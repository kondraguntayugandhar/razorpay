package com.thirdprd.payment.provider.simulation;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/simulations")
@CrossOrigin(origins = "*")
public class ProviderSimulationController {

    private final ProviderSimulationService simulationService;

    public ProviderSimulationController(ProviderSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    @GetMapping
    public ResponseEntity<?> getSimulations() {
        return ResponseEntity.ok(Map.of("success", true, "data", simulationService.getAllSimulations()));
    }

    @PostMapping("/{providerCode}")
    public ResponseEntity<?> updateSimulation(
            @PathVariable String providerCode,
            @RequestBody Map<String, Object> body) {
        
        SimulationMode mode = null;
        if (body.containsKey("simulationMode")) {
            mode = SimulationMode.valueOf(String.valueOf(body.get("simulationMode")).toUpperCase());
        }

        Integer latencyMs = null;
        if (body.containsKey("injectedLatencyMs")) {
            Object lat = body.get("injectedLatencyMs");
            latencyMs = (lat instanceof Number) ? ((Number) lat).intValue() : Integer.parseInt(lat.toString());
        }

        Boolean healthy = null;
        if (body.containsKey("healthy")) {
            healthy = Boolean.parseBoolean(String.valueOf(body.get("healthy")));
        }

        Map<String, Object> updated = simulationService.updateSimulation(providerCode, mode, latencyMs, healthy);
        return ResponseEntity.ok(Map.of("success", true, "data", updated));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetAllSimulations() {
        simulationService.resetAll();
        return ResponseEntity.ok(Map.of("success", true, "message", "All provider simulations reset to NORMAL"));
    }
}
