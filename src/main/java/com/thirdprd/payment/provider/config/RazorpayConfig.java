package com.thirdprd.payment.provider.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.Set;

@Configuration
public class RazorpayConfig {

    private static final Logger log = LoggerFactory.getLogger(RazorpayConfig.class);

    private static final Set<String> PLACEHOLDER_KEYS = Set.of(
            "rzp_test_mockkey", "mocksecret", "placeholder", "default_webhook_secret_key"
    );

    @Value("${payment.provider:mock}")
    private String paymentProvider;

    @Value("${razorpay.key_id:rzp_test_mockKey}")
    private String keyId;

    @Value("${razorpay.key_secret:mockSecret}")
    private String keySecret;

    @Value("${razorpay.webhook_secret:default_webhook_secret_key}")
    private String webhookSecret;

    @PostConstruct
    public void validateConfiguration() {
        String normalizedProvider = paymentProvider != null ? paymentProvider.trim().toLowerCase() : "mock";

        if ("razorpay-test".equals(normalizedProvider) || "razorpay-live".equals(normalizedProvider)) {
            boolean isKeyIdInvalid = keyId == null || keyId.isBlank() || PLACEHOLDER_KEYS.contains(keyId.trim().toLowerCase());
            boolean isKeySecretInvalid = keySecret == null || keySecret.isBlank() || PLACEHOLDER_KEYS.contains(keySecret.trim().toLowerCase());

            if (isKeyIdInvalid || isKeySecretInvalid) {
                String errorMsg = String.format(
                        "FAIL-SAFE STARTUP BLOCKER: Payment provider is set to '%s', but valid Razorpay credentials are not configured (key_id='%s'). Refusing to start in unsafe configuration state.",
                        paymentProvider, keyId
                );
                log.error(errorMsg);
                throw new IllegalStateException(errorMsg);
            }
            log.info("Razorpay provider configuration validated successfully for provider mode: {}", paymentProvider);
        } else {
            log.info("Active payment provider configured as: {}", paymentProvider);
        }
    }

    public String getPaymentProvider() {
        return paymentProvider;
    }

    public String getKeyId() {
        return keyId;
    }

    public String getKeySecret() {
        return keySecret;
    }

    public String getWebhookSecret() {
        return webhookSecret;
    }
}
