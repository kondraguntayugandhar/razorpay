package com.thirdprd.payment.provider.dto;

import java.util.UUID;

public class RefundRequest {

    private UUID refundId;
    private String providerPaymentId;
    private Long amount;
    private String reason;

    public RefundRequest() {
    }

    public RefundRequest(UUID refundId, String providerPaymentId, Long amount, String reason) {
        this.refundId = refundId;
        this.providerPaymentId = providerPaymentId;
        this.amount = amount;
        this.reason = reason;
    }

    public UUID getRefundId() {
        return refundId;
    }

    public void setRefundId(UUID refundId) {
        this.refundId = refundId;
    }

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public void setProviderPaymentId(String providerPaymentId) {
        this.providerPaymentId = providerPaymentId;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID refundId;
        private String providerPaymentId;
        private Long amount;
        private String reason;

        public Builder refundId(UUID refundId) {
            this.refundId = refundId;
            return this;
        }

        public Builder providerPaymentId(String providerPaymentId) {
            this.providerPaymentId = providerPaymentId;
            return this;
        }

        public Builder amount(Long amount) {
            this.amount = amount;
            return this;
        }

        public Builder reason(String reason) {
            this.reason = reason;
            return this;
        }

        public RefundRequest build() {
            return new RefundRequest(refundId, providerPaymentId, amount, reason);
        }
    }
}
