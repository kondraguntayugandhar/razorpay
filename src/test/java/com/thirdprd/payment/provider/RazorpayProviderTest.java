package com.thirdprd.payment.provider;

import com.razorpay.Order;
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import com.thirdprd.payment.provider.config.RazorpayConfig;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RazorpayProviderTest {

    @Mock
    private RazorpayConfig razorpayConfig;

    @Mock
    private RazorpayClient razorpayClient;

    @Mock
    private OrderClient orderClient;

    private RazorpayProvider razorpayProvider;

    @BeforeEach
    void setUp() {
        lenient().when(razorpayConfig.getKeyId()).thenReturn("rzp_test_mockKey");
        lenient().when(razorpayConfig.getKeySecret()).thenReturn("mockSecret");
        lenient().when(razorpayConfig.getWebhookSecret()).thenReturn("test_webhook_secret_key");
        lenient().when(razorpayConfig.getPaymentProvider()).thenReturn("mock");
        razorpayProvider = new RazorpayProvider(razorpayConfig);
    }

    @Test
    void testAmountInPaiseExplicitNumericAssertion() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(50000L) // 50000 paise = ₹500.00
                .currency("INR")
                .build();

        JSONObject orderRequest = razorpayProvider.buildOrderRequest(request);

        assertNotNull(orderRequest);
        assertEquals(50000L, orderRequest.getLong("amount"), "Razorpay JSON payload must contain exact amount in paise (50000)");
        assertEquals("INR", orderRequest.getString("currency"), "Razorpay JSON payload must specify INR currency");
        assertEquals(1, orderRequest.getInt("payment_capture"), "Razorpay JSON payload must set payment_capture=1");
    }

    @Test
    void testOrderCreationWithMockedRazorpayClientSDK() throws Exception {
        razorpayClient.orders = orderClient;

        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(50000L) // 50000 paise = ₹500.00
                .currency("INR")
                .build();

        Order mockOrder = mock(Order.class);
        when(mockOrder.get("id")).thenReturn("order_rzp_mock_12345");
        when(mockOrder.toString()).thenReturn("{\"id\":\"order_rzp_mock_12345\"}");
        when(orderClient.create(any(JSONObject.class))).thenReturn(mockOrder);

        RazorpayProvider providerWithClient = new RazorpayProvider(razorpayConfig, razorpayClient);
        ProviderResponse response = providerWithClient.createPayment(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("order_rzp_mock_12345", response.getProviderPaymentId());

        ArgumentCaptor<JSONObject> jsonCaptor = ArgumentCaptor.forClass(JSONObject.class);
        verify(orderClient).create(jsonCaptor.capture());

        JSONObject captured = jsonCaptor.getValue();
        assertEquals(50000L, captured.getLong("amount"), "Captured Razorpay SDK argument must match 50000 paise explicitly");
        assertEquals("INR", captured.getString("currency"), "Captured currency must be INR");
    }

    @Test
    void testRazorpayTestProviderModeRefusesSimulationWhenClientUninitialized() {
        when(razorpayConfig.getPaymentProvider()).thenReturn("razorpay-test");

        RazorpayProvider uninitProvider = new RazorpayProvider(razorpayConfig, null);
        PaymentRequest request = PaymentRequest.builder()
                .amount(10000L)
                .build();

        ProviderResponse response = uninitProvider.createPayment(request);

        assertFalse(response.isSuccess());
        assertEquals("RAZORPAY_CLIENT_UNINITIALIZED", response.getErrorCode());
        assertTrue(response.getErrorDescription().contains("razorpay-test"));
    }

    @Test
    void testVerifySignatureRejectsForgedSignature() {
        String payload = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_12345\"}}}}";
        String invalidSignature = "invalid_forged_signature_12345";

        boolean isValid = razorpayProvider.verifySignature(payload, invalidSignature, "test_webhook_secret_key");

        assertFalse(isValid, "RazorpayProvider must reject invalid/forged signature");
    }

    @Test
    void testVerifySignatureAcceptsValidSignature() {
        String payload = "{\"event\":\"payment.captured\",\"payload\":{\"payment\":{\"entity\":{\"id\":\"pay_12345\"}}}}";
        String secret = "test_webhook_secret_key";

        String validSignature = calculateHmacSha256(payload, secret);

        boolean isValid = razorpayProvider.verifySignature(payload, validSignature, secret);

        assertTrue(isValid, "RazorpayProvider must accept valid HMAC SHA256 signature");
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
