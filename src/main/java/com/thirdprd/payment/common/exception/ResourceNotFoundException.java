package com.thirdprd.payment.common.exception;

import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.enums.PaymentStatus;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(ErrorCode.RESOURCE_NOT_FOUND, String.format("%s not found with identifier: %s", resourceName, identifier));
    }
}
