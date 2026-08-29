package com.thirdprd.payment.dispute.repository;

import com.thirdprd.payment.dispute.entity.Dispute;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DisputeRepository extends JpaRepository<Dispute, UUID> {
    List<Dispute> findByMerchantId(UUID merchantId);
    Optional<Dispute> findByMerchantIdAndDisputeId(UUID merchantId, String disputeId);
}
