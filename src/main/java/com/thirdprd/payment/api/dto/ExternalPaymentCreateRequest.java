package com.thirdprd.payment.api.dto;

import java.util.UUID;

public class ExternalPaymentCreateRequest {
    private UUID merchantId;
    private Long amount; // in paise (e.g. 50000 = ₹500.00)
    private String currency = "INR";
    private String idempotencyKey;
    private UUID orderRef;

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
}
