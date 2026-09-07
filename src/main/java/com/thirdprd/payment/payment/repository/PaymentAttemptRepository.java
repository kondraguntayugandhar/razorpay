package com.thirdprd.payment.payment.repository;

import com.thirdprd.payment.payment.entity.PaymentAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentAttemptRepository extends JpaRepository<PaymentAttempt, UUID> {
    List<PaymentAttempt> findByPaymentIdOrderByStartedAtAsc(UUID paymentId);
    Optional<PaymentAttempt> findByAttemptId(String attemptId);
    long countByPaymentId(UUID paymentId);
}
