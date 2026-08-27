package com.thirdprd.payment.provider;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.provider.dto.PaymentRequest;
import com.thirdprd.payment.provider.dto.ProviderResponse;
import com.thirdprd.payment.provider.entity.ProviderHealth;
import com.thirdprd.payment.provider.entity.ProviderHealth.HealthStatus;
import com.thirdprd.payment.provider.event.ProviderFailoverEvent;
import com.thirdprd.payment.provider.repository.ProviderHealthRepository;
import com.thirdprd.payment.provider.router.ProviderRouter;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class ProviderRouterTest {

    private MockPaymentProvider primaryProvider;
    private MockPaymentProviderB secondaryProvider;
    private ProviderHealthRepository healthRepository;
    private ApplicationEventPublisher eventPublisher;
    private ProviderRouter router;

    @BeforeEach
    void setUp() {
        primaryProvider = new MockPaymentProvider();
        secondaryProvider = new MockPaymentProviderB();
        healthRepository = Mockito.mock(ProviderHealthRepository.class);
        eventPublisher = Mockito.mock(ApplicationEventPublisher.class);

        when(healthRepository.findByProvider(primaryProvider.getProviderName()))
                .thenReturn(Optional.of(ProviderHealth.builder().provider(primaryProvider.getProviderName()).status(HealthStatus.HEALTHY).build()));
        when(healthRepository.findByProvider(secondaryProvider.getProviderName()))
                .thenReturn(Optional.of(ProviderHealth.builder().provider(secondaryProvider.getProviderName()).status(HealthStatus.HEALTHY).build()));

        router = new ProviderRouter(primaryProvider, secondaryProvider, healthRepository, eventPublisher);
    }

    @Test
    void testSelectsHealthyPrimaryProviderByDefault() {
        PaymentProvider selected = router.selectHealthyProvider();
        assertNotNull(selected);
        assertEquals(MockPaymentProvider.MOCK_PROVIDER_NAME, selected.getProviderName());
    }

    @Test
    void testSelectsSecondaryProviderWhenPrimaryIsDown() {
        primaryProvider.setHealthy(false);
        when(healthRepository.findByProvider(primaryProvider.getProviderName()))
                .thenReturn(Optional.of(ProviderHealth.builder().provider(primaryProvider.getProviderName()).status(HealthStatus.DOWN).build()));

        PaymentProvider selected = router.selectHealthyProvider();
        assertNotNull(selected);
        assertEquals(MockPaymentProviderB.MOCK_PROVIDER_B_NAME, selected.getProviderName());

        List<ProviderFailoverEvent> failovers = router.getRecordedFailoverEvents();
        assertFalse(failovers.isEmpty());
        assertEquals(MockPaymentProvider.MOCK_PROVIDER_NAME, failovers.get(0).getPrimaryProvider());
        assertEquals(MockPaymentProviderB.MOCK_PROVIDER_B_NAME, failovers.get(0).getFallbackProvider());
    }

    @Test
    void testCircuitBreakerOpensAndRoutesToFallback() {
        // Force primary provider calls to fail to trigger circuit breaker threshold
        MockPaymentProvider spyPrimary = Mockito.spy(primaryProvider);
        Mockito.doThrow(new RuntimeException("Gateway connection reset")).when(spyPrimary).createPayment(any());

        ProviderRouter spyRouter = new ProviderRouter(spyPrimary, secondaryProvider, healthRepository, eventPublisher);

        PaymentRequest request = PaymentRequest.builder()
                .paymentId(UUID.randomUUID())
                .orderId(UUID.randomUUID())
                .merchantId(UUID.randomUUID())
                .amount(1000L)
                .currency("INR")
                .method("CARD")
                .build();

        // 1st call fails primary -> triggers failover to secondary
        ProviderResponse resp1 = spyRouter.createPayment(request);
        assertTrue(resp1.isSuccess());

        // 2nd call fails primary -> triggers failover
        ProviderResponse resp2 = spyRouter.createPayment(request);
        assertTrue(resp2.isSuccess());

        CircuitBreaker cb = spyRouter.getCircuitBreaker(primaryProvider.getProviderName());
        assertNotNull(cb);

        List<ProviderFailoverEvent> failovers = spyRouter.getRecordedFailoverEvents();
        assertTrue(failovers.size() >= 2);
    }
}
