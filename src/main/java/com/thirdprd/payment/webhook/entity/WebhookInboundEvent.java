package com.thirdprd.payment.webhook.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "webhook_inbound_events", uniqueConstraints = {
        @UniqueConstraint(name = "uq_webhook_inbound", columnNames = {"provider", "provider_event_id"})
})
public class WebhookInboundEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "provider_event_id", nullable = false, length = 100)
    private String providerEventId;

    @Column(name = "payload_hash", nullable = false, length = 64)
    private String payloadHash;

    @Column(nullable = false, length = 30)
    private String status = "PROCESSED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public WebhookInboundEvent() {
    }

    public WebhookInboundEvent(UUID id, String provider, String providerEventId, String payloadHash, String status, Instant createdAt) {
        this.id = id;
        this.provider = provider;
        this.providerEventId = providerEventId;
        this.payloadHash = payloadHash;
        this.status = status != null ? status : "PROCESSED";
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static WebhookInboundEventBuilder builder() {
        return new WebhookInboundEventBuilder();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getProviderEventId() { return providerEventId; }
    public void setProviderEventId(String providerEventId) { this.providerEventId = providerEventId; }

    public String getPayloadHash() { return payloadHash; }
    public void setPayloadHash(String payloadHash) { this.payloadHash = payloadHash; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class WebhookInboundEventBuilder {
        private UUID id;
        private String provider;
        private String providerEventId;
        private String payloadHash;
        private String status = "PROCESSED";
        private Instant createdAt = Instant.now();

        public WebhookInboundEventBuilder id(UUID id) { this.id = id; return this; }
        public WebhookInboundEventBuilder provider(String provider) { this.provider = provider; return this; }
        public WebhookInboundEventBuilder providerEventId(String providerEventId) { this.providerEventId = providerEventId; return this; }
        public WebhookInboundEventBuilder payloadHash(String payloadHash) { this.payloadHash = payloadHash; return this; }
        public WebhookInboundEventBuilder status(String status) { this.status = status; return this; }
        public WebhookInboundEventBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public WebhookInboundEvent build() {
            return new WebhookInboundEvent(id, provider, providerEventId, payloadHash, status, createdAt);
        }
    }
}
