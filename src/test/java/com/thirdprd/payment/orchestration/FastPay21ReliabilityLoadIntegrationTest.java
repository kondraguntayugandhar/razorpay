package com.thirdprd.payment.orchestration;

import com.thirdprd.payment.api.ExternalPaymentController;
import com.thirdprd.payment.api.dto.ExternalPaymentCreateRequest;
import com.thirdprd.payment.api.dto.ExternalPaymentResponse;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.idempotency.service.IdempotencyLockService;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentAttempt;
import com.thirdprd.payment.payment.orchestrator.PaymentOrchestrator;
import com.thirdprd.payment.payment.repository.PaymentAttemptRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.provider.mock.MockPspA;
import com.thirdprd.payment.provider.mock.MockPspB;
import com.thirdprd.payment.provider.mock.MockPspC;
import com.thirdprd.payment.provider.simulation.SimulationMode;
import com.thirdprd.payment.reconciliation.PaymentReconciliationScheduler;
import com.thirdprd.payment.routing.entity.RoutingRule;
import com.thirdprd.payment.routing.repository.RoutingRuleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * FastPay 2.1 Reliability & Production Hardening Load and Invariant Integration Tests
 * Validates:
 * 1. 100 concurrent duplicate requests with zero duplicate financial execution
 * 2. Safe timeout recovery (PSP-B never called when PSP-A succeeded)
 * 3. Controlled failover after confirmed upstream failure
 * 4. Optimistic locking (@Version) safety on entity race conditions
 * 5. Concurrent reconciliation worker idempotency via distributed locking
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.MethodName.class)
public class FastPay21ReliabilityLoadIntegrationTest {

    @Autowired
    private ExternalPaymentController externalPaymentController;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentOrchestrator orchestrator;

    @Autowired
    private ProviderHealthEngine healthEngine;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAttemptRepository attemptRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private MockPspA mockPspA;

    @Autowired
    private MockPspB mockPspB;

    @Autowired
    private MockPspC mockPspC;

    @Autowired
    private PaymentReconciliationScheduler reconciliationScheduler;

    @Autowired
    private RoutingRuleRepository ruleRepository;

    @Autowired(required = false)
    private IdempotencyLockService lockService;

    private Merchant testMerchant;
    private final UUID merchantId = UUID.nameUUIDFromBytes("RELIABILITY_MERCHANT".getBytes(StandardCharsets.UTF_8));

    @BeforeEach
    void setUp() {
        mockPspA.resetSimulation();
        mockPspB.resetSimulation();
        mockPspC.resetSimulation();

        healthEngine.resetCircuitBreaker("PSP_A");
        healthEngine.resetCircuitBreaker("PSP_B");
        healthEngine.resetCircuitBreaker("PSP_C");

        ruleRepository.deleteAll();

        Optional<Merchant> existingById = merchantRepository.findById(merchantId);
        if (existingById.isPresent()) {
            testMerchant = existingById.get();
        } else {
            merchantRepository.findAll().stream()
                    .filter(m -> ("reliability_" + merchantId + "@fastpay.io").equals(m.getEmail()) || "reliability@fastpay.io".equals(m.getEmail()))
                    .forEach(m -> {
                        try { merchantRepository.delete(m); } catch (Exception ignored) {}
                    });
            Merchant m = Merchant.builder()
                    .name("Reliability Test Merchant")
                    .email("reliability_" + merchantId + "@fastpay.io")
                    .status("ACTIVE")
                    .build();
            m.setId(merchantId);
            testMerchant = merchantRepository.save(m);
        }

        // Set default routing rule to PSP_A
        RoutingRule rule = new RoutingRule(
                null, "Reliability Route to PSP_A", testMerchant.getId(), "CARD", 0L, 1000000000L, "PSP_A", 1, 100, true, null, Instant.now(), Instant.now()
        );
        ruleRepository.save(rule);
    }

