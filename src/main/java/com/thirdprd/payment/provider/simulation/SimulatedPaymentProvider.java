package com.thirdprd.payment.provider.simulation;

public interface SimulatedPaymentProvider {
    String getProviderCode();
    SimulationMode getSimulationMode();
    void setSimulationMode(SimulationMode mode);
    int getInjectedLatencyMs();
    void setInjectedLatencyMs(int latencyMs);
    double getTargetSuccessRate();
    int getTargetAvgLatencyMs();
    void resetSimulation();
    void setHealthy(boolean healthy);
}
