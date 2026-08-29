package com.thirdprd.payment.settlement.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "settlements")
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "settlement_id", nullable = false, unique = true)
    private String settlementId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "gross_amount", nullable = false)
    private Long grossAmount;

    @Column(nullable = false)
    private Long fees = 0L;

    @Column(nullable = false)
    private Long gst = 0L;

    @Column(nullable = false)
    private Long refunds = 0L;

    @Column(nullable = false)
    private Long adjustments = 0L;

    @Column(name = "net_amount", nullable = false)
    private Long netAmount;

    @Column(nullable = false)
    private String currency = "INR";

    @Column(nullable = false)
    private String status = "PROCESSED";

    @Column(name = "settlement_date", nullable = false)
    private LocalDate settlementDate = LocalDate.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Settlement() {}

    public Settlement(UUID id, String settlementId, UUID merchantId, Long grossAmount, Long fees, Long gst, Long refunds, Long adjustments, Long netAmount, String currency, String status, LocalDate settlementDate, Instant processedAt, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.settlementId = settlementId;
        this.merchantId = merchantId;
        this.grossAmount = grossAmount;
        this.fees = fees != null ? fees : 0L;
        this.gst = gst != null ? gst : 0L;
        this.refunds = refunds != null ? refunds : 0L;
        this.adjustments = adjustments != null ? adjustments : 0L;
        this.netAmount = netAmount;
        this.currency = currency != null ? currency : "INR";
        this.status = status != null ? status : "PROCESSED";
        this.settlementDate = settlementDate != null ? settlementDate : LocalDate.now();
        this.processedAt = processedAt;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public String getSettlementId() { return settlementId; }
    public UUID getMerchantId() { return merchantId; }
    public Long getGrossAmount() { return grossAmount; }
    public Long getFees() { return fees; }
    public Long getGst() { return gst; }
    public Long getRefunds() { return refunds; }
    public Long getNetAmount() { return netAmount; }
    public String getStatus() { return status; }
    public LocalDate getSettlementDate() { return settlementDate != null ? settlementDate : LocalDate.now(); }

    public static SettlementBuilder builder() { return new SettlementBuilder(); }

    public static class SettlementBuilder {
        private UUID id;
        private String settlementId;
        private UUID merchantId;
        private Long grossAmount;
        private Long fees = 0L;
        private Long gst = 0L;
        private Long refunds = 0L;
        private Long adjustments = 0L;
        private Long netAmount;
        private String currency = "INR";
        private String status = "PROCESSED";
        private LocalDate settlementDate = LocalDate.now();

        public SettlementBuilder id(UUID id) { this.id = id; return this; }
        public SettlementBuilder settlementId(String settlementId) { this.settlementId = settlementId; return this; }
        public SettlementBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public SettlementBuilder grossAmount(Long grossAmount) { this.grossAmount = grossAmount; return this; }
        public SettlementBuilder fees(Long fees) { this.fees = fees; return this; }
        public SettlementBuilder gst(Long gst) { this.gst = gst; return this; }
        public SettlementBuilder refunds(Long refunds) { this.refunds = refunds; return this; }
        public SettlementBuilder netAmount(Long netAmount) { this.netAmount = netAmount; return this; }
        public SettlementBuilder status(String status) { this.status = status; return this; }

        public Settlement build() {
            return new Settlement(id, settlementId, merchantId, grossAmount, fees, gst, refunds, adjustments, netAmount, currency, status, settlementDate, Instant.now(), Instant.now(), Instant.now());
        }
    }
}
