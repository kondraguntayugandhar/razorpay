package com.thirdprd.payment.audit.repository;

import com.thirdprd.payment.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    Page<AuditLog> findByMerchantIdOrderByCreatedAtDesc(UUID merchantId, Pageable pageable);
    List<AuditLog> findTop20ByMerchantIdOrderByCreatedAtDesc(UUID merchantId);
}
