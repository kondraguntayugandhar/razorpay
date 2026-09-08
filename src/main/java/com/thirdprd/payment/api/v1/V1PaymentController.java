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
    private final Map<String, Map<String, Object>> ordersMap = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, Map<String, Object>> paymentsMap = new java.util.concurrent.ConcurrentHashMap<>();

    // 1. ORDERS API (5 MINUTES EXPIRATION = 300 SECONDS)
    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> req) {
        Object amtObj = req.getOrDefault("amount", 700000);
        long amount = (amtObj instanceof Number) ? ((Number) amtObj).longValue() : 700000L;
        String currency = (String) req.getOrDefault("currency", "INR");
        String receipt = (String) req.getOrDefault("receipt", "FP" + System.currentTimeMillis() % 1000000);

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes = 300 seconds
        String orderId = "order_FP" + (System.currentTimeMillis() % 1000000);

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", orderId);
        orderData.put("merchantId", DEFAULT_MERCHANT_ID);
        orderData.put("amount", amount);
        orderData.put("currency", currency);
        orderData.put("status", "CREATED");
        orderData.put("receipt", receipt);
        orderData.put("createdAt", now.toString());
        orderData.put("expiresAt", expiresAt.toString());

        ordersMap.put(orderId, orderData);

        return ResponseEntity.ok(Map.of("success", true, "data", orderData));
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Map<String, Object>> getOrder(@PathVariable String orderId) {
        Map<String, Object> orderData = ordersMap.get(orderId);
        if (orderData == null) {
            Instant now = Instant.now();
            Instant expiresAt = now.plusSeconds(300); // 5 minutes

            orderData = new HashMap<>();
            orderData.put("id", orderId);
            orderData.put("merchantId", DEFAULT_MERCHANT_ID);
            orderData.put("amount", 700000L);
            orderData.put("currency", "INR");
            orderData.put("status", "CREATED");
            orderData.put("receipt", "FP102938");
            orderData.put("createdAt", now.toString());
            orderData.put("expiresAt", expiresAt.toString());
            ordersMap.put(orderId, orderData);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", orderData));
    }

    // 2. PAYMENTS API (5 MINUTES EXPIRATION = 300 SECONDS)
    @PostMapping("/payments")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody Map<String, Object> req) {
        String orderId = (String) req.getOrDefault("orderId", "order_FP102938");
        String method = (String) req.getOrDefault("method", "UPI");
        String payId = "pay_FP" + System.currentTimeMillis() % 1000000;

        long amount = 700000L;
        if (req.containsKey("amount") && req.get("amount") instanceof Number) {
            amount = ((Number) req.get("amount")).longValue();
        } else if (ordersMap.containsKey(orderId)) {
            Object orderAmt = ordersMap.get(orderId).get("amount");
            if (orderAmt instanceof Number) {
                amount = ((Number) orderAmt).longValue();
            }
        }

        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(300); // 5 minutes
        String intentUri = String.format("upi://pay?pa=merchant@fastpay&pn=FastPay%%20Store&am=%.2f&tr=%s&cu=INR", amount / 100.0, payId);

        Map<String, Object> payData = new HashMap<>();
        payData.put("id", payId);
        payData.put("orderId", orderId);
        payData.put("merchantId", DEFAULT_MERCHANT_ID);
        payData.put("amount", amount);
        payData.put("currency", "INR");
        payData.put("status", "CAPTURED");
        payData.put("method", method);
        payData.put("intentUri", intentUri);
        payData.put("createdAt", now.toString());
        payData.put("expiresAt", expiresAt.toString());

        paymentsMap.put(payId, payData);

        return ResponseEntity.ok(Map.of("success", true, "data", payData));
    }

    @GetMapping("/payments/{paymentId}")
    public ResponseEntity<Map<String, Object>> getPayment(@PathVariable String paymentId) {
        Map<String, Object> payData = paymentsMap.get(paymentId);
        if (payData == null) {
            Instant now = Instant.now();
            Instant expiresAt = now.plusSeconds(300); // 5 minutes

            payData = new HashMap<>();
            payData.put("id", paymentId);
            payData.put("orderId", "order_FP102938");
            payData.put("merchantId", DEFAULT_MERCHANT_ID);
            payData.put("amount", 700000L);
            payData.put("currency", "INR");
            payData.put("status", "CAPTURED");
            payData.put("method", "UPI");
            payData.put("intentUri", String.format("upi://pay?pa=merchant@fastpay&pn=FastPay%%20Store&am=%.2f&tr=%s&cu=INR", 7000.0, paymentId));
            payData.put("createdAt", now.toString());
            payData.put("expiresAt", expiresAt.toString());
            paymentsMap.put(paymentId, payData);
        }
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
