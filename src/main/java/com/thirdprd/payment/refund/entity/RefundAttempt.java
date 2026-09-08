package com.thirdprd.payment.refund.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "refund_attempts")
public class RefundAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "attempt_id", unique = true, nullable = false, length = 64)
    private String attemptId;

    @Column(name = "refund_id", nullable = false)
    private UUID refundId;

    @Column(length = 50)
    private String provider;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(nullable = false)
    private Long amount;

    @Column(name = "latency_ms")
    private Integer latencyMs = 0;

    @Column(name = "error_code", length = 50)
    private String errorCode;

    @Column(name = "error_description")
    private String errorDescription;

    @Column(name = "provider_reference", length = 100)
    private String providerReference;

    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    public RefundAttempt() {
    }

    public RefundAttempt(UUID id, String attemptId, UUID refundId, String provider, String status, Long amount, Integer latencyMs, String errorCode, String errorDescription, String providerReference, Instant startedAt, Instant completedAt) {
        this.id = id;
        this.attemptId = attemptId;
        this.refundId = refundId;
        this.provider = provider;
        this.status = status;
        this.amount = amount;
        this.latencyMs = latencyMs;
        this.errorCode = errorCode;
        this.errorDescription = errorDescription;
        this.providerReference = providerReference;
        this.startedAt = startedAt != null ? startedAt : Instant.now();
        this.completedAt = completedAt;
    }

    public static RefundAttemptBuilder builder() {
        return new RefundAttemptBuilder();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAttemptId() { return attemptId; }
    public void setAttemptId(String attemptId) { this.attemptId = attemptId; }

    public UUID getRefundId() { return refundId; }
    public void setRefundId(UUID refundId) { this.refundId = refundId; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public Integer getLatencyMs() { return latencyMs; }
    public void setLatencyMs(Integer latencyMs) { this.latencyMs = latencyMs; }

    public String getErrorCode() { return errorCode; }
    public void setErrorCode(String errorCode) { this.errorCode = errorCode; }

    public String getErrorDescription() { return errorDescription; }
    public void setErrorDescription(String errorDescription) { this.errorDescription = errorDescription; }

    public String getProviderReference() { return providerReference; }
    public void setProviderReference(String providerReference) { this.providerReference = providerReference; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }

    public static class RefundAttemptBuilder {
        private UUID id;
        private String attemptId;
        private UUID refundId;
        private String provider;
        private String status;
        private Long amount;
        private Integer latencyMs = 0;
        private String errorCode;
        private String errorDescription;
        private String providerReference;
        private Instant startedAt = Instant.now();
        private Instant completedAt;

        public RefundAttemptBuilder id(UUID id) { this.id = id; return this; }
        public RefundAttemptBuilder attemptId(String attemptId) { this.attemptId = attemptId; return this; }
        public RefundAttemptBuilder refundId(UUID refundId) { this.refundId = refundId; return this; }
        public RefundAttemptBuilder provider(String provider) { this.provider = provider; return this; }
        public RefundAttemptBuilder status(String status) { this.status = status; return this; }
        public RefundAttemptBuilder amount(Long amount) { this.amount = amount; return this; }
        public RefundAttemptBuilder latencyMs(Integer latencyMs) { this.latencyMs = latencyMs; return this; }
        public RefundAttemptBuilder errorCode(String errorCode) { this.errorCode = errorCode; return this; }
        public RefundAttemptBuilder errorDescription(String errorDescription) { this.errorDescription = errorDescription; return this; }
        public RefundAttemptBuilder providerReference(String providerReference) { this.providerReference = providerReference; return this; }
        public RefundAttemptBuilder startedAt(Instant startedAt) { this.startedAt = startedAt; return this; }
        public RefundAttemptBuilder completedAt(Instant completedAt) { this.completedAt = completedAt; return this; }

        public RefundAttempt build() {
            return new RefundAttempt(id, attemptId, refundId, provider, status, amount, latencyMs, errorCode, errorDescription, providerReference, startedAt, completedAt);
        }
    }
}
