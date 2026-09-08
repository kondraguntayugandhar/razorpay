-- V11__reliability_hardening.sql
-- FastPay 2.1: Reliability & Production Hardening Schema Updates

-- 1. OPTIMISTIC LOCKING VERSION COLUMNS
ALTER TABLE payments ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;
ALTER TABLE refunds ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0 NOT NULL;

-- 2. INBOUND WEBHOOK EVENTS DEDUPLICATION
CREATE TABLE IF NOT EXISTS webhook_inbound_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(100) NOT NULL,
    payload_hash VARCHAR(64) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_webhook_inbound UNIQUE (provider, provider_event_id)
);

-- 3. REFUND EXECUTION ATTEMPTS
CREATE TABLE IF NOT EXISTS refund_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id VARCHAR(64) UNIQUE NOT NULL,
    refund_id UUID NOT NULL REFERENCES refunds(id),
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL,
    latency_ms INT DEFAULT 0,
    error_code VARCHAR(50),
    error_description VARCHAR(255),
    provider_reference VARCHAR(100),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 4. PERFORMANCE & CONCURRENCY INDEXES
CREATE INDEX IF NOT EXISTS idx_payments_merchant_status ON payments(merchant_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_status ON refunds(payment_id, status);
CREATE INDEX IF NOT EXISTS idx_refund_attempts_refund ON refund_attempts(refund_id);
CREATE INDEX IF NOT EXISTS idx_webhook_inbound_created ON webhook_inbound_events(created_at);
