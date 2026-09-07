package com.thirdprd.payment.routing.repository;

import com.thirdprd.payment.routing.entity.RoutingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RoutingRuleRepository extends JpaRepository<RoutingRule, UUID> {

    @Query("SELECT r FROM RoutingRule r WHERE r.isActive = true AND " +
           "(r.merchantId = :merchantId OR r.merchantId IS NULL) " +
           "ORDER BY r.priority ASC, r.weight DESC")
    List<RoutingRule> findActiveRulesForMerchant(@Param("merchantId") UUID merchantId);

    List<RoutingRule> findByMerchantId(UUID merchantId);
}
