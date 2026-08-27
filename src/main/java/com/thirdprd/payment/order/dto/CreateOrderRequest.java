package com.thirdprd.payment.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Map;
import java.util.UUID;

public class CreateOrderRequest {

    @NotNull(message = "Amount is required")
    @Min(value = 100, message = "Minimum amount is 100 (1 INR / 100 paise)")
    private Long amount;

    private String currency = "INR";
    private String receipt;
    private UUID customerId;
    private Map<String, Object> notes;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long amount, String currency, String receipt, UUID customerId, Map<String, Object> notes) {
        this.amount = amount;
        this.currency = currency != null ? currency : "INR";
        this.receipt = receipt;
        this.customerId = customerId;
        this.notes = notes;
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

    public String getReceipt() {
        return receipt;
    }

    public void setReceipt(String receipt) {
        this.receipt = receipt;
    }

    public UUID getCustomerId() {
        return customerId;
    }

    public void setCustomerId(UUID customerId) {
        this.customerId = customerId;
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
        private Long amount;
        private String currency = "INR";
        private String receipt;
        private UUID customerId;
        private Map<String, Object> notes;

        public Builder amount(Long amount) {
            this.amount = amount;
            return this;
        }

        public Builder currency(String currency) {
            this.currency = currency;
            return this;
        }

        public Builder receipt(String receipt) {
            this.receipt = receipt;
            return this;
        }

        public Builder customerId(UUID customerId) {
            this.customerId = customerId;
            return this;
        }

        public Builder notes(Map<String, Object> notes) {
            this.notes = notes;
            return this;
        }

        public CreateOrderRequest build() {
            return new CreateOrderRequest(amount, currency, receipt, customerId, notes);
        }
    }
}
