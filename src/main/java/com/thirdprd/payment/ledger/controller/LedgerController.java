package com.thirdprd.payment.ledger.controller;

import com.thirdprd.payment.ledger.entity.LedgerEntry;
import com.thirdprd.payment.ledger.service.LedgerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/ledger", "/api/ledger"})
@CrossOrigin(origins = "*")
public class LedgerController {

    private final LedgerService ledgerService;

    public LedgerController(LedgerService ledgerService) {
        this.ledgerService = ledgerService;
    }

    @GetMapping
    public ResponseEntity<?> getLedger(
            Authentication authentication,
            @RequestParam(required = false) UUID merchantId) {
        UUID effectiveMid = merchantId;
        if (effectiveMid == null && authentication != null && authentication.getPrincipal() instanceof UUID) {
            effectiveMid = (UUID) authentication.getPrincipal();
        }

        if (effectiveMid == null) {
            effectiveMid = UUID.nameUUIDFromBytes("DEFAULT_MERCHANT".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        }

        List<LedgerEntry> entries = ledgerService.getLedgerEntries(effectiveMid);
        Long balance = ledgerService.getMerchantBalance(effectiveMid);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "merchantId", effectiveMid,
                "netBalance", balance,
                "count", entries.size(),
                "entries", entries
        ));
    }
}
