package com.thirdprd.payment.routing.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "routing_rules")
public class RoutingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "min_amount")
    private Long minAmount = 0L;

    @Column(name = "max_amount")
    private Long maxAmount = 100000000L;

    @Column(name = "target_provider", nullable = false, length = 50)
    private String targetProvider;

    @Column(nullable = false)
    private Integer priority = 1;

    @Column(nullable = false)
    private Integer weight = 100;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(columnDefinition = "jsonb")
    private String conditions;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public RoutingRule() {
    }

    public RoutingRule(UUID id, String name, UUID merchantId, String paymentMethod, Long minAmount,
                       Long maxAmount, String targetProvider, Integer priority, Integer weight,
                       Boolean isActive, String conditions, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.name = name;
        this.merchantId = merchantId;
        this.paymentMethod = paymentMethod;
        this.minAmount = minAmount != null ? minAmount : 0L;
        this.maxAmount = maxAmount != null ? maxAmount : 100000000L;
        this.targetProvider = targetProvider;
        this.priority = priority != null ? priority : 1;
        this.weight = weight != null ? weight : 100;
        this.isActive = isActive != null ? isActive : true;
        this.conditions = conditions;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Long getMinAmount() { return minAmount; }
    public void setMinAmount(Long minAmount) { this.minAmount = minAmount; }

    public Long getMaxAmount() { return maxAmount; }
    public void setMaxAmount(Long maxAmount) { this.maxAmount = maxAmount; }

    public String getTargetProvider() { return targetProvider; }
    public void setTargetProvider(String targetProvider) { this.targetProvider = targetProvider; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Integer getWeight() { return weight; }
    public void setWeight(Integer weight) { this.weight = weight; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
