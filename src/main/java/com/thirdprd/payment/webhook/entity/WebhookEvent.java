package com.thirdprd.payment.webhook.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "webhook_events")
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "provider_event_id", nullable = false, length = 150)
    private String providerEventId;

    @Column(nullable = false, columnDefinition = "JSONB")
    private String payload;

    @Column(name = "signature_valid", nullable = false)
    private Boolean signatureValid;

    @Column(nullable = false)
    private Boolean processed = false;

    @Column(name = "received_at", nullable = false, updatable = false)
    private Instant receivedAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    public WebhookEvent() {
    }

    public WebhookEvent(UUID id, String provider, String providerEventId, String payload, Boolean signatureValid, Boolean processed, Instant receivedAt, Instant processedAt) {
        this.id = id;
        this.provider = provider;
        this.providerEventId = providerEventId;
        this.payload = payload;
        this.signatureValid = signatureValid;
        this.processed = processed != null ? processed : false;
        this.receivedAt = receivedAt != null ? receivedAt : Instant.now();
        this.processedAt = processedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderEventId() {
        return providerEventId;
    }

    public void setProviderEventId(String providerEventId) {
        this.providerEventId = providerEventId;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Boolean getSignatureValid() {
        return signatureValid;
    }

    public void setSignatureValid(Boolean signatureValid) {
        this.signatureValid = signatureValid;
    }

    public Boolean getProcessed() {
        return processed;
    }

    public void setProcessed(Boolean processed) {
        this.processed = processed;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String provider;
        private String providerEventId;
        private String payload;
        private Boolean signatureValid;
        private Boolean processed = false;
        private Instant receivedAt = Instant.now();
        private Instant processedAt;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public Builder providerEventId(String providerEventId) {
            this.providerEventId = providerEventId;
            return this;
        }

        public Builder payload(String payload) {
            this.payload = payload;
            return this;
        }

        public Builder signatureValid(Boolean signatureValid) {
            this.signatureValid = signatureValid;
            return this;
        }

        public Builder processed(Boolean processed) {
            this.processed = processed;
            return this;
        }

        public Builder receivedAt(Instant receivedAt) {
            this.receivedAt = receivedAt;
            return this;
        }

        public Builder processedAt(Instant processedAt) {
            this.processedAt = processedAt;
            return this;
        }

        public WebhookEvent build() {
            return new WebhookEvent(id, provider, providerEventId, payload, signatureValid, processed, receivedAt, processedAt);
        }
    }
}
