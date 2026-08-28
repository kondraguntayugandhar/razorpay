package com.thirdprd.payment.refund;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.refund.dto.CreateRefundRequest;
import com.thirdprd.payment.refund.repository.RefundRepository;
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
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RefundIntegrationTest {

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
    private RefundRepository refundRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String apiKey;
    private UUID merchantId;

    @BeforeEach
    void setUp() {
        refundRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("Refund Integration Store")
                .email("refunds@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_rf_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testEndToEndRefundCreationAndIdempotencyKeyDeduplication() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(100000L) // ₹1000.00
                .currency("INR")
                .receipt("rcpt_rf_001")
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String orderIdStr = objectMapper.readTree(orderResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 2. Create Payment (card payment succeeds immediately with MOCK_PROVIDER)
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(UUID.fromString(orderIdStr))
                .method("CARD")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andReturn();

        String paymentIdStr = objectMapper.readTree(paymentResult.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 3. Initiate Partial Refund with Idempotency-Key
        CreateRefundRequest refundReq = CreateRefundRequest.builder()
                .amount(40000L) // ₹400.00
                .reason("Damaged item")
                .build();

        String idempotencyKey = "idem_refund_100";

        MvcResult refundResult1 = mockMvc.perform(post("/api/v1/payments/" + paymentIdStr + "/refunds")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("SUCCESS")))
                .andExpect(jsonPath("$.data.amount", is(40000)))
                .andReturn();

        String refundIdStr = objectMapper.readTree(refundResult1.getResponse().getContentAsString())
                .path("data").path("id").asText();

        // 4. Duplicate Refund Request with SAME Idempotency-Key -> assert exact cached response
        mockMvc.perform(post("/api/v1/payments/" + paymentIdStr + "/refunds")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refundReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id", is(refundIdStr)))
                .andReturn();

        // Verify only 1 refund record was saved in database
        assertEquals(1, refundRepository.count());

        // 5. Check Payment status transitioned to PARTIALLY_REFUNDED
        mockMvc.perform(get("/api/v1/payments/" + paymentIdStr)
                        .header("Authorization", "Bearer " + apiKey))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("PARTIALLY_REFUNDED")));
    }
}
