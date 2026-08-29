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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class LiveApiVerificationRunnerTest {

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

        apiKey = "rzp_test_acme_key_001";
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("hashed_secret")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void executeLiveApiVerification() throws Exception {
        System.out.println("========================================================");
        System.out.println("LIVE VERIFICATION: CUSTOMER FRONTEND API ENDPOINTS");
        System.out.println("========================================================");

        // 1. POST /api/v1/orders
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(50000L)
                .currency("INR")
                .receipt("rcpt_cust_test_001")
                .notes(Map.of("customer_name", "Ananya Krishnan"))
                .build();

        MvcResult orderResult = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_live_ord_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andReturn();

        int orderStatus = orderResult.getResponse().getStatus();
        String orderBody = orderResult.getResponse().getContentAsString();

        System.out.println("\nHTTP STATUS FOR POST /api/v1/orders: " + orderStatus);
        System.out.println("RESPONSE BODY FOR POST /api/v1/orders:");
        System.out.println(orderBody);

        String orderIdStr = objectMapper.readTree(orderBody)
                .path("data").path("id").asText();
        UUID orderId = UUID.fromString(orderIdStr);

        // 2. POST /api/v1/payments
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("UPI")
                .vpa("ananya@upi")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_live_pay_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andReturn();

        int paymentStatus = paymentResult.getResponse().getStatus();
        String paymentBody = paymentResult.getResponse().getContentAsString();

        System.out.println("\nHTTP STATUS FOR POST /api/v1/payments: " + paymentStatus);
        System.out.println("RESPONSE BODY FOR POST /api/v1/payments:");
        System.out.println(paymentBody);
        System.out.println("========================================================");
    }
}
