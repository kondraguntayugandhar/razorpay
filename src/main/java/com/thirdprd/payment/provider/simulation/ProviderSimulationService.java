package com.thirdprd.payment.provider.simulation;

import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
public class ProviderSimulationService {

    private final Map<String, SimulatedPaymentProvider> simulatedProviders = new HashMap<>();
    private final ProviderHealthRepository healthRepository;

    public ProviderSimulationService(List<SimulatedPaymentProvider> providers,
                                     ProviderHealthRepository healthRepository) {
        for (SimulatedPaymentProvider p : providers) {
            this.simulatedProviders.put(p.getProviderCode().toUpperCase(), p);
        }
        this.healthRepository = healthRepository;
    }

    public List<Map<String, Object>> getAllSimulations() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SimulatedPaymentProvider p : simulatedProviders.values()) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("providerCode", p.getProviderCode());
            map.put("simulationMode", p.getSimulationMode());
            map.put("injectedLatencyMs", p.getInjectedLatencyMs());
            map.put("targetSuccessRate", p.getTargetSuccessRate());
            map.put("targetAvgLatencyMs", p.getTargetAvgLatencyMs());
            
            Optional<ProviderHealth> dbHealth = healthRepository.findByProvider(p.getProviderCode());
            String healthStatus = dbHealth.map(h -> h.getStatus().name()).orElse("HEALTHY");
            map.put("healthStatus", healthStatus);
            result.add(map);
        }
        return result;
    }

    @Transactional
    public Map<String, Object> updateSimulation(String providerCode, SimulationMode mode, Integer latencyMs, Boolean healthy) {
        SimulatedPaymentProvider provider = simulatedProviders.get(providerCode.toUpperCase());
        if (provider == null) {
            throw new IllegalArgumentException("Unknown simulated provider: " + providerCode);
        }

        if (mode != null) {
            provider.setSimulationMode(mode);
        }
        if (latencyMs != null) {
            provider.setInjectedLatencyMs(latencyMs);
        }
        if (healthy != null) {
            provider.setHealthy(healthy);
            HealthStatus targetStatus = healthy ? HealthStatus.HEALTHY : HealthStatus.DOWN;
            ProviderHealth ph = healthRepository.findByProvider(providerCode.toUpperCase())
                    .orElse(ProviderHealth.builder()
                            .provider(providerCode.toUpperCase())
                            .status(targetStatus)
                            .lastCheckedAt(Instant.now())
                            .consecutiveFailures(healthy ? 0 : 5)
                            .updatedAt(Instant.now())
                            .build());
            ph.setStatus(targetStatus);
            ph.setConsecutiveFailures(healthy ? 0 : 5);
            ph.setUpdatedAt(Instant.now());
            healthRepository.save(ph);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("providerCode", provider.getProviderCode());
        response.put("simulationMode", provider.getSimulationMode());
        response.put("injectedLatencyMs", provider.getInjectedLatencyMs());
        response.put("healthy", healthy != null ? healthy : (provider.getSimulationMode() != SimulationMode.OUTAGE));
        return response;
    }

    @Transactional
    public void resetAll() {
        for (SimulatedPaymentProvider provider : simulatedProviders.values()) {
            provider.resetSimulation();
            ProviderHealth ph = healthRepository.findByProvider(provider.getProviderCode().toUpperCase()).orElse(null);
            if (ph != null) {
                ph.setStatus(HealthStatus.HEALTHY);
                ph.setConsecutiveFailures(0);
                ph.setUpdatedAt(Instant.now());
                healthRepository.save(ph);
            }
        }
    }
}
