package com.thirdprd.payment.provider.mock;

import com.thirdprd.payment.common.enums.PaymentStatus;
import com.thirdprd.payment.common.exception.BusinessException;
import com.thirdprd.payment.common.enums.ErrorCode;
import com.thirdprd.payment.provider.PaymentProvider;
import com.thirdprd.payment.provider.dto.*;
import com.thirdprd.payment.provider.simulation.SimulatedPaymentProvider;
import com.thirdprd.payment.provider.simulation.SimulationMode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

public abstract class AbstractMockPsp implements PaymentProvider, SimulatedPaymentProvider {

    protected final Logger log = LoggerFactory.getLogger(getClass());

    protected final String providerCode;
    protected final String providerName;
    protected final double targetSuccessRate;
    protected final int targetAvgLatencyMs;

    protected volatile SimulationMode simulationMode = SimulationMode.NORMAL;
    protected volatile int injectedLatencyMs = 0;
    protected volatile boolean healthy = true;
    protected volatile PaymentStatus simulatedTimeoutResolution = PaymentStatus.UNKNOWN;

    protected final Map<String, PaymentRecord> transactionStore = new ConcurrentHashMap<>();

    protected static class PaymentRecord {
        final String providerPaymentId;
        PaymentStatus status;
        final Long amount;
        final String currency;
        String errorCode;
        String errorDescription;

        PaymentRecord(String providerPaymentId, PaymentStatus status, Long amount, String currency, String errorCode, String errorDescription) {
            this.providerPaymentId = providerPaymentId;
            this.status = status;
            this.amount = amount;
            this.currency = currency;
            this.errorCode = errorCode;
            this.errorDescription = errorDescription;
        }
    }

    public AbstractMockPsp(String providerCode, String providerName, double targetSuccessRate, int targetAvgLatencyMs) {
        this.providerCode = providerCode;
        this.providerName = providerName;
        this.targetSuccessRate = targetSuccessRate;
        this.targetAvgLatencyMs = targetAvgLatencyMs;
    }

    @Override
    public String getProviderCode() {
        return providerCode;
    }

    @Override
    public String getProviderName() {
        return providerCode;
    }

    public String getDisplayName() {
        return providerName;
    }

    @Override
    public SimulationMode getSimulationMode() {
        return simulationMode;
    }

    @Override
    public void setSimulationMode(SimulationMode mode) {
        this.simulationMode = mode;
        if (mode == SimulationMode.OUTAGE) {
            this.healthy = false;
        } else if (!this.healthy && mode == SimulationMode.NORMAL) {
            this.healthy = true;
        }
    }

    @Override
    public int getInjectedLatencyMs() {
        return injectedLatencyMs;
    }

    @Override
    public void setInjectedLatencyMs(int latencyMs) {
        this.injectedLatencyMs = latencyMs;
    }

    @Override
    public double getTargetSuccessRate() {
        return targetSuccessRate;
    }

    @Override
    public int getTargetAvgLatencyMs() {
        return targetAvgLatencyMs;
    }

    @Override
    public void setHealthy(boolean healthy) {
        this.healthy = healthy;
        if (!healthy) {
            this.simulationMode = SimulationMode.OUTAGE;
        } else if (this.simulationMode == SimulationMode.OUTAGE) {
            this.simulationMode = SimulationMode.NORMAL;
        }
    }

    @Override
    public boolean isHealthy() {
        return healthy && simulationMode != SimulationMode.OUTAGE;
    }

    public void setSimulatedTimeoutResolution(PaymentStatus status) {
        this.simulatedTimeoutResolution = status;
    }

    public PaymentStatus getSimulatedTimeoutResolution() {
        return this.simulatedTimeoutResolution;
    }

    @Override
    public void resetSimulation() {
        this.simulationMode = SimulationMode.NORMAL;
        this.injectedLatencyMs = 0;
        this.healthy = true;
        this.simulatedTimeoutResolution = PaymentStatus.UNKNOWN;
    }

    protected void simulateDelay() {
        int delay = injectedLatencyMs > 0 ? injectedLatencyMs : Math.min(targetAvgLatencyMs / 5, 100);
        if (simulationMode == SimulationMode.SLOW_RESPONSE) {
            delay = Math.max(delay, 2000);
        }
        if (delay > 0) {
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    @Override
    public ProviderResponse createPayment(PaymentRequest request) {
        simulateDelay();

        if (!isHealthy()) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, providerCode + " is OUTAGE / UNAVAILABLE");
        }

        if (simulationMode == SimulationMode.FORCE_TIMEOUT) {
            log.warn("[{}] Simulating upstream timeout for payment", providerCode);
            String providerPaymentId = "pay_" + providerCode.toLowerCase() + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            PaymentRecord timeoutRecord = new PaymentRecord(providerPaymentId, simulatedTimeoutResolution,
                    request != null ? request.getAmount() : 0L,
                    request != null ? request.getCurrency() : "INR",
                    simulatedTimeoutResolution == PaymentStatus.FAILED ? "PSP_DECLINED" : null,
                    simulatedTimeoutResolution == PaymentStatus.FAILED ? "Transaction declined on upstream gateway" : null);
            transactionStore.put(providerPaymentId, timeoutRecord);
            if (request != null && request.getPaymentId() != null) {
                transactionStore.put(request.getPaymentId().toString(), timeoutRecord);
            }
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "GATEWAY_TIMEOUT: Upstream provider " + providerCode + " timed out");
        }

