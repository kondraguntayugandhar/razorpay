package com.thirdprd.payment.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private static final String SECRET = "FastPayProductionSecretKey2026_MustBeAtLeast256BitsLongForHmacSha256!";
    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000L; // 24 hours
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateToken(UUID merchantId, String email, String role) {
        long now = System.currentTimeMillis();
        long exp = now + EXPIRATION_MS;

        Map<String, Object> header = Map.of("alg", "HS256", "typ", "JWT");
        Map<String, Object> payload = Map.of(
                "merchantId", merchantId.toString(),
                "email", email,
                "role", role != null ? role : "MERCHANT",
                "iat", now / 1000,
                "exp", exp / 1000
        );

        try {
            String headerB64 = encodeBase64(objectMapper.writeValueAsString(header));
            String payloadB64 = encodeBase64(objectMapper.writeValueAsString(payload));
            String content = headerB64 + "." + payloadB64;
            String signature = hmacSha256(content, SECRET);

            return content + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JWT token", e);
        }
    }

    public boolean validateToken(String token) {
        if (token == null || token.isBlank()) return false;
        String[] parts = token.split("\\.");
        if (parts.length != 3) return false;

        try {
            String content = parts[0] + "." + parts[1];
            String expectedSignature = hmacSha256(content, SECRET);
            if (!expectedSignature.equals(parts[2])) return false;

            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<?, ?> payload = objectMapper.readValue(payloadJson, Map.class);
            Number exp = (Number) payload.get("exp");
            if (exp != null && (exp.longValue() * 1000) < System.currentTimeMillis()) {
                return false; // Token expired
            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<?, ?> payload = objectMapper.readValue(payloadJson, Map.class);
            return (String) payload.get("email");
        } catch (Exception e) {
            return null;
        }
    }

    public String getMerchantIdFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            Map<?, ?> payload = objectMapper.readValue(payloadJson, Map.class);
            return (String) payload.get("merchantId");
        } catch (Exception e) {
            return null;
        }
    }

    private String encodeBase64(String input) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(input.getBytes(StandardCharsets.UTF_8));
    }

    private String hmacSha256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
    }
}
