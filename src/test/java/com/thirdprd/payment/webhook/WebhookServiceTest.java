package com.thirdprd.payment.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.payment.event.PaymentEventPublisher;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WebhookServiceTest {

    @Mock
    private PaymentService paymentService;

    @Mock
    private PaymentEventPublisher eventPublisher;

    private WebhookSignatureVerifier signatureVerifier;
    private WebhookService webhookService;
    private ObjectMapper objectMapper;
    private final String secret = "test_shared_webhook_secret_key_123";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        signatureVerifier = new WebhookSignatureVerifier(secret);
        webhookService = new WebhookService(signatureVerifier, paymentService, objectMapper, eventPublisher);
    }

    @Test
    void testInvalidSignatureRejectsIngestionAndPublishesAuditEvent() {
        String provider = "MOCK_PROVIDER";
        String invalidSig = "bad_signature";
        String payload = "{\"event_id\":\"evt_001\",\"provider_payment_id\":\"pay_100\",\"status\":\"SUCCESS\"}";

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook(provider, invalidSig, payload);

        assertEquals(WebhookService.WebhookIngestionResult.INVALID_SIGNATURE, result);

        ArgumentCaptor<WebhookReceivedEvent> eventCaptor = ArgumentCaptor.forClass(WebhookReceivedEvent.class);
        verify(eventPublisher).publishWebhookReceived(eventCaptor.capture());

        assertFalse(eventCaptor.getValue().getSignatureValid(), "Event signatureValid MUST be false for bad signature");
        assertEquals(provider, eventCaptor.getValue().getProvider());
    }

    @Test
    void testValidSignaturePublishesAuditEventAndSucceeds() {
        String provider = "MOCK_PROVIDER";
        String payload = "{\"event_id\":\"evt_002\",\"provider_payment_id\":\"pay_101\",\"status\":\"SUCCESS\"}";
        String validSig = signatureVerifier.calculateSignature(payload, secret);

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook(provider, validSig, payload);

        assertEquals(WebhookService.WebhookIngestionResult.SUCCESS, result);

        ArgumentCaptor<WebhookReceivedEvent> eventCaptor = ArgumentCaptor.forClass(WebhookReceivedEvent.class);
        verify(eventPublisher).publishWebhookReceived(eventCaptor.capture());

        assertTrue(eventCaptor.getValue().getSignatureValid());
    }
}
