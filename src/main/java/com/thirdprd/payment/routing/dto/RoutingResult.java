package com.thirdprd.payment.routing.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public class RoutingResult {
    private String selectedProvider;
    private List<String> fallbackProviders;
    private String decisionId;
    private UUID matchedRuleId;
    private String algorithm;
    private Map<String, Double> providerScores;
    private String reasoning;

    public RoutingResult() {
    }

    public RoutingResult(String selectedProvider, List<String> fallbackProviders, String decisionId,
                         UUID matchedRuleId, String algorithm, Map<String, Double> providerScores, String reasoning) {
        this.selectedProvider = selectedProvider;
        this.fallbackProviders = fallbackProviders;
        this.decisionId = decisionId;
        this.matchedRuleId = matchedRuleId;
        this.algorithm = algorithm;
        this.providerScores = providerScores;
        this.reasoning = reasoning;
    }

    public String getSelectedProvider() { return selectedProvider; }
    public void setSelectedProvider(String selectedProvider) { this.selectedProvider = selectedProvider; }

    public List<String> getFallbackProviders() { return fallbackProviders; }
    public void setFallbackProviders(List<String> fallbackProviders) { this.fallbackProviders = fallbackProviders; }

    public String getDecisionId() { return decisionId; }
    public void setDecisionId(String decisionId) { this.decisionId = decisionId; }

    public UUID getMatchedRuleId() { return matchedRuleId; }
    public void setMatchedRuleId(UUID matchedRuleId) { this.matchedRuleId = matchedRuleId; }

    public UUID getRuleAppliedId() { return matchedRuleId; }

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public Map<String, Double> getProviderScores() { return providerScores; }
    public void setProviderScores(Map<String, Double> providerScores) { this.providerScores = providerScores; }

    public String getReasoning() { return reasoning; }
    public void setReasoning(String reasoning) { this.reasoning = reasoning; }
}
