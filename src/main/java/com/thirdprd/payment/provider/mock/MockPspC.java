package com.thirdprd.payment.provider.mock;

import org.springframework.stereotype.Component;

@Component("mockPspC")
public class MockPspC extends AbstractMockPsp {
    public MockPspC() {
        super("PSP_C", "Mock PSP-C (Cost Optimized)", 0.90, 500);
    }
}
