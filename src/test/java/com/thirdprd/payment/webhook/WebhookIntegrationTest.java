package com.thirdprd.payment.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentEvent;
import com.thirdprd.payment.payment.repository.PaymentEventRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.MockPaymentProvider;
import com.thirdprd.payment.webhook.entity.WebhookEvent;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import com.thirdprd.payment.webhook.repository.WebhookEventRepository;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.List;
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
class WebhookIntegrationTest {

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
    private PaymentEventRepository paymentEventRepository;

    @Autowired
    private WebhookEventRepository webhookEventRepository;

    @Autowired
    private MockPaymentProvider mockPaymentProvider;

    @Autowired
    private WebhookService webhookService;

    @Autowired
    private WebhookSignatureVerifier signatureVerifier;

    @Autowired
    private ObjectMapper objectMapper;

    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;

    private String apiKey;
    private UUID merchantId;

    @BeforeEach
    void setUp() {
        webhookEventRepository.deleteAll();
        paymentEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("Acme Webhook Store")
                .email("webhooks@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_wh_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testEndToEndWebhookProcessingFlow() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(75000L)
                .currency("INR")
                .receipt("rcpt_wh_100")
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

        // 2. Create Payment with PENDING simulation
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("UPI")
                .notes(Map.of("simulate", "pending"))
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("PENDING")))
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        String providerPaymentId = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("providerPaymentId").asText();

        // 3. Fire Webhook POST /api/v1/webhooks/MOCK_PROVIDER marking payment SUCCESS
        String eventId = "evt_wh_" + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String webhookPayload = mockPaymentProvider.generateMockWebhookPayload(eventId, providerPaymentId, PaymentStatus.SUCCESS);
        String signature = signatureVerifier.calculateSignature(webhookPayload, null);

        mockMvc.perform(post("/api/v1/webhooks/MOCK_PROVIDER")
                        .header("X-Webhook-Signature", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(webhookPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Process WebhookReceivedEvent synchronously for test assertions
        WebhookReceivedEvent event = new WebhookReceivedEvent(UUID.randomUUID(), "MOCK_PROVIDER", eventId, webhookPayload, true);
        webhookService.processWebhookAsync(event);

        // Wait for async webhook background processing to complete and update status
        for (int i = 0; i < 30; i++) {
            entityManager.clear();
            Payment p = paymentRepository.findByProviderPaymentId(providerPaymentId).orElse(null);
            if (p != null && p.getStatus() == PaymentStatus.SUCCESS) {
                break;
            }
            Thread.sleep(100);
        }
        entityManager.clear();

        // 4. Assert Payment status is SUCCESS
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));

        // 5. Assert Order status is PAID
        mockMvc.perform(get("/api/v1/orders/" + orderIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PAID")));

        // 6. Assert PaymentEvents contains full audit trail
        List<PaymentEvent> events = paymentEventRepository.findByPaymentIdOrderByCreatedAtAsc(UUID.fromString(paymentIdStr));
        assertTrue(events.size() >= 3);
        assertEquals(PaymentStatus.CREATED, events.get(0).getToStatus());
        assertEquals(PaymentStatus.PROCESSING, events.get(1).getToStatus());
        assertEquals(PaymentStatus.PENDING, events.get(2).getToStatus());
        assertEquals(PaymentStatus.SUCCESS, events.get(events.size() - 1).getToStatus());
    }

    @Test
    void testForgedRazorpayWebhookSignatureRejection() throws Exception {
        String forgedRazorpayPayload = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_rzp_forged123\",\"order_id\":\"order_rzp_forged456\",\"status\":\"captured\"}}}}";
        String invalidSignature = "invalid_forged_razorpay_hmac_signature";

        mockMvc.perform(post("/api/v1/webhooks/RAZORPAY")
                        .header("X-Razorpay-Signature", invalidSignature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(forgedRazorpayPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.error.code", is("INVALID_SIGNATURE")));

        // Verify zero payment state mutations occurred
        assertEquals(0, paymentEventRepository.count());
    }
}
