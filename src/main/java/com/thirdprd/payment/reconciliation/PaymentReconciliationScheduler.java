package com.thirdprd.payment.reconciliation;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.ProviderStatusResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.transaction.annotation.Transactional;

@Component
public class PaymentReconciliationScheduler {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationScheduler.class);

    private final PaymentService paymentService;
    private final PaymentProvider paymentProvider;
    private final long timeoutMinutes;

    public PaymentReconciliationScheduler(
            PaymentService paymentService,
            PaymentProvider paymentProvider,
            @Value("${payment.reconciliation.timeout-minutes:2}") long timeoutMinutes) {
        this.paymentService = paymentService;
        this.paymentProvider = paymentProvider;
        this.timeoutMinutes = timeoutMinutes;
    }

    @Scheduled(fixedDelayString = "${payment.reconciliation.interval-ms:30000}")
    @Transactional
    public void reconcileStuckPayments() {
        Instant cutoffTime = Instant.now().minus(timeoutMinutes, ChronoUnit.MINUTES);
        List<PaymentStatus> targetStatuses = List.of(PaymentStatus.PROCESSING, PaymentStatus.PENDING);

        List<Payment> stuckPayments = paymentService.findStuckPaymentsForUpdate(targetStatuses, cutoffTime);
        if (stuckPayments.isEmpty()) {
            return;
        }

        log.info("Found {} payments stuck in PROCESSING/PENDING older than {} minutes for reconciliation",
                stuckPayments.size(), timeoutMinutes);

        for (Payment payment : stuckPayments) {
            if (payment.getProviderPaymentId() == null || payment.getProviderPaymentId().isBlank()) {
                log.warn("Payment ID {} has no providerPaymentId, skipping reconciliation", payment.getId());
                continue;
            }

            try {
                log.info("Reconciling payment ID {} with provider payment ID {}",
                        payment.getId(), payment.getProviderPaymentId());

                ProviderStatusResponse providerStatus = paymentProvider.getStatus(payment.getProviderPaymentId());
                if (providerStatus != null && providerStatus.getStatus() != null) {
                    PaymentStatus resolvedStatus = providerStatus.getStatus();

                    if (resolvedStatus != payment.getStatus()) {
                        paymentService.processProviderStatusUpdate(
                                payment.getProviderPaymentId(),
                                resolvedStatus,
                                providerStatus.getErrorCode(),
                                providerStatus.getErrorDescription(),
                                "Reconciled via background scheduler job"
                        );
                        log.info("Successfully reconciled payment ID {} from {} to {}",
                                payment.getId(), payment.getStatus(), resolvedStatus);
                    } else {
                        log.info("Payment ID {} provider status remains {}", payment.getId(), resolvedStatus);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to reconcile payment ID {}: {}", payment.getId(), e.getMessage(), e);
            }
        }
    }
}
