package com.thirdprd.payment.webhook.listener;

import com.thirdprd.payment.config.RabbitMQConfig;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import com.thirdprd.payment.webhook.service.WebhookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class WebhookEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebhookEventListener.class);

    private final WebhookService webhookService;

    public WebhookEventListener(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @RabbitListener(queues = RabbitMQConfig.WEBHOOK_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    public void handleWebhookReceivedFromRabbit(WebhookReceivedEvent event) {
        log.info("Consuming WebhookReceivedEvent from RabbitMQ queue for event ID: {}", event.getWebhookEventId());
        webhookService.processWebhookAsync(event.getWebhookEventId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleWebhookReceivedFromSpringEvent(WebhookReceivedEvent event) {
        log.info("Processing WebhookReceivedEvent from local event bus for event ID: {}", event.getWebhookEventId());
        webhookService.processWebhookAsync(event.getWebhookEventId());
    }
}
