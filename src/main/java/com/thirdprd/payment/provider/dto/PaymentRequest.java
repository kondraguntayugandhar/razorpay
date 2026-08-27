package com.thirdprd.payment.provider.dto;

import java.util.Map;
import java.util.UUID;

public class PaymentRequest {

    private UUID paymentId;
    private UUID orderId;
    private UUID merchantId;
    private Long amount;
    private String currency;
    private String method;
    private Map<String, Object> notes;

    public PaymentRequest() {
    }

    public PaymentRequest(UUID paymentId, UUID orderId, UUID merchantId, Long amount, String currency, String method, Map<String, Object> notes) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.method = method;
        this.notes = notes;
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

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public Map<String, Object> getNotes() {
        return notes;
    }

    public void setNotes(Map<String, Object> notes) {
        this.notes = notes;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID paymentId;
        private UUID orderId;
        private UUID merchantId;
        private Long amount;
        private String currency;
        private String method;
        private Map<String, Object> notes;

        public Builder paymentId(UUID paymentId) {
            this.paymentId = paymentId;
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

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder notes(Map<String, Object> notes) {
            this.notes = notes;
            return this;
        }

        public PaymentRequest build() {
            return new PaymentRequest(paymentId, orderId, merchantId, amount, currency, method, notes);
        }
    }
}
