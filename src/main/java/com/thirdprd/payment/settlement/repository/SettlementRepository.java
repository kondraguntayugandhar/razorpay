package com.thirdprd.payment.settlement.repository;

import com.thirdprd.payment.settlement.entity.Settlement;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SettlementRepository extends JpaRepository<Settlement, UUID> {
    List<Settlement> findByMerchantId(UUID merchantId);
}
