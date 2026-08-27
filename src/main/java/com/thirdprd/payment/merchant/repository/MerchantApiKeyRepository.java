package com.thirdprd.payment.merchant.repository;

import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MerchantApiKeyRepository extends JpaRepository<MerchantApiKey, UUID> {
    Optional<MerchantApiKey> findByKeyIdAndRevokedAtIsNull(String keyId);
}
