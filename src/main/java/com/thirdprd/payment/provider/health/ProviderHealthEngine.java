package com.thirdprd.payment.provider.health;

import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ProviderHealthEngine {

    private static final Logger log = LoggerFactory.getLogger(ProviderHealthEngine.class);
    private static final int SLIDING_WINDOW_CAPACITY = 100;

    private final ProviderHealthRepository healthRepository;
    private final CircuitBreakerRegistry circuitBreakerRegistry;
    private final Map<String, CircuitBreaker> circuitBreakers = new ConcurrentHashMap<>();

    private final Map<String, ProviderMetrics> metricsMap = new ConcurrentHashMap<>();
    private final Map<String, String> lastStateTransitions = new ConcurrentHashMap<>();
    private final Map<String, String> lastFailures = new ConcurrentHashMap<>();

    private static class ProviderMetrics {
        final AtomicLong totalCalls = new AtomicLong(0);
        final AtomicLong successCalls = new AtomicLong(0);
        final AtomicLong failureCalls = new AtomicLong(0);
        final AtomicLong timeoutCalls = new AtomicLong(0);
        final Deque<Integer> recentLatencies = new ConcurrentLinkedDeque<>();
    }

    public ProviderHealthEngine(ProviderHealthRepository healthRepository) {
        this.healthRepository = healthRepository;

        CircuitBreakerConfig cbConfig = CircuitBreakerConfig.custom()
                .failureRateThreshold(50.0f)
                .slidingWindowSize(4)
                .minimumNumberOfCalls(2)
                .waitDurationInOpenState(Duration.ofSeconds(3))
                .permittedNumberOfCallsInHalfOpenState(2)
                .build();

        this.circuitBreakerRegistry = CircuitBreakerRegistry.of(cbConfig);

        // Pre-initialize known providers
        List<String> initialProviders = List.of("PSP_A", "PSP_B", "PSP_C", "RAZORPAY", "UPI_QR", "MOCK_PROVIDER", "MOCK_PROVIDER_B");
        for (String p : initialProviders) {
            getOrCreateCircuitBreaker(p);
            metricsMap.put(p.toUpperCase(), new ProviderMetrics());
        }
    }

    public CircuitBreaker getOrCreateCircuitBreaker(String providerCode) {
        String key = providerCode.toUpperCase();
        return circuitBreakers.computeIfAbsent(key, k -> {
            CircuitBreaker cb = circuitBreakerRegistry.circuitBreaker(k);
            cb.getEventPublisher().onStateTransition(event -> {
                String transitionDesc = event.getStateTransition().getFromState() + " -> " + event.getStateTransition().getToState();
                log.warn("[CIRCUIT_BREAKER] Provider {} state changed: {}", key, transitionDesc);
                lastStateTransitions.put(key, Instant.now() + " (" + transitionDesc + ")");
                syncHealthStatusWithDb(key, event.getStateTransition().getToState());
            });
            return cb;
        });
    }

    public void recordOutcome(String providerCode, int latencyMs, boolean success, boolean timeout) {
        String key = providerCode.toUpperCase();
        ProviderMetrics metrics = metricsMap.computeIfAbsent(key, k -> new ProviderMetrics());

        metrics.totalCalls.incrementAndGet();
        CircuitBreaker cb = getOrCreateCircuitBreaker(key);

        if (success) {
            metrics.successCalls.incrementAndGet();
            if (cb != null) {
                cb.onSuccess(latencyMs, java.util.concurrent.TimeUnit.MILLISECONDS);
            }
        } else {
            metrics.failureCalls.incrementAndGet();
            if (timeout) {
                metrics.timeoutCalls.incrementAndGet();
            }
            lastFailures.put(key, Instant.now() + " (" + (timeout ? "TIMEOUT" : "GATEWAY_FAILURE") + ", " + latencyMs + "ms)");
            if (cb != null) {
                cb.onError(latencyMs, java.util.concurrent.TimeUnit.MILLISECONDS,
                        new RuntimeException(timeout ? "GATEWAY_TIMEOUT" : "GATEWAY_FAILURE"));
            }
        }

        // Maintain bounded deque for P95/P99 latency calculations
        metrics.recentLatencies.addLast(latencyMs);
        while (metrics.recentLatencies.size() > SLIDING_WINDOW_CAPACITY) {
            metrics.recentLatencies.pollFirst();
        }
    }

    public void resetCircuitBreaker(String providerCode) {
        String key = providerCode.toUpperCase();
        CircuitBreaker cb = circuitBreakers.get(key);
        if (cb != null) {
            cb.reset();
            syncHealthStatusWithDb(key, CircuitBreaker.State.CLOSED);
        }
    }

    public void transitionCircuitBreakerToOpen(String providerCode) {
        String key = providerCode.toUpperCase();
        CircuitBreaker cb = getOrCreateCircuitBreaker(key);
        cb.transitionToOpenState();
        syncHealthStatusWithDb(key, CircuitBreaker.State.OPEN);
    }

    public void transitionCircuitBreakerToHalfOpen(String providerCode) {
        String key = providerCode.toUpperCase();
        CircuitBreaker cb = getOrCreateCircuitBreaker(key);
        if (cb.getState() == CircuitBreaker.State.CLOSED) {
            cb.transitionToOpenState();
        }
        cb.transitionToHalfOpenState();
        syncHealthStatusWithDb(key, CircuitBreaker.State.HALF_OPEN);
    }

    public void transitionCircuitBreakerToClosed(String providerCode) {
        String key = providerCode.toUpperCase();
        CircuitBreaker cb = getOrCreateCircuitBreaker(key);
        cb.transitionToClosedState();
        syncHealthStatusWithDb(key, CircuitBreaker.State.CLOSED);
    }

    private void syncHealthStatusWithDb(String providerCode, CircuitBreaker.State cbState) {
        try {
            Optional<ProviderHealth> opt = healthRepository.findByProvider(providerCode);
            HealthStatus target = (cbState == CircuitBreaker.State.OPEN) ? HealthStatus.DOWN :
                    (cbState == CircuitBreaker.State.HALF_OPEN) ? HealthStatus.DEGRADED : HealthStatus.HEALTHY;

            ProviderHealth ph = opt.orElse(ProviderHealth.builder()
                    .provider(providerCode)
                    .status(target)
                    .consecutiveFailures(0)
                    .lastCheckedAt(Instant.now())
                    .updatedAt(Instant.now())
                    .build());

            ph.setStatus(target);
            ph.setUpdatedAt(Instant.now());
            healthRepository.save(ph);
        } catch (Exception e) {
            log.error("Failed to sync DB provider health for {}: {}", providerCode, e.getMessage());
        }
    }

    public boolean isProviderAvailable(String providerCode) {
        String key = providerCode.toUpperCase();
        CircuitBreaker cb = circuitBreakers.get(key);
        if (cb != null && cb.getState() == CircuitBreaker.State.OPEN) {
            return false;
        }

        Optional<ProviderHealth> dbHealth = healthRepository.findByProvider(key);
        if (dbHealth.isPresent() && dbHealth.get().getStatus() == HealthStatus.DOWN) {
            return false;
        }

        return true;
    }

    public ProviderTelemetryDto getTelemetry(String providerCode) {
        String key = providerCode.toUpperCase();
        ProviderMetrics metrics = metricsMap.get(key);
        CircuitBreaker cb = circuitBreakers.get(key);
        String cbState = cb != null ? cb.getState().name() : "CLOSED";
        boolean available = isProviderAvailable(key);

        float slowCallRate = cb != null ? cb.getMetrics().getSlowCallRate() : 0.0f;
        int numberOfCalls = cb != null ? cb.getMetrics().getNumberOfBufferedCalls() : 0;
        String lastFailure = lastFailures.get(key);
        String lastTransition = lastStateTransitions.get(key);

        if (metrics == null || metrics.totalCalls.get() == 0) {
            // Default baseline stats for demo
            double baselineSuccess = key.equals("PSP_A") ? 98.5 : key.equals("PSP_B") ? 96.0 : 92.0;
            double baselineLatency = key.equals("PSP_A") ? 290.0 : key.equals("PSP_B") ? 210.0 : 480.0;
            return new ProviderTelemetryDto(key, 0, 0, 0, 0, baselineSuccess, baselineLatency,
                    baselineLatency * 1.3, baselineLatency * 1.7, cbState, available,
                    slowCallRate, numberOfCalls, lastFailure, lastTransition);
        }

        long total = metrics.totalCalls.get();
        long success = metrics.successCalls.get();
        long failed = metrics.failureCalls.get();
        long timeouts = metrics.timeoutCalls.get();

        double successRate = total > 0 ? ((double) success / total) * 100.0 : 100.0;

        List<Integer> latencies = new ArrayList<>(metrics.recentLatencies);
        Collections.sort(latencies);

        double avgLatency = latencies.isEmpty() ? 0.0 :
                latencies.stream().mapToInt(Integer::intValue).average().orElse(0.0);

        double p95 = calculatePercentile(latencies, 95);
        double p99 = calculatePercentile(latencies, 99);

        return new ProviderTelemetryDto(key, total, success, failed, timeouts,
                Math.round(successRate * 10.0) / 10.0,
                Math.round(avgLatency), Math.round(p95), Math.round(p99),
                cbState, available,
                slowCallRate, numberOfCalls > 0 ? numberOfCalls : (int) total, lastFailure, lastTransition);
    }

    private double calculatePercentile(List<Integer> sorted, int percentile) {
        if (sorted.isEmpty()) return 0.0;
        int index = (int) Math.ceil((percentile / 100.0) * sorted.size()) - 1;
        return sorted.get(Math.max(0, Math.min(index, sorted.size() - 1)));
    }

    public List<ProviderTelemetryDto> getAllTelemetry() {
        List<ProviderTelemetryDto> list = new ArrayList<>();
        Set<String> allKeys = new LinkedHashSet<>(List.of("PSP_A", "PSP_B", "PSP_C", "RAZORPAY", "UPI_QR"));
        allKeys.addAll(metricsMap.keySet());

        for (String code : allKeys) {
            list.add(getTelemetry(code));
        }
        return list;
    }
}
