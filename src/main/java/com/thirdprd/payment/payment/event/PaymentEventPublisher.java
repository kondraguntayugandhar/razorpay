package com.thirdprd.payment.payment.event;

import com.thirdprd.payment.common.exception.ServiceUnavailableException;
import com.thirdprd.payment.config.RabbitMQConfig;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(PaymentEventPublisher.class);

    private final RabbitTemplate rabbitTemplate;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final Environment environment;

    public PaymentEventPublisher(@Autowired(required = false) RabbitTemplate rabbitTemplate,
                                 ApplicationEventPublisher applicationEventPublisher,
                                 Environment environment) {
        this.rabbitTemplate = rabbitTemplate;
        this.applicationEventPublisher = applicationEventPublisher;
        this.environment = environment;
    }

    public void publishPaymentCreated(PaymentCreatedEvent event) {
        log.info("Publishing PaymentCreatedEvent for paymentId: {}", event.getPaymentId());
        publishEventInternal(RabbitMQConfig.ROUTING_KEY_PAYMENT_CREATED, event);
    }

    public void publishPaymentSucceeded(PaymentSucceededEvent event) {
        log.info("Publishing PaymentSucceededEvent for paymentId: {}", event.getPaymentId());
        publishEventInternal(RabbitMQConfig.ROUTING_KEY_PAYMENT_SUCCEEDED, event);
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        log.info("Publishing PaymentFailedEvent for paymentId: {}", event.getPaymentId());
        publishEventInternal(RabbitMQConfig.ROUTING_KEY_PAYMENT_FAILED, event);
    }

    public void publishWebhookReceived(WebhookReceivedEvent event) {
        log.info("Publishing WebhookReceivedEvent for webhookEventId: {}", event.getWebhookEventId());
        publishEventInternal(RabbitMQConfig.ROUTING_KEY_WEBHOOK_RECEIVED, event);
    }

    private void publishEventInternal(String routingKey, Object payload) {
        boolean isTestProfile = environment.acceptsProfiles(Profiles.of("test"));

        if (isTestProfile) {
            // In test environment, publish to local event bus and attempt RabbitMQ gracefully
            applicationEventPublisher.publishEvent(payload);
            if (rabbitTemplate != null) {
                try {
                    rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, payload);
                } catch (Exception e) {
                    log.warn("RabbitMQ unavailable for event publish ({}), payload handled via local event bus in test profile", e.getMessage());
                }
            }
            return;
        }

        // In non-test / production environment:
        // Must publish to RabbitMQ broker for distributed multi-instance cluster delivery.
        // If RabbitMQ is unavailable, fail-closed with 503 ServiceUnavailableException to prevent silent single-instance degradation.
        if (rabbitTemplate == null) {
            throw new ServiceUnavailableException("RabbitMQ connection is not configured or unavailable for distributed event publishing");
        }

        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, payload);
        } catch (Exception e) {
            log.error("Failed to publish event to RabbitMQ broker (routingKey: {}): {}", routingKey, e.getMessage(), e);
            throw new ServiceUnavailableException("Message broker (RabbitMQ) is unavailable for distributed event delivery: " + e.getMessage());
        }
    }
}
