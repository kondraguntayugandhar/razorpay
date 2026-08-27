package com.thirdprd.payment.provider.router;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.provider.MockPaymentProvider;
import com.thirdprd.payment.provider.MockPaymentProviderB;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.*;
import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.event.ProviderFailoverEvent;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@Primary
public class ProviderRouter implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(ProviderRouter.class);

    private final MockPaymentProvider primaryProvider;
    private final MockPaymentProviderB secondaryProvider;
    private final ProviderHealthRepository healthRepository;
    private final ApplicationEventPublisher eventPublisher;

    private final Map<String, CircuitBreaker> circuitBreakers = new HashMap<>();
    private final List<ProviderFailoverEvent> recordedFailoverEvents = new CopyOnWriteArrayList<>();

    public ProviderRouter(MockPaymentProvider primaryProvider,
                          MockPaymentProviderB secondaryProvider,
                          ProviderHealthRepository healthRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.primaryProvider = primaryProvider;
        this.secondaryProvider = secondaryProvider;
        this.healthRepository = healthRepository;
        this.eventPublisher = eventPublisher;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .slidingWindowSize(4)
                .minimumNumberOfCalls(2)
                .waitDurationInOpenState(Duration.ofSeconds(2))
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
        circuitBreakers.put(primaryProvider.getProviderName(), registry.circuitBreaker(primaryProvider.getProviderName()));
        circuitBreakers.put(secondaryProvider.getProviderName(), registry.circuitBreaker(secondaryProvider.getProviderName()));
    }

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        PaymentProvider selected = selectHealthyProvider();
        if (selected == null) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "All payment providers are currently DOWN or Circuit Open");
        }

        CircuitBreaker cb = circuitBreakers.get(selected.getProviderName());
        try {
            return cb.executeSupplier(() -> selected.createPayment(request));
        } catch (Exception e) {
            log.warn("Primary provider {} call failed ({}), attempting failover...", selected.getProviderName(), e.getMessage());
            emitFailoverEvent(selected.getProviderName(), getFallbackProviderName(selected.getProviderName()), e.getMessage());

            PaymentProvider fallback = getFallbackProvider(selected.getProviderName());
            if (fallback != null && isProviderAvailable(fallback.getProviderName())) {
                CircuitBreaker fallbackCb = circuitBreakers.get(fallback.getProviderName());
                return fallbackCb.executeSupplier(() -> fallback.createPayment(request));
            }
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "Provider call failed and fallback unavailable: " + e.getMessage());
        }
    }

    public PaymentProvider selectHealthyProvider() {
        if (isProviderAvailable(primaryProvider.getProviderName())) {
            return primaryProvider;
        }

        log.warn("Primary provider {} is unavailable (DOWN/Circuit Open). Failing over to secondary provider {}",
                primaryProvider.getProviderName(), secondaryProvider.getProviderName());
        emitFailoverEvent(primaryProvider.getProviderName(), secondaryProvider.getProviderName(), "Primary provider DOWN or Circuit Open");

        if (isProviderAvailable(secondaryProvider.getProviderName())) {
            return secondaryProvider;
        }

        return null;
    }

    public boolean isProviderAvailable(String providerName) {
        CircuitBreaker cb = circuitBreakers.get(providerName);
        if (cb != null && cb.getState() == CircuitBreaker.State.OPEN) {
            return false;
        }

        PaymentProvider providerObj = getProviderByName(providerName);
        if (providerObj != null && !providerObj.isHealthy()) {
            return false;
        }

        Optional<ProviderHealth> health = healthRepository.findByProvider(providerName);
        if (health.isPresent() && health.get().getStatus() == HealthStatus.DOWN) {
            return false;
        }

        return true;
    }

    private PaymentProvider getProviderByName(String name) {
        if (primaryProvider.getProviderName().equalsIgnoreCase(name)) return primaryProvider;
        if (secondaryProvider.getProviderName().equalsIgnoreCase(name)) return secondaryProvider;
        return null;
    }

    private String getFallbackProviderName(String primaryName) {
        return primaryProvider.getProviderName().equalsIgnoreCase(primaryName) ?
                secondaryProvider.getProviderName() : primaryProvider.getProviderName();
    }

    private PaymentProvider getFallbackProvider(String primaryName) {
        return primaryProvider.getProviderName().equalsIgnoreCase(primaryName) ? secondaryProvider : primaryProvider;
    }

    private void emitFailoverEvent(String primary, String fallback, String reason) {
        ProviderFailoverEvent event = new ProviderFailoverEvent(primary, fallback, reason);
        recordedFailoverEvents.add(event);
        log.info("EMITTED PROVIDER FAILOVER EVENT: {}", event);
        if (eventPublisher != null) {
            eventPublisher.publishEvent(event);
        }
    }

    public List<ProviderFailoverEvent> getRecordedFailoverEvents() {
        return Collections.unmodifiableList(recordedFailoverEvents);
    }

    public void clearRecordedFailoverEvents() {
        recordedFailoverEvents.clear();
    }

    public CircuitBreaker getCircuitBreaker(String providerName) {
        return circuitBreakers.get(providerName);
    }

    @Override
    public ProviderStatusResponse getStatus(String providerPaymentId) {
        PaymentProvider selected = selectHealthyProvider();
        if (selected == null) selected = primaryProvider;
        return selected.getStatus(providerPaymentId);
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        PaymentProvider selected = selectHealthyProvider();
        if (selected == null) selected = primaryProvider;
        return selected.refund(request);
    }

    @Override
    public boolean isHealthy() {
        return isProviderAvailable(primaryProvider.getProviderName()) || isProviderAvailable(secondaryProvider.getProviderName());
    }

    @Override
    public String getProviderName() {
        return "PROVIDER_ROUTER";
    }
}
