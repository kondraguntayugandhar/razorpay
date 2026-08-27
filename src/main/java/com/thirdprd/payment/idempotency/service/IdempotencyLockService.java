package com.thirdprd.payment.idempotency.service;

public interface IdempotencyLockService {
    boolean acquireLock(String lockKey, long timeoutSeconds);
    void releaseLock(String lockKey);
}
