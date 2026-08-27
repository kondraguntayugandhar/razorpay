package com.thirdprd.payment.webhook.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Component
public class WebhookSignatureVerifier {

    private final String defaultSecret;

    public WebhookSignatureVerifier(@Value("${webhook.secret:default_webhook_secret_key}") String defaultSecret) {
        this.defaultSecret = defaultSecret;
    }

    public boolean verifySignature(String payload, String signature, String secret) {
        if (signature == null || signature.isBlank()) {
            return false;
        }

        String signingSecret = (secret != null && !secret.isBlank()) ? secret : defaultSecret;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedSignature = HexFormat.of().formatHex(hmacBytes);
            return expectedSignature.equalsIgnoreCase(signature.trim());
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    public String calculateSignature(String payload, String secret) {
        String signingSecret = (secret != null && !secret.isBlank()) ? secret : defaultSecret;
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(signingSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hmacBytes = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hmacBytes);
        } catch (Exception e) {
            throw new RuntimeException("HMAC SHA256 computation failed", e);
        }
    }
}
