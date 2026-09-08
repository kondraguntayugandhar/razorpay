package com.thirdprd.payment.webhook.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.payment.event.PaymentEventPublisher;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.webhook.event.WebhookReceivedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class WebhookService {

    private static final Logger log = LoggerFactory.getLogger(WebhookService.class);

    private final WebhookSignatureVerifier signatureVerifier;
    private final PaymentService paymentService;
    private final ObjectMapper objectMapper;
    private final PaymentEventPublisher eventPublisher;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.webhook.repository.WebhookInboundEventRepository inboundEventRepository;

    public WebhookService(WebhookSignatureVerifier signatureVerifier,
                          PaymentService paymentService,
                          ObjectMapper objectMapper,
                          PaymentEventPublisher eventPublisher) {
        this.signatureVerifier = signatureVerifier;
        this.paymentService = paymentService;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
    }

    public enum WebhookIngestionResult {
        SUCCESS,
        INVALID_SIGNATURE,
        DUPLICATE_ALREADY_PROCESSED
    }

    public WebhookIngestionResult ingestWebhook(String provider, String signature, String rawPayload) {
        // Step 1: Verify HMAC signature directly on raw bytes string
        boolean isSignatureValid = signatureVerifier.verifySignature(rawPayload, signature, null);
        String providerEventId = extractProviderEventId(rawPayload);
        UUID webhookEventId = UUID.randomUUID();

        // Step 2: Publish WebhookReceivedEvent containing signature audit status and raw payload
        WebhookReceivedEvent event = new WebhookReceivedEvent(
                webhookEventId,
                provider,
                providerEventId,
                rawPayload,
                isSignatureValid
        );

        eventPublisher.publishWebhookReceived(event);

        // Step 3: Explicit early-return if signature is invalid (NEVER touch PaymentStateMachine)
        if (!isSignatureValid) {
            log.warn("Invalid signature for webhook event {} from {}. Published audit event but aborting state transition.", providerEventId, provider);
            return WebhookIngestionResult.INVALID_SIGNATURE;
        }

        // Step 4: Check deduplication table
        if (inboundEventRepository != null) {
            if (inboundEventRepository.existsByProviderAndProviderEventId(provider, providerEventId)) {
                log.info("Duplicate webhook event {} from {} already processed. Acknowledging duplicate delivery with SUCCESS.", providerEventId, provider);
                return WebhookIngestionResult.SUCCESS;
            }
            try {
                String payloadHash = org.springframework.util.DigestUtils.md5DigestAsHex(rawPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
                com.thirdprd.payment.webhook.entity.WebhookInboundEvent inboundEvent =
                        com.thirdprd.payment.webhook.entity.WebhookInboundEvent.builder()
                                .provider(provider)
                                .providerEventId(providerEventId)
                                .payloadHash(payloadHash)
                                .status("PROCESSED")
                                .build();
                inboundEventRepository.save(inboundEvent);
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                log.info("Duplicate concurrent webhook event {} from {} captured via DB unique constraint. Acknowledging with SUCCESS.", providerEventId, provider);
                return WebhookIngestionResult.SUCCESS;
            }
        }

        return WebhookIngestionResult.SUCCESS;
    }

    @Async("webhookTaskExecutor")
    public void processWebhookAsync(WebhookReceivedEvent event) {
        if (event == null || Boolean.FALSE.equals(event.getSignatureValid())) {
            log.warn("Skipping state processing for webhook event: missing event or invalid signature");
            return;
        }

        try {
            JsonNode root = objectMapper.readTree(event.getRawPayload());
            if (root.isTextual()) {
                root = objectMapper.readTree(root.asText());
            }
            String providerPaymentId = null;
            PaymentStatus targetStatus = null;
            String errorCode = null;
            String errorDescription = null;
            Long payloadAmount = null;
            String payloadCurrency = null;

            // Check if payload matches Razorpay webhook event schema
            if (root.has("event") && root.has("payload")) {
                String eventName = root.get("event").asText();
                JsonNode payloadNode = root.get("payload");

                if (payloadNode.has("payment") && payloadNode.get("payment").has("entity")) {
                    JsonNode paymentEntity = payloadNode.get("payment").get("entity");
                    providerPaymentId = paymentEntity.has("id") ? paymentEntity.get("id").asText() : null;
                    if (providerPaymentId == null && paymentEntity.has("order_id")) {
                        providerPaymentId = paymentEntity.get("order_id").asText();
                    }
                    if (paymentEntity.has("amount")) {
                        payloadAmount = paymentEntity.get("amount").asLong();
                    }
                    if (paymentEntity.has("currency")) {
                        payloadCurrency = paymentEntity.get("currency").asText();
                    }

                    if ("payment.captured".equalsIgnoreCase(eventName) || "order.paid".equalsIgnoreCase(eventName)) {
                        targetStatus = PaymentStatus.SUCCESS;
                    } else if ("payment.failed".equalsIgnoreCase(eventName)) {
                        targetStatus = PaymentStatus.FAILED;
                        errorCode = paymentEntity.has("error_code") ? paymentEntity.get("error_code").asText() : "PAYMENT_FAILED";
                        errorDescription = paymentEntity.has("error_description") ? paymentEntity.get("error_description").asText() : "Razorpay payment failed";
                    }
                } else if (payloadNode.has("order") && payloadNode.get("order").has("entity")) {
                    JsonNode orderEntity = payloadNode.get("order").get("entity");
                    providerPaymentId = orderEntity.has("id") ? orderEntity.get("id").asText() : null;
                    if (orderEntity.has("amount")) {
                        payloadAmount = orderEntity.get("amount").asLong();
                    }
                    if (orderEntity.has("currency")) {
                        payloadCurrency = orderEntity.get("currency").asText();
                    }
                    if ("order.paid".equalsIgnoreCase(eventName)) {
                        targetStatus = PaymentStatus.SUCCESS;
                    }
                }
            } else {
                // Mock / default / UPI payload format
                providerPaymentId = root.has("provider_payment_id") ? root.get("provider_payment_id").asText() : null;
                if (providerPaymentId == null && root.has("paymentId")) {
                    providerPaymentId = root.get("paymentId").asText();
                }
                if (providerPaymentId == null && root.has("payment_id")) {
                    providerPaymentId = root.get("payment_id").asText();
                }
                if (providerPaymentId == null && root.has("upi_reference_id")) {
                    providerPaymentId = root.get("upi_reference_id").asText();
                }
                if (root.has("amount")) {
                    payloadAmount = root.get("amount").asLong();
                }
                if (root.has("currency")) {
                    payloadCurrency = root.get("currency").asText();
                }
                if (root.has("event")) {
                    String evt = root.get("event").asText();
                    if ("PAYMENT_SUCCESS".equalsIgnoreCase(evt)) {
                        targetStatus = PaymentStatus.SUCCESS;
                    } else if ("PAYMENT_FAILED".equalsIgnoreCase(evt)) {
                        targetStatus = PaymentStatus.FAILED;
                    }
                }
                String statusStr = root.has("status") ? root.get("status").asText() : null;
                if (statusStr != null) {
                    try {
                        targetStatus = PaymentStatus.valueOf(statusStr.toUpperCase());
                    } catch (IllegalArgumentException ignored) {}
                }
                errorCode = root.has("error_code") ? root.get("error_code").asText() : null;
                errorDescription = root.has("error_description") ? root.get("error_description").asText() : null;
            }

            if (providerPaymentId != null && targetStatus != null) {
                try {
                    long t3Start = System.currentTimeMillis();
                    paymentService.processProviderStatusUpdate(
                            providerPaymentId,
                            targetStatus,
                            errorCode,
                            errorDescription,
                            "Updated via inbound webhook event: " + event.getProviderEventId(),
                            payloadAmount,
                            payloadCurrency
                    );
                    long t3toT4Ms = System.currentTimeMillis() - t3Start;
                    log.info("[PERF_TIMING] webhookEventId={} | hop=T3->T4_state_transition | latencyMs={}", event.getWebhookEventId(), t3toT4Ms);
                } catch (com.thirdprd.payment.common.exception.InvalidStateTransitionException iste) {
                    log.warn("[OUT_OF_ORDER_WEBHOOK] Ignoring invalid state transition for payment with ref {}: {}. Payment state will not regress.",
                            providerPaymentId, iste.getMessage());
                }
            }

            log.info("Successfully processed webhook event ID: {}", event.getProviderEventId());
        } catch (Exception e) {
            log.error("Failed to process webhook event ID: {}", event.getProviderEventId(), e);
        }
    }

    public void processWebhookAsync(UUID webhookEventId) {
        log.warn("Legacy processWebhookAsync called with UUID {}; state processing delegated to WebhookReceivedEvent consumer", webhookEventId);
    }

    private String extractProviderEventId(String rawPayload) {
        try {
            JsonNode node = objectMapper.readTree(rawPayload);
            if (node.has("eventId")) {
                return node.get("eventId").asText();
            }
            if (node.has("event_id")) {
                return node.get("event_id").asText();
            }
            if (node.has("id")) {
                return node.get("id").asText();
            }
            if (node.has("event") && node.has("payload")) {
                return "evt_rzp_" + UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            }
        } catch (Exception ignored) {
        }
        return "evt_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
