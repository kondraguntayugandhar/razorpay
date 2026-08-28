package com.thirdprd.payment.webhook.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class WebhookReceivedEvent implements Serializable {
    private UUID webhookEventId;
    private String provider;
    private String providerEventId;
    private String rawPayload;
    private Boolean signatureValid;
    private Instant receivedAt;

    public WebhookReceivedEvent() {
    }

    public WebhookReceivedEvent(UUID webhookEventId, String provider, String providerEventId) {
        this(webhookEventId, provider, providerEventId, "{}", true);
    }

    public WebhookReceivedEvent(UUID webhookEventId, String provider, String providerEventId, String rawPayload, Boolean signatureValid) {
        this.webhookEventId = webhookEventId;
        this.provider = provider;
        this.providerEventId = providerEventId;
        this.rawPayload = rawPayload != null ? rawPayload : "{}";
        this.signatureValid = signatureValid != null ? signatureValid : true;
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

    public String getRawPayload() {
        return rawPayload;
    }

    public Boolean getSignatureValid() {
        return signatureValid;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }
}
