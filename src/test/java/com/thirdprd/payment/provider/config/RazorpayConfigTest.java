package com.thirdprd.payment.provider.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class RazorpayConfigTest {

    @Test
    void testStartupFailsLoudlyWhenRazorpayTestHasPlaceholderKeys() {
        RazorpayConfig config = new RazorpayConfig();
        ReflectionTestUtils.setField(config, "paymentProvider", "razorpay-test");
        ReflectionTestUtils.setField(config, "keyId", "rzp_test_mockKey");
        ReflectionTestUtils.setField(config, "keySecret", "mockSecret");

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateConfiguration);
        assertTrue(ex.getMessage().contains("FAIL-SAFE STARTUP BLOCKER"));
    }

    @Test
    void testStartupFailsLoudlyWhenRazorpayLiveHasBlankKeys() {
        RazorpayConfig config = new RazorpayConfig();
        ReflectionTestUtils.setField(config, "paymentProvider", "razorpay-live");
        ReflectionTestUtils.setField(config, "keyId", "");
        ReflectionTestUtils.setField(config, "keySecret", "");

        IllegalStateException ex = assertThrows(IllegalStateException.class, config::validateConfiguration);
        assertTrue(ex.getMessage().contains("FAIL-SAFE STARTUP BLOCKER"));
    }

    @Test
    void testStartupSucceedsWhenMockProviderActive() {
        RazorpayConfig config = new RazorpayConfig();
        ReflectionTestUtils.setField(config, "paymentProvider", "mock");
        ReflectionTestUtils.setField(config, "keyId", "rzp_test_mockKey");
        ReflectionTestUtils.setField(config, "keySecret", "mockSecret");

        assertDoesNotThrow(config::validateConfiguration);
    }
}
