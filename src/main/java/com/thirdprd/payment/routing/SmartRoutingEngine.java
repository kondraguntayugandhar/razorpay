package com.thirdprd.payment.routing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.provider.entity.PaymentProviderEntity;
import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.provider.health.ProviderTelemetryDto;
import com.thirdprd.payment.provider.repository.PaymentProviderEntityRepository;
import com.thirdprd.payment.routing.dto.RoutingResult;
import com.thirdprd.payment.routing.entity.RoutingDecision;
import com.thirdprd.payment.routing.entity.RoutingRule;
import com.thirdprd.payment.routing.repository.RoutingDecisionRepository;
import com.thirdprd.payment.routing.repository.RoutingRuleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SmartRoutingEngine {

    private static final Logger log = LoggerFactory.getLogger(SmartRoutingEngine.class);

    private final RoutingRuleRepository ruleRepository;
    private final RoutingDecisionRepository decisionRepository;
    private final PaymentProviderEntityRepository providerRepository;
    private final ProviderHealthEngine healthEngine;
    private final ObjectMapper objectMapper;

    public SmartRoutingEngine(RoutingRuleRepository ruleRepository,
                              RoutingDecisionRepository decisionRepository,
                              PaymentProviderEntityRepository providerRepository,
                              ProviderHealthEngine healthEngine,
                              ObjectMapper objectMapper) {
        this.ruleRepository = ruleRepository;
        this.decisionRepository = decisionRepository;
        this.providerRepository = providerRepository;
        this.healthEngine = healthEngine;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public RoutingResult routePayment(UUID paymentId, UUID merchantId, String method, Long amount, String currency) {
        List<RoutingRule> activeRules = ruleRepository.findActiveRulesForMerchant(merchantId);
        List<PaymentProviderEntity> allProviders = providerRepository.findByIsActiveTrueOrderByPriorityDesc();

        if (allProviders.isEmpty()) {
            // Fallback default list if DB catalog hasn't been synced yet
            allProviders = getDefaultProviders();
        }

        RoutingRule matchedRule = null;
        for (RoutingRule rule : activeRules) {
            if (ruleMatches(rule, method, amount)) {
                matchedRule = rule;
                break;
            }
        }

        Map<String, Double> scoresMap = new LinkedHashMap<>();
        Map<String, PaymentProviderEntity> providerMap = allProviders.stream()
                .collect(Collectors.toMap(p -> p.getProviderCode().toUpperCase(), p -> p, (a, b) -> a));

        List<String> availableCandidates = new ArrayList<>();

        for (PaymentProviderEntity p : allProviders) {
            String code = p.getProviderCode().toUpperCase();
            if (!healthEngine.isProviderAvailable(code)) {
                log.info("[ROUTING] Provider {} is unavailable (Circuit OPEN or DOWN), omitting from primary ranking", code);
                continue;
            }
            availableCandidates.add(code);
        }

        if (availableCandidates.isEmpty()) {
            // If all are down according to CB, allow fallback to candidates with best historical stats to attempt recovery
            log.warn("[ROUTING] All providers marked down! Falling back to standard mock PSPs");
            availableCandidates.addAll(List.of("PSP_A", "PSP_B", "PSP_C"));
        }

        for (String code : availableCandidates) {
            PaymentProviderEntity entity = providerMap.getOrDefault(code,
                    new PaymentProviderEntity(UUID.randomUUID(), code, code, true, 5, 300L, java.math.BigDecimal.valueOf(1.5), null, null, Instant.now(), Instant.now()));

            ProviderTelemetryDto telemetry = healthEngine.getTelemetry(code);

            double successScore = telemetry.getSuccessRatePercent();
            double latencyScore = Math.max(0.0, 100.0 - (telemetry.getAvgLatencyMs() / 10.0));
            double costScore = Math.max(0.0, 100.0 - (entity.getBaseFeePaise() / 10.0));
            double priorityScore = entity.getPriority() * 10.0;

            double ruleBonus = 0.0;
            if (matchedRule != null && matchedRule.getTargetProvider().equalsIgnoreCase(code)) {
                ruleBonus = matchedRule.getWeight();
            }

            // Weighted multi-factor scoring formula:
            // Score = (0.40 * Success) + (0.25 * Latency) + (0.15 * Cost) + (0.20 * Priority) + RuleBonus
            double finalScore = (0.40 * successScore) + (0.25 * latencyScore) + (0.15 * costScore) + (0.20 * priorityScore) + ruleBonus;
            scoresMap.put(code, Math.round(finalScore * 100.0) / 100.0);
        }

        List<Map.Entry<String, Double>> sortedScores = new ArrayList<>(scoresMap.entrySet());
        sortedScores.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));

        if (sortedScores.isEmpty()) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "No payment provider available for method " + method);
        }

        String chosen = sortedScores.get(0).getKey();
        List<String> fallbacks = sortedScores.stream()
                .skip(1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String decisionId = "dec_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        String scoresJson = "{}";
        try {
            scoresJson = objectMapper.writeValueAsString(scoresMap);
        } catch (Exception ignored) {
        }

        String reason = String.format("Selected %s with score %.2f (Rule: %s, Fallbacks: %s)",
                chosen, sortedScores.get(0).getValue(),
                matchedRule != null ? matchedRule.getName() : "None (Weighted Scoring)",
                fallbacks);

        RoutingDecision decision = RoutingDecision.builder()
                .decisionId(decisionId)
                .paymentId(paymentId)
                .merchantId(merchantId)
                .chosenProvider(chosen)
                .ruleAppliedId(matchedRule != null ? matchedRule.getId() : null)
                .algorithm("WEIGHTED_MULTI_FACTOR")
                .scoresJson(scoresJson)
                .reasons(reason)
                .build();

        decisionRepository.save(decision);
        log.info("[SMART_ROUTER] Payment {} -> Selected {} | Score Breakdown: {}", paymentId, chosen, scoresJson);

        return new RoutingResult(chosen, fallbacks, decisionId,
                matchedRule != null ? matchedRule.getId() : null,
                "WEIGHTED_MULTI_FACTOR", scoresMap, reason);
    }

    private boolean ruleMatches(RoutingRule rule, String method, Long amount) {
        if (rule.getPaymentMethod() != null && !rule.getPaymentMethod().isBlank()) {
            if (method == null || !rule.getPaymentMethod().equalsIgnoreCase(method)) {
                return false;
            }
        }
        if (amount != null) {
            if (rule.getMinAmount() != null && amount < rule.getMinAmount()) return false;
            if (rule.getMaxAmount() != null && amount > rule.getMaxAmount()) return false;
        }
        return true;
    }

    private List<PaymentProviderEntity> getDefaultProviders() {
        return List.of(
                new PaymentProviderEntity(UUID.randomUUID(), "PSP_A", "Mock PSP-A (High Reliability)", true, 10, 500L, java.math.BigDecimal.valueOf(1.5), null, null, Instant.now(), Instant.now()),
                new PaymentProviderEntity(UUID.randomUUID(), "PSP_B", "Mock PSP-B (Low Latency)", true, 9, 300L, java.math.BigDecimal.valueOf(1.2), null, null, Instant.now(), Instant.now()),
                new PaymentProviderEntity(UUID.randomUUID(), "PSP_C", "Mock PSP-C (Cost Optimized)", true, 8, 200L, java.math.BigDecimal.valueOf(0.9), null, null, Instant.now(), Instant.now())
        );
    }
}
