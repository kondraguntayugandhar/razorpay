package com.thirdprd.payment.payment.event;

import com.thirdprd.payment.config.RabbitMQConfig;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final ApplicationEventPublisher applicationEventPublisher;

    public PaymentEventPublisher(@Autowired(required = false) RabbitTemplate rabbitTemplate,
                                ApplicationEventPublisher applicationEventPublisher) {
        this.rabbitTemplate = rabbitTemplate;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publishPaymentCreated(PaymentCreatedEvent event) {
        log.info("Publishing PaymentCreatedEvent for paymentId: {}", event.getPaymentId());
        applicationEventPublisher.publishEvent(event);
        publishToRabbit(RabbitMQConfig.ROUTING_KEY_PAYMENT_CREATED, event);
    }

    public void publishPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Publishing PaymentSucceededEvent for paymentId: {}", event.getPaymentId());
        applicationEventPublisher.publishEvent(event);
        publishToRabbit(RabbitMQConfig.ROUTING_KEY_PAYMENT_SUCCEEDED, event);
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent for paymentId: {}", event.getPaymentId());
        applicationEventPublisher.publishEvent(event);
        publishToRabbit(RabbitMQConfig.ROUTING_KEY_PAYMENT_FAILED, event);
    }

    public void publishWebhookReceived(WebhookReceivedEvent event) {
        log.info("Publishing WebhookReceivedEvent for webhookEventId: {}", event.getWebhookEventId());
        applicationEventPublisher.publishEvent(event);
        publishToRabbit(RabbitMQConfig.ROUTING_KEY_WEBHOOK_RECEIVED, event);
    }

    private void publishToRabbit(String routingKey, Object payload) {
        if (rabbitTemplate != null) {
            try {
                rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, payload);
            } catch (Exception e) {
                log.warn("RabbitMQ unavailable for event publish ({}), payload handled via local event bus", e.getMessage());
            }
        }
    }
}
