package com.thirdprd.payment.routing.repository;

import com.thirdprd.payment.routing.entity.RoutingDecision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoutingDecisionRepository extends JpaRepository<RoutingDecision, UUID> {
    Optional<RoutingDecision> findByPaymentId(UUID paymentId);
    List<RoutingDecision> findByMerchantIdOrderByCreatedAtDesc(UUID merchantId);
}
