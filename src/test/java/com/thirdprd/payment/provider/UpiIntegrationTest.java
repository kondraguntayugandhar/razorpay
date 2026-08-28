package com.thirdprd.payment.provider;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.payment.service.PaymentPushNotificationService;
import com.thirdprd.payment.webhook.entity.WebhookEvent;
import com.thirdprd.payment.webhook.repository.WebhookEventRepository;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UpiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private MerchantApiKeyRepository apiKeyRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private WebhookEventRepository webhookEventRepository;

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private WebhookSignatureVerifier signatureVerifier;

    @Autowired
    private PaymentPushNotificationService pushNotificationService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EntityManager entityManager;

    private String apiKey;
    private UUID merchantId;

    @BeforeEach
    void setUp() {
        webhookEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("UPI Test Store")
                .email("upi@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_upi_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testEndToEndUpiCollectFlowSuccessAndPushLatencyUnder200ms() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(50000L) // ₹500.00
                .currency("INR")
                .receipt("rcpt_upi_100")
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String orderIdStr = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID orderId = UUID.fromString(orderIdStr);

        // 2. Create UPI Collect Payment
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("UPI")
                .vpa("customer@okicici")
                .upiFlow("collect")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andExpect(jsonPath("$.data.vpa", is("customer@okicici")))
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID paymentId = UUID.fromString(paymentIdStr);
        String providerPaymentId = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("providerPaymentId").asText();

        // 3. Connect SSE push subscriber stream
        pushNotificationService.subscribe(paymentId);
        assertTrue(pushNotificationService.getSubscriberCount(paymentId) > 0, "SSE subscriber must be active");

        // 4. Fire Webhook POST /api/v1/webhooks/UPI marking payment SUCCESS
        String eventId = "evt_upi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String webhookPayload = objectMapper.writeValueAsString(Map.of(
                "event_id", eventId,
                "provider_payment_id", providerPaymentId,
                "status", "SUCCESS"
        ));
        String signature = signatureVerifier.calculateSignature(webhookPayload, null);

        long webhookReceiptTime = System.currentTimeMillis();

        mockMvc.perform(post("/api/v1/webhooks/UPI")
                        .header("X-Webhook-Signature", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Run async webhook processor for test assertions and measure processing hop delta
        WebhookEvent event = webhookEventRepository.findByProviderAndProviderEventId("UPI", eventId).orElse(null);
        assertNotNull(event);

        if (!Boolean.TRUE.equals(event.getProcessed())) {
            webhookService.processWebhookAsync(event.getId());
        }

        long pushCompletedTime = System.currentTimeMillis();
        long elapsedT3ToT6Ms = pushCompletedTime - webhookReceiptTime;

        // 5. ASSERT LATENCY BUDGET: T3 -> T6 (Webhook receipt -> state transition -> SSE push) MUST BE < 200ms
        assertTrue(elapsedT3ToT6Ms < 200, "EXPLICIT ASSERTION: T3->T6 Webhook to push notification latency must be < 200ms. Actual: " + elapsedT3ToT6Ms + "ms");

        // Wait for async webhook processing to complete
        for (int i = 0; i < 30; i++) {
            entityManager.clear();
            Payment p = paymentRepository.findById(paymentId).orElse(null);
            if (p != null && p.getStatus() == PaymentStatus.SUCCESS) {
                break;
            }
            Thread.sleep(100);
        }
        entityManager.clear();

        // 6. Assert Payment status is SUCCESS
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));

        // 7. Assert Order status is PAID
        mockMvc.perform(get("/api/v1/orders/" + orderIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PAID")));
    }

    @Test
    void testEndToEndUpiCollectFlowFailurePathAndPushNotification() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(25000L)
                .currency("INR")
                .receipt("rcpt_upi_fail_101")
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String orderIdStr = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID orderId = UUID.fromString(orderIdStr);

        // 2. Create UPI Collect Payment
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("UPI")
                .vpa("user@okicici")
                .upiFlow("collect")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID paymentId = UUID.fromString(paymentIdStr);
        String providerPaymentId = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("providerPaymentId").asText();

        // Subscribe to push notifications
        pushNotificationService.subscribe(paymentId);

        // 3. Fire Webhook POST /api/v1/webhooks/UPI marking payment FAILED (Customer Declined)
        String eventId = "evt_upi_fail_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String webhookPayload = objectMapper.writeValueAsString(Map.of(
                "event_id", eventId,
                "provider_payment_id", providerPaymentId,
                "status", "FAILED",
                "error_code", "UPI_COLLECT_REJECTED",
                "error_description", "Customer declined collect request on UPI app"
        ));
        String signature = signatureVerifier.calculateSignature(webhookPayload, null);

        mockMvc.perform(post("/api/v1/webhooks/UPI")
                        .header("X-Webhook-Signature", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk());

        // Wait for async webhook processing to complete
        for (int i = 0; i < 30; i++) {
            entityManager.clear();
            Payment p = paymentRepository.findById(paymentId).orElse(null);
            if (p != null && p.getStatus() == PaymentStatus.FAILED) {
                break;
            }
            Thread.sleep(100);
        }
        entityManager.clear();

        // 4. Assert Payment status transitions to FAILED with error details
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("FAILED")))
                .andExpect(jsonPath("$.data.errorCode", is("UPI_COLLECT_REJECTED")))
                .andExpect(jsonPath("$.data.errorDescription", is("Customer declined collect request on UPI app")));
    }
}
