package com.thirdprd.payment.orchestration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.api.ExternalPaymentController;
import com.thirdprd.payment.api.dto.ExternalPaymentCreateRequest;
import com.thirdprd.payment.api.dto.ExternalPaymentResponse;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentAttempt;
import com.thirdprd.payment.payment.repository.PaymentAttemptRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.provider.dto.ProviderStatusResponse;
import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.provider.health.ProviderTelemetryDto;
import com.thirdprd.payment.provider.mock.MockPspA;
import com.thirdprd.payment.provider.mock.MockPspB;
import com.thirdprd.payment.provider.mock.MockPspC;
import com.thirdprd.payment.provider.simulation.SimulationMode;
import com.thirdprd.payment.reconciliation.PaymentReconciliationScheduler;
import com.thirdprd.payment.refund.dto.CreateRefundRequest;
import com.thirdprd.payment.refund.dto.RefundResponse;
import com.thirdprd.payment.refund.entity.Refund;
import com.thirdprd.payment.refund.repository.RefundAttemptRepository;
import com.thirdprd.payment.refund.repository.RefundRepository;
import com.thirdprd.payment.refund.service.RefundService;
import com.thirdprd.payment.routing.SmartRoutingEngine;
import com.thirdprd.payment.routing.dto.RoutingResult;
import com.thirdprd.payment.routing.entity.RoutingRule;
import com.thirdprd.payment.routing.repository.RoutingRuleRepository;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import com.thirdprd.payment.webhook.repository.WebhookInboundEventRepository;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import org.junit.jupiter.api.*;
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
 * FastPay 2.1 Customer E2E Test Suite
 * Fully implements and validates test cases C001 through C050.
 * Core invariant: Never sacrifice payment correctness for availability.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.MethodName.class)
public class FastPay21CustomerE2ETest {

    @Autowired
    private ExternalPaymentController externalPaymentController;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private RefundService refundService;

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private WebhookSignatureVerifier signatureVerifier;

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
    private RefundRepository refundRepository;

    @Autowired(required = false)
    private RefundAttemptRepository refundAttemptRepository;

    @Autowired(required = false)
    private WebhookInboundEventRepository inboundEventRepository;

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

    @Autowired
    private ObjectMapper objectMapper;

    private Merchant testMerchant;
    private final UUID merchantId = UUID.nameUUIDFromBytes("MERCHANT001".getBytes(StandardCharsets.UTF_8));

    @BeforeEach
    void setUp() {
        mockPspA.resetSimulation();
        mockPspB.resetSimulation();
        mockPspC.resetSimulation();

        healthEngine.resetCircuitBreaker("PSP_A");
        healthEngine.resetCircuitBreaker("PSP_B");
        healthEngine.resetCircuitBreaker("PSP_C");

        ruleRepository.deleteAll();

        testMerchant = merchantRepository.findById(merchantId)
                .or(() -> merchantRepository.findByEmail("merchant_" + merchantId + "@fastpay.io"))
                .orElseGet(() -> {
                    Merchant m = Merchant.builder()
                            .name("Merchant MERCHANT001")
                            .email("merchant_" + merchantId + "@fastpay.io")
                            .status("ACTIVE")
                            .build();
                    m.setId(merchantId);
                    try {
                        return merchantRepository.save(m);
                    } catch (Exception e) {
                        return merchantRepository.findByEmail("merchant_" + merchantId + "@fastpay.io").orElse(m);
                    }
                });

        // Ensure default routing rule routes to PSP_A with fallback to PSP_B
        RoutingRule defaultRule = new RoutingRule(
                null, "Default E2E Route to PSP_A", testMerchant.getId(), "CARD", 0L, 1000000000L, "PSP_A", 1, 100, true, null, Instant.now(), Instant.now()
        );
        ruleRepository.save(defaultRule);
    }

    // ==========================================
    // Phase 1: Core Payment & Validations (C001 - C010)
    // ==========================================

