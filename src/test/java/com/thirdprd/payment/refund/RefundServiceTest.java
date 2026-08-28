package com.thirdprd.payment.refund;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.ProviderRefundResponse;
import com.thirdprd.payment.refund.dto.CreateRefundRequest;
import com.thirdprd.payment.refund.dto.RefundResponse;
import com.thirdprd.payment.refund.entity.Refund;
import com.thirdprd.payment.refund.repository.RefundRepository;
import com.thirdprd.payment.refund.service.RefundService;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RefundServiceTest {

    private PaymentRepository paymentRepository;
    private RefundRepository refundRepository;
    private PaymentProvider paymentProvider;
    private PaymentStateMachine stateMachine;
    private RefundService refundService;

    private UUID merchantId;
    private UUID paymentId;
    private Payment testPayment;

    @BeforeEach
    void setUp() {
        paymentRepository = Mockito.mock(PaymentRepository.class);
        refundRepository = Mockito.mock(RefundRepository.class);
        paymentProvider = Mockito.mock(PaymentProvider.class);
        stateMachine = new PaymentStateMachine();

        refundService = new RefundService(paymentRepository, refundRepository, paymentProvider, stateMachine);

        merchantId = UUID.randomUUID();
        paymentId = UUID.randomUUID();
        testPayment = Payment.builder()
                .id(paymentId)
                .merchantId(merchantId)
                .amount(50000L) // ₹500.00
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .providerPaymentId("pay_test_123")
                .build();

        when(paymentRepository.findByIdAndMerchantId(paymentId, merchantId)).thenReturn(Optional.of(testPayment));
        when(refundRepository.save(any(Refund.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void testFullRefundTransitionsStatusToRefunded() {
        CreateRefundRequest request = CreateRefundRequest.builder()
                .amount(50000L)
                .reason("Customer cancellation")
                .build();

        when(refundRepository.sumSuccessfulRefundAmountByPaymentId(paymentId)).thenReturn(0L);
        when(paymentProvider.refund(any())).thenReturn(ProviderRefundResponse.builder()
                .success(true)
                .providerRefundId("rfnd_test_001")
                .build());

        RefundResponse response = refundService.createRefund(merchantId, paymentId, "idem_rfnd_1", request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals("rfnd_test_001", response.getProviderRefundId());
        assertEquals(PaymentStatus.REFUNDED, testPayment.getStatus());
        verify(paymentRepository, times(2)).save(testPayment);
    }

    @Test
    void testPartialRefundTransitionsStatusToPartiallyRefunded() {
        CreateRefundRequest request = CreateRefundRequest.builder()
                .amount(20000L)
                .reason("Partial return")
                .build();

        when(refundRepository.sumSuccessfulRefundAmountByPaymentId(paymentId)).thenReturn(0L);
        when(paymentProvider.refund(any())).thenReturn(ProviderRefundResponse.builder()
                .success(true)
                .providerRefundId("rfnd_test_002")
                .build());

        RefundResponse response = refundService.createRefund(merchantId, paymentId, "idem_rfnd_2", request);

        assertNotNull(response);
        assertEquals(PaymentStatus.SUCCESS, response.getStatus());
        assertEquals(PaymentStatus.PARTIALLY_REFUNDED, testPayment.getStatus());
        verify(paymentRepository, times(2)).save(testPayment);
    }

    @Test
    void testRefundAmountExceedingBalanceThrowsBusinessException() {
        CreateRefundRequest request = CreateRefundRequest.builder()
                .amount(30000L)
                .reason("Over refund")
                .build();

        // 30000 already refunded out of 50000 total balance -> 20000 remaining
        when(refundRepository.sumSuccessfulRefundAmountByPaymentId(paymentId)).thenReturn(30000L);

        BusinessException exception = assertThrows(BusinessException.class, () ->
                refundService.createRefund(merchantId, paymentId, "idem_rfnd_3", request));

        assertTrue(exception.getMessage().contains("exceeds remaining refundable balance"));
        verify(paymentProvider, never()).refund(any());
    }

    @Test
    void testAmbiguousRefundStatusProtectsStateToRefundPending() {
        CreateRefundRequest request = CreateRefundRequest.builder()
                .amount(10000L)
                .reason("Ambiguous gateway response")
                .build();

        when(refundRepository.sumSuccessfulRefundAmountByPaymentId(paymentId)).thenReturn(0L);
        // Ambiguous response: success = false, errorCode = null / PENDING
        when(paymentProvider.refund(any())).thenReturn(ProviderRefundResponse.builder()
                .success(false)
                .errorCode("PENDING")
                .errorDescription("Gateway timeout, refund processing in progress")
                .build());

        RefundResponse response = refundService.createRefund(merchantId, paymentId, "idem_rfnd_4", request);

        assertNotNull(response);
        assertEquals(PaymentStatus.REFUND_PENDING, response.getStatus());
        assertEquals("REFUND_PENDING", response.getErrorCode());
        // Verify payment is NOT marked REFUND_FAILED
        assertNotEquals(PaymentStatus.REFUND_FAILED, response.getStatus());
    }
}
