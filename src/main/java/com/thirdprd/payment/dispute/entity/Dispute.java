package com.thirdprd.payment.dispute.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "disputes")
public class Dispute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "dispute_id", nullable = false, unique = true)
    private String disputeId;

    @Column(name = "merchant_id", nullable = false)
    private UUID merchantId;

    @Column(name = "payment_id", nullable = false)
    private UUID paymentId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String status = "NEEDS_RESPONSE";

    @Column(name = "response_deadline")
    private Instant responseDeadline;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Dispute() {}

    public Dispute(UUID id, String disputeId, UUID merchantId, UUID paymentId, UUID customerId, Long amount, String reason, String status, Instant responseDeadline, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.disputeId = disputeId;
        this.merchantId = merchantId;
        this.paymentId = paymentId;
        this.customerId = customerId;
        this.amount = amount;
        this.reason = reason;
        this.status = status != null ? status : "NEEDS_RESPONSE";
        this.responseDeadline = responseDeadline;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public UUID getId() { return id; }
    public String getDisputeId() { return disputeId; }
    public UUID getMerchantId() { return merchantId; }
    public UUID getPaymentId() { return paymentId; }
    public Long getAmount() { return amount; }
    public String getReason() { return reason; }
    public String getStatus() { return status; }
    public Instant getResponseDeadline() { return responseDeadline; }

    public static DisputeBuilder builder() { return new DisputeBuilder(); }

    public static class DisputeBuilder {
        private UUID id;
        private String disputeId;
        private UUID merchantId;
        private UUID paymentId;
        private UUID customerId;
        private Long amount;
        private String reason;
        private String status = "NEEDS_RESPONSE";
        private Instant responseDeadline;

        public DisputeBuilder id(UUID id) { this.id = id; return this; }
        public DisputeBuilder disputeId(String disputeId) { this.disputeId = disputeId; return this; }
        public DisputeBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public DisputeBuilder paymentId(UUID paymentId) { this.paymentId = paymentId; return this; }
        public DisputeBuilder amount(Long amount) { this.amount = amount; return this; }
        public DisputeBuilder reason(String reason) { this.reason = reason; return this; }
        public DisputeBuilder status(String status) { this.status = status; return this; }
        public DisputeBuilder responseDeadline(Instant responseDeadline) { this.responseDeadline = responseDeadline; return this; }

        public Dispute build() {
            return new Dispute(id, disputeId, merchantId, paymentId, customerId, amount, reason, status, responseDeadline, Instant.now(), Instant.now());
        }
    }
}
