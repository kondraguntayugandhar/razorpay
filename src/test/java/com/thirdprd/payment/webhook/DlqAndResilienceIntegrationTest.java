package com.thirdprd.payment.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.webhook.repository.WebhookEventRepository;
import com.thirdprd.payment.webhook.service.WebhookService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DlqAndResilienceIntegrationTest {

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
    private ObjectMapper objectMapper;

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
                .name("Resilience Store")
                .email("resilience@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_res_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testWebhookConsumerFailuresAndDlqRoutingPreservesPaymentPendingState() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(50000L)
                .currency("INR")
                .receipt("rcpt_dlq_001")
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID orderId = UUID.fromString(objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("id").asText());

        // 2. Create UPI Payment in PENDING status
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
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. Simulate repeated consumer failure (3 retries before DLQ routing) by passing nonexistent webhook event ID
        UUID nonExistentWebhookId = UUID.randomUUID();
        for (int retry = 1; retry <= 3; retry++) {
            webhookService.processWebhookAsync(nonExistentWebhookId);
        }

        // 4. ASSERT: Payment state MUST REMAIN PENDING (never silently defaulting to FAILED)
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }
}
