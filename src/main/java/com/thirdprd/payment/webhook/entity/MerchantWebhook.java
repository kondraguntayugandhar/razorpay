package com.thirdprd.payment.webhook.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "webhooks")
public class MerchantWebhook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "webhook_id", nullable = false, unique = true)
    private String webhookId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(nullable = false, length = 500)
    private String url;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "secret_encrypted", nullable = false)
    private String secretEncrypted;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public MerchantWebhook() {}

    public MerchantWebhook(UUID id, String webhookId, UUID merchantId, String url, String status, String secretEncrypted, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.webhookId = webhookId;
        this.merchantId = merchantId;
        this.url = url;
        this.status = status != null ? status : "ACTIVE";
        this.secretEncrypted = secretEncrypted;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public String getWebhookId() { return webhookId; }
    public UUID getMerchantId() { return merchantId; }
    public String getUrl() { return url; }
    public String getStatus() { return status; }
    public String getSecretEncrypted() { return secretEncrypted; }
    public Instant getCreatedAt() { return createdAt; }

    public static MerchantWebhookBuilder builder() { return new MerchantWebhookBuilder(); }

    public static class MerchantWebhookBuilder {
        private UUID id;
        private String webhookId;
        private UUID merchantId;
        private String url;
        private String status = "ACTIVE";
        private String secretEncrypted;

        public MerchantWebhookBuilder id(UUID id) { this.id = id; return this; }
        public MerchantWebhookBuilder webhookId(String webhookId) { this.webhookId = webhookId; return this; }
        public MerchantWebhookBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public MerchantWebhookBuilder url(String url) { this.url = url; return this; }
        public MerchantWebhookBuilder status(String status) { this.status = status; return this; }
        public MerchantWebhookBuilder secretEncrypted(String secretEncrypted) { this.secretEncrypted = secretEncrypted; return this; }

        public MerchantWebhook build() {
            return new MerchantWebhook(id, webhookId, merchantId, url, status, secretEncrypted, Instant.now(), Instant.now());
        }
    }
}
