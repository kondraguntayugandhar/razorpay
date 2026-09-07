package com.thirdprd.payment.payment.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_attempts")
public class PaymentAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attempt_id", unique = true, nullable = false, length = 64)
    private String attemptId;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(nullable = false, length = 50)
    private String method;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "attempt_number")
    private Integer attemptNumber = 1;

    @Column(name = "latency_ms")
    private Integer latencyMs = 0;

    @Column(name = "is_safe_failover")
    private Boolean isSafeFailover = false;

    @Column(name = "failure_code", length = 50)
    private String failureCode;

    @Column(name = "failure_reason", length = 255)
    private String failureReason;

    @Column(name = "provider_reference", length = 100)
    private String providerReference;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public PaymentAttempt() {
    }

    public PaymentAttempt(UUID id, String attemptId, UUID paymentId, String method, String provider,
                          String status, Long amount, Integer attemptNumber, Integer latencyMs,
                          Boolean isSafeFailover, String failureCode, String failureReason,
                          String providerReference, Instant startedAt, Instant completedAt) {
        this.id = id;
        this.attemptId = attemptId;
        this.paymentId = paymentId;
        this.method = method;
        this.provider = provider;
        this.status = status;
        this.amount = amount;
        this.attemptNumber = attemptNumber != null ? attemptNumber : 1;
        this.latencyMs = latencyMs != null ? latencyMs : 0;
        this.isSafeFailover = isSafeFailover != null ? isSafeFailover : false;
        this.failureCode = failureCode;
        this.failureReason = failureReason;
        this.providerReference = providerReference;
        this.startedAt = startedAt != null ? startedAt : Instant.now();
        this.completedAt = completedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(String attemptId) {
        this.attemptId = attemptId;
    }

    public UUID getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(UUID paymentId) {
        this.paymentId = paymentId;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Integer getAttemptNumber() {
        return attemptNumber;
    }

    public void setAttemptNumber(Integer attemptNumber) {
        this.attemptNumber = attemptNumber;
    }

    public Integer getLatencyMs() {
        return latencyMs;
    }

    public void setLatencyMs(Integer latencyMs) {
        this.latencyMs = latencyMs;
    }

    public Boolean getIsSafeFailover() {
        return isSafeFailover;
    }

    public void setIsSafeFailover(Boolean safeFailover) {
        isSafeFailover = safeFailover;
    }

    public String getFailureCode() {
        return failureCode;
    }

    public void setFailureCode(String failureCode) {
        this.failureCode = failureCode;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getProviderReference() {
        return providerReference;
    }

    public void setProviderReference(String providerReference) {
        this.providerReference = providerReference;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public static class Builder {
        private UUID id;
        private String attemptId;
        private UUID paymentId;
        private String method;
        private String provider;
        private String status;
        private Long amount;
        private Integer attemptNumber = 1;
        private Integer latencyMs = 0;
        private Boolean isSafeFailover = false;
        private String failureCode;
        private String failureReason;
        private String providerReference;
        private Instant startedAt = Instant.now();
        private Instant completedAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder attemptId(String attemptId) { this.attemptId = attemptId; return this; }
        public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder attemptNumber(Integer attemptNumber) { this.attemptNumber = attemptNumber; return this; }
        public Builder latencyMs(Integer latencyMs) { this.latencyMs = latencyMs; return this; }
        public Builder isSafeFailover(Boolean isSafeFailover) { this.isSafeFailover = isSafeFailover; return this; }
        public Builder failureCode(String failureCode) { this.failureCode = failureCode; return this; }
        public Builder failureReason(String failureReason) { this.failureReason = failureReason; return this; }
        public Builder providerReference(String providerReference) { this.providerReference = providerReference; return this; }
        public Builder startedAt(Instant startedAt) { this.startedAt = startedAt; return this; }
        public Builder completedAt(Instant completedAt) { this.completedAt = completedAt; return this; }

        public PaymentAttempt build() {
            return new PaymentAttempt(id, attemptId, paymentId, method, provider, status, amount,
                    attemptNumber, latencyMs, isSafeFailover, failureCode, failureReason,
                    providerReference, startedAt, completedAt);
        }
    }
}
