package com.thirdprd.payment.payment.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class PaymentCreatedEvent implements Serializable {
    private UUID paymentId;
    private UUID orderId;
    private UUID merchantId;
    private Long amount;
    private String currency;
    private Instant createdAt;

    public PaymentCreatedEvent() {
    }

    public PaymentCreatedEvent(UUID paymentId, UUID orderId, UUID merchantId, Long amount, String currency) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.amount = amount;
        this.currency = currency;
        this.createdAt = Instant.now();
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public Long getAmount() {
        return amount;
    }

    public String getCurrency() {
        return currency;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
