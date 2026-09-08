package com.thirdprd.payment.refund.repository;

import com.thirdprd.payment.refund.entity.RefundAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefundAttemptRepository extends JpaRepository<RefundAttempt, UUID> {
    List<RefundAttempt> findByRefundIdOrderByStartedAtAsc(UUID refundId);
    long countByRefundId(UUID refundId);
}
