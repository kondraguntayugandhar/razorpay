package com.thirdprd.payment.refund.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.service.IdempotencyService;
import com.thirdprd.payment.refund.dto.CreateRefundRequest;
import com.thirdprd.payment.refund.dto.RefundResponse;
import com.thirdprd.payment.refund.service.RefundService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class RefundController {

    private final RefundService refundService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public RefundController(RefundService refundService, IdempotencyService idempotencyService, ObjectMapper objectMapper) {
        this.refundService = refundService;
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/{paymentId}/refunds")
    public ResponseEntity<Object> createRefund(
            Authentication authentication,
            @PathVariable("paymentId") UUID paymentId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreateRefundRequest request) throws Exception {

        UUID merchantId = (UUID) authentication.getPrincipal();

        String requestJsonPayload = objectMapper.writeValueAsString(request);
        String requestHash = idempotencyService.computeHash("refund_" + paymentId + "_" + requestJsonPayload);

        boolean holdingLock = false;
        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            Optional<IdempotencyKey> existing = idempotencyService.checkIdempotency(merchantId, idempotencyKey, requestHash);
            if (existing.isPresent()) {
                Object cachedObj = objectMapper.readValue(existing.get().getResponseBody(), Object.class);
                return ResponseEntity.status(existing.get().getStatusCode())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(cachedObj);
            }

            holdingLock = idempotencyService.acquireIdempotencyLock(merchantId, idempotencyKey, 30);
            if (!holdingLock) {
                Optional<IdempotencyKey> completedRecord = idempotencyService.waitForCompletedRecord(merchantId, idempotencyKey, requestHash, 5000);
                if (completedRecord.isPresent()) {
                    Object cachedObj = objectMapper.readValue(completedRecord.get().getResponseBody(), Object.class);
                    return ResponseEntity.status(completedRecord.get().getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cachedObj);
                }
                holdingLock = idempotencyService.acquireIdempotencyLock(merchantId, idempotencyKey, 30);
            }

            if (holdingLock) {
                Optional<IdempotencyKey> recordAfterLock = idempotencyService.checkIdempotency(merchantId, idempotencyKey, requestHash);
                if (recordAfterLock.isPresent()) {
                    idempotencyService.releaseIdempotencyLock(merchantId, idempotencyKey);
                    holdingLock = false;
                    Object cachedObj = objectMapper.readValue(recordAfterLock.get().getResponseBody(), Object.class);
                    return ResponseEntity.status(recordAfterLock.get().getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cachedObj);
                }
            }
        }

        try {
            RefundResponse response = refundService.createRefund(merchantId, paymentId, idempotencyKey, request);
            ApiResponse<RefundResponse> apiResponse = ApiResponse.success(response);
            String responseJson = objectMapper.writeValueAsString(apiResponse);
            idempotencyService.saveIdempotencyRecord(merchantId, idempotencyKey, requestHash, responseJson, HttpStatus.CREATED.value());
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        } finally {
            if (holdingLock && idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.releaseIdempotencyLock(merchantId, idempotencyKey);
            }
        }
    }

    @GetMapping("/{paymentId}/refunds")
    public ResponseEntity<ApiResponse<List<RefundResponse>>> getRefunds(
            Authentication authentication,
            @PathVariable("paymentId") UUID paymentId) {

        UUID merchantId = (UUID) authentication.getPrincipal();
        List<RefundResponse> responses = refundService.getRefundsForPayment(merchantId, paymentId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
