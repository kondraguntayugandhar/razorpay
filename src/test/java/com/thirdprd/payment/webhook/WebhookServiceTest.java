package com.thirdprd.payment.webhook;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.webhook.entity.WebhookEvent;
import com.thirdprd.payment.webhook.repository.WebhookEventRepository;
import com.thirdprd.payment.webhook.service.WebhookService;
import com.thirdprd.payment.webhook.service.WebhookSignatureVerifier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import com.thirdprd.payment.payment.event.PaymentEventPublisher;

@ExtendWith(MockitoExtension.class)
class WebhookServiceTest {

    @Mock
    private WebhookEventRepository webhookEventRepository;

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
        webhookService = new WebhookService(webhookEventRepository, signatureVerifier, paymentService, objectMapper, eventPublisher);
    }

    @Test
    void testInvalidSignatureRejectsIngestion() {
        String provider = "MOCK_PROVIDER";
        String invalidSig = "bad_signature";
        String payload = "{\"event_id\":\"evt_001\",\"provider_payment_id\":\"pay_100\",\"status\":\"SUCCESS\"}";

        when(webhookEventRepository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook(provider, invalidSig, payload);

        assertEquals(WebhookService.WebhookIngestionResult.INVALID_SIGNATURE, result);

        ArgumentCaptor<WebhookEvent> eventCaptor = ArgumentCaptor.forClass(WebhookEvent.class);
        verify(webhookEventRepository).saveAndFlush(eventCaptor.capture());

        assertFalse(eventCaptor.getValue().getSignatureValid());
        assertFalse(eventCaptor.getValue().getProcessed());
    }

    @Test
    void testDeduplicationReturnsDuplicateResult() {
        String provider = "MOCK_PROVIDER";
        String payload = "{\"event_id\":\"evt_002\",\"provider_payment_id\":\"pay_101\",\"status\":\"SUCCESS\"}";
        String validSig = signatureVerifier.calculateSignature(payload, secret);

        WebhookEvent existingEvent = WebhookEvent.builder()
                .id(UUID.randomUUID())
                .provider(provider)
                .providerEventId("evt_002")
                .payload(payload)
                .signatureValid(true)
                .processed(true)
                .build();

        when(webhookEventRepository.saveAndFlush(any()))
                .thenThrow(new org.springframework.dao.DataIntegrityViolationException("Duplicate key"));
        when(webhookEventRepository.findByProviderAndProviderEventId(eq(provider), eq("evt_002")))
                .thenReturn(Optional.of(existingEvent));

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook(provider, validSig, payload);

        assertEquals(WebhookService.WebhookIngestionResult.DUPLICATE_ALREADY_PROCESSED, result);
    }
}
