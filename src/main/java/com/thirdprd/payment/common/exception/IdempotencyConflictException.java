package com.thirdprd.payment.common.exception;

import com.thirdprd.payment.common.enums.ErrorCode;

public class IdempotencyConflictException extends BusinessException {

    public IdempotencyConflictException(String idempotencyKey) {
        super(ErrorCode.IDEMPOTENCY_CONFLICT,
                String.format("Idempotency key '%s' was previously used with a different request payload", idempotencyKey));
    }
}
