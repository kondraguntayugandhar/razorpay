package com.thirdprd.payment.provider.event;

import java.time.Instant;

public class ProviderFailoverEvent {

    private final String primaryProvider;
    private final String fallbackProvider;
    private final String reason;
    private final Instant timestamp;

    public ProviderFailoverEvent(String primaryProvider, String fallbackProvider, String reason) {
        this.primaryProvider = primaryProvider;
        this.fallbackProvider = fallbackProvider;
        this.reason = reason;
        this.timestamp = Instant.now();
    }

    public String getPrimaryProvider() {
        return primaryProvider;
    }

    public String getFallbackProvider() {
        return fallbackProvider;
    }

    public String getReason() {
        return reason;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    @Override
    public String toString() {
        return "ProviderFailoverEvent{" +
                "primaryProvider='" + primaryProvider + '\'' +
                ", fallbackProvider='" + fallbackProvider + '\'' +
                ", reason='" + reason + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
