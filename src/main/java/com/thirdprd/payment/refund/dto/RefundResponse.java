package com.thirdprd.payment.refund.dto;

import com.thirdprd.payment.common.enums.PaymentStatus;

import java.time.Instant;
import java.util.UUID;

public class RefundResponse {
    private UUID id;
    private UUID paymentId;
    private UUID merchantId;
    private Long amount;
    private String currency;
    private PaymentStatus status;
    private String providerRefundId;
    private String reason;
    private String errorCode;
    private String errorDescription;
    private Instant createdAt;
    private Instant updatedAt;

    public RefundResponse() {
    }

    public RefundResponse(UUID id, UUID paymentId, UUID merchantId, Long amount, String currency, PaymentStatus status, String providerRefundId, String reason, String errorCode, String errorDescription, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.paymentId = paymentId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.providerRefundId = providerRefundId;
        this.reason = reason;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
        private String currency;
        private PaymentStatus status;
        private String providerRefundId;
        private String reason;
        private String errorCode;
        private String errorDescription;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder status(PaymentStatus status) { this.status = status; return this; }
        public Builder providerRefundId(String providerRefundId) { this.providerRefundId = providerRefundId; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder errorCode(String errorCode) { this.errorCode = errorCode; return this; }
        public Builder errorDescription(String errorDescription) { this.errorDescription = errorDescription; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public RefundResponse build() {
            return new RefundResponse(id, paymentId, merchantId, amount, currency, status, providerRefundId, reason, errorCode, errorDescription, createdAt, updatedAt);
        }
    }
}
