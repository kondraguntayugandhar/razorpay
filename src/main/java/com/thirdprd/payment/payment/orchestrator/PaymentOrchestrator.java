package com.thirdprd.payment.payment.orchestrator;

import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.enums.OrderStatus;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.order.entity.Order;
import com.thirdprd.payment.order.repository.OrderRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.entity.PaymentAttempt;
import com.thirdprd.payment.payment.entity.PaymentEvent;
import com.thirdprd.payment.payment.event.PaymentCreatedEvent;
import com.thirdprd.payment.payment.event.PaymentEventPublisher;
import com.thirdprd.payment.payment.event.PaymentFailedEvent;
import com.thirdprd.payment.payment.event.PaymentSucceededEvent;
import com.thirdprd.payment.payment.repository.PaymentAttemptRepository;
import com.thirdprd.payment.payment.repository.PaymentEventRepository;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import com.thirdprd.payment.provider.dto.ProviderStatusResponse;
import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.routing.SmartRoutingEngine;
import com.thirdprd.payment.routing.dto.RoutingResult;
import com.thirdprd.payment.statemachine.PaymentStateMachine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PaymentOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrchestrator.class);

    private final SmartRoutingEngine routingEngine;
    private final ProviderHealthEngine healthEngine;
    private final PaymentRepository paymentRepository;
    private final PaymentAttemptRepository attemptRepository;
    private final PaymentEventRepository eventRepository;
    private final OrderRepository orderRepository;
    private final PaymentStateMachine stateMachine;
    private final PaymentEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;

    private final Map<String, PaymentProvider> providers = new ConcurrentHashMap<>();

    public PaymentOrchestrator(SmartRoutingEngine routingEngine,
                               ProviderHealthEngine healthEngine,
                               PaymentRepository paymentRepository,
                               PaymentAttemptRepository attemptRepository,
                               PaymentEventRepository eventRepository,
                               OrderRepository orderRepository,
                               PaymentStateMachine stateMachine,
                               PaymentEventPublisher eventPublisher,
                               @Autowired(required = false) StringRedisTemplate redisTemplate,
                               List<PaymentProvider> providerList) {
        this.routingEngine = routingEngine;
        this.healthEngine = healthEngine;
        this.paymentRepository = paymentRepository;
        this.attemptRepository = attemptRepository;
        this.eventRepository = eventRepository;
        this.orderRepository = orderRepository;
        this.stateMachine = stateMachine;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;

        for (PaymentProvider p : providerList) {
            this.providers.put(p.getProviderName().toUpperCase(), p);
        }
    }

    public ProviderResponse orchestratePayment(Payment payment, PaymentRequest request) {
        String lockKey = "payment:lock:" + payment.getId();
        boolean lockAcquired = false;

        try {
            if (redisTemplate != null) {
                try {
                    Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(15));
                    lockAcquired = Boolean.TRUE.equals(acquired);
                    if (!lockAcquired) {
                        throw new BusinessException(ErrorCode.BAD_REQUEST, "Concurrent processing lock in effect for payment: " + payment.getId());
                    }
                } catch (BusinessException be) {
                    throw be;
                } catch (Exception redisEx) {
                    log.debug("[ORCHESTRATOR] Redis lock unavailable, proceeding without distributed lock: {}", redisEx.getMessage());
                }
            }

            // Step 1: Routing Decision
            RoutingResult routing = routingEngine.routePayment(
                    payment.getId(), payment.getMerchantId(), payment.getMethod(), payment.getAmount(), payment.getCurrency());

            String primaryProviderCode = routing.getSelectedProvider();
            List<String> fallbackCodes = routing.getFallbackProviders();

            log.info("[ORCHESTRATOR] Payment {} routed to Primary: {}, Fallbacks: {}",
                    payment.getId(), primaryProviderCode, fallbackCodes);

            // Step 2: Attempt with Primary Provider
            int attemptNum = 1;
            ProviderResponse response = executeAttempt(payment, request, primaryProviderCode, attemptNum, false);

            if (response != null && response.isSuccess()) {
                handleSuccess(payment, response);
                return response;
            }

            // Step 3: Handle Failure / Timeout with Safe Failover
            boolean isTimeoutOrUnknown = (response != null && response.getStatus() == PaymentStatus.UNKNOWN);

            if (isTimeoutOrUnknown) {
                log.warn("[ORCHESTRATOR] Payment {} timed out on {}. Entering UNKNOWN status for safe inquiry...",
                        payment.getId(), primaryProviderCode);
                transitionPayment(payment, PaymentStatus.UNKNOWN, "Upstream timeout on " + primaryProviderCode);

                // Check status with provider to avoid duplicate charge
                PaymentProvider primaryPsp = providers.get(primaryProviderCode.toUpperCase());
                if (primaryPsp != null && response.getProviderPaymentId() != null) {
                    ProviderStatusResponse statusCheck = primaryPsp.getStatus(response.getProviderPaymentId());
                    if (statusCheck != null && statusCheck.getStatus() == PaymentStatus.SUCCESS) {
                        log.info("[ORCHESTRATOR] Status check confirmed payment {} was SUCCESS on {}", payment.getId(), primaryProviderCode);
                        response.setSuccess(true);
                        response.setStatus(PaymentStatus.SUCCESS);
                        handleSuccess(payment, response);
                        return response;
                    }
                }
            }

            // If confirmed failed or safe to failover
            for (String fallbackCode : fallbackCodes) {
                attemptNum++;
                log.info("[ORCHESTRATOR] Triggering SAFE FAILOVER for payment {} -> Attempt #{} on {}",
                        payment.getId(), attemptNum, fallbackCode);

                if (payment.getStatus() == PaymentStatus.UNKNOWN) {
                    transitionPayment(payment, PaymentStatus.PROCESSING, "Safe failover to " + fallbackCode);
                }

                ProviderResponse fallbackResp = executeAttempt(payment, request, fallbackCode, attemptNum, true);
                if (fallbackResp != null && fallbackResp.isSuccess()) {
                    handleSuccess(payment, fallbackResp);
                    return fallbackResp;
                }
            }

            // All attempts exhausted
            handleFinalFailure(payment, response);
            return response != null ? response : ProviderResponse.builder()
                    .success(false)
                    .providerName(primaryProviderCode)
                    .status(PaymentStatus.FAILED)
                    .errorCode("ALL_PROVIDERS_FAILED")
                    .errorDescription("Payment failed across primary and failover providers")
                    .build();

        } finally {
            if (lockAcquired && redisTemplate != null) {
                try {
                    redisTemplate.delete(lockKey);
                } catch (Exception ignored) {
                }
            }
        }
    }

    private ProviderResponse executeAttempt(Payment payment, PaymentRequest request,
                                            String providerCode, int attemptNum, boolean isFailover) {
        PaymentProvider provider = providers.get(providerCode.toUpperCase());
        if (provider == null) {
            log.error("[ORCHESTRATOR] Provider {} not found in active providers registry", providerCode);
            return null;
        }

        String attemptId = "att_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        Instant startTime = Instant.now();

        PaymentAttempt attempt = PaymentAttempt.builder()
                .attemptId(attemptId)
                .paymentId(payment.getId())
                .method(payment.getMethod() != null ? payment.getMethod() : "CARD")
                .provider(providerCode)
                .status("INITIATED")
                .amount(payment.getAmount())
                .attemptNumber(attemptNum)
                .isSafeFailover(isFailover)
                .startedAt(startTime)
                .build();
        attemptRepository.save(attempt);

        long startMs = System.currentTimeMillis();
        ProviderResponse response = null;
        boolean timeout = false;

        try {
            response = provider.createPayment(request);
            int latency = (int) (System.currentTimeMillis() - startMs);

            attempt.setLatencyMs(latency);
            attempt.setCompletedAt(Instant.now());
            attempt.setProviderReference(response.getProviderPaymentId());

            if (response.isSuccess()) {
                attempt.setStatus("SUCCESS");
                healthEngine.recordOutcome(providerCode, latency, true, false);
            } else if (response.getStatus() == PaymentStatus.UNKNOWN) {
                attempt.setStatus("UNKNOWN");
                attempt.setFailureCode(response.getErrorCode());
                attempt.setFailureReason(response.getErrorDescription());
                healthEngine.recordOutcome(providerCode, latency, false, true);
            } else {
                attempt.setStatus("FAILED");
                attempt.setFailureCode(response.getErrorCode());
                attempt.setFailureReason(response.getErrorDescription());
                healthEngine.recordOutcome(providerCode, latency, false, false);
            }
        } catch (Exception e) {
            int latency = (int) (System.currentTimeMillis() - startMs);
            timeout = e.getMessage() != null && e.getMessage().contains("TIMEOUT");

            attempt.setLatencyMs(latency);
            attempt.setCompletedAt(Instant.now());
            attempt.setStatus(timeout ? "TIMEOUT" : "FAILED");
            attempt.setFailureCode(timeout ? "GATEWAY_TIMEOUT" : "EXCEPTION");
            attempt.setFailureReason(e.getMessage());

            healthEngine.recordOutcome(providerCode, latency, false, timeout);

            response = ProviderResponse.builder()
                    .success(false)
                    .providerName(providerCode)
                    .status(timeout ? PaymentStatus.UNKNOWN : PaymentStatus.FAILED)
                    .errorCode(timeout ? "GATEWAY_TIMEOUT" : "PROVIDER_CALL_EXCEPTION")
                    .errorDescription(e.getMessage())
                    .build();
        }

        attemptRepository.save(attempt);
        return response;
    }

    private void handleSuccess(Payment payment, ProviderResponse response) {
        payment.setProvider(response.getProviderName());
        payment.setProviderPaymentId(response.getProviderPaymentId());
        if (response.getUpiReferenceId() != null) payment.setUpiReferenceId(response.getUpiReferenceId());
        if (response.getVpa() != null) payment.setVpa(response.getVpa());

        transitionPayment(payment, PaymentStatus.SUCCESS, "Payment authorized by provider " + response.getProviderName());

        Order order = orderRepository.findById(payment.getOrderId()).orElse(null);
        if (order != null && order.getStatus() != OrderStatus.PAID) {
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);
        }

        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        if (eventPublisher != null) {
            eventPublisher.publishPaymentSucceeded(new PaymentSucceededEvent(
                    payment.getId(), payment.getOrderId(), payment.getMerchantId(), payment.getProviderPaymentId()));
        }
    }

    private void handleFinalFailure(Payment payment, ProviderResponse response) {
        if (response != null) {
            payment.setErrorCode(response.getErrorCode());
            payment.setErrorDescription(response.getErrorDescription());
            payment.setProvider(response.getProviderName());
        }

        PaymentStatus finalStatus = (response != null && response.getStatus() == PaymentStatus.UNKNOWN) ?
                PaymentStatus.UNKNOWN : PaymentStatus.FAILED;

        transitionPayment(payment, finalStatus, "Payment processing terminated with status " + finalStatus);

        payment.setUpdatedAt(Instant.now());
        paymentRepository.save(payment);

        if (eventPublisher != null) {
            eventPublisher.publishPaymentFailed(new PaymentFailedEvent(
                    payment.getId(), payment.getOrderId(), payment.getMerchantId(),
                    payment.getErrorCode(), payment.getErrorDescription()));
        }
    }

    private void transitionPayment(Payment payment, PaymentStatus targetStatus, String reason) {
        PaymentStatus currentStatus = payment.getStatus();
        stateMachine.validateTransition(currentStatus, targetStatus);
        payment.setStatus(targetStatus);

        PaymentEvent event = PaymentEvent.builder()
                .paymentId(payment.getId())
                .fromStatus(currentStatus)
                .toStatus(targetStatus)
                .reason(reason)
                .build();
        eventRepository.save(event);
    }
}
