package com.thirdprd.payment.api.dto;

import java.util.UUID;

public class ExternalPaymentCreateRequest {
    private UUID merchantId;
    private Long amount; // in paise (e.g. 50000 = ₹500.00)
    private String currency = "INR";
    private String idempotencyKey;
    private UUID orderRef;
    private String customerId;
    private String orderId;

    public ExternalPaymentCreateRequest() {
    }

    public ExternalPaymentCreateRequest(UUID merchantId, Long amount, String currency, String idempotencyKey, UUID orderRef) {
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.idempotencyKey = idempotencyKey;
        this.orderRef = orderRef;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(Object merchantId) {
        if (merchantId instanceof UUID) {
            this.merchantId = (UUID) merchantId;
        } else if (merchantId != null) {
            try {
                this.merchantId = UUID.fromString(merchantId.toString());
            } catch (Exception e) {
                // If named string like MERCHANT001, hash to deterministic UUID
                this.merchantId = UUID.nameUUIDFromBytes(merchantId.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
        }
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

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public void setIdempotencyKey(String idempotencyKey) {
        this.idempotencyKey = idempotencyKey;
    }

    public UUID getOrderRef() {
        return orderRef;
    }

    public void setOrderRef(UUID orderRef) {
        this.orderRef = orderRef;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID merchantId;
        private Long amount;
        private String currency = "INR";
        private String idempotencyKey;
        private UUID orderRef;
        private String customerId;
        private String orderId;

        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder orderRef(UUID orderRef) { this.orderRef = orderRef; return this; }
        public Builder customerId(String customerId) { this.customerId = customerId; return this; }
        public Builder orderId(String orderId) { this.orderId = orderId; return this; }

        public ExternalPaymentCreateRequest build() {
            ExternalPaymentCreateRequest req = new ExternalPaymentCreateRequest();
            req.setMerchantId(this.merchantId);
            req.setAmount(this.amount);
            req.setCurrency(this.currency);
            req.setIdempotencyKey(this.idempotencyKey);
            req.setOrderRef(this.orderRef);
            req.setCustomerId(this.customerId);
            req.setOrderId(this.orderId);
            return req;
        }
    }
}
