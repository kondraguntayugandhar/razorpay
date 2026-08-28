package com.thirdprd.payment.provider;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Base64;
import java.util.UUID;
import java.util.regex.Pattern;

@Component
public class UpiPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(UpiPaymentProvider.class);

    private static final Pattern VPA_PATTERN = Pattern.compile("^[a-zA-Z0-9.\\-_]{2,256}@[a-zA-Z]{2,64}$");

    @Value("${payment.upi.simulated-delay-ms:0}")
    private long simulatedDelayMs;

    @Value("${payment.upi.merchant-vpa:merchant@fastpay}")
    private String merchantVpa;

    @Value("${payment.upi.merchant-name:FastPay Store}")
    private String merchantName;

    public UpiPaymentProvider() {
    }

    public UpiPaymentProvider(long simulatedDelayMs, String merchantVpa, String merchantName) {
        this.simulatedDelayMs = simulatedDelayMs;
        this.merchantVpa = merchantVpa != null ? merchantVpa : "merchant@fastpay";
        this.merchantName = merchantName != null ? merchantName : "FastPay Store";
    }

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        log.info("UpiPaymentProvider: Creating payment request for amount: {} paise, method: {}", request.getAmount(), request.getMethod());

        String upiFlow = request.getUpiFlow();
        String customerVpa = request.getVpa();

        if (customerVpa == null && request.getNotes() != null && request.getNotes().containsKey("vpa")) {
            customerVpa = String.valueOf(request.getNotes().get("vpa"));
        }
        if (upiFlow == null && request.getNotes() != null && request.getNotes().containsKey("upi_flow")) {
            upiFlow = String.valueOf(request.getNotes().get("upi_flow"));
        }

        boolean isCollectFlow = "collect".equalsIgnoreCase(upiFlow) || (customerVpa != null && !customerVpa.isBlank());

        if (isCollectFlow) {
            // Collect Flow: validate VPA format
            if (customerVpa == null || customerVpa.isBlank() || !validateVpa(customerVpa)) {
                log.warn("UPI Collect Flow rejected: malformed VPA format '{}'", customerVpa);
                return ProviderResponse.builder()
                        .success(false)
                        .providerName(getProviderName())
                        .errorCode("INVALID_VPA")
                        .errorDescription("Malformed Virtual Payment Address (VPA) format. Expected format: user@bank")
                        .build();
            }

            String upiRef = generateUpiRefId();
            simulateApprovalDelay();

            String providerPaymentId = "pay_upi_col_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            log.info("UPI Collect request initiated successfully for VPA: {}, upiRef: {}", customerVpa, upiRef);

            return ProviderResponse.builder()
                    .success(true)
                    .providerPaymentId(providerPaymentId)
                    .providerName(getProviderName())
                    .status(PaymentStatus.PENDING)
                    .upiReferenceId(upiRef)
                    .vpa(customerVpa)
                    .build();
        }

        // Intent / Dynamic QR Flow
        String upiRef = generateUpiRefId();
        String intentUri = generateIntentUri(request.getAmount(), upiRef);
        String qrCodeBase64 = generateQrCodeBase64(intentUri, 250, 250);

        String providerPaymentId = "pay_upi_int_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        log.info("UPI Intent request created successfully. Intent URI: {}, upiRef: {}", intentUri, upiRef);

        return ProviderResponse.builder()
                .success(true)
                .providerPaymentId(providerPaymentId)
                .providerName(getProviderName())
                .status(PaymentStatus.PENDING)
                .upiReferenceId(upiRef)
                .intentUri(intentUri)
                .qrCodeBase64(qrCodeBase64)
                .build();
    }

    public boolean validateVpa(String vpa) {
        if (vpa == null || vpa.isBlank()) return false;
        return VPA_PATTERN.matcher(vpa.trim()).matches();
    }

    public String generateIntentUri(Long amountPaise, String transactionRef) {
        long paise = amountPaise != null ? amountPaise : 0L;
        BigDecimal rupees = BigDecimal.valueOf(paise)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        return String.format("upi://pay?pa=%s&pn=%s&am=%s&tr=%s&cu=INR",
                merchantVpa,
                encodeUriParam(merchantName),
                rupees.toPlainString(),
                transactionRef != null ? transactionRef : generateUpiRefId()
        );
    }

    public String generateQrCodeBase64(String text, int width, int height) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(text, BarcodeFormat.QR_CODE, width, height);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return Base64.getEncoder().encodeToString(outputStream.toByteArray());
        } catch (Exception e) {
            log.error("Failed to generate ZXing QR code image: {}", e.getMessage(), e);
            return "";
        }
    }

    private String generateUpiRefId() {
        return "upi_ref_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }

    private String encodeUriParam(String value) {
        try {
            return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8).replace("+", "%20");
        } catch (Exception e) {
            return value;
        }
    }

    private void simulateApprovalDelay() {
        if (simulatedDelayMs > 0) {
            try {
                Thread.sleep(simulatedDelayMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    @Override
    public ProviderStatusResponse getStatus(String providerPaymentId) {
        return ProviderStatusResponse.builder()
                .providerPaymentId(providerPaymentId)
                .status(PaymentStatus.SUCCESS)
                .errorDescription("UPI transaction authorized")
                .build();
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        return ProviderRefundResponse.builder()
                .providerRefundId("rfnd_upi_" + UUID.randomUUID().toString().substring(0, 8))
                .success(true)
                .build();
    }

    @Override
    public boolean isHealthy() {
        return true;
    }

    @Override
    public String getProviderName() {
        return "UPI";
    }
}
