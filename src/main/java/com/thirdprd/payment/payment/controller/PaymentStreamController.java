package com.thirdprd.payment.payment.controller;

import com.thirdprd.payment.payment.service.PaymentPushNotificationService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentStreamController {

    private final PaymentPushNotificationService pushNotificationService;

    public PaymentStreamController(PaymentPushNotificationService pushNotificationService) {
        this.pushNotificationService = pushNotificationService;
    }

    @GetMapping(path = "/{paymentId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamPaymentStatus(@PathVariable("paymentId") UUID paymentId) {
        return pushNotificationService.subscribe(paymentId);
    }
}
