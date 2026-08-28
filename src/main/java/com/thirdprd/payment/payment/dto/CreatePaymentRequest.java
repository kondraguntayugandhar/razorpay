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

    private String vpa;

    private String upiFlow; // "intent" or "collect"

    private Map<String, Object> notes;

    public CreatePaymentRequest() {
    }

    public CreatePaymentRequest(UUID orderId, String method, String vpa, String upiFlow, Map<String, Object> notes) {
        this.orderId = orderId;
        this.method = method;
        this.vpa = vpa;
        this.upiFlow = upiFlow;
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

    public String getVpa() {
        return vpa;
    }

    public void setVpa(String vpa) {
        this.vpa = vpa;
    }

    public String getUpiFlow() {
        return upiFlow;
    }

    public void setUpiFlow(String upiFlow) {
        this.upiFlow = upiFlow;
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
        private String vpa;
        private String upiFlow;
        private Map<String, Object> notes;

        public Builder orderId(UUID orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder method(String method) {
            this.method = method;
            return this;
        }

        public Builder vpa(String vpa) {
            this.vpa = vpa;
            return this;
        }

        public Builder upiFlow(String upiFlow) {
            this.upiFlow = upiFlow;
            return this;
        }

        public Builder notes(Map<String, Object> notes) {
            this.notes = notes;
            return this;
        }

        public CreatePaymentRequest build() {
            return new CreatePaymentRequest(orderId, method, vpa, upiFlow, notes);
        }
    }
}
