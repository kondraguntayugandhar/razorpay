package com.thirdprd.payment.refund.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateRefundRequest {

    @NotNull(message = "Refund amount is required")
    @Min(value = 1, message = "Refund amount must be greater than 0")
    private Long amount;

    private String reason;

    public CreateRefundRequest() {
    }

    public CreateRefundRequest(Long amount, String reason) {
        this.amount = amount;
        this.reason = reason;
    }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long amount;
        private String reason;

        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }

        public CreateRefundRequest build() {
            return new CreateRefundRequest(amount, reason);
        }
    }
}
