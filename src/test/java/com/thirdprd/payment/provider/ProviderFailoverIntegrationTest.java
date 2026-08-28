package com.thirdprd.payment.provider;

import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.repository.PaymentEventRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.event.ProviderFailoverEvent;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import com.thirdprd.payment.provider.router.ProviderRouter;
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
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProviderFailoverIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MockPaymentProvider primaryProvider;

    @Autowired
    private MockPaymentProviderB secondaryProvider;

    @Autowired
    private ProviderHealthRepository healthRepository;

    @Autowired
    private ProviderRouter providerRouter;

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
    private com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    private String apiKey;
    private UUID merchantId;

    @BeforeEach
    void setUp() {
        providerRouter.clearRecordedFailoverEvents();
        primaryProvider.setHealthy(true);
        secondaryProvider.setHealthy(true);

        paymentEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();
        healthRepository.deleteAll();

        healthRepository.save(ProviderHealth.builder().provider(primaryProvider.getProviderName()).status(HealthStatus.HEALTHY).build());
        healthRepository.save(ProviderHealth.builder().provider(secondaryProvider.getProviderName()).status(HealthStatus.HEALTHY).build());

        Merchant merchant = Merchant.builder()
                .name("Failover Test Store")
                .email("failover@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_failover_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testFailoverToSecondaryProviderWhenPrimaryIsDownAndRecovery() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(25000L)
                .currency("INR")
                .receipt("rcpt_failover_1")
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

        // 2. Force primary provider to fail (DOWN)
        primaryProvider.setHealthy(false);
        ProviderHealth ph = healthRepository.findByProvider(primaryProvider.getProviderName()).orElseThrow();
        ph.setStatus(HealthStatus.DOWN);
        healthRepository.save(ph);

        // 3. Create payment -> assert it succeeds via secondary provider (MOCK_PROVIDER_B)
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("CARD")
                .build();

        MvcResult paymentResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_failover_001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String respJson = paymentResult.getResponse().getContentAsString();
        PaymentResponse response = objectMapper.readValue(
                objectMapper.readTree(respJson).path("data").toString(), PaymentResponse.class);

        assertEquals("SUCCESS", response.getStatus().name());
        assertEquals("MOCK_PROVIDER_B", response.getProvider());
        assertTrue(response.getProviderPaymentId().startsWith("pay_mockb_"));

        // Verify ProviderFailover event was recorded
        List<ProviderFailoverEvent> failovers = providerRouter.getRecordedFailoverEvents();
        assertFalse(failovers.isEmpty(), "ProviderFailoverEvent must be recorded when routing falls back");
        assertEquals("MOCK_PROVIDER", failovers.get(0).getPrimaryProvider());
        assertEquals("MOCK_PROVIDER_B", failovers.get(0).getFallbackProvider());

        // 4. Recovery: restore primary provider health
        primaryProvider.setHealthy(true);
        ph.setStatus(HealthStatus.HEALTHY);
        healthRepository.save(ph);

        // Create 2nd order and payment -> confirm it routes back to primary (MOCK_PROVIDER)
        MvcResult orderResult2 = mockMvc.perform(post("/api/v1/orders")
                        .header("Authorization", "Bearer " + apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isCreated())
                .andReturn();

        UUID orderId2 = UUID.fromString(objectMapper.readTree(orderResult2.getResponse().getContentAsString())
                .path("data").path("id").asText());

        CreatePaymentRequest paymentReq2 = CreatePaymentRequest.builder()
                .orderId(orderId2)
                .method("CARD")
                .build();

        MvcResult paymentResult2 = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", "idem_failover_002")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq2)))
                .andExpect(status().isCreated())
                .andReturn();

        PaymentResponse response2 = objectMapper.readValue(
                objectMapper.readTree(paymentResult2.getResponse().getContentAsString()).path("data").toString(), PaymentResponse.class);

        assertEquals("SUCCESS", response2.getStatus().name());
        assertEquals("MOCK_PROVIDER", response2.getProvider());
        assertTrue(response2.getProviderPaymentId().startsWith("pay_mock_"));
    }
}
