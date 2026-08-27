package com.thirdprd.payment.common.exception;

import com.thirdprd.payment.common.enums.ErrorCode;

public class ServiceUnavailableException extends RuntimeException {
    private final ErrorCode errorCode;

    public ServiceUnavailableException(String message) {
        super(message);
        this.errorCode = ErrorCode.SERVICE_UNAVAILABLE;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}
