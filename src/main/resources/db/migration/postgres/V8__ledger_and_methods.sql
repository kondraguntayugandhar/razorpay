-- V8__ledger_and_methods.sql
-- Financial ledger, payment methods, settlements, and performance indexes

CREATE TABLE IF NOT EXISTS merchant_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ENABLED',
    configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_merchant_payment_method UNIQUE (merchant_id, method)
);

CREATE INDEX IF NOT EXISTS idx_merchant_payment_methods_merchant ON merchant_payment_methods(merchant_id);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ledger_entry_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    payment_id UUID REFERENCES payments(id),
    refund_id UUID REFERENCES refunds(id),
    order_id UUID,
    type VARCHAR(32) NOT NULL,
    amount BIGINT NOT NULL,
    fee BIGINT NOT NULL DEFAULT 0,
    gst BIGINT NOT NULL DEFAULT 0,
    net_amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    balance_after BIGINT NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_merchant_created ON ledger_entries(merchant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_payment_id ON ledger_entries(payment_id);
CREATE INDEX IF NOT EXISTS idx_ledger_refund_id ON ledger_entries(refund_id);

CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    gross_amount BIGINT NOT NULL,
    fees BIGINT NOT NULL DEFAULT 0,
    gst BIGINT NOT NULL DEFAULT 0,
    refunds BIGINT NOT NULL DEFAULT 0,
    net_amount BIGINT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    utr VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_settlements_merchant_date ON settlements(merchant_id, settlement_date);

-- Composite Performance Indexes for PostgreSQL OLTP
CREATE INDEX IF NOT EXISTS idx_payments_merchant_status_created ON payments(merchant_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_refunds_payment_status ON refunds(payment_id, status);
