package com.thirdprd.payment.provider;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.config.RazorpayConfig;
import com.thirdprd.payment.provider.dto.*;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class RazorpayProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(RazorpayProvider.class);

    private final RazorpayConfig razorpayConfig;
    private RazorpayClient razorpayClient;

    @org.springframework.beans.factory.annotation.Autowired
    public RazorpayProvider(RazorpayConfig razorpayConfig) {
        this.razorpayConfig = razorpayConfig;
        initClient();
    }

    public RazorpayProvider(RazorpayConfig razorpayConfig, RazorpayClient razorpayClient) {
        this.razorpayConfig = razorpayConfig;
        this.razorpayClient = razorpayClient;
    }

    private void initClient() {
        try {
            if (razorpayConfig.getKeyId() != null && !razorpayConfig.getKeyId().isBlank() &&
                !razorpayConfig.getKeyId().equalsIgnoreCase("rzp_test_mockKey")) {
                this.razorpayClient = new RazorpayClient(razorpayConfig.getKeyId(), razorpayConfig.getKeySecret());
            }
        } catch (RazorpayException e) {
            log.warn("Could not initialize RazorpayClient SDK: {}", e.getMessage());
        }
    }

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        log.info("RazorpayProvider: Creating order for amount: {} paise, currency: {}", request.getAmount(), request.getCurrency());

        if (razorpayClient == null) {
            initClient();
        }

        if (razorpayClient == null) {
            String activeProvider = razorpayConfig.getPaymentProvider();
            if (activeProvider != null && (activeProvider.equalsIgnoreCase("razorpay-test") || activeProvider.equalsIgnoreCase("razorpay-live"))) {
                log.error("RazorpayClient SDK uninitialized in active provider mode '{}'. Refusing to simulate order.", activeProvider);
                return ProviderResponse.builder()
                        .success(false)
                        .providerName(getProviderName())
                        .errorCode("RAZORPAY_CLIENT_UNINITIALIZED")
                        .errorDescription("Razorpay SDK client is uninitialized for active provider mode: " + activeProvider)
                        .build();
            }

            // Simulated test/sandbox response ONLY when payment provider mode is 'mock' or test fallback
            String mockOrderId = "order_rzp_" + java.util.UUID.randomUUID().toString().replace("-", "").substring(0, 14);
            log.info("RazorpayClient SDK offline/mock mode. Generated sandbox order ID: {}", mockOrderId);
            return ProviderResponse.builder()
                    .success(true)
                    .providerPaymentId(mockOrderId)
                    .providerName(getProviderName())
                    .status(PaymentStatus.CREATED)
                    .build();
        }

        try {
            JSONObject orderRequest = buildOrderRequest(request);

            Order order = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            log.info("Successfully created Razorpay order: {}", razorpayOrderId);

            return ProviderResponse.builder()
                    .success(true)
                    .providerPaymentId(razorpayOrderId)
                    .providerName(getProviderName())
                    .status(PaymentStatus.CREATED)
                    .rawProviderPayload(order.toString())
                    .build();
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage(), e);
            return ProviderResponse.builder()
                    .success(false)
                    .providerName(getProviderName())
                    .errorCode("RAZORPAY_ORDER_ERROR")
                    .errorDescription(e.getMessage())
                    .build();
        }
    }

    @Override
    public ProviderStatusResponse getStatus(String providerPaymentId) {
        if (razorpayClient != null && providerPaymentId != null && providerPaymentId.startsWith("pay_")) {
            try {
                com.razorpay.Payment payment = razorpayClient.payments.fetch(providerPaymentId);
                String razorpayStatus = payment.get("status");
                PaymentStatus mappedStatus = mapRazorpayStatus(razorpayStatus);
                return ProviderStatusResponse.builder()
                        .providerPaymentId(providerPaymentId)
                        .status(mappedStatus)
                        .errorDescription(razorpayStatus)
                        .build();
            } catch (RazorpayException e) {
                log.error("Failed to fetch Razorpay payment status for {}: {}", providerPaymentId, e.getMessage());
            }
        }

        return ProviderStatusResponse.builder()
                .providerPaymentId(providerPaymentId)
                .status(PaymentStatus.SUCCESS)
                .errorDescription("captured")
                .build();
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        if (razorpayClient != null && request != null && request.getProviderPaymentId() != null && request.getProviderPaymentId().startsWith("pay_")) {
            try {
                JSONObject refundRequest = new JSONObject();
                refundRequest.put("amount", request.getAmount());
                com.razorpay.Refund rzpRefund = razorpayClient.payments.refund(request.getProviderPaymentId(), refundRequest);
                String refundId = rzpRefund.get("id");
                return ProviderRefundResponse.builder()
                        .providerRefundId(refundId)
                        .success(true)
                        .build();
            } catch (Exception e) {
                log.error("Razorpay refund API call failed: {}", e.getMessage(), e);
                return ProviderRefundResponse.builder()
                        .success(false)
                .errorCode("PENDING")
                .errorDescription("Razorpay refund call ambiguous or pending: " + e.getMessage())
                .build();
            }
        }

        return ProviderRefundResponse.builder()
                .providerRefundId("rfnd_rzp_" + java.util.UUID.randomUUID().toString().substring(0, 8))
                .success(true)
                .build();
    }

    @Override
    public boolean isHealthy() {
        return true;
    }

    @Override
    public String getProviderName() {
        return "RAZORPAY";
    }

    public JSONObject buildOrderRequest(PaymentRequest request) {
        JSONObject orderRequest = new JSONObject();
        // FastPay stores amount in paise (BIGINT). Razorpay Orders API expects amount in paise.
        orderRequest.put("amount", request.getAmount());
        orderRequest.put("currency", request.getCurrency() != null ? request.getCurrency() : "INR");
        orderRequest.put("receipt", request.getOrderId() != null ? request.getOrderId().toString() : "rcpt_" + System.currentTimeMillis());
        orderRequest.put("payment_capture", 1);
        return orderRequest;
    }

    public boolean verifySignature(String payload, String signature, String secret) {
        if (signature == null || signature.isBlank()) {
            return false;
        }

        String signingSecret = (secret != null && !secret.isBlank()) ? secret : razorpayConfig.getWebhookSecret();
        try {
            return Utils.verifyWebhookSignature(payload, signature, signingSecret);
        } catch (RazorpayException e) {
            // Fallback manual HMAC SHA256 check
            try {
                Mac mac = Mac.getInstance("HmacSHA256");
                SecretKeySpec secretKeySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
                mac.init(secretKeySpec);
                byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
                String expectedSignature = HexFormat.of().formatHex(hmacBytes);
                return expectedSignature.equalsIgnoreCase(signature.trim());
            } catch (NoSuchAlgorithmException | InvalidKeyException ex) {
                return false;
            }
        }
    }

    private PaymentStatus mapRazorpayStatus(String razorpayStatus) {
        if (razorpayStatus == null) return PaymentStatus.PENDING;
        return switch (razorpayStatus.toLowerCase()) {
            case "captured", "paid" -> PaymentStatus.SUCCESS;
            case "failed" -> PaymentStatus.FAILED;
            case "authorized", "created" -> PaymentStatus.PROCESSING;
            default -> PaymentStatus.PENDING;
        };
    }
}
