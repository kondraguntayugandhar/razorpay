package com.thirdprd.payment.provider;

import com.thirdprd.payment.provider.dto.*;

public interface PaymentProvider {
    ProviderResponse createPayment(PaymentRequest request);
    ProviderStatusResponse getStatus(String providerPaymentId);
    ProviderRefundResponse refund(RefundRequest request);
    boolean isHealthy();
    String getProviderName();
}
