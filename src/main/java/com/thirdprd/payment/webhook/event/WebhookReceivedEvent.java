package com.thirdprd.payment.webhook.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class WebhookReceivedEvent implements Serializable {
    private UUID webhookEventId;
    private String provider;
    private String providerEventId;
    private Instant receivedAt;

    public WebhookReceivedEvent() {
    }

    public WebhookReceivedEvent(UUID webhookEventId, String provider, String providerEventId) {
        this.webhookEventId = webhookEventId;
        this.provider = provider;
        this.providerEventId = providerEventId;
        this.receivedAt = Instant.now();
    }

    public UUID getWebhookEventId() {
        return webhookEventId;
    }

    public String getProvider() {
        return provider;
    }

    public String getProviderEventId() {
        return providerEventId;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }
}
