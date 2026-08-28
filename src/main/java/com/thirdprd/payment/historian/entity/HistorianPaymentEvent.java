package com.thirdprd.payment.historian.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_events")
public class HistorianPaymentEvent {

    @Id
    private String id;

    @Column(name = "payment_id", nullable = false, length = 36)
    private String paymentId;

    @Column(name = "from_status", length = 30)
    private String fromStatus;

    @Column(name = "to_status", nullable = false, length = 30)
    private String toStatus;

    @Column(length = 255)
    private String reason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public HistorianPaymentEvent() {
    }

    public HistorianPaymentEvent(String id, String paymentId, String fromStatus, String toStatus, String reason, Instant createdAt) {
        this.id = id != null ? id : UUID.randomUUID().toString();
        this.paymentId = paymentId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.reason = reason;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getPaymentId() { return paymentId; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }

    public String getFromStatus() { return fromStatus; }
    public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }

    public String getToStatus() { return toStatus; }
    public void setToStatus(String toStatus) { this.toStatus = toStatus; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String paymentId;
        private String fromStatus;
        private String toStatus;
        private String reason;
        private Instant createdAt = Instant.now();

        public Builder id(String id) { this.id = id; return this; }
        public Builder paymentId(String paymentId) { this.paymentId = paymentId; return this; }
        public Builder fromStatus(String fromStatus) { this.fromStatus = fromStatus; return this; }
        public Builder toStatus(String toStatus) { this.toStatus = toStatus; return this; }
        public Builder reason(String reason) { this.reason = reason; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public HistorianPaymentEvent build() {
            return new HistorianPaymentEvent(id, paymentId, fromStatus, toStatus, reason, createdAt);
        }
    }
}
