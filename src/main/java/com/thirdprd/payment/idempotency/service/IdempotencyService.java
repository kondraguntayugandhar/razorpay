package com.thirdprd.payment.idempotency.service;

import com.thirdprd.payment.common.exception.IdempotencyConflictException;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.repository.IdempotencyKeyRepository;
import com.thirdprd.payment.payment.entity.Payment;
import com.thirdprd.payment.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
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

    private static final Logger log = LoggerFactory.getLogger(IdempotencyService.class);

    private final IdempotencyKeyRepository idempotencyKeyRepository;
    private final IdempotencyLockService lockService;

    @Autowired(required = false)
    private PaymentRepository paymentRepository;

    public IdempotencyService(IdempotencyKeyRepository idempotencyKeyRepository, IdempotencyLockService lockService) {
        this.idempotencyKeyRepository = idempotencyKeyRepository;
        this.lockService = lockService;
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

    public boolean acquireIdempotencyLock(UUID merchantId, String keyHeader, long timeoutSeconds) {
        if (keyHeader == null || keyHeader.isBlank()) {
            return true;
        }
        String lockKey = "lock:idempotency:" + merchantId + ":" + keyHeader;
        return lockService.acquireLock(lockKey, timeoutSeconds);
    }

    public void releaseIdempotencyLock(UUID merchantId, String keyHeader) {
        if (keyHeader == null || keyHeader.isBlank()) {
            return;
        }
        String lockKey = "lock:idempotency:" + merchantId + ":" + keyHeader;
        lockService.releaseLock(lockKey);
    }

    public Optional<IdempotencyKey> waitForCompletedRecord(UUID merchantId, String keyHeader, String requestHash, long maxWaitMs) {
        long startTime = System.currentTimeMillis();
        long pollIntervalMs = 50;

        while (System.currentTimeMillis() - startTime < maxWaitMs) {
            Optional<IdempotencyKey> record = checkIdempotency(merchantId, keyHeader, requestHash);
            if (record.isPresent()) {
                return record;
            }
            if (paymentRepository != null) {
                Optional<Payment> payment = paymentRepository.findByMerchantIdAndIdempotencyKey(merchantId, keyHeader);
                if (payment.isPresent()) {
                    // Give DB transaction a few milliseconds to finalize idempotency record
                    try {
                        Thread.sleep(pollIntervalMs);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                    record = checkIdempotency(merchantId, keyHeader, requestHash);
                    if (record.isPresent()) {
                        return record;
                    }
                }
            }
            try {
                Thread.sleep(pollIntervalMs);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return checkIdempotency(merchantId, keyHeader, requestHash);
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

        try {
            return idempotencyKeyRepository.save(record);
        } catch (DataIntegrityViolationException e) {
            Optional<IdempotencyKey> existing = checkIdempotency(merchantId, keyHeader, requestHash);
            return existing.orElse(record);
        }
    }
}
