package com.thirdprd.payment.refund.service;

import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.common.exception.ResourceNotFoundException;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.ProviderRefundResponse;
import com.thirdprd.payment.provider.dto.RefundRequest;
import com.thirdprd.payment.refund.dto.CreateRefundRequest;
import com.thirdprd.payment.refund.dto.RefundResponse;
import com.thirdprd.payment.refund.entity.Refund;
import com.thirdprd.payment.refund.repository.RefundRepository;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class RefundService {

    private static final Logger log = LoggerFactory.getLogger(RefundService.class);

    private final PaymentRepository paymentRepository;
    private final RefundRepository refundRepository;
    private final PaymentProvider paymentProvider;
    private final PaymentStateMachine stateMachine;

    public RefundService(PaymentRepository paymentRepository,
                         RefundRepository refundRepository,
                         PaymentProvider paymentProvider,
                         PaymentStateMachine stateMachine) {
        this.paymentRepository = paymentRepository;
        this.refundRepository = refundRepository;
        this.paymentProvider = paymentProvider;
        this.stateMachine = stateMachine;
    }

    @Transactional
    public RefundResponse createRefund(UUID merchantId, UUID paymentId, String idempotencyKey, CreateRefundRequest request) {
        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        if (payment.getStatus() != PaymentStatus.SUCCESS && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
            throw new BusinessException(ErrorCode.BAD_REQUEST, "Payment cannot be refunded in current status: " + payment.getStatus());
        }

        // Idempotency Check
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<Refund> existing = refundRepository.findByMerchantIdAndIdempotencyKey(merchantId, idempotencyKey);
            if (existing.isPresent()) {
                log.info("Returning cached refund response for idempotencyKey: {}", idempotencyKey);
                return mapToResponse(existing.get());
            }
        }

        // Running-total check
        Long currentRefundedTotal = refundRepository.sumSuccessfulRefundAmountByPaymentId(paymentId);
        if (currentRefundedTotal == null) currentRefundedTotal = 0L;

        long remainingBalance = payment.getAmount() - currentRefundedTotal;
        if (request.getAmount() > remainingBalance) {
            throw new BusinessException(ErrorCode.BAD_REQUEST,
                    String.format("Refund amount (%d paise) exceeds remaining refundable balance (%d paise)", request.getAmount(), remainingBalance));
        }

        // Save initial Refund record in REFUND_PENDING state
        Refund refund = Refund.builder()
                .paymentId(paymentId)
                .merchantId(merchantId)
                .amount(request.getAmount())
                .currency(payment.getCurrency())
                .status(PaymentStatus.REFUND_PENDING)
                .idempotencyKey(idempotencyKey)
                .reason(request.getReason())
                .build();

        try {
            refund = refundRepository.save(refund);
        } catch (DataIntegrityViolationException e) {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                Optional<Refund> existing = refundRepository.findByMerchantIdAndIdempotencyKey(merchantId, idempotencyKey);
                if (existing.isPresent()) return mapToResponse(existing.get());
            }
            throw e;
        }

        // Transition Payment CREATED -> REFUND_PENDING
        stateMachine.validateTransition(payment.getStatus(), PaymentStatus.REFUND_PENDING);
        payment.setStatus(PaymentStatus.REFUND_PENDING);
        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        // Execute provider refund call
        RefundRequest providerRequest = RefundRequest.builder()
                .refundId(refund.getId())
                .providerPaymentId(payment.getProviderPaymentId())
                .amount(request.getAmount())
                .reason(request.getReason())
                .build();

        ProviderRefundResponse providerResponse;
        try {
            providerResponse = paymentProvider.refund(providerRequest);
        } catch (Exception e) {
            log.error("Provider refund call failed for paymentId {}: {}", paymentId, e.getMessage(), e);
            providerResponse = ProviderRefundResponse.builder()
                    .success(false)
                    .errorCode("PROVIDER_REFUND_ERROR")
                    .errorDescription(e.getMessage())
                    .build();
        }

        // Handle provider refund status (Ambiguous/Unknown Protection: pending/null status -> REFUND_PENDING)
        PaymentStatus refundTargetStatus;
        if (providerResponse.isSuccess()) {
            refundTargetStatus = (currentRefundedTotal + request.getAmount() >= payment.getAmount()) ?
                    PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;
            refund.setStatus(PaymentStatus.SUCCESS);
            refund.setProviderRefundId(providerResponse.getProviderRefundId());
        } else if ("PENDING".equalsIgnoreCase(providerResponse.getErrorCode()) || providerResponse.getErrorCode() == null) {
            // Ambiguous status protection
            refundTargetStatus = PaymentStatus.REFUND_PENDING;
            refund.setStatus(PaymentStatus.REFUND_PENDING);
            refund.setErrorCode("REFUND_PENDING");
            refund.setErrorDescription("Refund submitted to gateway, awaiting processing confirmation");
        } else {
            refundTargetStatus = PaymentStatus.REFUND_FAILED;
            refund.setStatus(PaymentStatus.REFUND_FAILED);
            refund.setErrorCode(providerResponse.getErrorCode());
            refund.setErrorDescription(providerResponse.getErrorDescription());
        }

        refund.setUpdatedAt(Instant.now());
        refundRepository.save(refund);

        // Transition Payment status via PaymentStateMachine
        PaymentStatus oldPaymentStatus = payment.getStatus();
        if (refundTargetStatus != oldPaymentStatus && refundTargetStatus != PaymentStatus.REFUND_FAILED) {
            stateMachine.validateTransition(oldPaymentStatus, refundTargetStatus);
            payment.setStatus(refundTargetStatus);
            payment.setUpdatedAt(Instant.now());
            paymentRepository.save(payment);
            log.info("PaymentId {} status transitioned from {} to {}", paymentId, oldPaymentStatus, refundTargetStatus);
        }

        return mapToResponse(refund);
    }

    @Transactional(readOnly = true)
    public List<RefundResponse> getRefundsForPayment(UUID merchantId, UUID paymentId) {
        Payment payment = paymentRepository.findByIdAndMerchantId(paymentId, merchantId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));
        return refundRepository.findByPaymentId(payment.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RefundResponse mapToResponse(Refund refund) {
        return RefundResponse.builder()
                .id(refund.getId())
                .paymentId(refund.getPaymentId())
                .merchantId(refund.getMerchantId())
                .amount(refund.getAmount())
                .currency(refund.getCurrency())
                .status(refund.getStatus())
                .providerRefundId(refund.getProviderRefundId())
                .reason(refund.getReason())
                .errorCode(refund.getErrorCode())
                .errorDescription(refund.getErrorDescription())
                .createdAt(refund.getCreatedAt())
                .updatedAt(refund.getUpdatedAt())
                .build();
    }
}
