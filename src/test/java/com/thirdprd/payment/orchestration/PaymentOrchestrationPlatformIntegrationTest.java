package com.thirdprd.payment.orchestration;

import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.InvalidStateTransitionException;
import com.thirdprd.payment.customer.entity.Customer;
import com.thirdprd.payment.customer.repository.CustomerRepository;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentAttempt;
import com.thirdprd.payment.payment.orchestrator.PaymentOrchestrator;
import com.thirdprd.payment.payment.repository.PaymentAttemptRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.provider.health.ProviderTelemetryDto;
import com.thirdprd.payment.provider.mock.MockPspA;
import com.thirdprd.payment.provider.mock.MockPspB;
import com.thirdprd.payment.provider.mock.MockPspC;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import com.thirdprd.payment.provider.simulation.SimulationMode;
import com.thirdprd.payment.reconciliation.PaymentReconciliationScheduler;
import com.thirdprd.payment.routing.SmartRoutingEngine;
import com.thirdprd.payment.routing.dto.RoutingResult;
import com.thirdprd.payment.routing.entity.RoutingRule;
import com.thirdprd.payment.routing.repository.RoutingRuleRepository;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.MethodName.class)
class PaymentOrchestrationPlatformIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentOrchestrator orchestrator;

    @Autowired
    private SmartRoutingEngine routingEngine;

    @Autowired
    private ProviderHealthEngine healthEngine;

    @Autowired
    private PaymentStateMachine stateMachine;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAttemptRepository attemptRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProviderHealthRepository healthRepository;

    @Autowired
    private RoutingRuleRepository ruleRepository;

    @Autowired
    private MockPspA mockPspA;

    @Autowired
    private MockPspB mockPspB;

    @Autowired
    private MockPspC mockPspC;

    @Autowired
    private PaymentReconciliationScheduler reconciliationScheduler;

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private WebhookSignatureVerifier signatureVerifier;

    private Merchant testMerchant;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        mockPspA.resetSimulation();
        mockPspB.resetSimulation();
        mockPspC.resetSimulation();
        healthEngine.resetCircuitBreaker("PSP_A");
        healthEngine.resetCircuitBreaker("PSP_B");
        healthEngine.resetCircuitBreaker("PSP_C");
        ruleRepository.deleteAll();

        testMerchant = merchantRepository.findAll().stream().findFirst().orElseGet(() -> {
            Merchant m = Merchant.builder()
                    .name("Orchestration Demo Merchant")
                    .email("demo-orchestrator@fastpay.io")
                    .status("ACTIVE")
                    .build();
            return merchantRepository.save(m);
        });

        // Seed default UPI rule to route to PSP_A with priority 1 and weight 100
        RoutingRule upiRule = new RoutingRule(
                null, "UPI Routing to PSP-A", testMerchant.getId(), "UPI", 0L, 100000000L, "PSP_A", 1, 100, true, null, Instant.now(), Instant.now()
        );
        ruleRepository.save(upiRule);

        testOrder = Order.builder()
                .merchantId(testMerchant.getId())
                .amount(1000000L) // ₹10,000
                .currency("INR")
                .status(OrderStatus.CREATED)
                .receipt("rcpt_orch_" + System.currentTimeMillis() % 10000)
                .build();
        testOrder = orderRepository.save(testOrder);
    }

    // 1. Normal PSP-A success
    @Test
    void test01_NormalPspASuccess() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t01_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals("PSP_A", response.getProvider());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertEquals(1, attempts.size());
        assertEquals("PSP_A", attempts.get(0).getProvider());
        assertEquals("SUCCESS", attempts.get(0).getStatus());
    }

    // 2. PSP-A failure → PSP-B failover
    @Test
    void test02_PspAFailure_PspBFailover() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_FAILURE);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t02_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotEquals("PSP_A", response.getProvider());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertTrue(attempts.size() >= 2, "Expected at least 2 attempts (PSP-A followed by fallback)");
        assertEquals("PSP_A", attempts.get(0).getProvider());
        assertEquals("FAILED", attempts.get(0).getStatus());
        assertTrue(attempts.get(1).getIsSafeFailover());
    }

    // 3. PSP-A timeout → UNKNOWN (inconclusive status check -> stops, does not blindly retry)
    @Test
    void test03_PspATimeout_TransitionsToUnknown_HaltsWithoutRetry() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.UNKNOWN);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t03_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.UNKNOWN, response.getStatus(), "Payment must remain UNKNOWN on inconclusive timeout");

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertEquals(1, attempts.size(), "Must NOT blindly retry an UNKNOWN payment!");
    }

    // 4. UNKNOWN + provider SUCCESS → SUCCESS
    @Test
    void test04_Unknown_ProviderSuccess_ResolvesSuccess() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t04_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus(), "Inquiry confirmed SUCCESS, payment must resolve to SUCCESS");
        assertEquals("PSP_A", response.getProvider());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertEquals(1, attempts.size(), "No failover should be attempted when primary succeeded upstream");
    }

    // 5. UNKNOWN + provider FAILED → controlled failover
    @Test
    void test05_Unknown_ProviderFailed_ControlledFailover() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.FAILED);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t05_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus(), "After confirmed failure on PSP-A, failover must succeed");
        assertNotEquals("PSP_A", response.getProvider());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertTrue(attempts.size() >= 2, "Must perform controlled failover only after confirming upstream failure");
    }

    // 6. Duplicate Idempotency-Key
    @Test
    void test06_DuplicateIdempotencyKey() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_t06_duplicate_key";

        PaymentResponse response1 = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);
        PaymentResponse response2 = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertEquals(response1.getId(), response2.getId(), "Duplicate key must return same payment ID");
        assertEquals(PaymentStatus.SUCCESS, response2.getStatus());

        long attemptCount = attemptRepository.countByPaymentId(response1.getId());
        assertEquals(1, attemptCount, "Only 1 attempt must exist for identical idempotency key");
    }

    // 7. Concurrent duplicate payment
    @Test
    void test07_ConcurrentDuplicatePayment() throws Exception {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String sharedIdempotencyKey = "idem_t07_concurrent_" + UUID.randomUUID();

        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch startLatch = new CountDownLatch(1);

        Callable<PaymentResponse> task = () -> {
            startLatch.await();
            return paymentService.createPayment(testMerchant.getId(), sharedIdempotencyKey, request);
        };

        Future<PaymentResponse> future1 = executor.submit(task);
        Future<PaymentResponse> future2 = executor.submit(task);

        startLatch.countDown();

        PaymentResponse r1 = future1.get(10, TimeUnit.SECONDS);
        PaymentResponse r2 = future2.get(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertNotNull(r1);
        assertNotNull(r2);
        assertEquals(r1.getId(), r2.getId(), "Concurrent requests with same key must return same payment");
    }

    // 8. Circuit breaker OPEN
    @Test
    void test08_CircuitBreakerOpen() {
        healthEngine.transitionCircuitBreakerToOpen("PSP_A");

        ProviderTelemetryDto telemetry = healthEngine.getTelemetry("PSP_A");
        assertEquals("OPEN", telemetry.getCircuitBreakerState());
        assertFalse(healthEngine.isProviderAvailable("PSP_A"));

        // Routing engine must omit OPEN provider
        RoutingResult routing = routingEngine.routePayment(
                UUID.randomUUID(), testMerchant.getId(), "UPI", testOrder.getAmount(), "INR");

        assertNotNull(routing);
        assertNotEquals("PSP_A", routing.getSelectedProvider(), "PSP-A should be omitted when Circuit Breaker is OPEN");
    }

    // 9. Circuit breaker HALF_OPEN
    @Test
    void test09_CircuitBreakerHalfOpen() {
        healthEngine.transitionCircuitBreakerToHalfOpen("PSP_A");

        ProviderTelemetryDto telemetry = healthEngine.getTelemetry("PSP_A");
        assertEquals("HALF_OPEN", telemetry.getCircuitBreakerState());
        assertTrue(healthEngine.isProviderAvailable("PSP_A"), "HALF_OPEN provider should allow test traffic");
    }

    // 10. Circuit breaker recovery
    @Test
    void test10_CircuitBreakerRecovery() {
        healthEngine.transitionCircuitBreakerToHalfOpen("PSP_A");
        assertEquals("HALF_OPEN", healthEngine.getTelemetry("PSP_A").getCircuitBreakerState());

        healthEngine.transitionCircuitBreakerToClosed("PSP_A");

        ProviderTelemetryDto telemetry = healthEngine.getTelemetry("PSP_A");
        assertEquals("CLOSED", telemetry.getCircuitBreakerState());
        assertTrue(healthEngine.isProviderAvailable("PSP_A"));
    }

    // 11. Routing rule selection
    @Test
    void test11_RoutingRuleSelection() {
        ruleRepository.deleteAll();

        // Specific high-priority rule targeting PSP_C for High-Value Card transactions
        RoutingRule cardRule = new RoutingRule(
                null, "VIP Card Rule to PSP-C", testMerchant.getId(), "CARD", 50000L, 50000000L, "PSP_C", 1, 500, true, null, Instant.now(), Instant.now()
        );
        ruleRepository.save(cardRule);

        RoutingResult result = routingEngine.routePayment(
                UUID.randomUUID(), testMerchant.getId(), "CARD", 100000L, "INR");

        assertNotNull(result);
        assertEquals("PSP_C", result.getSelectedProvider(), "Rule with weight bonus must choose PSP_C");
        assertNotNull(result.getRuleAppliedId());
    }

    // 12. Provider health affecting routing
    @Test
    void test12_ProviderHealthAffectingRouting() {
        ruleRepository.deleteAll();

        // Record multiple failures for PSP_A to degrade its score
        for (int i = 0; i < 5; i++) {
            healthEngine.recordOutcome("PSP_A", 900, false, false);
        }
        // Record good health for PSP_B
        for (int i = 0; i < 10; i++) {
            healthEngine.recordOutcome("PSP_B", 50, true, false);
        }

        ProviderTelemetryDto telA = healthEngine.getTelemetry("PSP_A");
        ProviderTelemetryDto telB = healthEngine.getTelemetry("PSP_B");

        assertTrue(telB.getSuccessRatePercent() > telA.getSuccessRatePercent());
        assertTrue(telA.getFailureRatePercent() > telB.getFailureRatePercent());
    }

    // 13. Reconciliation mismatch (amount mismatch flags security alert)
    @Test
    void test13_ReconciliationMismatch() {
        Payment payment = Payment.builder()
                .orderId(testOrder.getId())
                .merchantId(testMerchant.getId())
                .amount(1000000L) // ₹10,000
                .currency("INR")
                .status(PaymentStatus.UNKNOWN)
                .provider("PSP_A")
                .providerPaymentId("pay_mismatch_test_" + UUID.randomUUID())
                .method("CARD")
                .build();
        payment = paymentRepository.save(payment);

        // Process status update with wrong amount (₹5,000 instead of ₹10,000)
        Payment updated = paymentService.processProviderStatusUpdate(
                payment.getProviderPaymentId(),
                PaymentStatus.SUCCESS,
                null,
                null,
                "Webhook reconciliation update",
                500000L, // Mismatched amount
                "INR"
        );

        assertEquals(PaymentStatus.FAILED, updated.getStatus());
        assertEquals("AMOUNT_MISMATCH", updated.getErrorCode());
    }

    // 14. Webhook retry / deduplication
    @Test
    void test14_WebhookRetryAndDeduplication() {
        String providerEventId = "evt_dedup_" + UUID.randomUUID();
        String payload = String.format("{\"id\":\"%s\",\"provider_payment_id\":\"pay_rzp_mock\",\"amount\":1000000,\"currency\":\"INR\",\"status\":\"SUCCESS\"}", providerEventId);
        String signature = signatureVerifier.calculateSignature(payload, null);

        WebhookService.WebhookIngestionResult r1 = webhookService.ingestWebhook("MOCK_PSP", signature, payload);
        assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, r1);

        // Repeated ingestion with same valid signature and payload should process idempotently
        WebhookService.WebhookIngestionResult r2 = webhookService.ingestWebhook("MOCK_PSP", signature, payload);
        assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, r2);
    }

    // 15. Invalid state transition
    @Test
    void test15_InvalidStateTransition() {
        assertFalse(stateMachine.isValidTransition(PaymentStatus.SUCCESS, PaymentStatus.CREATED));
        assertFalse(stateMachine.isValidTransition(PaymentStatus.FAILED, PaymentStatus.PROCESSING));

        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(PaymentStatus.SUCCESS, PaymentStatus.CREATED));

        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(PaymentStatus.FAILED, PaymentStatus.PROCESSING));
    }
}
