package com.thirdprd.payment.analytics;

import com.thirdprd.payment.analytics.indexer.PaymentAnalyticsIndexer;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AnalyticsPipelineIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MerchantRepository merchantRepository;

    @Autowired
    private MerchantApiKeyRepository apiKeyRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAnalyticsIndexer analyticsIndexer;

    private UUID paymentId;
    private UUID merchantId;
    private String apiKey;

    @BeforeEach
    void setUp() {
        paymentRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("Acme Analytics Merchant")
                .email("analytics@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_analytics_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);

        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(UUID.randomUUID())
                .amount(100000L)
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .provider("MOCK_PROVIDER")
                .providerPaymentId("pay_analytics_001")
                .method("CARD")
                .build();

        payment = paymentRepository.save(payment);
        paymentId = payment.getId();
    }

    @Test
    void testAnalyticsSearchEndpointReturnsCleanResponsePayload() throws Exception {
        // Trigger analytics indexer
        analyticsIndexer.indexPayment(paymentId, "SUCCESS", null);

        // Query analytics search endpoint with valid Merchant Auth Header
        mockMvc.perform(get("/api/v1/analytics/payments/search")
                        .header("Authorization", "Bearer " + apiKey)
                        .param("status", "SUCCESS")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
