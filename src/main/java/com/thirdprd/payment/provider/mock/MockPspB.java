package com.thirdprd.payment.provider.mock;

import org.springframework.stereotype.Component;

@Component("mockPspB")
public class MockPspB extends AbstractMockPsp {
    public MockPspB() {
        super("PSP_B", "Mock PSP-B (Low Latency)", 0.95, 200);
    }
}
