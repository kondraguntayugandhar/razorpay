package com.thirdprd.payment.provider.repository;

import com.thirdprd.payment.provider.entity.PaymentProviderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentProviderEntityRepository extends JpaRepository<PaymentProviderEntity, UUID> {
    Optional<PaymentProviderEntity> findByProviderCode(String providerCode);
    List<PaymentProviderEntity> findByIsActiveTrueOrderByPriorityDesc();
}
