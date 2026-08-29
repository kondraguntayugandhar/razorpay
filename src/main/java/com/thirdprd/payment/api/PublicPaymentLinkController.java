package com.thirdprd.payment.api;

import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.merchant.entity.Merchant;
import com.thirdprd.payment.merchant.repository.MerchantRepository;
import com.thirdprd.payment.paymentlink.entity.PaymentLink;
import com.thirdprd.payment.paymentlink.repository.PaymentLinkRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/links/public")
public class PublicPaymentLinkController {

    private final PaymentLinkRepository paymentLinkRepository;
    private final MerchantRepository merchantRepository;

    public PublicPaymentLinkController(PaymentLinkRepository paymentLinkRepository, MerchantRepository merchantRepository) {
        this.paymentLinkRepository = paymentLinkRepository;
        this.merchantRepository = merchantRepository;
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPublicPaymentLink(@PathVariable String shortCode) {
        Optional<PaymentLink> linkOpt = paymentLinkRepository.findByShortCode(shortCode);
        if (linkOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("NOT_FOUND", "Payment link not found"));
        }

        PaymentLink link = linkOpt.get();

        // Server-Side Expiration & Status Check
        if (!"ACTIVE".equalsIgnoreCase(link.getStatus()) || (link.getExpiresAt() != null && link.getExpiresAt().isBefore(Instant.now()))) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("PAYMENT_LINK_EXPIRED", "Payment link has expired or is inactive"));
        }

        String merchantName = merchantRepository.findById(link.getMerchantId())
                .map(Merchant::getName)
                .orElse("FastPay Merchant");

        // Scoped minimal checkout payload — Zero PII exposed
        Map<String, Object> publicData = Map.of(
                "shortCode", link.getShortCode(),
                "merchantName", merchantName,
                "amount", link.getAmount(),
                "currency", link.getCurrency(),
                "description", link.getDescription() != null ? link.getDescription() : "",
                "status", link.getStatus(),
                "expiresAt", link.getExpiresAt() != null ? link.getExpiresAt().toString() : ""
        );

        return ResponseEntity.ok(ApiResponse.success(publicData));
    }
}
