package com.thirdprd.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
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
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentPlatformIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private MerchantApiKeyRepository apiKeyRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String apiKey;
    private UUID merchantId;

    @BeforeEach
    void setUp() {
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("Acme Corp")
                .email("billing@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("hashed_secret")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testEndToEndOrderAndPaymentFlow() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(50000L) // 500.00 INR in paise
                .currency("INR")
                .receipt("rcpt_1001")
                .notes(Map.of("customer_name", "John Doe"))
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_order_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.id", notNullValue()))
                .andExpect(jsonPath("$.data.amount", is(50000)))
                .andExpect(jsonPath("$.data.status", is("CREATED")))
                .andReturn();

        String orderIdStr = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("id").asText();
        UUID orderId = UUID.fromString(orderIdStr);

        // 2. Replay Order Creation with Idempotency Key -> Should Return Replayed 201 Response
        mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_order_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(orderIdStr)));

        // 3. Create Payment against Order
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("CARD")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_pay_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.providerPaymentId", notNullValue()))
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. Verify Order status updated to PAID
        mockMvc.perform(get("/api/v1/orders/" + orderId)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PAID")));

        // 5. Fetch Payment Status
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")));
    }
}
