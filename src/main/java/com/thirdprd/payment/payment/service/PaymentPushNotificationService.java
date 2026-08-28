package com.thirdprd.payment.payment.service;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.event.PaymentCreatedEvent;
import com.thirdprd.payment.payment.event.PaymentFailedEvent;
import com.thirdprd.payment.payment.event.PaymentSucceededEvent;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Service
public class PaymentPushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PaymentPushNotificationService.class);

    private final Map<UUID, Set<SseEmitter>> activeEmitters = new ConcurrentHashMap<>();

    @Autowired(required = false)
    private PaymentRepository paymentRepository;

    public SseEmitter subscribe(UUID paymentId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minutes timeout

        activeEmitters.computeIfAbsent(paymentId, k -> new CopyOnWriteArraySet<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(paymentId, emitter));
        emitter.onTimeout(() -> removeEmitter(paymentId, emitter));
        emitter.onError((ex) -> removeEmitter(paymentId, emitter));

        // Initial State Sync on Connect: Push current payment status if initialized
        if (paymentRepository != null && paymentId != null) {
            try {
                Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
                if (paymentOpt.isPresent()) {
                    Payment payment = paymentOpt.get();
                    Map<String, Object> initialSync = Map.of(
                            "event", "INITIAL_SYNC",
                            "paymentId", payment.getId().toString(),
                            "status", payment.getStatus().name(),
                            "providerPaymentId", payment.getProviderPaymentId() != null ? payment.getProviderPaymentId() : ""
                    );
                    emitter.send(SseEmitter.event().name("payment-status").data(initialSync));
                }
            } catch (Exception e) {
                log.warn("Failed to send initial state sync for paymentId {}: {}", paymentId, e.getMessage());
            }
        }

        log.info("Client subscribed to SSE stream for paymentId: {}. Active subscribers: {}", paymentId, getSubscriberCount(paymentId));
        return emitter;
    }

    @EventListener
    public void handlePaymentCreated(PaymentCreatedEvent event) {
        pushStatusEvent(event.getPaymentId(), "CREATED", PaymentStatus.CREATED.name(), Map.of(
                "orderId", event.getOrderId().toString(),
                "amount", event.getAmount(),
                "currency", event.getCurrency()
        ));
    }

    @EventListener
    public void handlePaymentSucceeded(PaymentSucceededEvent event) {
        pushStatusEvent(event.getPaymentId(), "SUCCEEDED", PaymentStatus.SUCCESS.name(), Map.of(
                "orderId", event.getOrderId().toString(),
                "providerPaymentId", event.getProviderPaymentId() != null ? event.getProviderPaymentId() : ""
        ));
    }

    @EventListener
    public void handlePaymentFailed(PaymentFailedEvent event) {
        pushStatusEvent(event.getPaymentId(), "FAILED", PaymentStatus.FAILED.name(), Map.of(
                "orderId", event.getOrderId().toString(),
                "errorCode", event.getErrorCode() != null ? event.getErrorCode() : "PAYMENT_FAILED",
                "errorDescription", event.getErrorDescription() != null ? event.getErrorDescription() : ""
        ));
    }

    private void pushStatusEvent(UUID paymentId, String eventType, String status, Map<String, Object> details) {
        long startMs = System.currentTimeMillis();
        Set<SseEmitter> emitters = activeEmitters.get(paymentId);
        if (emitters == null || emitters.isEmpty()) {
            log.debug("No active SSE subscribers for paymentId: {}", paymentId);
            return;
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("event", eventType);
        payload.put("paymentId", paymentId.toString());
        payload.put("status", status);
        payload.put("timestamp", System.currentTimeMillis());
        payload.putAll(details);

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("payment-status").data(payload));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        for (SseEmitter dead : deadEmitters) {
            removeEmitter(paymentId, dead);
        }

        long pushLatencyMs = System.currentTimeMillis() - startMs;
        log.info("[PERF_TIMING] paymentId={} | hop=T5->T6_push | status={} | latencyMs={}", paymentId, status, pushLatencyMs);
    }

    private void removeEmitter(UUID paymentId, SseEmitter emitter) {
        Set<SseEmitter> emitters = activeEmitters.get(paymentId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                activeEmitters.remove(paymentId);
            }
        }
    }

    public int getSubscriberCount(UUID paymentId) {
        Set<SseEmitter> emitters = activeEmitters.get(paymentId);
        return emitters != null ? emitters.size() : 0;
    }
}
