package com.thirdprd.payment.payment.event;

import com.thirdprd.payment.common.exception.ServiceUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentEventPublisherTest {

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private ApplicationEventPublisher applicationEventPublisher;

    @Mock
    private Environment environment;

    private PaymentEventPublisher eventPublisher;

    @BeforeEach
    void setUp() {
        eventPublisher = new PaymentEventPublisher(rabbitTemplate, applicationEventPublisher, environment);
    }

    @Test
    void testProductionProfileThrowsServiceUnavailableWhenRabbitFails() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(false);
        doThrow(new AmqpException("RabbitMQ broker connection refused"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        PaymentCreatedEvent event = new PaymentCreatedEvent(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), 1000L, "INR");

        ServiceUnavailableException ex = assertThrows(ServiceUnavailableException.class, () ->
                eventPublisher.publishPaymentCreated(event));

        assertTrue(ex.getMessage().contains("Message broker (RabbitMQ) is unavailable"));
        verify(applicationEventPublisher, never()).publishEvent(any());
    }

    @Test
    void testProductionProfileThrowsServiceUnavailableWhenRabbitTemplateNull() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(false);
        PaymentEventPublisher nullRabbitPublisher = new PaymentEventPublisher(null, applicationEventPublisher, environment);

        PaymentCreatedEvent event = new PaymentCreatedEvent(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), 1000L, "INR");

        ServiceUnavailableException ex = assertThrows(ServiceUnavailableException.class, () ->
                nullRabbitPublisher.publishPaymentCreated(event));

        assertTrue(ex.getMessage().contains("RabbitMQ connection is not configured or unavailable"));
        verify(applicationEventPublisher, never()).publishEvent(any());
    }

    @Test
    void testTestProfileFallsBackToLocalEventBusWhenRabbitFails() {
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(true);
        doThrow(new AmqpException("RabbitMQ offline in test"))
                .when(rabbitTemplate).convertAndSend(anyString(), anyString(), any(Object.class));

        PaymentCreatedEvent event = new PaymentCreatedEvent(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), 1000L, "INR");

        assertDoesNotThrow(() -> eventPublisher.publishPaymentCreated(event));
        verify(applicationEventPublisher).publishEvent(event);
    }
}