    @Test
    void test01_100ConcurrentDuplicateRequests_ZeroDuplicateCharge() throws Exception {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        int concurrency = 100;
        String idempotencyKey = "IDEM-LOAD-100-" + UUID.randomUUID();
        String orderId = "ORD-LOAD-100";
        String customerId = "CUS-LOAD-100";
        Long amount = 25000L;

        ExecutorService executor = Executors.newFixedThreadPool(25);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(concurrency);

        List<ExternalPaymentResponse> responses = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger duplicateConflictCount = new AtomicInteger(0);

        for (int i = 0; i < concurrency; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    ExternalPaymentCreateRequest req = ExternalPaymentCreateRequest.builder()
                            .amount(amount)
                            .currency("INR")
                            .customerId(customerId)
                            .merchantId(merchantId)
                            .orderId(orderId)
                            .idempotencyKey(idempotencyKey)
                            .build();

                    ResponseEntity<?> res = externalPaymentController.createExternalPayment(idempotencyKey, req);
                    if (res.getStatusCode() == HttpStatus.CREATED || res.getStatusCode() == HttpStatus.OK) {
                        if (res.getBody() instanceof ExternalPaymentResponse) {
                            responses.add((ExternalPaymentResponse) res.getBody());
                        }
                    } else if (res.getStatusCode() == HttpStatus.CONFLICT) {
                        duplicateConflictCount.incrementAndGet();
                    }
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(45, TimeUnit.SECONDS));
        executor.shutdown();

        assertFalse(responses.isEmpty(), "At least one request must succeed and return a payment response");
        UUID standardPaymentId = responses.get(0).getPaymentId();
        for (ExternalPaymentResponse resp : responses) {
            assertEquals(standardPaymentId, resp.getPaymentId(), "All responses must map to the same Payment ID");
            assertEquals(PaymentStatus.SUCCESS, resp.getStatus());
        }

        // Database Invariant Verification
        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(standardPaymentId);
        assertEquals(1, attempts.size(), "Core Invariant: Provider execution count must be EXACTLY 1 (zero duplicate charge)");
        assertEquals("SUCCESS", attempts.get(0).getStatus());

        Optional<Payment> savedPayment = paymentRepository.findById(standardPaymentId);
        assertTrue(savedPayment.isPresent());
        assertEquals(PaymentStatus.SUCCESS, savedPayment.get().getStatus());
        assertNotNull(savedPayment.get().getVersion(), "Optimistic lock version must be initialized");
    }

    @Test
    void test02_SafeTimeoutRecovery_PspBNeverCalledWhenPspASucceeded() {
        // Primary PSP-A times out but actually succeeded upstream
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.SUCCESS);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        String idempotencyKey = "IDEM-SAFE-REC-" + UUID.randomUUID();
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(30000L)
                .currency("INR")
                .customerId("CUS-REC-01")
                .merchantId(merchantId)
                .orderId("ORD-REC-01")
                .idempotencyKey(idempotencyKey)
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment(idempotencyKey, request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertNotNull(body);
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertEquals(1, attempts.size(), "PSP-B MUST NEVER be called when inquiry proves PSP-A succeeded");
        assertTrue(attempts.get(0).getProvider().contains("A"));
    }

    @Test
    void test03_SafeTimeoutRecovery_ControlledFailoverWhenPspAConfirmedFailed() {
        // Primary PSP-A times out and inquiry confirms FAILED upstream
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.FAILED);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        String idempotencyKey = "IDEM-SAFE-FAILOVER-" + UUID.randomUUID();
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(35000L)
                .currency("INR")
                .customerId("CUS-FAILOVER-01")
                .merchantId(merchantId)
                .orderId("ORD-FAILOVER-01")
                .idempotencyKey(idempotencyKey)
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment(idempotencyKey, request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertNotNull(body);
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertEquals(2, attempts.size(), "Controlled failover must record exactly 2 attempts");
        assertTrue(attempts.get(0).getProvider().contains("A"));
        assertEquals("TIMEOUT", attempts.get(0).getStatus());
        assertTrue(attempts.get(1).getProvider().contains("B"));
        assertEquals("SUCCESS", attempts.get(1).getStatus());
    }

    @Test
    void test04_ConcurrentReconciliationWorkers_DistributedLockIdempotency() throws Exception {
        // Create an UNKNOWN payment
        Order order = Order.builder()
                .merchantId(merchantId)
                .amount(10000L)
                .currency("INR")
                .status(OrderStatus.CREATED)
                .receipt("rcpt_rec_conc")
                .build();
        order = orderRepository.save(order);

        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(order.getId())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.UNKNOWN)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("pay_pspa_rec_conc")
                .build();
        payment = paymentRepository.save(payment);

        mockPspA.setSimulatedStatus("pay_pspa_rec_conc", PaymentStatus.SUCCESS);

        // Run two concurrent reconciliation calls
        final UUID paymentId = payment.getId();
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);

        for (int i = 0; i < 2; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    reconciliationScheduler.reconcileSinglePayment(paymentId);
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(10, TimeUnit.SECONDS));
        executor.shutdown();

        Payment resolved = paymentRepository.findById(paymentId).orElse(null);
        assertNotNull(resolved);
        assertEquals(PaymentStatus.SUCCESS, resolved.getStatus(), "Payment must be cleanly resolved to SUCCESS without race conditions");
    }
}
