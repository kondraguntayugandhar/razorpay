package com.thirdprd.payment.analytics.controller;

import com.thirdprd.payment.analytics.document.PaymentAnalyticsDocument;
import com.thirdprd.payment.analytics.repository.PaymentAnalyticsRepository;
import com.thirdprd.payment.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics/payments")
public class AnalyticsController {

    private final PaymentAnalyticsRepository analyticsRepository;

    public AnalyticsController(@Autowired(required = false) PaymentAnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PaymentAnalyticsDocument>>> searchPayments(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String merchantId,
            @RequestParam(required = false) String status) {

        List<PaymentAnalyticsDocument> results = new ArrayList<>();

        if (analyticsRepository != null) {
            try {
                if (merchantId != null && !merchantId.isBlank()) {
                    results = analyticsRepository.findByMerchantId(merchantId);
                } else if (status != null && !status.isBlank()) {
                    results = analyticsRepository.findByStatus(status);
                } else if (query != null && !query.isBlank()) {
                    results = analyticsRepository.findByReceiptContaining(query);
                } else {
                    analyticsRepository.findAll().forEach(results::add);
                }
            } catch (Exception e) {
                // If Elasticsearch cluster is offline/unreachable, return clean empty list
            }
        }

        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
