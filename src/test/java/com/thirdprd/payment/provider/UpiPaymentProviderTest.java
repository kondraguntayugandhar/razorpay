package com.thirdprd.payment.provider;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class UpiPaymentProviderTest {

    private UpiPaymentProvider upiPaymentProvider;

    @BeforeEach
    void setUp() {
        upiPaymentProvider = new UpiPaymentProvider(0, "merchant@fastpay", "FastPay Store");
    }

    @Test
    void testGenerateIntentUriWithExplicitPaiseToRupeesConversion() {
        Long amountPaise = 50000L; // 50000 paise = ₹500.00
        String transactionRef = "upi_ref_test123456";

        String intentUri = upiPaymentProvider.generateIntentUri(amountPaise, transactionRef);

        assertNotNull(intentUri);
        assertTrue(intentUri.startsWith("upi://pay?"), "Intent URI must start with upi://pay?");
        assertTrue(intentUri.contains("pa=merchant@fastpay"), "URI must contain merchant VPA");
        assertTrue(intentUri.contains("am=500.00"), "EXPLICIT ASSERTION: 50000 paise must convert to am=500.00 in rupees");
        assertTrue(intentUri.contains("tr=upi_ref_test123456"), "URI must contain transaction reference");
        assertTrue(intentUri.contains("cu=INR"), "URI must specify currency=INR");
    }

    @Test
    void testZXingQrCodeGenerationOutput() {
        String testText = "upi://pay?pa=merchant@fastpay&pn=FastPay%20Store&am=500.00&tr=ref123&cu=INR";

        String qrBase64 = upiPaymentProvider.generateQrCodeBase64(testText, 200, 200);

        assertNotNull(qrBase64);
        assertFalse(qrBase64.isBlank(), "Generated QR code Base64 string must not be empty");

        byte[] decoded = Base64.getDecoder().decode(qrBase64);
        assertTrue(decoded.length > 100, "Decoded PNG byte array must contain valid image data");
    }

    @Test
    void testVpaValidationAcceptsValidVpa() {
        assertTrue(upiPaymentProvider.validateVpa("user@okicici"));
        assertTrue(upiPaymentProvider.validateVpa("merchant.store-1@hdfcbank"));
        assertTrue(upiPaymentProvider.validateVpa("customer_123@ybl"));
        assertTrue(upiPaymentProvider.validateVpa("payee@paytm"));
    }

    @Test
    void testVpaValidationRejectsMalformedVpa() {
        assertFalse(upiPaymentProvider.validateVpa(null));
        assertFalse(upiPaymentProvider.validateVpa(""));
        assertFalse(upiPaymentProvider.validateVpa("   "));
        assertFalse(upiPaymentProvider.validateVpa("invalid_vpa_without_at"));
        assertFalse(upiPaymentProvider.validateVpa("bad_vpa@"));
        assertFalse(upiPaymentProvider.validateVpa("@bank"));
        assertFalse(upiPaymentProvider.validateVpa("user@bank@extra"));
    }

    @Test
    void testCollectFlowRejectsMalformedVpaWithInvalidVpaErrorCode() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .amount(25000L)
                .method("UPI")
                .vpa("malformed_vpa_string")
                .upiFlow("collect")
                .build();

        ProviderResponse response = upiPaymentProvider.createPayment(request);

        assertNotNull(response);
        assertFalse(response.isSuccess(), "Collect flow with malformed VPA must fail");
        assertEquals("INVALID_VPA", response.getErrorCode());
        assertTrue(response.getErrorDescription().contains("user@bank"));
    }

    @Test
    void testCollectFlowReturnsPendingStatus() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .amount(75000L)
                .method("UPI")
                .vpa("customer@okicici")
                .upiFlow("collect")
                .build();

        ProviderResponse response = upiPaymentProvider.createPayment(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        assertEquals("UPI", response.getProviderName());
        assertEquals(PaymentStatus.PENDING, response.getStatus());
        assertNotNull(response.getUpiReferenceId());
        assertTrue(response.getUpiReferenceId().startsWith("upi_ref_"));
        assertEquals("customer@okicici", response.getVpa());
    }
}