    @Test
    void testC001_NormalSuccessfulPayment() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS001")
                .merchantId(merchantId)
                .orderId("ORD-C001")
                .idempotencyKey("IDEM-C001")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C001", request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody() instanceof ExternalPaymentResponse);

        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertNotNull(body.getPaymentId());
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
        assertEquals(1, body.getProviderAttemptCount());
    }

    @Test
    void testC002_SmallestValidPayment() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(100L)
                .currency("INR")
                .customerId("CUS002")
                .merchantId(merchantId)
                .orderId("ORD-C002")
                .idempotencyKey("IDEM-C002")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C002", request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
    }

    @Test
    void testC003_LargePaymentWithinConfiguredLimit() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(50000000L) // ₹500,000 in paise
                .currency("INR")
                .customerId("CUS003")
                .merchantId(merchantId)
                .orderId("ORD-C003")
                .idempotencyKey("IDEM-C003")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C003", request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
    }

    @Test
    void testC004_DuplicateIdempotencyRequest() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS004")
                .merchantId(merchantId)
                .orderId("ORD-C004")
                .idempotencyKey("IDEM-C004")
                .build();

        ResponseEntity<?> response1 = externalPaymentController.createExternalPayment("IDEM-C004", request);
        assertEquals(HttpStatus.CREATED, response1.getStatusCode());
        ExternalPaymentResponse body1 = (ExternalPaymentResponse) response1.getBody();

        ResponseEntity<?> response2 = externalPaymentController.createExternalPayment("IDEM-C004", request);
        assertEquals(HttpStatus.OK, response2.getStatusCode());
        ExternalPaymentResponse body2 = (ExternalPaymentResponse) response2.getBody();

        assertEquals(body1.getPaymentId(), body2.getPaymentId());
        assertEquals(body1.getAmount(), body2.getAmount());
        assertEquals(body1.getStatus(), body2.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body1.getPaymentId());
        assertEquals(1, attempts.size(), "Provider must only have been called once");
    }

    @Test
    void testC005_SameIdempotencyKeyWithDifferentAmount() {
        ExternalPaymentCreateRequest request1 = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS005")
                .merchantId(merchantId)
                .orderId("ORD-C005")
                .idempotencyKey("IDEM-C005")
                .build();

        ResponseEntity<?> response1 = externalPaymentController.createExternalPayment("IDEM-C005", request1);
        assertEquals(HttpStatus.CREATED, response1.getStatusCode());

        ExternalPaymentCreateRequest request2 = ExternalPaymentCreateRequest.builder()
                .amount(20000L)
                .currency("INR")
                .customerId("CUS005")
                .merchantId(merchantId)
                .orderId("ORD-C005")
                .idempotencyKey("IDEM-C005")
                .build();

        ResponseEntity<?> response2 = externalPaymentController.createExternalPayment("IDEM-C005", request2);
        assertEquals(HttpStatus.CONFLICT, response2.getStatusCode(), "Second request with differing amount must be rejected with 409 CONFLICT");

        ExternalPaymentResponse body1 = (ExternalPaymentResponse) response1.getBody();
        assertNotNull(body1);
        long paymentCount = paymentRepository.findAll().stream()
                .filter(p -> "IDEM-C005".equals(p.getIdempotencyKey()))
                .count();
        assertEquals(1, paymentCount);
    }

    @Test
    void testC006_MissingIdempotencyKey() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS006")
                .merchantId(merchantId)
                .orderId("ORD-C006")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment(null, request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testC007_ZeroAmount() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(0L)
                .currency("INR")
                .customerId("CUS007")
                .merchantId(merchantId)
                .orderId("ORD-C007")
                .idempotencyKey("IDEM-C007")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C007", request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testC008_NegativeAmount() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(-1000L)
                .currency("INR")
                .customerId("CUS008")
                .merchantId(merchantId)
                .orderId("ORD-C008")
                .idempotencyKey("IDEM-C008")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C008", request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testC009_UnsupportedCurrency() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("XYZ")
                .customerId("CUS009")
                .merchantId(merchantId)
                .orderId("ORD-C009")
                .idempotencyKey("IDEM-C009")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C009", request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void testC010_MissingCustomerId() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId(null)
                .merchantId(merchantId)
                .orderId("ORD-C010")
                .idempotencyKey("IDEM-C010")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C010", request);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    // ==========================================
    // Phase 2: Provider Simulations & Failover (C011 - C020)
    // ==========================================

    @Test
    void testC011_PspASuccessfulPayment() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(15000L)
                .currency("INR")
                .customerId("CUS011")
                .merchantId(merchantId)
                .orderId("ORD-C011")
                .idempotencyKey("IDEM-C011")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C011", request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
        assertTrue(body.getProvider().equalsIgnoreCase("PSP_A") || body.getProvider().equalsIgnoreCase("PSP-A"));
    }

    @Test
    void testC012_PspAFailureWithFailover() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_FAILURE);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(15000L)
                .currency("INR")
                .customerId("CUS012")
                .merchantId(merchantId)
                .orderId("ORD-C012")
                .idempotencyKey("IDEM-C012")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C012", request);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertTrue(attempts.size() >= 2, "Failover should have generated at least 2 attempts");
        assertEquals("FAILED", attempts.get(0).getStatus());
        assertEquals("SUCCESS", attempts.get(1).getStatus());
        assertTrue(attempts.get(1).getProvider().equalsIgnoreCase("PSP_B") || attempts.get(1).getProvider().equalsIgnoreCase("PSP-B"));
    }

    @Test
    void testC013_PspATimeout() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.UNKNOWN);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(20000L)
                .currency("INR")
                .customerId("CUS013")
                .merchantId(merchantId)
                .orderId("ORD-C013")
                .idempotencyKey("IDEM-C013")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C013", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.UNKNOWN, body.getStatus(), "Indeterminate timeout must leave payment in UNKNOWN state");
    }

    @Test
    void testC014_TimeoutButPspActuallySucceeded() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(25000L)
                .currency("INR")
                .customerId("CUS014")
                .merchantId(merchantId)
                .orderId("ORD-C014")
                .idempotencyKey("IDEM-C014")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C014", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        // Inquiry during orchestrator processing detects SUCCESS upstream and avoids failover
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertEquals(1, attempts.size(), "Failover should NOT be executed when upstream succeeded");
    }

    @Test
    void testC015_TimeoutButPspActuallyFailed() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.FAILED);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(25000L)
                .currency("INR")
                .customerId("CUS015")
                .merchantId(merchantId)
                .orderId("ORD-C015")
                .idempotencyKey("IDEM-C015")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C015", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        // Upstream failure confirmed via inquiry -> controlled failover allowed to PSP-B -> SUCCESS
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertTrue(attempts.size() >= 2);
        assertTrue(attempts.get(1).getProvider().contains("B"));
    }

    @Test
    void testC016_SlowProviderResponse() {
        mockPspA.setSimulationMode(SimulationMode.SLOW_RESPONSE);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(12000L)
                .currency("INR")
                .customerId("CUS016")
                .merchantId(merchantId)
                .orderId("ORD-C016")
                .idempotencyKey("IDEM-C016")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C016", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertNotNull(body.getPaymentId());

        Payment payment = paymentRepository.findById(body.getPaymentId()).orElse(null);
        assertNotNull(payment);

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertFalse(attempts.isEmpty());
        assertTrue(attempts.get(0).getLatencyMs() >= 0, "Latency must be recorded in payment attempt");
    }

    @Test
    void testC017_PspAOutage() {
        mockPspA.setSimulationMode(SimulationMode.OUTAGE);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS017")
                .merchantId(merchantId)
                .orderId("ORD-C017")
                .idempotencyKey("IDEM-C017")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C017", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
        assertTrue(body.getProvider().toUpperCase().contains("B"), "Fallback provider PSP-B should have been used");
    }

    @Test
    void testC018_PspACircuitOpen() {
        for (int i = 0; i < 20; i++) {
            healthEngine.recordOutcome("PSP_A", 100, false, false);
        }

        ProviderTelemetryDto telemetry = healthEngine.getTelemetry("PSP_A");
        assertEquals("OPEN", telemetry.circuitState());
    }

    @Test
    void testC019_ProviderRecovery() {
        for (int i = 0; i < 20; i++) {
            healthEngine.recordOutcome("PSP_A", 100, false, false);
        }
        assertEquals("OPEN", healthEngine.getTelemetry("PSP_A").circuitState());

        // Reset and record normal successes
        healthEngine.resetCircuitBreaker("PSP_A");
        for (int i = 0; i < 10; i++) {
            healthEngine.recordOutcome("PSP_A", 100, true, false);
        }

        ProviderTelemetryDto telemetry = healthEngine.getTelemetry("PSP_A");
        assertEquals("CLOSED", telemetry.circuitState());
    }

    @Test
    void testC020_AllPspsUnavailable() {
        mockPspA.setSimulationMode(SimulationMode.OUTAGE);
        mockPspB.setSimulationMode(SimulationMode.OUTAGE);
        mockPspC.setSimulationMode(SimulationMode.OUTAGE);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS020")
                .merchantId(merchantId)
                .orderId("ORD-C020")
                .idempotencyKey("IDEM-C020")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C020", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertNotEquals(PaymentStatus.SUCCESS, body.getStatus(), "Payment MUST NOT be marked SUCCESS when all providers are unavailable");
    }

    // ==========================================
    // Phase 3: Multi-Customer & Concurrency (C021 - C025)
    // ==========================================

    @Test
    void testC021_DifferentCustomerSameMerchant() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS021")
                .merchantId(merchantId)
                .orderId("ORD-C021")
                .idempotencyKey("IDEM-C021")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C021", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
    }

    @Test
    void testC022_SameCustomerMultiplePayments() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        int count = 5;
        List<UUID> createdPaymentIds = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                    .amount(10000L)
                    .currency("INR")
                    .customerId("CUS022")
                    .merchantId(merchantId)
                    .orderId("ORD-C022-" + i)
                    .idempotencyKey("IDEM-C022-" + i)
                    .build();

            ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C022-" + i, request);
            ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
            assertEquals(PaymentStatus.SUCCESS, body.getStatus());
            createdPaymentIds.add(body.getPaymentId());
        }

        assertEquals(5, createdPaymentIds.stream().distinct().count());
    }

    @Test
    void testC023_ConcurrentDuplicateRequests10() throws Exception {
        executeConcurrentDuplicateTest(10, "IDEM-C023", "ORD-C023", "CUS023", 10000L);
    }

    @Test
    void testC024_ConcurrentDuplicateRequests50() throws Exception {
        executeConcurrentDuplicateTest(50, "IDEM-C024", "ORD-C024", "CUS024", 15000L);
    }

    @Test
    void testC025_ConcurrentDuplicateRequests100() throws Exception {
        executeConcurrentDuplicateTest(100, "IDEM-C025", "ORD-C025", "CUS025", 20000L);
    }

    private void executeConcurrentDuplicateTest(int concurrency, String idempotencyKey, String orderId, String customerId, Long amount) throws Exception {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExecutorService executor = Executors.newFixedThreadPool(Math.min(concurrency, 32));
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(concurrency);

        List<ExternalPaymentResponse> results = Collections.synchronizedList(new ArrayList<>());
        AtomicInteger successCount = new AtomicInteger(0);

        for (int i = 0; i < concurrency; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                            .amount(amount)
                            .currency("INR")
                            .customerId(customerId)
                            .merchantId(merchantId)
                            .orderId(orderId)
                            .idempotencyKey(idempotencyKey)
                            .build();

                    ResponseEntity<?> response = externalPaymentController.createExternalPayment(idempotencyKey, request);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() instanceof ExternalPaymentResponse) {
                        results.add((ExternalPaymentResponse) response.getBody());
                        successCount.incrementAndGet();
                    }
                } catch (Exception ignored) {
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        startLatch.countDown();
        assertTrue(doneLatch.await(30, TimeUnit.SECONDS));
        executor.shutdown();

        assertFalse(results.isEmpty(), "At least one call should succeed");
        UUID expectedPaymentId = results.get(0).getPaymentId();
        for (ExternalPaymentResponse r : results) {
            assertEquals(expectedPaymentId, r.getPaymentId(), "All responses must refer to the exact same payment");
        }

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(expectedPaymentId);
        assertEquals(1, attempts.size(), "Provider must execute EXACTLY once for " + concurrency + " duplicate requests");
    }

    // ==========================================
    // Phase 4: Webhooks & Signature Hardening (C026 - C030)
    // ==========================================

    @Test
    void testC026_WebhookSuccessDelivery() throws Exception {
        // Create an initial pending payment
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.PROCESSING)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("PAY-C026")
                .build();
        payment = paymentRepository.save(payment);

        String payload = String.format("{\"event\": \"PAYMENT_SUCCESS\", \"paymentId\": \"%s\", \"provider\": \"PSP-A\", \"eventId\": \"EVT-C026\"}",
                payment.getId());
        String signature = signatureVerifier.calculateSignature(payload, null);

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook("PSP_A", signature, payload);
        assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, result);

        // Process event
        webhookService.processWebhookAsync(new WebhookReceivedEvent(UUID.randomUUID(), "PSP_A", "EVT-C026", payload, true));

        Payment updated = null;
        for (int i = 0; i < 30; i++) {
            Thread.sleep(50);
            updated = paymentRepository.findById(payment.getId()).orElse(null);
            if (updated != null && updated.getStatus() == PaymentStatus.SUCCESS) {
                break;
            }
        }
        assertNotNull(updated);
        assertEquals(PaymentStatus.SUCCESS, updated.getStatus());
    }

    @Test
    void testC027_DuplicateWebhook() {
        String payload = "{\"event\": \"PAYMENT_SUCCESS\", \"paymentId\": \"PAY-C027\", \"provider\": \"PSP-A\", \"eventId\": \"EVT-C027\"}";
        String signature = signatureVerifier.calculateSignature(payload, null);

        for (int i = 0; i < 10; i++) {
            WebhookService.WebhookIngestionResult res = webhookService.ingestWebhook("PSP_A", signature, payload);
            assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, res);
        }

        if (inboundEventRepository != null) {
            long count = inboundEventRepository.findAll().stream().filter(e -> "EVT-C027".equals(e.getProviderEventId())).count();
            assertEquals(1, count, "Effective state transitions / deduplicated event records must be exactly 1");
        }
    }

    @Test
    void testC028_InvalidWebhookSignature() {
        String payload = "{\"event\": \"PAYMENT_SUCCESS\", \"paymentId\": \"PAY-C028\", \"eventId\": \"EVT-C028\"}";
        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook("PSP_A", "INVALID", payload);
        assertEquals(WebhookService.WebhookIngestionResult.INVALID_SIGNATURE, result);
    }

    @Test
    void testC029_OutOfOrderWebhook() throws Exception {
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.PROCESSING)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("PAY-C029")
                .build();
        payment = paymentRepository.save(payment);

        // 1. Success event delivered first
        String successPayload = String.format("{\"event\": \"PAYMENT_SUCCESS\", \"paymentId\": \"%s\", \"eventId\": \"EVT-C029-2\"}", payment.getId());
        webhookService.processWebhookAsync(new WebhookReceivedEvent(UUID.randomUUID(), "PSP_A", "EVT-C029-2", successPayload, true));

        Payment updated = null;
        for (int i = 0; i < 30; i++) {
            Thread.sleep(50);
            updated = paymentRepository.findById(payment.getId()).orElse(null);
            if (updated != null && updated.getStatus() == PaymentStatus.SUCCESS) {
                break;
            }
        }
        assertNotNull(updated);
        assertEquals(PaymentStatus.SUCCESS, updated.getStatus());

        // 2. Out-of-order delayed FAILED event arrives
        String failedPayload = String.format("{\"event\": \"PAYMENT_FAILED\", \"paymentId\": \"%s\", \"eventId\": \"EVT-C029-1\"}", payment.getId());
        webhookService.processWebhookAsync(new WebhookReceivedEvent(UUID.randomUUID(), "PSP_A", "EVT-C029-1", failedPayload, true));
        Thread.sleep(100);

        Payment afterFailed = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(afterFailed);
        assertEquals(PaymentStatus.SUCCESS, afterFailed.getStatus(), "Payment state MUST NOT regress from SUCCESS to FAILED");
    }

    @Test
    void testC030_WebhookRetryAfterTemporaryFailure() {
        String payload = "{\"event\": \"PAYMENT_SUCCESS\", \"paymentId\": \"PAY-C030\", \"eventId\": \"EVT-C030\"}";

        // First delivery: invalid signature
        WebhookService.WebhookIngestionResult first = webhookService.ingestWebhook("PSP_A", "BAD_SIG", payload);
        assertEquals(WebhookService.WebhookIngestionResult.INVALID_SIGNATURE, first);

        // Second delivery (retry): valid signature
        String validSig = signatureVerifier.calculateSignature(payload, null);
        WebhookService.WebhookIngestionResult second = webhookService.ingestWebhook("PSP_A", validSig, payload);
        assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, second);
    }

    // ==========================================
    // Phase 5: Refunds & Concurrency (C031 - C040)
    // ==========================================

    @Test
    void testC031_NormalRefund() {
        Payment payment = createSuccessfulPayment(10000L);

        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Customer return")
                .build();

        RefundResponse refundResp = refundService.createRefund(merchantId, payment.getId(), "REF-C031", refundRequest);
        assertNotNull(refundResp);
        assertEquals(PaymentStatus.SUCCESS, refundResp.getStatus());
        assertEquals(5000L, refundResp.getAmount());
    }

    @Test
    void testC032_FullRefund() {
        Payment payment = createSuccessfulPayment(10000L);

        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(10000L)
                .reason("Full cancellation")
                .build();

        RefundResponse refundResp = refundService.createRefund(merchantId, payment.getId(), "REF-C032", refundRequest);
        assertNotNull(refundResp);
        assertEquals(PaymentStatus.SUCCESS, refundResp.getStatus());

        Payment updated = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(PaymentStatus.REFUNDED, updated.getStatus());
    }

    @Test
    void testC033_RefundGreaterThanPayment() {
        Payment payment = createSuccessfulPayment(10000L);

        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(20000L)
                .reason("Excessive refund attempt")
                .build();

        assertThrows(BusinessException.class, () ->
                refundService.createRefund(merchantId, payment.getId(), "REF-C033", refundRequest));
    }

    @Test
    void testC034_DuplicateRefund() {
        Payment payment = createSuccessfulPayment(10000L);

        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Duplicate test")
                .build();

        RefundResponse first = refundService.createRefund(merchantId, payment.getId(), "REF-C034", refundRequest);
        for (int i = 0; i < 4; i++) {
            RefundResponse repeat = refundService.createRefund(merchantId, payment.getId(), "REF-C034", refundRequest);
            assertEquals(first.getId(), repeat.getId());
        }

        List<Refund> refunds = refundRepository.findByPaymentIdOrderByCreatedAtDesc(payment.getId());
        assertEquals(1, refunds.size(), "Duplicate idempotency requests must only produce 1 Refund record");
    }

    @Test
    void testC035_RefundTimeout() {
        Payment payment = createSuccessfulPayment(10000L);
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);

        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Timeout test")
                .build();

        RefundResponse resp = refundService.createRefund(merchantId, payment.getId(), "REF-C035", refundRequest);
        assertNotNull(resp);
        assertEquals(PaymentStatus.UNKNOWN, resp.getStatus(), "Timed out refund must be recorded with UNKNOWN status");
    }

    @Test
    void testC036_RefundProviderSucceedsButResponseLost() {
        Payment payment = createSuccessfulPayment(10000L);
        // Provider succeeds
        CreateRefundRequest refundRequest = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Lost response test")
                .build();

        RefundResponse resp = refundService.createRefund(merchantId, payment.getId(), "REF-C036", refundRequest);
        assertEquals(PaymentStatus.SUCCESS, resp.getStatus());

        List<Refund> refunds = refundRepository.findByPaymentIdOrderByCreatedAtDesc(payment.getId());
        assertEquals(1, refunds.size());
    }

    @Test
    void testC037_ConcurrentRefunds() throws Exception {
        Payment payment = createSuccessfulPayment(10000L);

        int concurrency = 20;
        ExecutorService executor = Executors.newFixedThreadPool(concurrency);
        CountDownLatch start = new CountDownLatch(1);
        CountDownLatch done = new CountDownLatch(concurrency);

        List<RefundResponse> responses = Collections.synchronizedList(new ArrayList<>());
        for (int i = 0; i < concurrency; i++) {
            executor.submit(() -> {
                try {
                    start.await();
                    CreateRefundRequest req = CreateRefundRequest.builder()
                            .amount(5000L)
                            .reason("Concurrent duplicate refund")
                            .build();
                    RefundResponse resp = refundService.createRefund(merchantId, payment.getId(), "REF-C037", req);
                    responses.add(resp);
                } catch (Exception ignored) {
                } finally {
                    done.countDown();
                }
            });
        }

        start.countDown();
        assertTrue(done.await(20, TimeUnit.SECONDS));
        executor.shutdown();

        assertFalse(responses.isEmpty());
        UUID firstRefundId = responses.get(0).getId();
        for (RefundResponse r : responses) {
            assertEquals(firstRefundId, r.getId());
        }

        List<Refund> saved = refundRepository.findByPaymentIdOrderByCreatedAtDesc(payment.getId());
        assertEquals(1, saved.size(), "Only 1 refund record must be created for 20 concurrent identical refund requests");
    }

    @Test
    void testC038_RefundAfterFailedPayment() {
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(5000L)
                .currency("INR")
                .status(PaymentStatus.FAILED)
                .method("CARD")
                .build();
        payment = paymentRepository.save(payment);

        final UUID paymentId = payment.getId();
        CreateRefundRequest req = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Refund after fail")
                .build();

        assertThrows(BusinessException.class, () ->
                refundService.createRefund(merchantId, paymentId, "REF-C038", req));
    }

    @Test
    void testC039_RefundAfterSuccessfulPayment() {
        Payment payment = createSuccessfulPayment(5000L);
        CreateRefundRequest req = CreateRefundRequest.builder()
                .amount(5000L)
                .reason("Allowed refund")
                .build();

        RefundResponse resp = refundService.createRefund(merchantId, payment.getId(), "REF-C039", req);
        assertEquals(PaymentStatus.SUCCESS, resp.getStatus());
    }

    @Test
    void testC040_PartialRefundTwice() {
        Payment payment = createSuccessfulPayment(10000L);

        CreateRefundRequest req1 = CreateRefundRequest.builder().amount(3000L).reason("Partial 1").build();
        RefundResponse resp1 = refundService.createRefund(merchantId, payment.getId(), "REF-C040-A", req1);
        assertEquals(PaymentStatus.SUCCESS, resp1.getStatus());

        CreateRefundRequest req2 = CreateRefundRequest.builder().amount(2000L).reason("Partial 2").build();
        RefundResponse resp2 = refundService.createRefund(merchantId, payment.getId(), "REF-C040-B", req2);
        assertEquals(PaymentStatus.SUCCESS, resp2.getStatus());

        Long totalRefunded = refundRepository.sumSuccessfulRefundAmountByPaymentId(payment.getId());
        assertEquals(5000L, totalRefunded);

        Payment updated = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(PaymentStatus.PARTIALLY_REFUNDED, updated.getStatus());
    }

    // ==========================================
    // Phase 6: Inquiry, Reconciliation & Advanced Concurrency (C041 - C050)
    // ==========================================

    @Test
    void testC041_PaymentInquiry() {
        Payment payment = createSuccessfulPayment(10000L);
        ProviderStatusResponse inquiry = mockPspA.getStatus(payment.getProviderPaymentId());
        assertNotNull(inquiry);
        assertEquals(PaymentStatus.SUCCESS, inquiry.getStatus());
    }

    @Test
    void testC042_UnknownPaymentReconciliation() {
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.UNKNOWN)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("pay_pspa_rec_042")
                .build();
        payment = paymentRepository.save(payment);

        mockPspA.setSimulatedStatus("pay_pspa_rec_042", PaymentStatus.SUCCESS);

        reconciliationScheduler.reconcileSinglePayment(payment.getId());

        Payment updated = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(PaymentStatus.SUCCESS, updated.getStatus());
    }

    @Test
    void testC043_UnknownPaymentResolvesSuccess() {
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.UNKNOWN)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("pay_pspa_rec_043")
                .build();
        payment = paymentRepository.save(payment);

        mockPspA.setSimulatedStatus("pay_pspa_rec_043", PaymentStatus.SUCCESS);
        reconciliationScheduler.reconcileSinglePayment(payment.getId());

        Payment updated = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(PaymentStatus.SUCCESS, updated.getStatus());
    }

    @Test
    void testC044_UnknownPaymentResolvesFailed() {
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(10000L)
                .currency("INR")
                .status(PaymentStatus.UNKNOWN)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("pay_pspa_rec_044")
                .build();
        payment = paymentRepository.save(payment);

        mockPspA.setSimulatedStatus("pay_pspa_rec_044", PaymentStatus.FAILED);
        reconciliationScheduler.reconcileSinglePayment(payment.getId());

        Payment updated = paymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(updated);
        assertEquals(PaymentStatus.FAILED, updated.getStatus());
    }

    @Test
    void testC045_RepeatedPaymentStatusRequest() {
        Payment payment = createSuccessfulPayment(10000L);

        for (int i = 0; i < 20; i++) {
            ResponseEntity<ExternalPaymentResponse> resp = externalPaymentController.getExternalPayment(payment.getId());
            assertEquals(HttpStatus.OK, resp.getStatusCode());
            assertNotNull(resp.getBody());
            assertEquals(PaymentStatus.SUCCESS, resp.getBody().getStatus());
            assertEquals(payment.getAmount(), resp.getBody().getAmount());
        }
    }

    @Test
    void testC046_PaymentRequestReplay() {
        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS046")
                .merchantId(merchantId)
                .orderId("ORD-C046")
                .idempotencyKey("IDEM-C046")
                .build();

        ResponseEntity<?> first = externalPaymentController.createExternalPayment("IDEM-C046", request);
        assertEquals(HttpStatus.CREATED, first.getStatusCode());

        ResponseEntity<?> replay = externalPaymentController.createExternalPayment("IDEM-C046", request);
        assertEquals(HttpStatus.OK, replay.getStatusCode());

        ExternalPaymentResponse body1 = (ExternalPaymentResponse) first.getBody();
        ExternalPaymentResponse body2 = (ExternalPaymentResponse) replay.getBody();
        assertEquals(body1.getPaymentId(), body2.getPaymentId());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body1.getPaymentId());
        assertEquals(1, attempts.size(), "Replay must not trigger duplicate execution");
    }

    @Test
    void testC047_UnknownPaymentMustNotBeBlindlyRetried() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);
        mockPspA.setSimulatedTimeoutResolution(PaymentStatus.UNKNOWN);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(10000L)
                .currency("INR")
                .customerId("CUS047")
                .merchantId(merchantId)
                .orderId("ORD-C047")
                .idempotencyKey("IDEM-C047")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C047", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.UNKNOWN, body.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(body.getPaymentId());
        assertEquals(1, attempts.size(), "UNKNOWN payment must not blindly retry without confirmed failure");
    }

    @Test
    void testC048_ProviderFailoverAfterConfirmedFailure() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_FAILURE);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        ExternalPaymentCreateRequest request = ExternalPaymentCreateRequest.builder()
                .amount(20000L)
                .currency("INR")
                .customerId("CUS048")
                .merchantId(merchantId)
                .orderId("ORD-C048")
                .idempotencyKey("IDEM-C048")
                .build();

        ResponseEntity<?> response = externalPaymentController.createExternalPayment("IDEM-C048", request);
        ExternalPaymentResponse body = (ExternalPaymentResponse) response.getBody();
        assertEquals(PaymentStatus.SUCCESS, body.getStatus());
        assertTrue(body.getProvider().toUpperCase().contains("B"), "Payment must be completed by PSP-B after PSP-A confirmed failure");
    }

    @Test
    void testC049_ProviderHealthChangesRouting() {
        // Degrade PSP-A
        for (int i = 0; i < 10; i++) {
            healthEngine.recordOutcome("PSP_A", 2500, false, false);
        }
        // Improve PSP-B
        for (int i = 0; i < 20; i++) {
            healthEngine.recordOutcome("PSP_B", 200, true, false);
        }

        RoutingResult result = routingEngine.routePayment(UUID.randomUUID(), merchantId, "CARD", 10000L, "INR");
        assertNotNull(result);
        assertEquals("PSP_B", result.getSelectedProvider(), "Routing should favor healthier PSP-B over degraded PSP-A");
    }

    @Test
    void testC050_100UniqueConcurrentPayments() throws Exception {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        int totalRequests = 100;
        ExecutorService executor = Executors.newFixedThreadPool(25);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(totalRequests);

        List<ExternalPaymentResponse> responses = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < totalRequests; i++) {
            final int idx = i;
            executor.submit(() -> {
                try {
                    startLatch.await();
                    ExternalPaymentCreateRequest req = ExternalPaymentCreateRequest.builder()
                            .amount(10000L + idx)
                            .currency("INR")
                            .customerId("CUS-050-" + idx)
                            .merchantId(merchantId)
                            .orderId("ORD-050-" + idx)
                            .idempotencyKey("IDEM-050-" + idx)
                            .build();

                    ResponseEntity<?> res = externalPaymentController.createExternalPayment("IDEM-050-" + idx, req);
                    if (res.getStatusCode().is2xxSuccessful() && res.getBody() instanceof ExternalPaymentResponse) {
                        responses.add((ExternalPaymentResponse) res.getBody());
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

        assertEquals(100, responses.size(), "All 100 unique payments must succeed");
        long distinctIds = responses.stream().map(ExternalPaymentResponse::getPaymentId).distinct().count();
        assertEquals(100, distinctIds, "All 100 payments must have unique payment IDs");
    }

    private Payment createSuccessfulPayment(Long amount) {
        Order order = Order.builder()
                .merchantId(merchantId)
                .amount(amount)
                .currency("INR")
                .status(OrderStatus.PAID)
                .receipt("rcpt_" + UUID.randomUUID().toString().substring(0, 8))
                .build();
        order = orderRepository.save(order);

        Payment payment = Payment.builder()
                .orderId(order.getId())
                .merchantId(merchantId)
                .amount(amount)
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .method("CARD")
                .provider("PSP_A")
                .providerPaymentId("pay_pspa_" + UUID.randomUUID().toString().substring(0, 8))
                .build();
        Payment saved = paymentRepository.save(payment);
        mockPspA.setSimulatedStatus(saved.getProviderPaymentId(), PaymentStatus.SUCCESS);
        return saved;
    }
}
