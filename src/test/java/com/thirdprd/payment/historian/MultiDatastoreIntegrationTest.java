package com.thirdprd.payment.historian;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.historian.entity.HistorianWebhookEvent;
import com.thirdprd.payment.historian.repository.HistorianWebhookEventRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import com.thirdprd.payment.historian.listener.HistorianEventListener;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class MultiDatastoreIntegrationTest {

    @Autowired
    private PaymentRepository postgresPaymentRepository;

    @Autowired
    private HistorianWebhookEventRepository mysqlWebhookEventRepository;

    @Autowired
    private HistorianEventListener historianEventListener;

    @BeforeEach
    void setUp() {
        postgresPaymentRepository.deleteAll();
        mysqlWebhookEventRepository.deleteAll();
    }

    @Test
    void testPaymentSavedInPostgresAndWebhookSavedInMysqlDatastore() {
        // 1. Save core financial Payment entity in PostgreSQL ("Accountant")
        UUID merchantId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(orderId)
                .amount(50000L)
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .provider("MOCK_PROVIDER")
                .providerPaymentId("pay_multi_ds_001")
                .method("CARD")
                .build();

        payment = postgresPaymentRepository.save(payment);
        assertNotNull(payment.getId());

        // 2. Emit Webhook event persisted asynchronously in MySQL ("Historian")
        UUID webhookEventId = UUID.randomUUID();
        WebhookReceivedEvent event = new WebhookReceivedEvent(
                webhookEventId,
                "MOCK_PROVIDER",
                "evt_multi_ds_001",
                "{\"status\":\"SUCCESS\"}",
                true
        );

        historianEventListener.handleWebhookEventFromSpring(event);

        // 3. ASSERTIONS: Confirm separate connection data ownership
        Payment postgresPayment = postgresPaymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(postgresPayment, "Payment row MUST exist in PostgreSQL Accountant datastore");

        HistorianWebhookEvent mysqlWebhookEvent = mysqlWebhookEventRepository.findById(webhookEventId.toString()).orElse(null);
        assertNotNull(mysqlWebhookEvent, "WebhookEvent row MUST exist in MySQL Historian datastore");
        assertEquals("MOCK_PROVIDER", mysqlWebhookEvent.getProvider());
        assertTrue(mysqlWebhookEvent.getSignatureValid());
    }
}
