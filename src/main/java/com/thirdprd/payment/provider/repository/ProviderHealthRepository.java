package com.thirdprd.payment.provider.repository;

import com.thirdprd.payment.provider.entity.ProviderHealth;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProviderHealthRepository extends JpaRepository<ProviderHealth, UUID> {
    Optional<ProviderHealth> findByProvider(String provider);
}
