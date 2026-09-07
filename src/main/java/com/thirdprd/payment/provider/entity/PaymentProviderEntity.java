package com.thirdprd.payment.provider.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_providers")
public class PaymentProviderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "provider_code", unique = true, nullable = false, length = 50)
    private String providerCode;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Integer priority = 10;

    @Column(name = "base_fee_paise", nullable = false)
    private Long baseFeePaise = 0L;

    @Column(name = "percentage_fee", precision = 5, scale = 2, nullable = false)
    private BigDecimal percentageFee = BigDecimal.ZERO;

    @Column(name = "supported_methods", columnDefinition = "jsonb")
    private String supportedMethods;

    @Column(columnDefinition = "jsonb")
    private String configuration;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public PaymentProviderEntity() {
    }

    public PaymentProviderEntity(UUID id, String providerCode, String name, Boolean isActive, Integer priority,
                                 Long baseFeePaise, BigDecimal percentageFee, String supportedMethods,
                                 String configuration, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.providerCode = providerCode;
        this.name = name;
        this.isActive = isActive != null ? isActive : true;
        this.priority = priority != null ? priority : 10;
        this.baseFeePaise = baseFeePaise != null ? baseFeePaise : 0L;
        this.percentageFee = percentageFee != null ? percentageFee : BigDecimal.ZERO;
        this.supportedMethods = supportedMethods;
        this.configuration = configuration;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getProviderCode() { return providerCode; }
    public void setProviderCode(String providerCode) { this.providerCode = providerCode; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }

    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }

    public Long getBaseFeePaise() { return baseFeePaise; }
    public void setBaseFeePaise(Long baseFeePaise) { this.baseFeePaise = baseFeePaise; }

    public BigDecimal getPercentageFee() { return percentageFee; }
    public void setPercentageFee(BigDecimal percentageFee) { this.percentageFee = percentageFee; }

    public String getSupportedMethods() { return supportedMethods; }
    public void setSupportedMethods(String supportedMethods) { this.supportedMethods = supportedMethods; }

    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
