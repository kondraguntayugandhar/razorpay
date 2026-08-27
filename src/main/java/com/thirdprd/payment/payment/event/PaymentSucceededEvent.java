package com.thirdprd.payment.payment.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class PaymentSucceededEvent implements Serializable {
    private UUID paymentId;
    private UUID orderId;
    private UUID merchantId;
    private String providerPaymentId;
    private Instant succeededAt;

    public PaymentSucceededEvent() {
    }

    public PaymentSucceededEvent(UUID paymentId, UUID orderId, UUID merchantId, String providerPaymentId) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.providerPaymentId = providerPaymentId;
        this.succeededAt = Instant.now();
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

    public String getProviderPaymentId() {
        return providerPaymentId;
    }

    public Instant getSucceededAt() {
        return succeededAt;
    }
}
