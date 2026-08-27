package com.thirdprd.payment.idempotency;

import com.thirdprd.payment.idempotency.service.IdempotencyLockService;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.repository.PaymentEventRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
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
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class IdempotencyLockInterruptIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private IdempotencyLockService lockService;

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
        paymentEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        apiKeyRepository.deleteAll();
        merchantRepository.deleteAll();

        Merchant merchant = Merchant.builder()
                .name("Interrupt Test Store")
                .email("interrupt@acme.com")
                .status("ACTIVE")
                .build();
        merchant = merchantRepository.save(merchant);
        merchantId = merchant.getId();

        apiKey = "rzp_test_interrupt_" + UUID.randomUUID().toString().replace("-", "");
        MerchantApiKey key = MerchantApiKey.builder()
                .merchantId(merchantId)
                .keyId(apiKey)
                .keySecretHash("secret_hash")
                .isTestMode(true)
                .build();
        apiKeyRepository.save(key);
    }

    @Test
    void testInterruptedWorkerThreadReleasesLockAndRetrySucceeds() throws Exception {
        // 1. Create Order
        CreateOrderRequest orderReq = CreateOrderRequest.builder()
                .amount(9900L)
                .currency("INR")
                .receipt("rcpt_interrupt_1")
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

        String idempotencyKey = "idem_interrupt_key_001";
        String lockKey = "lock:idempotency:" + merchantId + ":" + idempotencyKey;

        // 2. Simulate a winning thread acquiring lock and getting interrupted mid-processing
        ExecutorService workerExecutor = Executors.newSingleThreadExecutor();
        CountDownLatch acquiredLatch = new CountDownLatch(1);
        CountDownLatch releaseLatch = new CountDownLatch(1);

        Future<?> workerFuture = workerExecutor.submit(() -> {
            boolean acquired = lockService.acquireLock(lockKey, 2); // 2 sec short TTL
            if (acquired) {
                acquiredLatch.countDown();
                try {
                    releaseLatch.await(); // wait until interrupted
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    lockService.releaseLock(lockKey);
                }
            }
        });

        // Wait for worker to acquire lock
        assertTrue(acquiredLatch.await(3, TimeUnit.SECONDS), "Worker thread must acquire lock");

        // Interrupt / cancel the worker thread mid-processing
        workerFuture.cancel(true);
        workerExecutor.shutdown();

        // 3. Retry payment request with the same idempotency key -> MUST succeed without hanging!
        CreatePaymentRequest paymentReq = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("CARD")
                .build();

        MvcResult retryResult = mockMvc.perform(post("/api/v1/payments")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Idempotency-Key", idempotencyKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(paymentReq)))
                .andExpect(status().isCreated())
                .andReturn();

        assertNotNull(retryResult.getResponse().getContentAsString());
        assertTrue(retryResult.getResponse().getContentAsString().contains("pay_mock_"));
    }
}
