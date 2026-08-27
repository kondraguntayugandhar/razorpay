package com.thirdprd.payment.payment.repository;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.payment.entity.Payment;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByIdAndMerchantId(UUID id, UUID merchantId);
    Optional<Payment> findByMerchantIdAndIdempotencyKey(UUID merchantId, String idempotencyKey);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
    List<Payment> findByStatusIn(List<PaymentStatus> statuses);

    @Query(value = "SELECT * FROM payments WHERE status IN (:statusStrings) AND updated_at < :cutoffTime FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<Payment> findStuckPaymentsForUpdate(@Param("statusStrings") List<String> statusStrings, @Param("cutoffTime") Instant cutoffTime);
}
