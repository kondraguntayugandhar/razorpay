package com.thirdprd.payment.provider.dto;

import com.thirdprd.payment.common.enums.PaymentStatus;

public class ProviderResponse {

    private boolean success;
    private String providerPaymentId;
    private String providerName;
    private PaymentStatus status;
    private String errorCode;
    private String errorDescription;
    private String rawProviderPayload;

    public ProviderResponse() {
    }

    public ProviderResponse(boolean success, String providerPaymentId, String providerName, PaymentStatus status, String errorCode, String errorDescription, String rawProviderPayload) {
        this.success = success;
        this.providerPaymentId = providerPaymentId;
        this.providerName = providerName;
        this.status = status;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.rawProviderPayload = rawProviderPayload;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public PaymentStatus getStatus() {
        return status;
    }

    public void setStatus(PaymentStatus status) {
        this.status = status;
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

    public String getRawProviderPayload() {
        return rawProviderPayload;
    }

    public void setRawProviderPayload(String rawProviderPayload) {
        this.rawProviderPayload = rawProviderPayload;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private boolean success;
        private String providerPaymentId;
        private String providerName;
        private PaymentStatus status;
        private String errorCode;
        private String errorDescription;
        private String rawProviderPayload;

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder providerPaymentId(String providerPaymentId) {
            this.providerPaymentId = providerPaymentId;
            return this;
        }

        public Builder providerName(String providerName) {
            this.providerName = providerName;
            return this;
        }

        public Builder status(PaymentStatus status) {
            this.status = status;
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

        public Builder rawProviderPayload(String rawProviderPayload) {
            this.rawProviderPayload = rawProviderPayload;
            return this;
        }

        public ProviderResponse build() {
            return new ProviderResponse(success, providerPaymentId, providerName, status, errorCode, errorDescription, rawProviderPayload);
        }
    }
}
