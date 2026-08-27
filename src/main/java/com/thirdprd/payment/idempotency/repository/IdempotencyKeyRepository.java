package com.thirdprd.payment.idempotency.repository;

import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, UUID> {
    Optional<IdempotencyKey> findByMerchantIdAndIdempotencyKey(UUID merchantId, String idempotencyKey);
}
