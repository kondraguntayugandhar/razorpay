package com.thirdprd.payment.provider.health;

public class ProviderTelemetryDto {
    private String providerCode;
    private long totalRequests;
    private long successRequests;
    private long failedRequests;
    private long timeoutRequests;
    private double successRatePercent;
    private double avgLatencyMs;
    private double p95LatencyMs;
    private double p99LatencyMs;
    private String circuitBreakerState; // CLOSED, OPEN, HALF_OPEN
    private boolean available;
    private double slowCallRate;
    private int numberOfCalls;
    private String lastFailure;
    private String lastStateTransition;

    public ProviderTelemetryDto() {
    }

    public ProviderTelemetryDto(String providerCode, long totalRequests, long successRequests,
                                long failedRequests, long timeoutRequests, double successRatePercent,
                                double avgLatencyMs, double p95LatencyMs, double p99LatencyMs,
                                String circuitBreakerState, boolean available) {
        this(providerCode, totalRequests, successRequests, failedRequests, timeoutRequests,
                successRatePercent, avgLatencyMs, p95LatencyMs, p99LatencyMs, circuitBreakerState,
                available, 0.0, (int) totalRequests, null, null);
    }

    public ProviderTelemetryDto(String providerCode, long totalRequests, long successRequests,
                                long failedRequests, long timeoutRequests, double successRatePercent,
                                double avgLatencyMs, double p95LatencyMs, double p99LatencyMs,
                                String circuitBreakerState, boolean available,
                                double slowCallRate, int numberOfCalls, String lastFailure, String lastStateTransition) {
        this.providerCode = providerCode;
        this.totalRequests = totalRequests;
        this.successRequests = successRequests;
        this.failedRequests = failedRequests;
        this.timeoutRequests = timeoutRequests;
        this.successRatePercent = successRatePercent;
        this.avgLatencyMs = avgLatencyMs;
        this.p95LatencyMs = p95LatencyMs;
        this.p99LatencyMs = p99LatencyMs;
        this.circuitBreakerState = circuitBreakerState;
        this.available = available;
        this.slowCallRate = slowCallRate;
        this.numberOfCalls = numberOfCalls;
        this.lastFailure = lastFailure;
        this.lastStateTransition = lastStateTransition;
    }

    public String getProviderCode() { return providerCode; }
    public void setProviderCode(String providerCode) { this.providerCode = providerCode; }

    public long getTotalRequests() { return totalRequests; }
    public void setTotalRequests(long totalRequests) { this.totalRequests = totalRequests; }

    public long getSuccessRequests() { return successRequests; }
    public void setSuccessRequests(long successRequests) { this.successRequests = successRequests; }

    public long getFailedRequests() { return failedRequests; }
    public void setFailedRequests(long failedRequests) { this.failedRequests = failedRequests; }

    public long getTimeoutRequests() { return timeoutRequests; }
    public void setTimeoutRequests(long timeoutRequests) { this.timeoutRequests = timeoutRequests; }

    public double getSuccessRatePercent() { return successRatePercent; }
    public void setSuccessRatePercent(double successRatePercent) { this.successRatePercent = successRatePercent; }

    public double getFailureRatePercent() {
        return Math.max(0.0, Math.round((100.0 - successRatePercent) * 10.0) / 10.0);
    }

    public double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }

    public double getP95LatencyMs() { return p95LatencyMs; }
    public void setP95LatencyMs(double p95LatencyMs) { this.p95LatencyMs = p95LatencyMs; }

    public double getP99LatencyMs() { return p99LatencyMs; }
    public void setP99LatencyMs(double p99LatencyMs) { this.p99LatencyMs = p99LatencyMs; }

    public String getCircuitBreakerState() { return circuitBreakerState; }
    public String circuitState() { return circuitBreakerState; }
    public void setCircuitBreakerState(String circuitBreakerState) { this.circuitBreakerState = circuitBreakerState; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public double getSlowCallRate() { return slowCallRate; }
    public void setSlowCallRate(double slowCallRate) { this.slowCallRate = slowCallRate; }

    public int getNumberOfCalls() { return numberOfCalls; }
    public void setNumberOfCalls(int numberOfCalls) { this.numberOfCalls = numberOfCalls; }

    public String getLastFailure() { return lastFailure; }
    public void setLastFailure(String lastFailure) { this.lastFailure = lastFailure; }

    public String getLastStateTransition() { return lastStateTransition; }
    public void setLastStateTransition(String lastStateTransition) { this.lastStateTransition = lastStateTransition; }
}
