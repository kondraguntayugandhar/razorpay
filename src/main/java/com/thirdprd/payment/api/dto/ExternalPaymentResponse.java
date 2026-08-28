package com.thirdprd.payment.api.dto;

import com.thirdprd.payment.common.enums.PaymentStatus;

import java.util.UUID;

public class ExternalPaymentResponse {
    private UUID paymentId;
    private UUID orderId;
    private String razorpayOrderId;
    private String keyId; // Public Key ID (never key_secret)
    private Long amount;
    private String currency;
    private PaymentStatus status;

    public ExternalPaymentResponse() {
    }

    public ExternalPaymentResponse(UUID paymentId, UUID orderId, String razorpayOrderId, String keyId, Long amount, String currency, PaymentStatus status) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.keyId = keyId;
        this.amount = amount;
        this.currency = currency;
        this.status = status;
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(UUID paymentId) {
        this.paymentId = paymentId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID paymentId;
        private UUID orderId;
        private String razorpayOrderId;
        private String keyId;
        private Long amount;
        private String currency;
        private PaymentStatus status;

        public Builder paymentId(UUID paymentId) {
            this.paymentId = paymentId;
            return this;
        }

        public Builder orderId(UUID orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder razorpayOrderId(String razorpayOrderId) {
            this.razorpayOrderId = razorpayOrderId;
            return this;
        }

        public Builder keyId(String keyId) {
            this.keyId = keyId;
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

        public ExternalPaymentResponse build() {
            return new ExternalPaymentResponse(paymentId, orderId, razorpayOrderId, keyId, amount, currency, status);
        }
    }
}
