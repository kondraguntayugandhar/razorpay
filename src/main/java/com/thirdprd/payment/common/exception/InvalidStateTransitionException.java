package com.thirdprd.payment.common.exception;

import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.enums.PaymentStatus;

public class InvalidStateTransitionException extends BusinessException {

    public InvalidStateTransitionException(PaymentStatus current, PaymentStatus target) {
        super(ErrorCode.INVALID_STATE_TRANSITION,
                String.format("Invalid state transition from %s to %s", current, target));
    }
}
