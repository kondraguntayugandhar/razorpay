package com.thirdprd.payment.historian.listener;

import com.thirdprd.payment.config.RabbitMQConfig;
import com.thirdprd.payment.historian.entity.HistorianPaymentEvent;
import com.thirdprd.payment.historian.entity.HistorianWebhookEvent;
import com.thirdprd.payment.historian.repository.HistorianPaymentEventRepository;
import com.thirdprd.payment.historian.repository.HistorianWebhookEventRepository;
import com.thirdprd.payment.payment.event.PaymentFailedEvent;
import com.thirdprd.payment.payment.event.PaymentSucceededEvent;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.util.UUID;

@Component
public class HistorianEventListener {

    private static final Logger log = LoggerFactory.getLogger(HistorianEventListener.class);

    private final HistorianWebhookEventRepository webhookEventRepository;
    private final HistorianPaymentEventRepository paymentEventRepository;

    public HistorianEventListener(HistorianWebhookEventRepository webhookEventRepository,
                                  HistorianPaymentEventRepository paymentEventRepository) {
        this.webhookEventRepository = webhookEventRepository;
        this.paymentEventRepository = paymentEventRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.WEBHOOK_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    @Transactional(transactionManager = "mysqlTransactionManager")
    public void handleWebhookEventFromRabbit(WebhookReceivedEvent event) {
        log.info("Historian: Consuming WebhookReceivedEvent from RabbitMQ for event ID: {}", event.getWebhookEventId());
        saveWebhookEventToMysql(event);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(transactionManager = "mysqlTransactionManager", propagation = Propagation.REQUIRES_NEW)
    public void handleWebhookEventFromSpring(WebhookReceivedEvent event) {
        log.info("Historian: Processing WebhookReceivedEvent from local event bus for event ID: {}", event.getWebhookEventId());
        saveWebhookEventToMysql(event);
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    @Transactional(transactionManager = "mysqlTransactionManager")
    public void handlePaymentSucceededFromRabbit(PaymentSucceededEvent event) {
        savePaymentEventToMysql(event.getPaymentId().toString(), "PROCESSING", "SUCCEEDED", "Payment captured successfully");
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(transactionManager = "mysqlTransactionManager", propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentSucceededFromSpring(PaymentSucceededEvent event) {
        savePaymentEventToMysql(event.getPaymentId().toString(), "PROCESSING", "SUCCEEDED", "Payment captured successfully");
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    @Transactional(transactionManager = "mysqlTransactionManager")
    public void handlePaymentFailedFromRabbit(PaymentFailedEvent event) {
        savePaymentEventToMysql(event.getPaymentId().toString(), "PROCESSING", "FAILED", event.getReason());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Transactional(transactionManager = "mysqlTransactionManager", propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentFailedFromSpring(PaymentFailedEvent event) {
        savePaymentEventToMysql(event.getPaymentId().toString(), "PROCESSING", "FAILED", event.getReason());
    }

    private void saveWebhookEventToMysql(WebhookReceivedEvent event) {
        if (event == null || event.getWebhookEventId() == null) return;

        String idStr = event.getWebhookEventId().toString();
        if (webhookEventRepository.findById(idStr).isPresent()) {
            log.info("Historian: Webhook event {} already recorded in MySQL. Skipping.", idStr);
            return;
        }

        HistorianWebhookEvent entity = HistorianWebhookEvent.builder()
                .id(idStr)
                .provider(event.getProvider() != null ? event.getProvider() : "UNKNOWN")
                .providerEventId(event.getProviderEventId() != null ? event.getProviderEventId() : "evt_" + idStr.substring(0, 8))
                .payload(event.getRawPayload() != null ? event.getRawPayload() : "{}")
                .signatureValid(event.getSignatureValid() != null ? event.getSignatureValid() : false)
                .processed(true)
                .receivedAt(Instant.now())
                .processedAt(Instant.now())
                .build();

        webhookEventRepository.save(entity);
        log.info("Historian: Successfully persisted WebhookEvent {} to MySQL Historian datastore", idStr);
    }

    private void savePaymentEventToMysql(String paymentId, String fromStatus, String toStatus, String reason) {
        HistorianPaymentEvent entity = HistorianPaymentEvent.builder()
                .id(UUID.randomUUID().toString())
                .paymentId(paymentId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .reason(reason)
                .createdAt(Instant.now())
                .build();

        paymentEventRepository.save(entity);
        log.info("Historian: Successfully persisted PaymentEvent for paymentId {} to MySQL Historian datastore", paymentId);
    }
}
