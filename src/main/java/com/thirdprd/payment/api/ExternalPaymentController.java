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

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class ExternalPaymentController {

    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final RazorpayConfig razorpayConfig;

    public ExternalPaymentController(PaymentService paymentService,
                                     PaymentRepository paymentRepository,
                                     RazorpayConfig razorpayConfig) {
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.razorpayConfig = razorpayConfig;
    }

    @PostMapping
    public ResponseEntity<ExternalPaymentResponse> createExternalPayment(@RequestBody ExternalPaymentCreateRequest request) {
        CreatePaymentRequest serviceRequest = CreatePaymentRequest.builder()
                .orderId(request.getOrderRef() != null ? request.getOrderRef() : UUID.randomUUID())
                .method("CARD")
                .build();

        PaymentResponse response = paymentService.createPayment(request.getMerchantId(), request.getIdempotencyKey(), serviceRequest);

        // Fetch payment entity to retrieve razorpay order ID mapping
        Payment payment = paymentRepository.findById(response.getId()).orElse(null);
        String razorpayOrderId = (payment != null && payment.getRazorpayOrderId() != null) ?
                payment.getRazorpayOrderId() : response.getProviderPaymentId();

        ExternalPaymentResponse externalResponse = ExternalPaymentResponse.builder()
                .paymentId(response.getId())
                .orderId(response.getOrderId())
                .razorpayOrderId(razorpayOrderId)
                .keyId(razorpayConfig.getKeyId()) // Public Key ID returned to client (NEVER key_secret)
                .amount(response.getAmount())
                .currency(response.getCurrency())
                .status(response.getStatus())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(externalResponse);
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
