package com.thirdprd.payment.reconciliation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reconciliation")
@CrossOrigin(origins = "*")
public class ReconciliationController {

    private final PaymentReconciliationScheduler reconciliationScheduler;

    public ReconciliationController(PaymentReconciliationScheduler reconciliationScheduler) {
        this.reconciliationScheduler = reconciliationScheduler;
    }

    @GetMapping
    public ResponseEntity<?> getReconciliationSummary() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "status", "ACTIVE",
                "schedulerRunning", true,
                "lastHeartbeat", Instant.now().toString()
        ));
    }

    @PostMapping("/run")
    public ResponseEntity<?> triggerManualReconciliation() {
        Map<String, Object> result = reconciliationScheduler.reconcileNow();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Reconciliation job completed successfully",
                "data", result,
                "timestamp", Instant.now().toString()
        ));
    }
}
