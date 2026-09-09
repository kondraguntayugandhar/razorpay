package com.thirdprd.payment.merchant.repository;

import com.thirdprd.payment.merchant.entity.MerchantPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantPaymentMethodRepository extends JpaRepository<MerchantPaymentMethod, UUID> {
    List<MerchantPaymentMethod> findByMerchantId(UUID merchantId);
    Optional<MerchantPaymentMethod> findByMerchantIdAndMethod(UUID merchantId, String method);
}
