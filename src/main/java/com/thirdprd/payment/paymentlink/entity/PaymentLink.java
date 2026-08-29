package com.thirdprd.payment.paymentlink.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_links")
public class PaymentLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "payment_link_id", nullable = false, unique = true)
    private String paymentLinkId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String currency = "INR";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "short_code", nullable = false, unique = true)
    private String shortCode;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PaymentLink() {}

    public PaymentLink(UUID id, String paymentLinkId, UUID merchantId, Long amount, String currency, String description, String status, String shortCode, Instant expiresAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.paymentLinkId = paymentLinkId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.description = description;
        this.status = status != null ? status : "ACTIVE";
        this.shortCode = shortCode;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getPaymentLinkId() { return paymentLinkId; }
    public void setPaymentLinkId(String paymentLinkId) { this.paymentLinkId = paymentLinkId; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getShortCode() { return shortCode; }
    public void setShortCode(String shortCode) { this.shortCode = shortCode; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static PaymentLinkBuilder builder() { return new PaymentLinkBuilder(); }

    public static class PaymentLinkBuilder {
        private UUID id;
        private String paymentLinkId;
        private UUID merchantId;
        private Long amount;
        private String currency = "INR";
        private String description;
        private String status = "ACTIVE";
        private String shortCode;
        private Instant expiresAt;

        public PaymentLinkBuilder id(UUID id) { this.id = id; return this; }
        public PaymentLinkBuilder paymentLinkId(String paymentLinkId) { this.paymentLinkId = paymentLinkId; return this; }
        public PaymentLinkBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public PaymentLinkBuilder amount(Long amount) { this.amount = amount; return this; }
        public PaymentLinkBuilder currency(String currency) { this.currency = currency; return this; }
        public PaymentLinkBuilder description(String description) { this.description = description; return this; }
        public PaymentLinkBuilder status(String status) { this.status = status; return this; }
        public PaymentLinkBuilder shortCode(String shortCode) { this.shortCode = shortCode; return this; }
        public PaymentLinkBuilder expiresAt(Instant expiresAt) { this.expiresAt = expiresAt; return this; }

        public PaymentLink build() {
            return new PaymentLink(id, paymentLinkId, merchantId, amount, currency, description, status, shortCode, expiresAt, Instant.now(), Instant.now());
        }
    }
}
