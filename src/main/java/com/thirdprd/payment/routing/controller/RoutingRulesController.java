package com.thirdprd.payment.routing.controller;

import com.thirdprd.payment.provider.health.ProviderHealthEngine;
import com.thirdprd.payment.routing.entity.RoutingDecision;
import com.thirdprd.payment.routing.entity.RoutingRule;
import com.thirdprd.payment.routing.repository.RoutingDecisionRepository;
import com.thirdprd.payment.routing.repository.RoutingRuleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/routing")
@CrossOrigin(origins = "*")
public class RoutingRulesController {

    private final RoutingRuleRepository ruleRepository;
    private final RoutingDecisionRepository decisionRepository;
    private final ProviderHealthEngine healthEngine;

    public RoutingRulesController(RoutingRuleRepository ruleRepository,
                                  RoutingDecisionRepository decisionRepository,
                                  ProviderHealthEngine healthEngine) {
        this.ruleRepository = ruleRepository;
        this.decisionRepository = decisionRepository;
        this.healthEngine = healthEngine;
    }

    @GetMapping("/rules")
    public ResponseEntity<?> getRoutingRules(@RequestParam(required = false) UUID merchantId) {
        List<RoutingRule> rules = (merchantId != null) ?
                ruleRepository.findActiveRulesForMerchant(merchantId) :
                ruleRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", rules));
    }

    @PostMapping("/rules")
    public ResponseEntity<?> createRoutingRule(@RequestBody RoutingRule rule) {
        if (rule.getCreatedAt() == null) rule.setCreatedAt(Instant.now());
        rule.setUpdatedAt(Instant.now());
        RoutingRule saved = ruleRepository.save(rule);
        return ResponseEntity.ok(Map.of("success", true, "data", saved));
    }

    @DeleteMapping("/rules/{id}")
    public ResponseEntity<?> deleteRoutingRule(@PathVariable UUID id) {
        ruleRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Routing rule removed"));
    }

    @GetMapping("/providers/health")
    public ResponseEntity<?> getProviderHealthTelemetry() {
        return ResponseEntity.ok(Map.of("success", true, "data", healthEngine.getAllTelemetry()));
    }

    @GetMapping("/decisions/{paymentId}")
    public ResponseEntity<?> getDecisionForPayment(@PathVariable UUID paymentId) {
        RoutingDecision decision = decisionRepository.findByPaymentId(paymentId).orElse(null);
        return ResponseEntity.ok(Map.of("success", true, "data", decision != null ? decision : Map.of()));
    }
}
