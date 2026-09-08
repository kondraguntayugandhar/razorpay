package com.thirdprd.payment.api;

import com.thirdprd.payment.api.dto.ExternalPaymentCreateRequest;
import com.thirdprd.payment.api.dto.ExternalPaymentResponse;
import com.thirdprd.payment.payment.dto.CreatePaymentRequest;
import com.thirdprd.payment.payment.dto.PaymentResponse;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import com.thirdprd.payment.payment.service.PaymentService;
import com.thirdprd.payment.provider.config.RazorpayConfig;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class ExternalPaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final RazorpayConfig razorpayConfig;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.merchant.repository.MerchantRepository merchantRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.order.repository.OrderRepository orderRepository;
    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.thirdprd.payment.payment.repository.PaymentAttemptRepository attemptRepository;

    public ExternalPaymentController(PaymentService paymentService,
                                     PaymentRepository paymentRepository,
                                     RazorpayConfig razorpayConfig) {
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.razorpayConfig = razorpayConfig;
    }

    @PostMapping
    public ResponseEntity<?> createExternalPayment(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKeyHeader,
            @RequestBody ExternalPaymentCreateRequest request) {

        String effectiveKey = (idempotencyKeyHeader != null && !idempotencyKeyHeader.isBlank())
                ? idempotencyKeyHeader
                : request.getIdempotencyKey();

        // Validation C006: Missing idempotency key
        if (effectiveKey == null || effectiveKey.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "MISSING_IDEMPOTENCY_KEY",
                    "message", "Idempotency key is required"
            ));
        }

        // Validation C007 & C008: Zero or negative amount
        if (request.getAmount() == null || request.getAmount() <= 0) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "INVALID_AMOUNT",
                    "message", "Amount must be strictly greater than 0"
            ));
        }

        // Validation C009: Unsupported currency
        if (request.getCurrency() != null && !request.getCurrency().equalsIgnoreCase("INR")) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "UNSUPPORTED_CURRENCY",
                    "message", "Only INR currency is supported"
            ));
        }

        // Validation C010: Missing customer ID
        if (request.getCustomerId() == null || request.getCustomerId().isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                    "error", "MISSING_CUSTOMER_ID",
                    "message", "Customer ID is required"
            ));
        }

        // Resolve or create merchant
        UUID merchantId = request.getMerchantId();
        if (merchantId == null) {
            merchantId = UUID.nameUUIDFromBytes("DEFAULT_MERCHANT".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }
        if (merchantRepository != null) {
            final UUID mid = merchantId;
            final String email = "merchant_" + mid + "@fastpay.io";
            com.thirdprd.payment.merchant.entity.Merchant merchant = merchantRepository.findById(mid)
                    .or(() -> merchantRepository.findByEmail(email))
                    .orElseGet(() -> {
                        com.thirdprd.payment.merchant.entity.Merchant m = com.thirdprd.payment.merchant.entity.Merchant.builder()
                                .name("Merchant " + mid)
                                .email(email)
                                .status("ACTIVE")
                                .build();
                        m.setId(mid);
                        try {
                            return merchantRepository.save(m);
                        } catch (Exception e) {
                            return merchantRepository.findByEmail(email).orElse(m);
                        }
                    });
            merchantId = merchant.getId();
        }

        // Idempotency check: if already exists, verify payload (amount)
        Optional<Payment> existingPaymentOpt = paymentRepository.findByMerchantIdAndIdempotencyKey(merchantId, effectiveKey);
        if (existingPaymentOpt.isPresent()) {
            Payment existing = existingPaymentOpt.get();
            // Validation C005: Same idempotency key with different amount -> 409 Conflict
            if (!existing.getAmount().equals(request.getAmount())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(java.util.Map.of(
                        "error", "IDEMPOTENCY_CONFLICT",
                        "message", "Idempotency key already used with different payload amount"
                ));
            }
            int attempts = attemptRepository != null ? (int) attemptRepository.countByPaymentId(existing.getId()) : 1;
            ExternalPaymentResponse cachedResp = mapToExternalResponse(existing, attempts);
            return ResponseEntity.ok(cachedResp);
        }

        // Resolve or create Order
        UUID orderId = request.getOrderRef();
        if (orderId == null && request.getOrderId() != null && !request.getOrderId().isBlank()) {
            try {
                orderId = UUID.fromString(request.getOrderId());
            } catch (Exception e) {
                orderId = UUID.nameUUIDFromBytes(request.getOrderId().getBytes(java.nio.charset.StandardCharsets.UTF_8));
            }
        }

        if (orderRepository != null) {
            final UUID mid = merchantId;
            if (orderId != null) {
                final UUID oid = orderId;
                com.thirdprd.payment.order.entity.Order order = orderRepository.findById(oid).orElseGet(() -> {
                    com.thirdprd.payment.order.entity.Order o = com.thirdprd.payment.order.entity.Order.builder()
                            .merchantId(mid)
                            .amount(request.getAmount())
                            .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                            .status(com.thirdprd.payment.common.enums.OrderStatus.CREATED)
                            .receipt("rcpt_" + UUID.randomUUID().toString().substring(0, 8))
                            .build();
                    o.setId(oid);
                    try {
                        return orderRepository.save(o);
                    } catch (Exception e) {
                        return orderRepository.findById(oid).orElse(o);
                    }
                });
                orderId = order.getId();
            } else {
                com.thirdprd.payment.order.entity.Order o = com.thirdprd.payment.order.entity.Order.builder()
                        .merchantId(mid)
                        .amount(request.getAmount())
                        .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                        .status(com.thirdprd.payment.common.enums.OrderStatus.CREATED)
                        .receipt("rcpt_" + UUID.randomUUID().toString().substring(0, 8))
                        .build();
                o = orderRepository.save(o);
                orderId = o.getId();
            }
        }

        CreatePaymentRequest serviceRequest = CreatePaymentRequest.builder()
                .orderId(orderId)
                .method("CARD")
                .build();

        PaymentResponse response = paymentService.createPayment(merchantId, effectiveKey, serviceRequest);

        // Fetch payment entity to retrieve razorpay order ID mapping
        Payment payment = paymentRepository.findById(response.getId()).orElse(null);
        int attempts = attemptRepository != null ? (int) attemptRepository.countByPaymentId(response.getId()) : 1;
        ExternalPaymentResponse externalResponse = mapToExternalResponse(payment != null ? payment : null, attempts);
        if (externalResponse.getPaymentId() == null) {
            externalResponse.setPaymentId(response.getId());
            externalResponse.setOrderId(response.getOrderId());
            externalResponse.setAmount(response.getAmount());
            externalResponse.setCurrency(response.getCurrency());
            externalResponse.setStatus(response.getStatus());
            externalResponse.setProvider(response.getProvider());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(externalResponse);
    }

    private ExternalPaymentResponse mapToExternalResponse(Payment payment, int attemptCount) {
        if (payment == null) {
            return ExternalPaymentResponse.builder().build();
        }
        String razorpayOrderId = (payment.getRazorpayOrderId() != null) ?
                payment.getRazorpayOrderId() : payment.getProviderPaymentId();

        ExternalPaymentResponse resp = ExternalPaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .razorpayOrderId(razorpayOrderId)
                .keyId(razorpayConfig.getKeyId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .build();
        resp.setProvider(payment.getProvider());
        resp.setProviderAttemptCount(attemptCount);
        return resp;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExternalPaymentResponse> getExternalPayment(@PathVariable UUID id) {
        Payment payment = paymentRepository.findById(id).orElse(null);
        if (payment == null) {
            return ResponseEntity.notFound().build();
        }

        ExternalPaymentResponse externalResponse = ExternalPaymentResponse.builder()
                .paymentId(payment.getId())
                .orderId(payment.getOrderId())
                .razorpayOrderId(payment.getRazorpayOrderId() != null ? payment.getRazorpayOrderId() : payment.getProviderPaymentId())
                .keyId(razorpayConfig.getKeyId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .build();

        return ResponseEntity.ok(externalResponse);
    }
}
