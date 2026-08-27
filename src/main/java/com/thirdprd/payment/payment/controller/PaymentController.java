package com.thirdprd.payment.payment.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.service.IdempotencyService;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<?> createPayment(
            @AuthenticationPrincipal UUID merchantId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @Valid @RequestBody CreatePaymentRequest request) throws Exception {

        String requestJson = objectMapper.writeValueAsString(request);
        String requestHash = idempotencyService.computeHash(requestJson);

        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
            Optional<IdempotencyKey> existingKey = idempotencyService.checkIdempotency(merchantId, idempotencyKeyHeader, requestHash);
            if (existingKey.isPresent() && existingKey.get().getResponseBody() != null) {
                String rawBody = existingKey.get().getResponseBody();
                JsonNode jsonNode = objectMapper.readTree(rawBody);
                Object bodyToReturn = jsonNode.isTextual() ? objectMapper.readValue(jsonNode.asText(), Object.class) : jsonNode;
                return ResponseEntity.status(existingKey.get().getStatusCode()).body(bodyToReturn);
            }
        }

        PaymentResponse response = paymentService.createPayment(merchantId, idempotencyKeyHeader, request);
        ApiResponse<PaymentResponse> apiResponse = ApiResponse.success(response);

        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
            String responseJson = objectMapper.writeValueAsString(apiResponse);
            idempotencyService.saveIdempotencyRecord(merchantId, idempotencyKeyHeader, requestHash, responseJson, HttpStatus.CREATED.value());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPayment(
            @AuthenticationPrincipal UUID merchantId,
            @PathVariable("id") UUID id) {

        PaymentResponse response = paymentService.getPayment(merchantId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
