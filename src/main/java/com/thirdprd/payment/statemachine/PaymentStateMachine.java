package com.thirdprd.payment.statemachine;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.InvalidStateTransitionException;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

@Component
public class PaymentStateMachine {

    private static final Map<PaymentStatus, Set<PaymentStatus>> TRANSITIONS = new EnumMap<>(PaymentStatus.class);

    static {
        TRANSITIONS.put(PaymentStatus.CREATED, Set.of(
                PaymentStatus.PENDING,
                PaymentStatus.PROCESSING,
                PaymentStatus.SUCCESS,
                PaymentStatus.FAILED,
                PaymentStatus.CANCELLED,
                PaymentStatus.EXPIRED
        ));

        TRANSITIONS.put(PaymentStatus.PENDING, Set.of(
                PaymentStatus.PROCESSING,
                PaymentStatus.SUCCESS,
                PaymentStatus.FAILED,
                PaymentStatus.EXPIRED
        ));

        TRANSITIONS.put(PaymentStatus.PROCESSING, Set.of(
                PaymentStatus.PENDING,
                PaymentStatus.SUCCESS,
                PaymentStatus.FAILED
        ));

        TRANSITIONS.put(PaymentStatus.SUCCESS, Set.of(
                PaymentStatus.SETTLEMENT_PENDING,
                PaymentStatus.REFUND_PENDING,
                PaymentStatus.DISPUTED
        ));

        TRANSITIONS.put(PaymentStatus.SETTLEMENT_PENDING, Set.of(
                PaymentStatus.SETTLED
        ));

        TRANSITIONS.put(PaymentStatus.REFUND_PENDING, Set.of(
                PaymentStatus.PARTIALLY_REFUNDED,
                PaymentStatus.REFUNDED,
                PaymentStatus.DISPUTED
        ));
    }

    public boolean isValidTransition(PaymentStatus current, PaymentStatus target) {
        if (current == target) {
            return true;
        }
        return TRANSITIONS.getOrDefault(current, Set.of()).contains(target);
    }

    public void validateTransition(PaymentStatus current, PaymentStatus target) {
        if (!isValidTransition(current, target)) {
            throw new InvalidStateTransitionException(current, target);
        }
    }
}
