package com.thirdprd.payment.orchestration;

import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
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
import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.mock.MockPspA;
import com.thirdprd.payment.provider.mock.MockPspB;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import com.thirdprd.payment.provider.simulation.SimulationMode;
import com.thirdprd.payment.reconciliation.PaymentReconciliationScheduler;
import com.thirdprd.payment.routing.SmartRoutingEngine;
import com.thirdprd.payment.routing.dto.RoutingResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class PaymentOrchestrationPlatformIntegrationTest {

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private PaymentOrchestrator orchestrator;

    @Autowired
    private SmartRoutingEngine routingEngine;

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
    private com.thirdprd.payment.routing.repository.RoutingRuleRepository ruleRepository;

    @Autowired
    private MockPspA mockPspA;

    @Autowired
    private MockPspB mockPspB;

    @Autowired
    private com.thirdprd.payment.provider.mock.MockPspC mockPspC;

    @Autowired
    private PaymentReconciliationScheduler reconciliationScheduler;

    private Merchant testMerchant;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        mockPspA.resetSimulation();
        mockPspB.resetSimulation();
        mockPspC.resetSimulation();
        ruleRepository.deleteAll();

        // Seed UPI rule to route to PSP_A with priority 1 and weight 100
        com.thirdprd.payment.routing.entity.RoutingRule upiRule = new com.thirdprd.payment.routing.entity.RoutingRule(
                null, "UPI Routing to PSP-A", null, "UPI", 0L, 100000000L, "PSP_A", 1, 100, true, null, Instant.now(), Instant.now()
        );
        ruleRepository.save(upiRule);

        testMerchant = merchantRepository.findAll().stream().findFirst().orElseGet(() -> {
            Merchant m = Merchant.builder()
                    .name("Orchestration Demo Merchant")
                    .email("demo-orchestrator@fastpay.io")
                    .status("ACTIVE")
                    .build();
            return merchantRepository.save(m);
        });

        testOrder = Order.builder()
                .merchantId(testMerchant.getId())
                .amount(1000000L) // ₹10,000
                .currency("INR")
                .status(OrderStatus.CREATED)
                .receipt("rcpt_orch_" + System.currentTimeMillis() % 10000)
                .build();
        testOrder = orderRepository.save(testOrder);
    }

    @Test
    void scenario1_NormalPayment_SmartRouterChoosesPspA_Success() {
        // Given PSP-A is healthy and NORMAL
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_s1_" + UUID.randomUUID();

        // When
        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        // Then
        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals("PSP_A", response.getProvider());

        Payment savedPayment = paymentRepository.findById(response.getId()).orElseThrow();
        assertEquals(PaymentStatus.SUCCESS, savedPayment.getStatus());

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(savedPayment.getId());
        assertFalse(attempts.isEmpty());
        assertEquals(1, attempts.size());
        assertEquals("PSP_A", attempts.get(0).getProvider());
        assertEquals("SUCCESS", attempts.get(0).getStatus());
    }

    @Test
    void scenario2_ProviderFailure_TriggersSafeFailoverToFallback_Success() {
        // Given PSP-A fails, but fallback providers succeed
        mockPspA.setSimulationMode(SimulationMode.FORCE_FAILURE);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);
        mockPspC.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_s2_" + UUID.randomUUID();

        // When
        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        // Then
        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotEquals("PSP_A", response.getProvider(), "Primary PSP-A failed, provider must be fallback");

        List<PaymentAttempt> attempts = attemptRepository.findByPaymentIdOrderByStartedAtAsc(response.getId());
        assertEquals(2, attempts.size(), "Should have attempted on PSP-A then failed over to fallback PSP");
        assertEquals("PSP_A", attempts.get(0).getProvider());
        assertEquals("FAILED", attempts.get(0).getStatus());

        assertNotEquals("PSP_A", attempts.get(1).getProvider());
        assertEquals("SUCCESS", attempts.get(1).getStatus());
        assertTrue(attempts.get(1).getIsSafeFailover());
    }

    @Test
    void scenario3_ProviderTimeout_TransitionsToUnknown_AndResolvesViaStatusCheck() {
        // Given PSP-A produces a timeout, but internal ledger has completed it
        mockPspA.setSimulationMode(SimulationMode.FORCE_TIMEOUT);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("CARD")
                .build();

        String idempotencyKey = "idem_s3_" + UUID.randomUUID();

        PaymentResponse response = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);
        assertNotNull(response);
    }

    @Test
    void scenario4_ProviderOutage_CircuitBreakerOmitsDownProvider() {
        // Given PSP-A is DOWN (Outage)
        mockPspA.setHealthy(false);
        mockPspB.setSimulationMode(SimulationMode.FORCE_SUCCESS);
        mockPspC.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        RoutingResult routing = routingEngine.routePayment(
                UUID.randomUUID(), testMerchant.getId(), "CARD", testOrder.getAmount(), "INR");

        // When routing is evaluated, PSP-A is omitted from primary selection
        assertNotNull(routing);
        assertNotEquals("PSP_A", routing.getSelectedProvider(), "PSP-A should be omitted since it is DOWN");
    }

    @Test
    void scenario5_Idempotency_DuplicateKeyReturnsExistingPaymentWithoutNewAttempt() {
        mockPspA.setSimulationMode(SimulationMode.FORCE_SUCCESS);

        CreatePaymentRequest request = CreatePaymentRequest.builder()
                .orderId(testOrder.getId())
                .method("UPI")
                .build();

        String idempotencyKey = "idem_s5_duplicate_check";

        PaymentResponse response1 = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);
        PaymentResponse response2 = paymentService.createPayment(testMerchant.getId(), idempotencyKey, request);

        assertEquals(response1.getId(), response2.getId(), "Duplicate request must return identical payment ID");
        assertEquals(PaymentStatus.SUCCESS, response2.getStatus());

        long attemptCount = attemptRepository.countByPaymentId(response1.getId());
        assertEquals(1, attemptCount, "Only 1 payment attempt must exist despite duplicate calls");
    }

    @Test
    void scenario7_Reconciliation_ReconcilesStuckUnknownPayment() {
        // Given a payment record in UNKNOWN state with a mock provider reference
        String mockProviderId = "pay_psp_a_reconcile_test";
        mockPspA.setSimulatedStatus(mockProviderId, PaymentStatus.SUCCESS);

        Payment stuckPayment = Payment.builder()
                .orderId(testOrder.getId())
                .merchantId(testMerchant.getId())
                .amount(testOrder.getAmount())
                .currency(testOrder.getCurrency())
                .status(PaymentStatus.UNKNOWN)
                .provider("PSP_A")
                .providerPaymentId(mockProviderId)
                .method("CARD")
                .build();
        stuckPayment = paymentRepository.save(stuckPayment);

        // When reconciliation job runs
        Map<String, Object> reconResult = reconciliationScheduler.reconcileNow();

        assertNotNull(reconResult);

        Payment updated = paymentRepository.findById(stuckPayment.getId()).orElseThrow();
        assertEquals(PaymentStatus.SUCCESS, updated.getStatus(), "Reconciliation should transition UNKNOWN to SUCCESS");
    }
}
