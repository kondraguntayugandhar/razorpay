package com.thirdprd.payment.provider.router;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.provider.MockPaymentProvider;
import com.thirdprd.payment.provider.MockPaymentProviderB;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.RazorpayProvider;
import com.thirdprd.payment.provider.UpiPaymentProvider;
import com.thirdprd.payment.provider.config.RazorpayConfig;
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

import io.github.resilience4j.retry.Retry;
import io.github.resilience4j.retry.RetryConfig;
import io.github.resilience4j.retry.RetryRegistry;

@Component
@Primary
public class ProviderRouter implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(ProviderRouter.class);

    private final MockPaymentProvider mockPrimaryProvider;
    private final MockPaymentProviderB mockSecondaryProvider;
    private final RazorpayProvider razorpayProvider;
    private final UpiPaymentProvider upiPaymentProvider;
    private final RazorpayConfig razorpayConfig;
    private final ProviderHealthRepository healthRepository;
    private final ApplicationEventPublisher eventPublisher;

    private final Map<String, CircuitBreaker> circuitBreakers = new HashMap<>();
    private final Map<String, Retry> retries = new HashMap<>();
    private final List<ProviderFailoverEvent> recordedFailoverEvents = new CopyOnWriteArrayList<>();

    public ProviderRouter(MockPaymentProvider mockPrimaryProvider,
                          MockPaymentProviderB mockSecondaryProvider,
                          RazorpayProvider razorpayProvider,
                          UpiPaymentProvider upiPaymentProvider,
                          RazorpayConfig razorpayConfig,
                          ProviderHealthRepository healthRepository,
                          ApplicationEventPublisher eventPublisher) {
        this.mockPrimaryProvider = mockPrimaryProvider;
        this.mockSecondaryProvider = mockSecondaryProvider;
        this.razorpayProvider = razorpayProvider;
        this.upiPaymentProvider = upiPaymentProvider;
        this.razorpayConfig = razorpayConfig;
        this.healthRepository = healthRepository;
        this.eventPublisher = eventPublisher;

        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .slidingWindowSize(4)
                .minimumNumberOfCalls(2)
                .waitDurationInOpenState(Duration.ofSeconds(2))
                .build();

        CircuitBreakerRegistry registry = CircuitBreakerRegistry.of(config);
        circuitBreakers.put(mockPrimaryProvider.getProviderName(), registry.circuitBreaker(mockPrimaryProvider.getProviderName()));
        circuitBreakers.put(mockSecondaryProvider.getProviderName(), registry.circuitBreaker(mockSecondaryProvider.getProviderName()));
        circuitBreakers.put(razorpayProvider.getProviderName(), registry.circuitBreaker(razorpayProvider.getProviderName()));
        circuitBreakers.put(upiPaymentProvider.getProviderName(), registry.circuitBreaker(upiPaymentProvider.getProviderName()));

        RetryConfig retryConfig = RetryConfig.custom()
                .maxAttempts(2)
                .waitDuration(Duration.ofMillis(200))
                .ignoreExceptions(BusinessException.class)
                .build();
        RetryRegistry retryRegistry = RetryRegistry.of(retryConfig);
        retries.put(mockPrimaryProvider.getProviderName(), retryRegistry.retry(mockPrimaryProvider.getProviderName()));
        retries.put(mockSecondaryProvider.getProviderName(), retryRegistry.retry(mockSecondaryProvider.getProviderName()));
        retries.put(razorpayProvider.getProviderName(), retryRegistry.retry(razorpayProvider.getProviderName()));
        retries.put(upiPaymentProvider.getProviderName(), retryRegistry.retry(upiPaymentProvider.getProviderName()));
    }

    private PaymentProvider getActivePrimaryProvider() {
        String mode = razorpayConfig.getPaymentProvider();
        if (mode != null && (mode.equalsIgnoreCase("razorpay-test") || mode.equalsIgnoreCase("razorpay-live"))) {
            return razorpayProvider;
        }
        return mockPrimaryProvider;
    }

    private PaymentProvider getActiveSecondaryProvider() {
        return mockSecondaryProvider;
    }

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        PaymentProvider selected;
        if (request != null && request.getMethod() != null && "UPI".equalsIgnoreCase(request.getMethod())) {
            selected = upiPaymentProvider;
        } else {
            selected = selectHealthyProvider();
        }

        if (selected == null) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "All payment providers are currently DOWN or Circuit Open");
        }

        CircuitBreaker cb = circuitBreakers.get(selected.getProviderName());
        Retry retry = retries.get(selected.getProviderName());

        try {
            if (cb == null) {
                return retry != null ? retry.executeSupplier(() -> selected.createPayment(request)) : selected.createPayment(request);
            }
            return cb.executeSupplier(() -> retry != null ? retry.executeSupplier(() -> selected.createPayment(request)) : selected.createPayment(request));
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
        PaymentProvider primary = getActivePrimaryProvider();
        PaymentProvider secondary = getActiveSecondaryProvider();

        if (isProviderAvailable(primary.getProviderName())) {
            return primary;
        }

        log.warn("Primary provider {} is unavailable (DOWN/Circuit Open). Failing over to secondary provider {}",
                primary.getProviderName(), secondary.getProviderName());
        emitFailoverEvent(primary.getProviderName(), secondary.getProviderName(), "Primary provider DOWN or Circuit Open");

        if (isProviderAvailable(secondary.getProviderName())) {
            return secondary;
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
        if (mockPrimaryProvider.getProviderName().equalsIgnoreCase(name)) return mockPrimaryProvider;
        if (mockSecondaryProvider.getProviderName().equalsIgnoreCase(name)) return mockSecondaryProvider;
        if (razorpayProvider.getProviderName().equalsIgnoreCase(name)) return razorpayProvider;
        if (upiPaymentProvider.getProviderName().equalsIgnoreCase(name)) return upiPaymentProvider;
        return null;
    }

    private String getFallbackProviderName(String primaryName) {
        PaymentProvider primary = getActivePrimaryProvider();
        PaymentProvider secondary = getActiveSecondaryProvider();
        return primary.getProviderName().equalsIgnoreCase(primaryName) ?
                secondary.getProviderName() : primary.getProviderName();
    }

    private PaymentProvider getFallbackProvider(String primaryName) {
        PaymentProvider primary = getActivePrimaryProvider();
        PaymentProvider secondary = getActiveSecondaryProvider();
        return primary.getProviderName().equalsIgnoreCase(primaryName) ? secondary : primary;
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
        if (selected == null) selected = getActivePrimaryProvider();
        return selected.getStatus(providerPaymentId);
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        PaymentProvider selected = selectHealthyProvider();
        if (selected == null) selected = getActivePrimaryProvider();
        return selected.refund(request);
    }

    @Override
    public boolean isHealthy() {
        return isProviderAvailable(getActivePrimaryProvider().getProviderName()) || isProviderAvailable(getActiveSecondaryProvider().getProviderName());
    }

    @Override
    public String getProviderName() {
        return "PROVIDER_ROUTER";
    }
}
