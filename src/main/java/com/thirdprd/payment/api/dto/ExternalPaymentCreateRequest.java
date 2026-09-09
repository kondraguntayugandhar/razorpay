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
    private String paymentMethod;
    private String bank;
    private Integer emiTenure;
    private String vpa;
    private String simulate;

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

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getBank() {
        return bank;
    }

    public void setBank(String bank) {
        this.bank = bank;
    }

    public Integer getEmiTenure() {
        return emiTenure;
    }

    public void setEmiTenure(Integer emiTenure) {
        this.emiTenure = emiTenure;
    }

    public String getVpa() {
        return vpa;
    }

    public void setVpa(String vpa) {
        this.vpa = vpa;
    }

    public String getSimulate() {
        return simulate;
    }

    public void setSimulate(String simulate) {
        this.simulate = simulate;
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
        private String paymentMethod;
        private String bank;
        private Integer emiTenure;
        private String vpa;
        private String simulate;

        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder idempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; return this; }
        public Builder orderRef(UUID orderRef) { this.orderRef = orderRef; return this; }
        public Builder customerId(String customerId) { this.customerId = customerId; return this; }
        public Builder orderId(String orderId) { this.orderId = orderId; return this; }
        public Builder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder bank(String bank) { this.bank = bank; return this; }
        public Builder emiTenure(Integer emiTenure) { this.emiTenure = emiTenure; return this; }
        public Builder vpa(String vpa) { this.vpa = vpa; return this; }
        public Builder simulate(String simulate) { this.simulate = simulate; return this; }

        public ExternalPaymentCreateRequest build() {
            ExternalPaymentCreateRequest req = new ExternalPaymentCreateRequest();
            req.setMerchantId(this.merchantId);
            req.setAmount(this.amount);
            req.setCurrency(this.currency);
            req.setIdempotencyKey(this.idempotencyKey);
            req.setOrderRef(this.orderRef);
            req.setCustomerId(this.customerId);
            req.setOrderId(this.orderId);
            req.setPaymentMethod(this.paymentMethod);
            req.setBank(this.bank);
            req.setEmiTenure(this.emiTenure);
            req.setVpa(this.vpa);
            req.setSimulate(this.simulate);
            return req;
        }
    }
}
