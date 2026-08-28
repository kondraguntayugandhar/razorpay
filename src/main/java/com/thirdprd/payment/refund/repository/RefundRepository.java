package com.thirdprd.payment.refund.repository;

import com.thirdprd.payment.refund.entity.Refund;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RefundRepository extends JpaRepository<Refund, UUID> {
    List<Refund> findByPaymentId(UUID paymentId);
    Optional<Refund> findByMerchantIdAndIdempotencyKey(UUID merchantId, String idempotencyKey);

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM Refund r WHERE r.paymentId = :paymentId AND r.status IN ('SUCCESS', 'REFUNDED', 'PARTIALLY_REFUNDED', 'REFUND_PENDING')")
    Long sumSuccessfulRefundAmountByPaymentId(@Param("paymentId") UUID paymentId);
}
