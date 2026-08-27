package com.thirdprd.payment.webhook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.webhook.entity.WebhookEvent;
import com.thirdprd.payment.webhook.repository.WebhookEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    private final WebhookEventRepository webhookEventRepository;
    private final WebhookSignatureVerifier signatureVerifier;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;

    public WebhookService(WebhookEventRepository webhookEventRepository, WebhookSignatureVerifier signatureVerifier, PaymentService paymentService, ObjectMapper objectMapper) {
        this.webhookEventRepository = webhookEventRepository;
        this.signatureVerifier = signatureVerifier;
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
    }

    public enum WebhookIngestionResult {
        SUCCESS,
        INVALID_SIGNATURE,
        DUPLICATE_ALREADY_PROCESSED
    }

    @Transactional
    public WebhookIngestionResult ingestWebhook(String provider, String signature, String rawPayload) {
        // Step 1: Verify HMAC signature directly on raw bytes string (no re-serialization)
        boolean isSignatureValid = signatureVerifier.verifySignature(rawPayload, signature, null);
        String providerEventId = extractProviderEventId(rawPayload);

        WebhookEvent webhookEvent = WebhookEvent.builder()
                .provider(provider)
                .providerEventId(providerEventId)
                .payload(rawPayload)
                .signatureValid(isSignatureValid)
                .processed(false)
                .build();

        // Step 4 correction: Insert-then-catch deduplication via DB unique constraint
        try {
            webhookEvent = webhookEventRepository.saveAndFlush(webhookEvent);
        } catch (DataIntegrityViolationException e) {
            log.info("Duplicate webhook event insert detected for providerEventId {}. Checking processing status.", providerEventId);
            Optional<WebhookEvent> existing = webhookEventRepository.findByProviderAndProviderEventId(provider, providerEventId);
            if (existing.isPresent()) {
                webhookEvent = existing.get();
                if (Boolean.TRUE.equals(webhookEvent.getProcessed())) {
                    log.info("Webhook event {} from {} already processed. Skipping.", providerEventId, provider);
                    return WebhookIngestionResult.DUPLICATE_ALREADY_PROCESSED;
                }
            }
        }

        // Step 3 correction: Explicit early-return if signature is invalid (NEVER touch PaymentStateMachine)
        if (!isSignatureValid) {
            log.warn("Invalid signature for webhook event {} from {}. Stored raw event but aborting processing.", providerEventId, provider);
            return WebhookIngestionResult.INVALID_SIGNATURE;
        }

        // Step 4: Asynchronous queue processing using bounded ThreadPoolTaskExecutor
        // (Note: In Phase 3, this becomes a RabbitMQ/Kafka queue consumer)
        processWebhookAsync(webhookEvent.getId());

        return WebhookIngestionResult.SUCCESS;
    }

    @Async("webhookTaskExecutor")
    @Transactional
    public void processWebhookAsync(UUID webhookEventId) {
        WebhookEvent event = webhookEventRepository.findById(webhookEventId).orElse(null);
        if (event == null || Boolean.FALSE.equals(event.getSignatureValid()) || Boolean.TRUE.equals(event.getProcessed())) {
            log.warn("Skipping processing for webhook event ID {}: invalid signature or already processed", webhookEventId);
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(event.getPayload());
            String providerPaymentId = root.path("provider_payment_id").asText(null);
            String statusStr = root.path("status").asText(null);
            String errorCode = root.path("error_code").asText(null);
            String errorDescription = root.path("error_description").asText(null);

            if (providerPaymentId != null && statusStr != null) {
                PaymentStatus targetStatus = PaymentStatus.valueOf(statusStr.toUpperCase());

                // State machine validation and audit logging happens inside PaymentService
                paymentService.processProviderStatusUpdate(
                        providerPaymentId,
                        targetStatus,
                        errorCode,
                        errorDescription,
                        "Updated via inbound webhook event: " + event.getProviderEventId()
                );
            }

            event.setProcessed(true);
            event.setProcessedAt(Instant.now());
            webhookEventRepository.save(event);
            log.info("Successfully processed webhook event ID: {}", event.getProviderEventId());
        } catch (Exception e) {
            log.error("Failed to process webhook event ID: {}", event.getProviderEventId(), e);
        }
    }

    private String extractProviderEventId(String rawPayload) {
        try {
            JsonNode node = objectMapper.readTree(rawPayload);
            if (node.has("event_id")) {
                return node.get("event_id").asText();
            }
            if (node.has("id")) {
                return node.get("id").asText();
            }
        } catch (Exception ignored) {
        }
        return "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
