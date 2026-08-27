package com.thirdprd.payment.provider.dto;

import com.thirdprd.payment.common.enums.PaymentStatus;

public class ProviderStatusResponse {

    private String providerPaymentId;
    private PaymentStatus status;
    private String errorCode;
    private String errorDescription;

    public ProviderStatusResponse() {
    }

    public ProviderStatusResponse(String providerPaymentId, PaymentStatus status, String errorCode, String errorDescription) {
        this.providerPaymentId = providerPaymentId;
        this.status = status;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String providerPaymentId;
        private PaymentStatus status;
        private String errorCode;
        private String errorDescription;

        public Builder providerPaymentId(String providerPaymentId) {
            this.providerPaymentId = providerPaymentId;
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

        public ProviderStatusResponse build() {
            return new ProviderStatusResponse(providerPaymentId, status, errorCode, errorDescription);
        }
    }
}
