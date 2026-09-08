package com.thirdprd.payment.webhook.repository;

import com.thirdprd.payment.webhook.entity.WebhookInboundEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WebhookInboundEventRepository extends JpaRepository<WebhookInboundEvent, UUID> {
    Optional<WebhookInboundEvent> findByProviderAndProviderEventId(String provider, String providerEventId);
    boolean existsByProviderAndProviderEventId(String provider, String providerEventId);
}
