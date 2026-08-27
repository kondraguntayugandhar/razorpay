package com.thirdprd.payment.order.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.service.IdempotencyService;
import com.thirdprd.payment.order.dto.CreateOrderRequest;
import com.thirdprd.payment.order.dto.OrderResponse;
import com.thirdprd.payment.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    public OrderController(OrderService orderService, IdempotencyService idempotencyService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.idempotencyService = idempotencyService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<?> createOrder(
            @AuthenticationPrincipal UUID merchantId,
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @Valid @RequestBody CreateOrderRequest request) throws Exception {

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

        OrderResponse response = orderService.createOrder(merchantId, request);
        ApiResponse<OrderResponse> apiResponse = ApiResponse.success(response);

        if (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank()) {
            String responseJson = objectMapper.writeValueAsString(apiResponse);
            idempotencyService.saveIdempotencyRecord(merchantId, idempotencyKeyHeader, requestHash, responseJson, HttpStatus.CREATED.value());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(
            @AuthenticationPrincipal UUID merchantId,
            @PathVariable("id") UUID id) {

        OrderResponse response = orderService.getOrder(merchantId, id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
