package com.thirdprd.payment.provider.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "provider_health")
public class ProviderHealth {

    public enum HealthStatus {
        HEALTHY,
        DEGRADED,
        DOWN
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true, length = 50)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private HealthStatus status;

    @Column(name = "last_checked_at", nullable = false)
    private Instant lastCheckedAt;

    @Column(name = "consecutive_failures", nullable = false)
    private int consecutiveFailures;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public ProviderHealth() {
    }

    public ProviderHealth(UUID id, String provider, HealthStatus status, Instant lastCheckedAt, int consecutiveFailures, Instant updatedAt) {
        this.id = id;
        this.provider = provider;
        this.status = status;
        this.lastCheckedAt = lastCheckedAt;
        this.consecutiveFailures = consecutiveFailures;
        this.updatedAt = updatedAt;
    }

    public static ProviderHealthBuilder builder() {
        return new ProviderHealthBuilder();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public HealthStatus getStatus() {
        return status;
    }

    public void setStatus(HealthStatus status) {
        this.status = status;
    }

    public Instant getLastCheckedAt() {
        return lastCheckedAt;
    }

    public void setLastCheckedAt(Instant lastCheckedAt) {
        this.lastCheckedAt = lastCheckedAt;
    }

    public int getConsecutiveFailures() {
        return consecutiveFailures;
    }

    public void setConsecutiveFailures(int consecutiveFailures) {
        this.consecutiveFailures = consecutiveFailures;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static class ProviderHealthBuilder {
        private UUID id;
        private String provider;
        private HealthStatus status = HealthStatus.HEALTHY;
        private Instant lastCheckedAt = Instant.now();
        private int consecutiveFailures = 0;
        private Instant updatedAt = Instant.now();

        ProviderHealthBuilder() {
        }

        public ProviderHealthBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ProviderHealthBuilder provider(String provider) {
            this.provider = provider;
            return this;
        }

        public ProviderHealthBuilder status(HealthStatus status) {
            this.status = status;
            return this;
        }

        public ProviderHealthBuilder lastCheckedAt(Instant lastCheckedAt) {
            this.lastCheckedAt = lastCheckedAt;
            return this;
        }

        public ProviderHealthBuilder consecutiveFailures(int consecutiveFailures) {
            this.consecutiveFailures = consecutiveFailures;
            return this;
        }

        public ProviderHealthBuilder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ProviderHealth build() {
            return new ProviderHealth(id, provider, status, lastCheckedAt, consecutiveFailures, updatedAt);
        }
    }
}
