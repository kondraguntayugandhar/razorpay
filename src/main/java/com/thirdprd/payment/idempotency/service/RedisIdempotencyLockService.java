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
    private final Map<String, String> localLockTokens = new ConcurrentHashMap<>();

    private static final String RELEASE_LOCK_LUA_SCRIPT =
            "if redis.call('get', KEYS[1]) == ARGV[1] then\n" +
            "    return redis.call('del', KEYS[1])\n" +
            "else\n" +
            "    return 0\n" +
            "end";

    private final org.springframework.data.redis.core.script.DefaultRedisScript<Long> releaseScript;

    @Value("${idempotency.local-lock-fallback-allowed:true}")
    private boolean localLockFallbackAllowed;

    public RedisIdempotencyLockService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.releaseScript = new org.springframework.data.redis.core.script.DefaultRedisScript<>(RELEASE_LOCK_LUA_SCRIPT, Long.class);
    }

    public void setLocalLockFallbackAllowed(boolean localLockFallbackAllowed) {
        this.localLockFallbackAllowed = localLockFallbackAllowed;
    }

    @Override
    public String acquireLockWithToken(String lockKey, long timeoutSeconds) {
        String token = java.util.UUID.randomUUID().toString();
        if (redisTemplate != null) {
            try {
                Boolean success = redisTemplate.opsForValue()
                        .setIfAbsent(lockKey, token, Duration.ofSeconds(timeoutSeconds));
                if (Boolean.TRUE.equals(success)) {
                    return token;
                } else if (Boolean.FALSE.equals(success)) {
                    return null;
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
        if (lock.tryLock()) {
            localLockTokens.put(lockKey, token);
            return token;
        }
        return null;
    }

    @Override
    public boolean releaseLockWithToken(String lockKey, String token) {
        if (token == null || lockKey == null) {
            return false;
        }

        boolean redisReleased = false;
        if (redisTemplate != null) {
            try {
                Long result = redisTemplate.execute(
                        releaseScript,
                        java.util.Collections.singletonList(lockKey),
                        token
                );
                redisReleased = (result != null && result > 0);
            } catch (Exception e) {
                log.warn("Error executing Redis unlock script for {}: {}", lockKey, e.getMessage());
            }
        }

        ReentrantLock lock = localLocks.get(lockKey);
        String currentToken = localLockTokens.get(lockKey);
        if (token.equals(currentToken) && lock != null && lock.isHeldByCurrentThread()) {
            localLockTokens.remove(lockKey);
            lock.unlock();
            return true;
        }

        return redisReleased;
    }

    @Override
    public boolean acquireLock(String lockKey, long timeoutSeconds) {
        return acquireLockWithToken(lockKey, timeoutSeconds) != null;
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
            localLockTokens.remove(lockKey);
            lock.unlock();
        }
    }
}
