package com.thirdprd.payment.provider.dto;

public class ProviderRefundResponse {

    private boolean success;
    private String providerRefundId;
    private String errorCode;
    private String errorDescription;

    public ProviderRefundResponse() {
    }

    public ProviderRefundResponse(boolean success, String providerRefundId, String errorCode, String errorDescription) {
        this.success = success;
        this.providerRefundId = providerRefundId;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getProviderRefundId() {
        return providerRefundId;
    }

    public void setProviderRefundId(String providerRefundId) {
        this.providerRefundId = providerRefundId;
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
        private boolean success;
        private String providerRefundId;
        private String errorCode;
        private String errorDescription;

        public Builder success(boolean success) {
            this.success = success;
            return this;
        }

        public Builder providerRefundId(String providerRefundId) {
            this.providerRefundId = providerRefundId;
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

        public ProviderRefundResponse build() {
            return new ProviderRefundResponse(success, providerRefundId, errorCode, errorDescription);
        }
    }
}
