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

    public ProviderTelemetryDto() {
    }

    public ProviderTelemetryDto(String providerCode, long totalRequests, long successRequests,
                                long failedRequests, long timeoutRequests, double successRatePercent,
                                double avgLatencyMs, double p95LatencyMs, double p99LatencyMs,
                                String circuitBreakerState, boolean available) {
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

    public double getAvgLatencyMs() { return avgLatencyMs; }
    public void setAvgLatencyMs(double avgLatencyMs) { this.avgLatencyMs = avgLatencyMs; }

    public double getP95LatencyMs() { return p95LatencyMs; }
    public void setP95LatencyMs(double p95LatencyMs) { this.p95LatencyMs = p95LatencyMs; }

    public double getP99LatencyMs() { return p99LatencyMs; }
    public void setP99LatencyMs(double p99LatencyMs) { this.p99LatencyMs = p99LatencyMs; }

    public String getCircuitBreakerState() { return circuitBreakerState; }
    public void setCircuitBreakerState(String circuitBreakerState) { this.circuitBreakerState = circuitBreakerState; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
}
