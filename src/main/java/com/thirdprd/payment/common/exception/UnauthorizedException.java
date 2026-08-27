package com.thirdprd.payment.common.exception;

import com.thirdprd.payment.common.enums.ErrorCode;

public class UnauthorizedException extends BusinessException {

    public UnauthorizedException(String message) {
        super(ErrorCode.UNAUTHORIZED, message);
    }
}
