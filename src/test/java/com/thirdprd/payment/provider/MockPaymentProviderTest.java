package com.thirdprd.payment.provider;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class MockPaymentProviderTest {

    private MockPaymentProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MockPaymentProvider();
    }

    @Test
    void testCreatePaymentDefaultSuccess() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(5000L)
                .currency("INR")
                .method("CARD")
                .build();

        ProviderResponse response = provider.createPayment(request);

        assertTrue(response.isSuccess());
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertNotNull(response.getProviderPaymentId());
    }

    @Test
    void testSimulatedDecline() {
        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(5000L)
                .currency("INR")
                .method("CARD")
                .notes(Map.of("simulate", "fail"))
                .build();

        ProviderResponse response = provider.createPayment(request);

        assertFalse(response.isSuccess());
        assertEquals(PaymentStatus.FAILED, response.getStatus());
        assertEquals("BAD_CARD_OR_DECLINED", response.getErrorCode());
    }
}
