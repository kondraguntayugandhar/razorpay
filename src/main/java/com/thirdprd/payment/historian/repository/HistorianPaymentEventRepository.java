package com.thirdprd.payment.historian.repository;

import com.thirdprd.payment.historian.entity.HistorianPaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorianPaymentEventRepository extends JpaRepository<HistorianPaymentEvent, String> {
    List<HistorianPaymentEvent> findByPaymentId(String paymentId);
}
