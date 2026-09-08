package com.thirdprd.payment.idempotency.service;

public interface IdempotencyLockService {
    boolean acquireLock(String lockKey, long timeoutSeconds);
    void releaseLock(String lockKey);

    default String acquireLockWithToken(String lockKey, long timeoutSeconds) {
        boolean ok = acquireLock(lockKey, timeoutSeconds);
        return ok ? "LEGACY_LOCK" : null;
    }

    default boolean releaseLockWithToken(String lockKey, String token) {
        releaseLock(lockKey);
        return true;
    }
}
