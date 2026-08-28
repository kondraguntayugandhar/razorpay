package com.thirdprd.payment.payment.event;

import java.io.Serializable;
import java.time.Instant;
import java.util.UUID;

public class PaymentFailedEvent implements Serializable {
    private UUID paymentId;
    private UUID orderId;
    private UUID merchantId;
    private String errorCode;
    private String errorDescription;
    private Instant failedAt;

    public PaymentFailedEvent() {
    }

    public PaymentFailedEvent(UUID paymentId, UUID orderId, UUID merchantId, String errorCode, String errorDescription) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.merchantId = merchantId;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.failedAt = Instant.now();
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

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorDescription() {
        return errorDescription;
    }

    public Instant getFailedAt() {
        return failedAt;
    }

    public String getReason() {
        return errorCode != null ? errorCode + ": " + errorDescription : errorDescription;
    }
}
