package com.thirdprd.payment.analytics.repository;

import com.thirdprd.payment.analytics.document.PaymentAnalyticsDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

import java.util.List;

public interface PaymentAnalyticsRepository extends ElasticsearchRepository<PaymentAnalyticsDocument, String> {
    List<PaymentAnalyticsDocument> findByMerchantId(String merchantId);
    List<PaymentAnalyticsDocument> findByStatus(String status);
    List<PaymentAnalyticsDocument> findByReceiptContaining(String receipt);
}
