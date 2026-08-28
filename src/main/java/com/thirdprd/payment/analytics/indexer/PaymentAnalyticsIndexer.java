package com.thirdprd.payment.analytics.indexer;

import com.thirdprd.payment.analytics.document.PaymentAnalyticsDocument;
import com.thirdprd.payment.analytics.repository.PaymentAnalyticsRepository;
import com.thirdprd.payment.config.RabbitMQConfig;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.event.PaymentCreatedEvent;
import com.thirdprd.payment.payment.event.PaymentFailedEvent;
import com.thirdprd.payment.payment.event.PaymentSucceededEvent;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Instant;
import java.util.UUID;

@Component
public class PaymentAnalyticsIndexer {

    private static final Logger log = LoggerFactory.getLogger(PaymentAnalyticsIndexer.class);

    private final PaymentAnalyticsRepository analyticsRepository;
    private final PaymentRepository paymentRepository;

    public PaymentAnalyticsIndexer(@Autowired(required = false) PaymentAnalyticsRepository analyticsRepository,
                                  PaymentRepository paymentRepository) {
        this.analyticsRepository = analyticsRepository;
        this.paymentRepository = paymentRepository;
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    public void indexPaymentSucceededFromRabbit(PaymentSucceededEvent event) {
        indexPayment(event.getPaymentId(), "SUCCEEDED", null);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void indexPaymentSucceededFromSpring(PaymentSucceededEvent event) {
        indexPayment(event.getPaymentId(), "SUCCEEDED", null);
    }

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_EVENTS_QUEUE, autoStartup = "${spring.rabbitmq.listener.auto-startup:true}")
    public void indexPaymentFailedFromRabbit(PaymentFailedEvent event) {
        indexPayment(event.getPaymentId(), "FAILED", event.getReason());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void indexPaymentFailedFromSpring(PaymentFailedEvent event) {
        indexPayment(event.getPaymentId(), "FAILED", event.getReason());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void indexPaymentCreatedFromSpring(PaymentCreatedEvent event) {
        indexPayment(event.getPaymentId(), "CREATED", null);
    }

    public void indexPayment(UUID paymentId, String status, String reason) {
        if (analyticsRepository == null) {
            log.debug("PaymentAnalyticsRepository uninitialized (Elasticsearch disabled/mocked). Skipping indexing.");
            return;
        }

        try {
            Payment payment = paymentRepository.findById(paymentId).orElse(null);
            if (payment == null) return;

            PaymentAnalyticsDocument doc = PaymentAnalyticsDocument.builder()
                    .id(payment.getId().toString())
                    .paymentId(payment.getId().toString())
                    .merchantId(payment.getMerchantId() != null ? payment.getMerchantId().toString() : null)
                    .amount(payment.getAmount())
                    .currency(payment.getCurrency())
                    .status(status != null ? status : payment.getStatus().name())
                    .provider(payment.getProvider())
                    .method(payment.getMethod())
                    .receipt("rcpt_" + payment.getId().toString().substring(0, 8))
                    .createdAt(payment.getCreatedAt() != null ? payment.getCreatedAt() : Instant.now())
                    .build();

            analyticsRepository.save(doc);
            log.info("Analytics: Successfully projected paymentId {} into Elasticsearch analytics index", paymentId);
        } catch (Exception e) {
            log.warn("Analytics: Elasticsearch indexing skipped/failed for paymentId {}: {}", paymentId, e.getMessage());
        }
    }
}
