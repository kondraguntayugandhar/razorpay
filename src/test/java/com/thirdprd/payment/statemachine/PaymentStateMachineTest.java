package com.thirdprd.payment.statemachine;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class PaymentStateMachineTest {

    private PaymentStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new PaymentStateMachine();
    }

    @Test
    void testValidTransitions() {
        assertTrue(stateMachine.isValidTransition(PaymentStatus.CREATED, PaymentStatus.PROCESSING));
        assertTrue(stateMachine.isValidTransition(PaymentStatus.PROCESSING, PaymentStatus.SUCCESS));
        assertTrue(stateMachine.isValidTransition(PaymentStatus.PROCESSING, PaymentStatus.FAILED));
        assertTrue(stateMachine.isValidTransition(PaymentStatus.SUCCESS, PaymentStatus.SETTLEMENT_PENDING));
        assertTrue(stateMachine.isValidTransition(PaymentStatus.SETTLEMENT_PENDING, PaymentStatus.SETTLED));
    }

    @Test
    void testInvalidTransitionsThrowException() {
        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(PaymentStatus.SUCCESS, PaymentStatus.PROCESSING));

        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(PaymentStatus.FAILED, PaymentStatus.SUCCESS));
    }
}
