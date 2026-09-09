package com.thirdprd.payment.ledger.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "ledger_entries")
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ledger_entry_id", nullable = false, unique = true)
    private String ledgerEntryId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "payment_id")
    private UUID paymentId;

    @Column(name = "order_id")
    private UUID orderId;

    @Column(name = "refund_id")
    private UUID refundId;

    @Column(name = "type", nullable = false)
    private String type; // CREDIT, DEBIT, FEE, TAX, NET_SETTLEMENT, REFUND_DEBIT, REFUND_CREDIT

    @Column(name = "amount", nullable = false)
    private Long amount; // in paise

    @Column(name = "fee", nullable = false)
    private Long fee = 0L;

    @Column(name = "gst", nullable = false)
    private Long gst = 0L;

    @Column(name = "net_amount", nullable = false)
    private Long netAmount = 0L;

    @Column(name = "currency", nullable = false)
    private String currency = "INR";

    @Column(name = "balance_after", nullable = false)
    private Long balanceAfter = 0L;

    @Column(name = "description")
    private String description;

    @Column(name = "correlation_id")
    private String correlationId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public LedgerEntry() {}

    public LedgerEntry(UUID id, String ledgerEntryId, UUID merchantId, UUID paymentId, UUID orderId, UUID refundId,
                       String type, Long amount, Long fee, Long gst, Long netAmount, String currency,
                       Long balanceAfter, String description, String correlationId, Instant createdAt) {
        this.id = id;
        this.ledgerEntryId = ledgerEntryId;
        this.merchantId = merchantId;
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.refundId = refundId;
        this.type = type;
        this.amount = amount != null ? amount : 0L;
        this.fee = fee != null ? fee : 0L;
        this.gst = gst != null ? gst : 0L;
        this.netAmount = netAmount != null ? netAmount : 0L;
        this.currency = currency != null ? currency : "INR";
        this.balanceAfter = balanceAfter != null ? balanceAfter : 0L;
        this.description = description;
        this.correlationId = correlationId;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getLedgerEntryId() { return ledgerEntryId; }
    public void setLedgerEntryId(String ledgerEntryId) { this.ledgerEntryId = ledgerEntryId; }
    public UUID getMerchantId() { return merchantId; }
    public void setMerchantId(UUID merchantId) { this.merchantId = merchantId; }
    public UUID getPaymentId() { return paymentId; }
    public void setPaymentId(UUID paymentId) { this.paymentId = paymentId; }
    public UUID getOrderId() { return orderId; }
    public void setOrderId(UUID orderId) { this.orderId = orderId; }
    public UUID getRefundId() { return refundId; }
    public void setRefundId(UUID refundId) { this.refundId = refundId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }
    public Long getFee() { return fee; }
    public void setFee(Long fee) { this.fee = fee; }
    public Long getGst() { return gst; }
    public void setGst(Long gst) { this.gst = gst; }
    public Long getNetAmount() { return netAmount; }
    public void setNetAmount(Long netAmount) { this.netAmount = netAmount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public Long getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(Long balanceAfter) { this.balanceAfter = balanceAfter; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private String ledgerEntryId;
        private UUID merchantId;
        private UUID paymentId;
        private UUID orderId;
        private UUID refundId;
        private String type;
        private Long amount;
        private Long fee = 0L;
        private Long gst = 0L;
        private Long netAmount = 0L;
        private String currency = "INR";
        private Long balanceAfter = 0L;
        private String description;
        private String correlationId;
        private Instant createdAt;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder ledgerEntryId(String ledgerEntryId) { this.ledgerEntryId = ledgerEntryId; return this; }
        public Builder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public Builder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public Builder orderId(UUID orderId) { this.orderId = orderId; return this; }
        public Builder refundId(UUID refundId) { this.refundId = refundId; return this; }
        public Builder type(String type) { this.type = type; return this; }
        public Builder amount(Long amount) { this.amount = amount; return this; }
        public Builder fee(Long fee) { this.fee = fee; return this; }
        public Builder gst(Long gst) { this.gst = gst; return this; }
        public Builder netAmount(Long netAmount) { this.netAmount = netAmount; return this; }
        public Builder currency(String currency) { this.currency = currency; return this; }
        public Builder balanceAfter(Long balanceAfter) { this.balanceAfter = balanceAfter; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder correlationId(String correlationId) { this.correlationId = correlationId; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public LedgerEntry build() {
            return new LedgerEntry(id, ledgerEntryId, merchantId, paymentId, orderId, refundId, type, amount, fee, gst, netAmount, currency, balanceAfter, description, correlationId, createdAt);
        }
    }
}
