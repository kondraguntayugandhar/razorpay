package com.thirdprd.payment.provider;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.*;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MockPaymentProvider implements PaymentProvider {

    public static final String MOCK_PROVIDER_NAME = "MOCK_PROVIDER";

    private final Map<String, PaymentStatus> simulatedStatusStore = new ConcurrentHashMap<>();

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        String providerPaymentId = "pay_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        String simulate = null;
        if (request.getNotes() != null && request.getNotes().containsKey("simulate")) {
            simulate = String.valueOf(request.getNotes().get("simulate"));
        }

        if ("fail".equalsIgnoreCase(simulate) || "decline".equalsIgnoreCase(simulate)) {
            simulatedStatusStore.put(providerPaymentId, PaymentStatus.FAILED);
            return ProviderResponse.builder()
                    .success(false)
                    .providerPaymentId(providerPaymentId)
                    .status(PaymentStatus.FAILED)
                    .errorCode("BAD_CARD_OR_DECLINED")
                    .errorDescription("Simulated payment decline by bank")
                    .rawProviderPayload("{\"mock\": true, \"result\": \"DECLINED\"}")
                    .build();
        }

        if ("timeout".equalsIgnoreCase(simulate)) {
            simulatedStatusStore.put(providerPaymentId, PaymentStatus.PENDING);
            return ProviderResponse.builder()
                    .success(false)
                    .providerPaymentId(providerPaymentId)
                    .status(PaymentStatus.PENDING)
                    .errorCode("GATEWAY_TIMEOUT")
                    .errorDescription("Simulated upstream provider timeout")
                    .rawProviderPayload("{\"mock\": true, \"result\": \"TIMEOUT\"}")
                    .build();
        }

        simulatedStatusStore.put(providerPaymentId, PaymentStatus.SUCCESS);
        return ProviderResponse.builder()
                .success(true)
                .providerPaymentId(providerPaymentId)
                .status(PaymentStatus.SUCCESS)
                .rawProviderPayload("{\"mock\": true, \"result\": \"SUCCESS\"}")
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
        String refundId = "rfnd_mock_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return ProviderRefundResponse.builder()
                .success(true)
                .providerRefundId(refundId)
                .build();
    }

    @Override
    public boolean isHealthy() {
        return true;
    }

    @Override
    public String getProviderName() {
        return MOCK_PROVIDER_NAME;
    }
}
