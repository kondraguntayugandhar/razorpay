package com.thirdprd.payment.paymentlink.repository;

import com.thirdprd.payment.paymentlink.entity.PaymentLink;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentLinkRepository extends JpaRepository<PaymentLink, UUID> {
    List<PaymentLink> findByMerchantId(UUID merchantId);
    Optional<PaymentLink> findByShortCode(String shortCode);
}
