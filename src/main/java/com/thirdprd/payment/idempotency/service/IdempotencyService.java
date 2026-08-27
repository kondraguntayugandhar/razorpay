package com.thirdprd.payment.idempotency.service;

import com.thirdprd.payment.common.exception.IdempotencyConflictException;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.repository.IdempotencyKeyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

@Service
public class IdempotencyService {

    private final IdempotencyKeyRepository idempotencyKeyRepository;

    public IdempotencyService(IdempotencyKeyRepository idempotencyKeyRepository) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
    }

    public String computeHash(String requestPayload) {
        if (requestPayload == null) {
            requestPayload = "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(requestPayload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm unavailable", e);
        }
    }

    @Transactional(readOnly = true)
    public Optional<IdempotencyKey> checkIdempotency(UUID merchantId, String keyHeader, String requestHash) {
        if (keyHeader == null || keyHeader.isBlank()) {
            return Optional.empty();
        }

        Optional<IdempotencyKey> existingKey = idempotencyKeyRepository
                .findByMerchantIdAndIdempotencyKey(merchantId, keyHeader);

        if (existingKey.isPresent()) {
            IdempotencyKey record = existingKey.get();
            if (!record.getRequestHash().equals(requestHash)) {
                throw new IdempotencyConflictException(keyHeader);
            }
        }

        return existingKey;
    }

    @Transactional
    public IdempotencyKey saveIdempotencyRecord(UUID merchantId, String keyHeader, String requestHash, String responseBody, int statusCode) {
        if (keyHeader == null || keyHeader.isBlank()) {
            return null;
        }

        IdempotencyKey record = IdempotencyKey.builder()
                .merchantId(merchantId)
                .idempotencyKey(keyHeader)
                .requestHash(requestHash)
                .responseBody(responseBody)
                .statusCode(statusCode)
                .build();

        return idempotencyKeyRepository.save(record);
    }
}
