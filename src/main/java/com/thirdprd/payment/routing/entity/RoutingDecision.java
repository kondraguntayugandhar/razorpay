package com.thirdprd.payment.routing.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "routing_decisions")
public class RoutingDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "decision_id", unique = true, nullable = false, length = 64)
    private String decisionId;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "chosen_provider", nullable = false, length = 50)
    private String chosenProvider;

    @Column(name = "rule_applied_id")
    private UUID ruleAppliedId;

    @Column(nullable = false, length = 50)
    private String algorithm = "WEIGHTED_MULTI_FACTOR";

    @Column(name = "scores_json", columnDefinition = "jsonb", nullable = false)
    private String scoresJson;

    @Column(columnDefinition = "text")
    private String reasons;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public RoutingDecision() {
    }

    public RoutingDecision(UUID id, String decisionId, UUID paymentId, UUID merchantId, String chosenProvider,
                           UUID ruleAppliedId, String algorithm, String scoresJson, String reasons, Instant createdAt) {
        this.id = id;
        this.decisionId = decisionId;
        this.paymentId = paymentId;
        this.merchantId = merchantId;
        this.chosenProvider = chosenProvider;
        this.ruleAppliedId = ruleAppliedId;
        this.algorithm = algorithm != null ? algorithm : "WEIGHTED_MULTI_FACTOR";
        this.scoresJson = scoresJson;
        this.reasons = reasons;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static Builder builder() {
        return new Builder();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getDecisionId() { return decisionId; }
    public void setDecisionId(String decisionId) { this.decisionId = decisionId; }

    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public String getChosenProvider() { return chosenProvider; }
    public void setChosenProvider(String chosenProvider) { this.chosenProvider = chosenProvider; }

    public UUID getRuleAppliedId() { return ruleAppliedId; }
    public void setRuleAppliedId(UUID ruleAppliedId) { this.ruleAppliedId = ruleAppliedId; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public String getScoresJson() { return scoresJson; }
    public void setScoresJson(String scoresJson) { this.scoresJson = scoresJson; }

    public String getReasons() { return reasons; }
    public void setReasons(String reasons) { this.reasons = reasons; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class Builder {
        private UUID id;
        private String decisionId;
        private UUID paymentId;
        private UUID merchantId;
        private String chosenProvider;
        private UUID ruleAppliedId;
        private String algorithm = "WEIGHTED_MULTI_FACTOR";
        private String scoresJson;
        private String reasons;
        private Instant createdAt = Instant.now();

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder decisionId(String decisionId) { this.decisionId = decisionId; return this; }
        public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder chosenProvider(String chosenProvider) { this.chosenProvider = chosenProvider; return this; }
        public Builder ruleAppliedId(UUID ruleAppliedId) { this.ruleAppliedId = ruleAppliedId; return this; }
        public Builder algorithm(String algorithm) { this.algorithm = algorithm; return this; }
        public Builder scoresJson(String scoresJson) { this.scoresJson = scoresJson; return this; }
        public Builder reasons(String reasons) { this.reasons = reasons; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public RoutingDecision build() {
            return new RoutingDecision(id, decisionId, paymentId, merchantId, chosenProvider, ruleAppliedId, algorithm, scoresJson, reasons, createdAt);
        }
    }
}
