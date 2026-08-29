package com.thirdprd.payment;

import com.thirdprd.payment.config.metrics.PaymentMetrics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase9ObservabilityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentMetrics paymentMetrics;

    @Test
    @DisplayName("Actuator Health Endpoint returns HTTP 200 OK")
    void testActuatorHealthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());
    }

    @Test
    @DisplayName("Actuator Prometheus Endpoint exposes JVM and custom FastPay metrics")
    void testPrometheusEndpoint() throws Exception {
        paymentMetrics.recordPayment("SUCCESS", "UPI", "RAZORPAY");
        paymentMetrics.recordWebhookLatency(120);
        paymentMetrics.recordLoginAttempt(true);

        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("fastpay_payments_total")))
                .andExpect(content().string(containsString("fastpay_webhook_latency")));
    }

    @Test
    @DisplayName("TraceIdFilter attaches X-Request-ID correlation header to HTTP response")
    void testTraceIdFilterAttachment() throws Exception {
        mockMvc.perform(get("/api/v1/merchant/logs"))
                .andExpect(status().isOk())
                .andExpect(header().exists("X-Request-ID"))
                .andExpect(header().string("X-Request-ID", startsWith("req_")));
    }
}
