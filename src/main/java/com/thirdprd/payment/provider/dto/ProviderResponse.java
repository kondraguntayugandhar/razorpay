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
    private String upiReferenceId;
    private String vpa;
    private String intentUri;
    private String qrCodeBase64;

    public ProviderResponse() {
    }

    public ProviderResponse(boolean success, String providerPaymentId, String providerName, PaymentStatus status, String errorCode, String errorDescription, String rawProviderPayload, String upiReferenceId, String vpa, String intentUri, String qrCodeBase64) {
        this.success = success;
        this.providerPaymentId = providerPaymentId;
        this.providerName = providerName;
        this.status = status;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.rawProviderPayload = rawProviderPayload;
        this.upiReferenceId = upiReferenceId;
        this.vpa = vpa;
        this.intentUri = intentUri;
        this.qrCodeBase64 = qrCodeBase64;
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
        private String upiReferenceId;
        private String vpa;
        private String intentUri;
        private String qrCodeBase64;

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

        public ProviderResponse build() {
            return new ProviderResponse(success, providerPaymentId, providerName, status, errorCode, errorDescription, rawProviderPayload, upiReferenceId, vpa, intentUri, qrCodeBase64);
        }
    }
}
