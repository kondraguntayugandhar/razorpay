package com.thirdprd.payment.historian.repository;

import com.thirdprd.payment.historian.entity.HistorianWebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HistorianWebhookEventRepository extends JpaRepository<HistorianWebhookEvent, String> {
    Optional<HistorianWebhookEvent> findByProviderAndProviderEventId(String provider, String providerEventId);
}
