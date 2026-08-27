package com.thirdprd.payment.idempotency.service;

import com.thirdprd.payment.common.exception.ServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.ReentrantLock;

@Service
public class RedisIdempotencyLockService implements IdempotencyLockService {

    private static final Logger log = LoggerFactory.getLogger(RedisIdempotencyLockService.class);

    private final StringRedisTemplate redisTemplate;
    private final Map<String, ReentrantLock> localLocks = new ConcurrentHashMap<>();

    @Value("${idempotency.local-lock-fallback-allowed:true}")
    private boolean localLockFallbackAllowed;

    public RedisIdempotencyLockService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void setLocalLockFallbackAllowed(boolean localLockFallbackAllowed) {
        this.localLockFallbackAllowed = localLockFallbackAllowed;
    }

    @Override
    public boolean acquireLock(String lockKey, long timeoutSeconds) {
        if (redisTemplate != null) {
            try {
                Boolean success = redisTemplate.opsForValue()
                        .setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(timeoutSeconds));
                if (Boolean.TRUE.equals(success)) {
                    return true;
                } else if (Boolean.FALSE.equals(success)) {
                    // Lock is already held in Redis by another instance/thread -> DO NOT fall back to local lock
                    return false;
                }
            } catch (Exception e) {
                log.warn("Redis unavailable for idempotency locking ({})", e.getMessage());
                if (!localLockFallbackAllowed) {
                    throw new ServiceUnavailableException("Idempotency lock service unavailable (Redis unreachable). Please retry.");
                }
            }
        }

        if (!localLockFallbackAllowed && redisTemplate != null) {
            throw new ServiceUnavailableException("Idempotency lock service unavailable. Please retry.");
        }

        ReentrantLock lock = localLocks.computeIfAbsent(lockKey, k -> new ReentrantLock());
        return lock.tryLock();
    }

    @Override
    public void releaseLock(String lockKey) {
        if (redisTemplate != null) {
            try {
                redisTemplate.delete(lockKey);
            } catch (Exception ignored) {
            }
        }

        ReentrantLock lock = localLocks.get(lockKey);
        if (lock != null && lock.isHeldByCurrentThread()) {
            lock.unlock();
        }
    }
}
