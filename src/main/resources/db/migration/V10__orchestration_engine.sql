-- V10__orchestration_engine.sql
-- FastPay 2.0: Payment Orchestration, Smart Routing & Multi-Provider Infrastructure

-- 1. PAYMENT PROVIDERS CATALOG
CREATE TABLE IF NOT EXISTS payment_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    priority INT NOT NULL DEFAULT 10,
    base_fee_paise BIGINT NOT NULL DEFAULT 0,
    percentage_fee NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    supported_methods JSONB NOT NULL DEFAULT '["CARD", "UPI", "NETBANKING"]'::jsonb,
    configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. SMART ROUTING RULES
CREATE TABLE IF NOT EXISTS routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    merchant_id UUID REFERENCES merchants(id),
    payment_method VARCHAR(50),
    min_amount BIGINT DEFAULT 0,
    max_amount BIGINT DEFAULT 100000000,
    target_provider VARCHAR(50) NOT NULL,
    priority INT NOT NULL DEFAULT 1,
    weight INT NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    conditions JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ROUTING DECISIONS AUDIT
CREATE TABLE IF NOT EXISTS routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_id VARCHAR(64) UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    chosen_provider VARCHAR(50) NOT NULL,
    rule_applied_id UUID REFERENCES routing_rules(id),
    algorithm VARCHAR(50) NOT NULL DEFAULT 'WEIGHTED_MULTI_FACTOR',
    scores_json JSONB NOT NULL,
    reasons TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. EXTEND PAYMENT ATTEMPTS
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS attempt_number INT DEFAULT 1;
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS latency_ms INT DEFAULT 0;
ALTER TABLE payment_attempts ADD COLUMN IF NOT EXISTS is_safe_failover BOOLEAN DEFAULT FALSE;

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_routing_rules_merchant ON routing_rules(merchant_id);
CREATE INDEX IF NOT EXISTS idx_routing_rules_method ON routing_rules(payment_method);
CREATE INDEX IF NOT EXISTS idx_routing_decisions_payment ON routing_decisions(payment_id);
CREATE INDEX IF NOT EXISTS idx_routing_decisions_merchant ON routing_decisions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment ON payment_attempts(payment_id);

-- 6. SEED DEFAULT PAYMENT PROVIDERS
INSERT INTO payment_providers (provider_code, name, is_active, priority, base_fee_paise, percentage_fee, supported_methods)
VALUES 
    ('PSP_A', 'Mock PSP-A (High Reliability)', TRUE, 10, 500, 1.50, '["CARD", "UPI", "NETBANKING", "WALLET"]'::jsonb),
    ('PSP_B', 'Mock PSP-B (Low Latency)', TRUE, 9, 300, 1.20, '["CARD", "UPI", "NETBANKING", "EMI"]'::jsonb),
    ('PSP_C', 'Mock PSP-C (Cost Optimized)', TRUE, 8, 200, 0.90, '["CARD", "UPI", "NETBANKING"]'::jsonb),
    ('RAZORPAY', 'Razorpay Production Gateway', TRUE, 5, 400, 2.00, '["CARD", "UPI", "NETBANKING"]'::jsonb),
    ('UPI_QR', 'FastPay Native UPI QR Engine', TRUE, 7, 0, 0.00, '["UPI"]'::jsonb)
ON CONFLICT (provider_code) DO NOTHING;

-- 7. SEED INITIAL PROVIDER HEALTH ROWS
INSERT INTO provider_health (provider, status, consecutive_failures)
VALUES 
    ('PSP_A', 'HEALTHY', 0),
    ('PSP_B', 'HEALTHY', 0),
    ('PSP_C', 'HEALTHY', 0)
ON CONFLICT (provider) DO NOTHING;

-- 8. SEED BASELINE ROUTING RULES
INSERT INTO routing_rules (name, payment_method, min_amount, max_amount, target_provider, priority, weight, is_active)
VALUES 
    ('UPI Routing Rule to PSP-A', 'UPI', 0, 5000000, 'PSP_A', 1, 100, TRUE),
    ('Card Low Latency Routing to PSP-B', 'CARD', 0, 5000000, 'PSP_B', 2, 100, TRUE),
    ('High Value Transactions to Cost-Optimized PSP-C', NULL, 500000, 100000000, 'PSP_C', 3, 80, TRUE)
ON CONFLICT DO NOTHING;

-- 9. PAYMENT STATE TRANSITIONS AUDIT VIEW
CREATE OR REPLACE VIEW payment_state_transitions AS 
SELECT id, payment_id, from_status, to_status, reason, created_at 
FROM payment_events;
