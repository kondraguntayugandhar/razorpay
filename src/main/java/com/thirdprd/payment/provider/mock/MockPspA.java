package com.thirdprd.payment.provider.mock;

import org.springframework.stereotype.Component;

@Component("mockPspA")
public class MockPspA extends AbstractMockPsp {
    public MockPspA() {
        super("PSP_A", "Mock PSP-A (High Reliability)", 0.98, 300);
    }
}
