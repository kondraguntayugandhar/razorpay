package com.thirdprd.payment.payment.dto;

import com.thirdprd.payment.common.enums.PaymentStatus;

import java.time.Instant;
import java.util.UUID;

public class PaymentResponse {

    private UUID id;
    private UUID orderId;
    private UUID merchantId;
    private Long amount;
    private String currency;
    private PaymentStatus status;
    private String provider;
    private String providerPaymentId;
    private String method;
    private String errorCode;
    private String errorDescription;
    private String upiReferenceId;
    private String vpa;
    private String intentUri;
    private String qrCodeBase64;
    private Instant createdAt;
    private Instant updatedAt;

    public PaymentResponse() {
    }

    public PaymentResponse(UUID id, UUID orderId, UUID merchantId, Long amount, String currency, PaymentStatus status, String provider, String providerPaymentId, String method, String errorCode, String errorDescription, String upiReferenceId, String vpa, String intentUri, String qrCodeBase64, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
        this.provider = provider;
        this.providerPaymentId = providerPaymentId;
        this.method = method;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.upiReferenceId = upiReferenceId;
        this.vpa = vpa;
        this.intentUri = intentUri;
        this.qrCodeBase64 = qrCodeBase64;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public String getErrorDescription() {
        return errorDescription;
    }

    public void setErrorDescription(String errorDescription) {
        this.errorDescription = errorDescription;
    }

    public String getUpiReferenceId() {
        return upiReferenceId;
    }

    public void setUpiReferenceId(String upiReferenceId) {
        this.upiReferenceId = upiReferenceId;
    }

    public String getVpa() {
        return vpa;
    }

    public void setVpa(String vpa) {
        this.vpa = vpa;
    }

    public String getIntentUri() {
        return intentUri;
    }

    public void setIntentUri(String intentUri) {
        this.intentUri = intentUri;
    }

    public String getQrCodeBase64() {
        return qrCodeBase64;
    }

    public void setQrCodeBase64(String qrCodeBase64) {
        this.qrCodeBase64 = qrCodeBase64;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private UUID orderId;
        private UUID merchantId;
        private Long amount;
        private String currency;
        private PaymentStatus status;
        private String provider;
        private String providerPaymentId;
        private String method;
        private String errorCode;
        private String errorDescription;
        private String upiReferenceId;
        private String vpa;
        private String intentUri;
        private String qrCodeBase64;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder orderId(UUID orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder merchantId(UUID merchantId) {
            this.merchantId = merchantId;
            return this;
        }

        public Builder amount(Long amount) {
            this.amount = amount;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder status(PaymentStatus status) {
            this.status = status;
            return this;
        }

        public Builder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public Builder providerPaymentId(String providerPaymentId) {
            this.providerPaymentId = providerPaymentId;
            return this;
        }

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder errorCode(String errorCode) {
            this.errorCode = errorCode;
            return this;
        }

        public Builder errorDescription(String errorDescription) {
            this.errorDescription = errorDescription;
            return this;
        }

        public Builder upiReferenceId(String upiReferenceId) {
            this.upiReferenceId = upiReferenceId;
            return this;
        }

        public Builder vpa(String vpa) {
            this.vpa = vpa;
            return this;
        }

        public Builder intentUri(String intentUri) {
            this.intentUri = intentUri;
            return this;
        }

        public Builder qrCodeBase64(String qrCodeBase64) {
            this.qrCodeBase64 = qrCodeBase64;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public PaymentResponse build() {
            return new PaymentResponse(id, orderId, merchantId, amount, currency, status, provider, providerPaymentId, method, errorCode, errorDescription, upiReferenceId, vpa, intentUri, qrCodeBase64, createdAt, updatedAt);
        }
    }
}
