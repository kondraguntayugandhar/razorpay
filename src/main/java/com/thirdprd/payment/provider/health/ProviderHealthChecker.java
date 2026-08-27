package com.thirdprd.payment.provider.health;

import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;

@Component
public class ProviderHealthChecker {

    private static final Logger log = LoggerFactory.getLogger(ProviderHealthChecker.class);

    private final List<PaymentProvider> providers;
    private final ProviderHealthRepository healthRepository;

    public ProviderHealthChecker(List<PaymentProvider> providers, ProviderHealthRepository healthRepository) {
        this.providers = providers;
        this.healthRepository = healthRepository;
    }

    @Scheduled(fixedDelayString = "${provider.health-check.interval-ms:15000}")
    public void checkProviderHealth() {
        for (PaymentProvider provider : providers) {
            String name = provider.getProviderName();
            try {
                boolean healthy = provider.isHealthy();
                updateHealthRecord(name, healthy);
            } catch (Exception e) {
                log.warn("Health check exception for provider {}: {}", name, e.getMessage());
                updateHealthRecord(name, false);
            }
        }
    }

    public void updateHealthRecord(String providerName, boolean isHealthy) {
        ProviderHealth record = healthRepository.findByProvider(providerName)
                .orElseGet(() -> ProviderHealth.builder()
                        .provider(providerName)
                        .status(HealthStatus.HEALTHY)
                        .build());

        record.setLastCheckedAt(Instant.now());
        record.setUpdatedAt(Instant.now());

        if (isHealthy) {
            if (record.getStatus() != HealthStatus.HEALTHY) {
                log.info("Provider {} health recovered to HEALTHY", providerName);
            }
            record.setConsecutiveFailures(0);
            record.setStatus(HealthStatus.HEALTHY);
        } else {
            int failures = record.getConsecutiveFailures() + 1;
            record.setConsecutiveFailures(failures);
            if (failures >= 3) {
                if (record.getStatus() != HealthStatus.DOWN) {
                    log.warn("Provider {} health status changed to DOWN after {} failures", providerName, failures);
                }
                record.setStatus(HealthStatus.DOWN);
            } else {
                record.setStatus(HealthStatus.DEGRADED);
            }
        }

        healthRepository.save(record);
    }
}