        String providerPaymentId = "pay_" + providerCode.toLowerCase() + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        // Check explicit notes simulation if passed
        String noteSimulate = null;
        if (request != null && request.getNotes() != null && request.getNotes().containsKey("simulate")) {
            noteSimulate = String.valueOf(request.getNotes().get("simulate"));
        }

        PaymentStatus outcomeStatus;
        String errorCode = null;
        String errorDescription = null;

        if ("fail".equalsIgnoreCase(noteSimulate) || simulationMode == SimulationMode.FORCE_FAILURE) {
            outcomeStatus = PaymentStatus.FAILED;
            errorCode = "BANK_DECLINED";
            errorDescription = "Simulated bank card decline by " + providerCode;
        } else if ("timeout".equalsIgnoreCase(noteSimulate) || simulationMode == SimulationMode.FORCE_UNKNOWN) {
            outcomeStatus = PaymentStatus.UNKNOWN;
            errorCode = "TRANSACTION_UNKNOWN";
            errorDescription = "Upstream response indeterminate, status UNKNOWN";
        } else if ("pending".equalsIgnoreCase(noteSimulate) || (request != null && "collect".equalsIgnoreCase(request.getUpiFlow()))) {
            outcomeStatus = PaymentStatus.PENDING;
        } else if ("success".equalsIgnoreCase(noteSimulate) || simulationMode == SimulationMode.FORCE_SUCCESS) {
            outcomeStatus = PaymentStatus.SUCCESS;
        } else {
            // Realistic random SLA distribution
            double roll = ThreadLocalRandom.current().nextDouble();
            if (roll <= targetSuccessRate) {
                outcomeStatus = PaymentStatus.SUCCESS;
            } else {
                outcomeStatus = PaymentStatus.FAILED;
                errorCode = "PSP_PROCESSING_ERROR";
                errorDescription = "Transient network failure on " + providerCode;
            }
        }

        PaymentRecord record = new PaymentRecord(providerPaymentId, outcomeStatus,
                request != null ? request.getAmount() : 0L,
                request != null ? request.getCurrency() : "INR",
                errorCode, errorDescription);
        transactionStore.put(providerPaymentId, record);
        if (request != null && request.getPaymentId() != null) {
            transactionStore.put(request.getPaymentId().toString(), record);
        }

        boolean isSuccess = (outcomeStatus == PaymentStatus.SUCCESS || outcomeStatus == PaymentStatus.PENDING);
        return ProviderResponse.builder()
                .success(isSuccess)
                .providerPaymentId(providerPaymentId)
                .providerName(providerCode)
                .status(outcomeStatus)
                .errorCode(errorCode)
                .errorDescription(errorDescription)
                .vpa(request != null ? request.getVpa() : null)
                .rawProviderPayload(String.format("{\"provider\": \"%s\", \"status\": \"%s\"}", providerCode, outcomeStatus))
                .build();
    }

    @Override
    public ProviderStatusResponse getStatus(String providerPaymentId) {
        simulateDelay();
        PaymentRecord record = transactionStore.get(providerPaymentId);
        if (record == null) {
            return ProviderStatusResponse.builder()
                    .providerPaymentId(providerPaymentId)
                    .status(PaymentStatus.FAILED)
                    .errorCode("TRANSACTION_NOT_FOUND")
                    .errorDescription("Payment reference " + providerPaymentId + " not found on " + providerCode)
                    .build();
        }

        return ProviderStatusResponse.builder()
                .providerPaymentId(providerPaymentId)
                .status(record.status)
                .errorCode(record.errorCode)
                .errorDescription(record.errorDescription)
                .build();
    }

    public void setSimulatedStatus(String providerPaymentId, PaymentStatus status) {
        PaymentRecord record = transactionStore.get(providerPaymentId);
        if (record != null) {
            record.status = status;
        } else {
            transactionStore.put(providerPaymentId, new PaymentRecord(providerPaymentId, status, 0L, "INR", null, null));
        }
    }

    @Override
    public ProviderRefundResponse refund(RefundRequest request) {
        simulateDelay();
        if (simulationMode == SimulationMode.FORCE_TIMEOUT) {
            throw new BusinessException(ErrorCode.PAYMENT_FAILED, "GATEWAY_TIMEOUT: Refund timed out on provider " + providerCode);
        }

        String providerRefundId = "ref_" + providerCode.toLowerCase() + "_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        if (!isHealthy() || simulationMode == SimulationMode.FORCE_FAILURE) {
            return ProviderRefundResponse.builder()
                    .success(false)
                    .errorCode("REFUND_DECLINED")
                    .errorDescription("Refund declined by provider " + providerCode)
                    .build();
        }

        return ProviderRefundResponse.builder()
                .success(true)
                .providerRefundId(providerRefundId)
                .build();
    }
}
