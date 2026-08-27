package com.thirdprd.payment.common.enums;

public enum ErrorCode {
    BAD_REQUEST("BAD_REQUEST", "Invalid request parameters"),
    UNAUTHORIZED("UNAUTHORIZED", "Authentication failed or API key missing/invalid"),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Requested resource was not found"),
    IDEMPOTENCY_CONFLICT("IDEMPOTENCY_CONFLICT", "Idempotency key reused with different request payload"),
    INVALID_STATE_TRANSITION("INVALID_STATE_TRANSITION", "Invalid state transition requested"),
    PAYMENT_FAILED("PAYMENT_FAILED", "Payment processing failed"),
    INTERNAL_ERROR("INTERNAL_ERROR", "An unexpected internal error occurred");

    private final String code;
    private final String defaultMessage;

    ErrorCode(String code, String defaultMessage) {
        this.code = code;
        this.defaultMessage = defaultMessage;
    }

    public String getCode() {
        return code;
    }

    public String getDefaultMessage() {
        return defaultMessage;
    }
}
