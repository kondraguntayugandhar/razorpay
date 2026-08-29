package com.thirdprd.payment.config.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class PaymentMetrics {

    private final MeterRegistry meterRegistry;

    public PaymentMetrics(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public void recordPayment(String status, String method, String provider) {
        Counter.builder("fastpay.payments.total")
                .description("Total number of processed payment attempts")
                .tag("status", status != null ? status : "UNKNOWN")
                .tag("method", method != null ? method : "UNKNOWN")
                .tag("provider", provider != null ? provider : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }

    public void recordWebhookLatency(long durationMs) {
        Timer.builder("fastpay.webhook.latency")
                .description("Webhook processing latency in seconds")
                .register(meterRegistry)
                .record(durationMs, TimeUnit.MILLISECONDS);
    }

    public void recordLoginAttempt(boolean success) {
        Counter.builder("fastpay.login.attempts")
                .description("Total number of merchant authentication attempts")
                .tag("status", success ? "SUCCESS" : "FAILED")
                .register(meterRegistry)
                .increment();
    }

    public void recordRefund(String status) {
        Counter.builder("fastpay.refunds.total")
                .description("Total number of refund requests processed")
                .tag("status", status != null ? status : "UNKNOWN")
                .register(meterRegistry)
                .increment();
    }
}
