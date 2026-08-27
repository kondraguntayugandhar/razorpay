package com.thirdprd.payment.order.repository;

import com.thirdprd.payment.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByIdAndMerchantId(UUID id, UUID merchantId);
}
