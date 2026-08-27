package com.thirdprd.payment.webhook.controller;

import com.thirdprd.payment.common.dto.ApiResponse;
import com.thirdprd.payment.webhook.service.WebhookService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/webhooks")
public class WebhookController {

    private final WebhookService webhookService;

    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/{provider}")
    public ResponseEntity<ApiResponse<String>> receiveWebhook(
            @PathVariable("provider") String provider,
            @RequestHeader(value = "X-Webhook-Signature", required = false) String signature,
            @RequestBody String rawPayload) {

        WebhookService.WebhookIngestionResult result = webhookService.ingestWebhook(provider, signature, rawPayload);

        if (result == WebhookService.WebhookIngestionResult.INVALID_SIGNATURE) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("INVALID_SIGNATURE", "Webhook signature verification failed"));
        }

        return ResponseEntity.ok(ApiResponse.success("Webhook event received and enqueued"));
    }
}
