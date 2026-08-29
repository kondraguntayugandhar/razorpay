package com.thirdprd.payment.api.v1;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/checkout-session")
@CrossOrigin(origins = "*")
public class V1PaymentController {

    private static final String DEFAULT_MERCHANT_ID = "11111111-1111-1111-1111-111111111111";

    // 1. ORDERS API (5 MINUTES EXPIRATION = 300 SECONDS)
    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> req) {
        Object amtObj = req.getOrDefault("amount", 700000);
        long amount = (amtObj instanceof Number) ? ((Number) amtObj).longValue() : 700000L;
        String currency = (String) req.getOrDefault("currency", "INR");
        String receipt = (String) req.getOrDefault("receipt", "FP" + System.currentTimeMillis() % 1000000);

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes = 300 seconds

        Map<String, Object> orderData = Map.of(
                "id", "order_FP" + (System.currentTimeMillis() % 1000000),
                "merchantId", DEFAULT_MERCHANT_ID,
                "amount", amount,
                "currency", currency,
                "status", "CREATED",
                "receipt", receipt,
                "createdAt", now.toString(),
                "expiresAt", expiresAt.toString()
        );

        return ResponseEntity.ok(Map.of("success", true, "data", orderData));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable String orderId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes

        Map<String, Object> orderData = Map.of(
                "id", orderId,
                "merchantId", DEFAULT_MERCHANT_ID,
                "amount", 700000L,
                "currency", "INR",
                "status", "CREATED",
                "receipt", "FP102938",
                "createdAt", now.toString(),
                "expiresAt", expiresAt.toString()
        );
        return ResponseEntity.ok(Map.of("success", true, "data", orderData));
    }

    // 2. PAYMENTS API (5 MINUTES EXPIRATION = 300 SECONDS)
    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> req) {
        String orderId = (String) req.getOrDefault("orderId", "order_FP102938");
        String method = (String) req.getOrDefault("method", "UPI");
        String payId = "pay_FP" + System.currentTimeMillis() % 1000000;

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes

        Map<String, Object> payData = Map.of(
                "id", payId,
                "orderId", orderId,
                "merchantId", DEFAULT_MERCHANT_ID,
                "amount", 700000L,
                "currency", "INR",
                "status", "CAPTURED",
                "method", method,
                "createdAt", now.toString(),
                "expiresAt", expiresAt.toString()
        );

        return ResponseEntity.ok(Map.of("success", true, "data", payData));
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<Map<String, Object>> getPayment(@PathVariable String paymentId) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes

        Map<String, Object> payData = Map.of(
                "id", paymentId,
                "orderId", "order_FP102938",
                "merchantId", DEFAULT_MERCHANT_ID,
                "amount", 700000L,
                "currency", "INR",
                "status", "CAPTURED",
                "method", "UPI",
                "createdAt", now.toString(),
                "expiresAt", expiresAt.toString()
        );
        return ResponseEntity.ok(Map.of("success", true, "data", payData));
    }

    // 3. REFUNDS API
    @PostMapping("/payments/{paymentId}/refunds")
    public ResponseEntity<Map<String, Object>> createRefund(@PathVariable String paymentId, @RequestBody Map<String, Object> req) {
        Object amtObj = req.getOrDefault("amount", 100000);
        long amount = (amtObj instanceof Number) ? ((Number) amtObj).longValue() : 100000L;
        String reason = (String) req.getOrDefault("reason", "CUSTOMER_REQUEST");

        Map<String, Object> refundData = Map.of(
                "id", "rfnd_FP" + System.currentTimeMillis() % 1000000,
                "paymentId", paymentId,
                "merchantId", DEFAULT_MERCHANT_ID,
                "amount", amount,
                "currency", "INR",
                "status", "REFUNDED",
                "reason", reason,
                "createdAt", Instant.now().toString()
        );

        return ResponseEntity.ok(Map.of("success", true, "data", refundData));
    }

    @GetMapping("/payments/{paymentId}/refunds")
    public ResponseEntity<Map<String, Object>> getRefunds(@PathVariable String paymentId) {
        List<Map<String, Object>> refunds = List.of(
                Map.of(
                        "id", "rfnd_FP102938",
                        "paymentId", paymentId,
                        "merchantId", DEFAULT_MERCHANT_ID,
                        "amount", 100000L,
                        "currency", "INR",
                        "status", "REFUNDED",
                        "reason", "CUSTOMER_REQUEST",
                        "createdAt", Instant.now().toString()
                )
        );
        return ResponseEntity.ok(Map.of("success", true, "data", refunds));
    }
}
