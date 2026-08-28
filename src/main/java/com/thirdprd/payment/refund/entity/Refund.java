package com.thirdprd.payment.refund.entity;

import com.thirdprd.payment.common.enums.PaymentStatus;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refunds", uniqueConstraints = {
        @UniqueConstraint(name = "uq_refunds_merchant_idempotency", columnNames = {"merchant_id", "idempotency_key"})
})
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private PaymentStatus status;

    @Column(name = "provider_refund_id")
    private String providerRefundId;

    @Column(name = "idempotency_key")
    private String idempotencyKey;

    private String reason;

    @Column(name = "error_code")
    private String errorCode;

    @Column(name = "error_description")
    private String errorDescription;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Refund() {
    }

    public Refund(UUID id, UUID paymentId, UUID merchantId, Long amount, String currency, PaymentStatus status, String providerRefundId, String idempotencyKey, String reason, String errorCode, String errorDescription, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.paymentId = paymentId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.status = status;
        this.providerRefundId = providerRefundId;
        this.idempotencyKey = idempotencyKey;
        this.reason = reason;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getProviderRefundId() { return providerRefundId; }
    public void setProviderRefundId(String providerRefundId) { this.providerRefundId = providerRefundId; }

    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorDescription() { return errorDescription; }
    public void setErrorDescription(String errorDescription) { this.errorDescription = errorDescription; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private UUID paymentId;
        private UUID merchantId;
        private Long amount;
        private String currency = "INR";
        private PaymentStatus status;
        private String providerRefundId;
        private String idempotencyKey;
        private String reason;
        private String errorCode;
        private String errorDescription;
        private Instant createdAt = Instant.now();
        private Instant updatedAt = Instant.now();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder providerRefundId(String providerRefundId) { this.providerRefundId = providerRefundId; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder errorCode(String errorCode) { this.errorCode = errorCode; return this; }
        public Builder errorDescription(String errorDescription) { this.errorDescription = errorDescription; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Refund build() {
            return new Refund(id, paymentId, merchantId, amount, currency, status, providerRefundId, idempotencyKey, reason, errorCode, errorDescription, createdAt, updatedAt);
        }
    }
}
