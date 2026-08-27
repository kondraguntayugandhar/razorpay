package com.thirdprd.payment.provider;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.*;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockPaymentProviderB implements PaymentProvider {

    public static final String MOCK_PROVIDER_B_NAME = "MOCK_PROVIDER_B";

    private final Map<String, PaymentStatus> simulatedStatusStore = new ConcurrentHashMap<>();
    private volatile boolean healthy = true;

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        String providerPaymentId = "pay_mockb_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        String simulate = null;
        if (request != null && request.getNotes() != null && request.getNotes().containsKey("simulate")) {
            simulate = String.valueOf(request.getNotes().get("simulate"));
        }

        if ("fail".equalsIgnoreCase(simulate) || "decline".equalsIgnoreCase(simulate)) {
            simulatedStatusStore.put(providerPaymentId, PaymentStatus.FAILED);
            return ProviderResponse.builder()
                    .success(false)
                    .providerPaymentId(providerPaymentId)
                    .providerName(getProviderName())
                    .status(PaymentStatus.FAILED)
                    .errorCode("BAD_CARD_OR_DECLINED")
                    .errorDescription("Simulated payment decline by bank (Provider B)")
                    .rawProviderPayload("{\"mock_b\": true, \"result\": \"DECLINED\"}")
                    .build();
        }

        if ("timeout".equalsIgnoreCase(simulate) || "pending".equalsIgnoreCase(simulate)) {
            simulatedStatusStore.put(providerPaymentId, PaymentStatus.PENDING);
            return ProviderResponse.builder()
                    .success(false)
                    .providerPaymentId(providerPaymentId)
                    .providerName(getProviderName())
                    .status(PaymentStatus.PENDING)
                    .errorCode("GATEWAY_TIMEOUT")
                    .errorDescription("Simulated upstream provider timeout (Provider B)")
                    .rawProviderPayload("{\"mock_b\": true, \"result\": \"TIMEOUT\"}")
                    .build();
        }

        simulatedStatusStore.put(providerPaymentId, PaymentStatus.SUCCESS);
        return ProviderResponse.builder()
                .success(true)
                .providerPaymentId(providerPaymentId)
                .providerName(getProviderName())
                .status(PaymentStatus.SUCCESS)
                .rawProviderPayload("{\"mock_b\": true, \"result\": \"SUCCESS\"}")
                .build();
    }

    @Override
    public ProviderStatusResponse getStatus(String providerPaymentId) {
        PaymentStatus status = simulatedStatusStore.getOrDefault(providerPaymentId, PaymentStatus.SUCCESS);
        return ProviderStatusResponse.builder()
                .providerPaymentId(providerPaymentId)
                .status(status)
                .build();
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        String refundId = "rfnd_mockb_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return ProviderRefundResponse.builder()
                .success(true)
                .providerRefundId(refundId)
                .build();
    }

    @Override
    public boolean isHealthy() {
        return healthy;
    }

    public void setHealthy(boolean healthy) {
        this.healthy = healthy;
    }

    @Override
    public String getProviderName() {
        return MOCK_PROVIDER_B_NAME;
    }
}
