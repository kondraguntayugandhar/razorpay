package com.thirdprd.payment.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public class CreatePaymentRequest {

    @NotNull(message = "order_id is required")
    private UUID orderId;

    @NotBlank(message = "method is required (e.g., CARD, UPI, NETBANKING)")
    private String method;

    private Map<String, Object> notes;

    public CreatePaymentRequest() {
    }

    public CreatePaymentRequest(UUID orderId, String method, Map<String, Object> notes) {
        this.orderId = orderId;
        this.method = method;
        this.notes = notes;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
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
        private UUID orderId;
        private String method;
        private Map<String, Object> notes;

        public Builder orderId(UUID orderId) {
            this.orderId = orderId;
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

        public CreatePaymentRequest build() {
            return new CreatePaymentRequest(orderId, method, notes);
        }
    }
}
