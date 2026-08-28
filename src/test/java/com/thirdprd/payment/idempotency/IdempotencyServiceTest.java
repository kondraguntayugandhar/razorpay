package com.thirdprd.payment.idempotency;

import com.thirdprd.payment.common.exception.IdempotencyConflictException;
import com.thirdprd.payment.idempotency.entity.IdempotencyKey;
import com.thirdprd.payment.idempotency.repository.IdempotencyKeyRepository;
import com.thirdprd.payment.idempotency.service.IdempotencyService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private IdempotencyKeyRepository idempotencyKeyRepository;

    @InjectMocks
    private IdempotencyService idempotencyService;

    private UUID merchantId;
    private String keyHeader;
    private String hash1;
    private String hash2;

    @BeforeEach
    void setUp() {
        merchantId = UUID.randomUUID();
        keyHeader = "idem_key_123456";
        hash1 = idempotencyService.computeHash("{\"amount\": 1000}");
        hash2 = idempotencyService.computeHash("{\"amount\": 2000}");
    }

    @Test
    void testComputeHashConsistency() {
        assertEquals(hash1, idempotencyService.computeHash("{\"amount\": 1000}"));
        assertNotEquals(hash1, hash2);
    }

    @Test
    void testCheckIdempotencyConflictThrowsException() {
        IdempotencyKey existingRecord = IdempotencyKey.builder()
                .merchantId(merchantId)
                .idempotencyKey(keyHeader)
                .requestHash(hash1)
                .responseBody("{\"id\":\"order_123\"}")
                .statusCode(201)
                .build();

        when(idempotencyKeyRepository.findByMerchantIdAndIdempotencyKey(eq(merchantId), eq(keyHeader)))
                .thenReturn(Optional.of(existingRecord));

        assertThrows(IdempotencyConflictException.class, () ->
                idempotencyService.checkIdempotency(merchantId, keyHeader, hash2));
    }
}
