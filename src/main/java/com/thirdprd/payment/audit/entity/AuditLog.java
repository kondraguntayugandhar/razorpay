package com.thirdprd.payment.audit.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "audit_id", nullable = false, unique = true)
    private String auditId;

    @Column(name = "merchant_id")
    private UUID merchantId;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "user_name")
    private String userName;

    @Column(nullable = false)
    private String action;

    @Column(name = "resource_type", nullable = false)
    private String resourceType;

    @Column(name = "resource_id")
    private String resourceId;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public AuditLog() {}

    public AuditLog(UUID id, String auditId, UUID merchantId, UUID userId, String userName, String action, String resourceType, String resourceId, String ipAddress, Instant createdAt) {
        this.id = id;
        this.auditId = auditId;
        this.merchantId = merchantId;
        this.userId = userId;
        this.userName = userName;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public UUID getId() { return id; }
    public String getAuditId() { return auditId; }
    public UUID getMerchantId() { return merchantId; }
    public UUID getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getAction() { return action; }
    public String getResourceType() { return resourceType; }
    public String getResourceId() { return resourceId; }
    public String getIpAddress() { return ipAddress; }
    public Instant getCreatedAt() { return createdAt; }

    public static AuditLogBuilder builder() { return new AuditLogBuilder(); }

    public static class AuditLogBuilder {
        private UUID id;
        private String auditId;
        private UUID merchantId;
        private UUID userId;
        private String userName;
        private String action;
        private String resourceType;
        private String resourceId;
        private String ipAddress;

        public AuditLogBuilder id(UUID id) { this.id = id; return this; }
        public AuditLogBuilder auditId(String auditId) { this.auditId = auditId; return this; }
        public AuditLogBuilder merchantId(UUID merchantId) { this.merchantId = merchantId; return this; }
        public AuditLogBuilder userId(UUID userId) { this.userId = userId; return this; }
        public AuditLogBuilder userName(String userName) { this.userName = userName; return this; }
        public AuditLogBuilder action(String action) { this.action = action; return this; }
        public AuditLogBuilder resourceType(String resourceType) { this.resourceType = resourceType; return this; }
        public AuditLogBuilder resourceId(String resourceId) { this.resourceId = resourceId; return this; }
        public AuditLogBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }

        public AuditLog build() {
            return new AuditLog(id, auditId, merchantId, userId, userName, action, resourceType, resourceId, ipAddress, Instant.now());
        }
    }
}
