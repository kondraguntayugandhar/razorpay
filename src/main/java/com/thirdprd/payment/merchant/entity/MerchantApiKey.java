package com.thirdprd.payment.merchant.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "merchant_api_keys")
public class MerchantApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "key_id", nullable = false, unique = true)
    private String keyId;

    @Column(name = "key_secret_hash", nullable = false)
    private String keySecretHash;

    @Column(name = "is_test_mode", nullable = false)
    private Boolean isTestMode = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "revoked_at")
    private Instant revokedAt;

    public MerchantApiKey() {
    }

    public MerchantApiKey(UUID id, UUID merchantId, String keyId, String keySecretHash, Boolean isTestMode, Instant createdAt, Instant revokedAt) {
        this.id = id;
        this.merchantId = merchantId;
        this.keyId = keyId;
        this.keySecretHash = keySecretHash;
        this.isTestMode = isTestMode != null ? isTestMode : true;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.revokedAt = revokedAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public void setMerchantId(UUID merchantId) {
        this.merchantId = merchantId;
    }

    public String getKeyId() {
        return keyId;
    }

    public void setKeyId(String keyId) {
        this.keyId = keyId;
    }

    public String getKeySecretHash() {
        return keySecretHash;
    }

    public void setKeySecretHash(String keySecretHash) {
        this.keySecretHash = keySecretHash;
    }

    public Boolean getIsTestMode() {
        return isTestMode;
    }

    public void setIsTestMode(Boolean isTestMode) {
        this.isTestMode = isTestMode;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private UUID merchantId;
        private String keyId;
        private String keySecretHash;
        private Boolean isTestMode = true;
        private Instant createdAt = Instant.now();
        private Instant revokedAt;

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder merchantId(UUID merchantId) {
            this.merchantId = merchantId;
            return this;
        }

        public Builder keyId(String keyId) {
            this.keyId = keyId;
            return this;
        }

        public Builder keySecretHash(String keySecretHash) {
            this.keySecretHash = keySecretHash;
            return this;
        }

        public Builder isTestMode(Boolean isTestMode) {
            this.isTestMode = isTestMode;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder revokedAt(Instant revokedAt) {
            this.revokedAt = revokedAt;
            return this;
        }

        public MerchantApiKey build() {
            return new MerchantApiKey(id, merchantId, keyId, keySecretHash, isTestMode, createdAt, revokedAt);
        }
    }
}
