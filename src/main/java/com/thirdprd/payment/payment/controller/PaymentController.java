package com.thirdprd.payment.payment.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.service.IdempotencyService;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public PaymentController(PaymentService paymentService, IdempotencyService idempotencyService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<Object> createPayment(
            Authentication authentication,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) throws Exception {

        UUID merchantId = (UUID) authentication.getPrincipal();

        String requestJsonPayload = objectMapper.writeValueAsString(request);
        String requestHash = idempotencyService.computeHash(requestJsonPayload);

        if (idempotencyKey != null && !idempotencyKey.isBlank()) {
            // 1. Check if completed idempotency record already exists before acquiring lock
            Optional<IdempotencyKey> existing = idempotencyService.checkIdempotency(merchantId, idempotencyKey, requestHash);
            if (existing.isPresent()) {
                Object cachedObj = objectMapper.readValue(existing.get().getResponseBody(), Object.class);
                return ResponseEntity.status(existing.get().getStatusCode())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(cachedObj);
            }

            // 2. Try to acquire Redis / local idempotency lock
            boolean lockAcquired = idempotencyService.acquireIdempotencyLock(merchantId, idempotencyKey, 10);
            if (!lockAcquired) {
                // In-flight request in progress: wait for it to complete and read its result
                Optional<IdempotencyKey> completedRecord = idempotencyService.waitForCompletedRecord(merchantId, idempotencyKey, requestHash, 5000);
                if (completedRecord.isPresent()) {
                    Object cachedObj = objectMapper.readValue(completedRecord.get().getResponseBody(), Object.class);
                    return ResponseEntity.status(completedRecord.get().getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cachedObj);
                }
            } else {
                // 3. Double-check after acquiring lock in case a previous lock-holder saved right as lock transferred
                Optional<IdempotencyKey> recordAfterLock = idempotencyService.checkIdempotency(merchantId, idempotencyKey, requestHash);
                if (recordAfterLock.isPresent()) {
                    idempotencyService.releaseIdempotencyLock(merchantId, idempotencyKey);
                    Object cachedObj = objectMapper.readValue(recordAfterLock.get().getResponseBody(), Object.class);
                    return ResponseEntity.status(recordAfterLock.get().getStatusCode())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(cachedObj);
                }
            }
        }

        try {
            PaymentResponse response = paymentService.createPayment(merchantId, idempotencyKey, request);
            ApiResponse<PaymentResponse> apiResponse = ApiResponse.success(response);
            String responseJson = objectMapper.writeValueAsString(apiResponse);
            idempotencyService.saveIdempotencyRecord(merchantId, idempotencyKey, requestHash, responseJson, HttpStatus.CREATED.value());
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        } finally {
            if (idempotencyKey != null && !idempotencyKey.isBlank()) {
                idempotencyService.releaseIdempotencyLock(merchantId, idempotencyKey);
            }
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            Authentication authentication,
            @PathVariable("id") UUID paymentId) {

        UUID merchantId = (UUID) authentication.getPrincipal();

        PaymentResponse response = paymentService.getPayment(merchantId, paymentId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
