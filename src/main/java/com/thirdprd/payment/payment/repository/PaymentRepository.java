package com.thirdprd.payment.payment.repository;

import com.thirdprd.payment.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByIdAndMerchantId(UUID id, UUID merchantId);
    Optional<Payment> findByMerchantIdAndIdempotencyKey(UUID merchantId, String idempotencyKey);
    Optional<Payment> findByProviderPaymentId(String providerPaymentId);
    List<Payment> findByStatusIn(List<com.thirdprd.payment.common.enums.PaymentStatus> statuses);
}
