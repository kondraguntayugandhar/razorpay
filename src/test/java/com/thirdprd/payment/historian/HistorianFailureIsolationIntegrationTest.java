package com.thirdprd.payment.historian;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.historian.listener.HistorianEventListener;
import com.thirdprd.payment.historian.repository.HistorianWebhookEventRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.transaction.CannotCreateTransactionException;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;

@SpringBootTest
@ActiveProfiles("test")
class HistorianFailureIsolationIntegrationTest {

    @Autowired
    private PaymentRepository postgresPaymentRepository;

    @MockBean
    private HistorianWebhookEventRepository mysqlWebhookEventRepository;

    @Autowired
    private HistorianEventListener historianEventListener;

    @BeforeEach
    void setUp() {
        postgresPaymentRepository.deleteAll();
    }

    @Test
    void testMysqlHistorianWriteFailureDoesNotRollbackOrCorruptPostgresPaymentState() {
        // 1. Commit Payment to PostgreSQL Accountant datastore
        UUID merchantId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        Payment payment = Payment.builder()
                .merchantId(merchantId)
                .orderId(orderId)
                .amount(75000L)
                .currency("INR")
                .status(PaymentStatus.SUCCESS)
                .provider("MOCK_PROVIDER")
                .providerPaymentId("pay_fail_iso_001")
                .method("UPI")
                .build();

        payment = postgresPaymentRepository.save(payment);
        assertNotNull(payment.getId());

        // 2. Simulate realistic MySQL connection failure / DataAccessException on Historian write
        doThrow(new CannotCreateTransactionException("MySQL connection timeout"))
                .when(mysqlWebhookEventRepository).save(any());

        // 3. Attempt Historian write
        WebhookReceivedEvent event = new WebhookReceivedEvent(
                UUID.randomUUID(),
                "MOCK_PROVIDER",
                "evt_fail_iso_001",
                "{\"status\":\"SUCCESS\"}",
                true
        );

        assertThrows(Exception.class, () -> historianEventListener.handleWebhookEventFromSpring(event));

        // 4. ASSERTION: PostgreSQL payment state MUST REMAIN SUCCESS (zero rollback or state corruption)
        Payment postgresPayment = postgresPaymentRepository.findById(payment.getId()).orElse(null);
        assertNotNull(postgresPayment);
        assertEquals(PaymentStatus.SUCCESS, postgresPayment.getStatus(), "PostgreSQL payment state MUST remain SUCCESS even if MySQL Historian fails");
    }
}
