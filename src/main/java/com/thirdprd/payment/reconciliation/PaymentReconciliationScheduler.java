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
    private final PaymentProvider defaultPaymentProvider;
    private final java.util.Map<String, PaymentProvider> providerMap = new java.util.concurrent.ConcurrentHashMap<>();
    private final long timeoutMinutes;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.idempotency.service.IdempotencyLockService lockService;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.payment.repository.PaymentRepository paymentRepository;

    public PaymentReconciliationScheduler(
            PaymentService paymentService,
            PaymentProvider paymentProvider,
            List<PaymentProvider> providerList,
            @Value("${payment.reconciliation.timeout-minutes:2}") long timeoutMinutes) {
        this.paymentService = paymentService;
        this.defaultPaymentProvider = paymentProvider;
        this.timeoutMinutes = timeoutMinutes;

        if (providerList != null) {
            for (PaymentProvider p : providerList) {
                this.providerMap.put(p.getProviderName().toUpperCase(), p);
            }
        }
    }

    @Scheduled(fixedDelayString = "${payment.reconciliation.interval-ms:30000}")
    @Transactional
    public void reconcileStuckPayments() {
        reconcileNow();
    }

    @Transactional
    public java.util.Map<String, Object> reconcileNow() {
        Instant cutoffTime = Instant.now().minus(timeoutMinutes, ChronoUnit.MINUTES);
        List<PaymentStatus> targetStatuses = List.of(PaymentStatus.PROCESSING, PaymentStatus.PENDING, PaymentStatus.UNKNOWN);

        List<Payment> stuckPayments = paymentService.findStuckPaymentsForUpdate(targetStatuses, cutoffTime);
        if (stuckPayments.isEmpty()) {
            return java.util.Map.of("checked", 0, "updated", 0, "mismatches", 0);
        }

        log.info("Found {} payments stuck in PROCESSING/PENDING/UNKNOWN older than {} minutes for reconciliation",
                stuckPayments.size(), timeoutMinutes);

        int updatedCount = 0;
        int mismatchCount = 0;

        for (Payment payment : stuckPayments) {
            boolean updated = reconcileSinglePayment(payment.getId());
            if (updated) {
                updatedCount++;
                mismatchCount++;
            }
        }
        return java.util.Map.of("checked", stuckPayments.size(), "updated", updatedCount, "mismatches", mismatchCount);
    }

    @Transactional
    public boolean reconcileSinglePayment(java.util.UUID paymentId) {
        String lockKey = "reconciliation:lock:" + paymentId;
        String lockToken = (lockService != null) ? lockService.acquireLockWithToken(lockKey, 15) : "LOCAL_TOKEN";

        if (lockToken == null) {
            log.info("[RECONCILIATION] Payment {} lock already held by another reconciliation worker, skipping.", paymentId);
            return false;
        }

        try {
            Payment payment = (paymentRepository != null) ?
                    paymentRepository.findById(paymentId).orElse(null) : null;
            if (payment == null) {
                return false;
            }

            // If state is already terminal (SUCCESS / FAILED), another worker already reconciled it
            if (payment.getStatus() == PaymentStatus.SUCCESS || payment.getStatus() == PaymentStatus.FAILED) {
                log.info("[RECONCILIATION] Payment {} already transitioned to terminal status {}, skipping.", paymentId, payment.getStatus());
                return false;
            }

            if (payment.getProviderPaymentId() == null || payment.getProviderPaymentId().isBlank()) {
                log.warn("Payment ID {} has no providerPaymentId, skipping reconciliation", payment.getId());
                return false;
            }

            String pCode = payment.getProvider() != null ? payment.getProvider().toUpperCase() : "";
            PaymentProvider activeProvider = providerMap.getOrDefault(pCode, defaultPaymentProvider);

            log.info("Reconciling payment ID {} with provider {} ref {}",
                    payment.getId(), pCode, payment.getProviderPaymentId());

            ProviderStatusResponse providerStatus = activeProvider.getStatus(payment.getProviderPaymentId());
            if (providerStatus != null && providerStatus.getStatus() != null) {
                PaymentStatus resolvedStatus = providerStatus.getStatus();

                if (resolvedStatus != payment.getStatus() && resolvedStatus != PaymentStatus.UNKNOWN) {
                    paymentService.processProviderStatusUpdate(
                            payment.getProviderPaymentId(),
                            resolvedStatus,
                            providerStatus.getErrorCode(),
                            providerStatus.getErrorDescription(),
                            "Reconciled via background scheduler job"
                    );
                    log.info("Successfully reconciled payment ID {} from {} to {}",
                            payment.getId(), payment.getStatus(), resolvedStatus);
                    return true;
                } else {
                    log.info("Payment ID {} provider status remains {}", payment.getId(), resolvedStatus);
                }
            }
        } catch (Exception e) {
            log.error("Failed to reconcile payment ID {}: {}", paymentId, e.getMessage(), e);
        } finally {
            if (lockToken != null && lockService != null) {
                lockService.releaseLockWithToken(lockKey, lockToken);
            }
        }
        return false;
    }
}
