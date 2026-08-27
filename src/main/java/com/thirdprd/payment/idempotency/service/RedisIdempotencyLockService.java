package com.thirdprd.payment.idempotency.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

    public RedisIdempotencyLockService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public boolean acquireLock(String lockKey, long timeoutSeconds) {
        if (redisTemplate != null) {
            try {
                Boolean success = redisTemplate.opsForValue()
                        .setIfAbsent(lockKey, "LOCKED", Duration.ofSeconds(timeoutSeconds));
                if (Boolean.TRUE.equals(success)) {
                    return true;
                }
            } catch (Exception e) {
                log.warn("Redis unavailable for idempotency locking ({}), falling back to local lock", e.getMessage());
            }
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
