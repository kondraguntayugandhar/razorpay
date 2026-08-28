package com.thirdprd.payment.provider;

import com.thirdprd.payment.provider.config.RazorpayConfig;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class RazorpayIntegrationTest {

    @Autowired
    private RazorpayProvider razorpayProvider;

    @Autowired
    private RazorpayConfig razorpayConfig;

    @BeforeEach
    void setUp() {
        assertNotNull(razorpayProvider);
        assertNotNull(razorpayConfig);
    }

    @Test
    void testEndToEndOrderCreationAndSignatureVerification() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(250000L) // ₹2,500.00 = 250000 paise
                .currency("INR")
                .build();

        ProviderResponse response = razorpayProvider.createPayment(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("RAZORPAY", response.getProviderName());
        assertNotNull(response.getProviderPaymentId());

        // Test signature verification
        String payload = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_rzp_mock123\",\"order_id\":\"" + response.getProviderPaymentId() + "\"}}}}";
        String validSignature = calculateHmacSha256(payload, razorpayConfig.getWebhookSecret());

        boolean isSignatureValid = razorpayProvider.verifySignature(payload, validSignature, razorpayConfig.getWebhookSecret());
        assertTrue(isSignatureValid, "Signature verification must succeed for valid HMAC payload");
    }

    private String calculateHmacSha256(String data, String key) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec secretKeySpec = new javax.crypto.spec.SecretKeySpec(
                    key.getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(data.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
