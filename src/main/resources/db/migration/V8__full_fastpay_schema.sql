-- V8__full_fastpay_schema.sql
-- Production-grade Schema for FastPay Payment Gateway

-- 1. USERS & AUTHENTICATION
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'OWNER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_mobile_verified BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL DEFAULT 'OWNER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(merchant_id, user_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PAYMENT ATTEMPTS
CREATE TABLE IF NOT EXISTS payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id VARCHAR(64) UNIQUE NOT NULL,
    payment_id UUID NOT NULL REFERENCES payments(id),
    method VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL,
    failure_code VARCHAR(50),
    failure_reason VARCHAR(255),
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    provider_reference VARCHAR(100),
    metadata JSONB
);

-- 3. FINANCIAL TRANSACTIONS (APPEND ONLY)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    payment_id UUID REFERENCES payments(id),
    order_id UUID REFERENCES orders(id),
    type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    fee BIGINT NOT NULL DEFAULT 0,
    gst BIGINT NOT NULL DEFAULT 0,
    net_amount BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
    reference VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. PAYMENT METHODS & BANKS
CREATE TABLE IF NOT EXISTS merchant_payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    method VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ENABLED',
    configuration JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(merchant_id, method)
);

CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    bank_type VARCHAR(50) NOT NULL DEFAULT 'Private',
    status VARCHAR(30) NOT NULL DEFAULT 'Enabled',
    logo_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PAYMENT LINKS & INVOICES
CREATE TABLE IF NOT EXISTS payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_link_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    customer_id UUID REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    short_code VARCHAR(50) UNIQUE NOT NULL,
    allow_partial_payment BOOLEAN NOT NULL DEFAULT FALSE,
    amount_collected BIGINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    customer_id UUID REFERENCES customers(id),
    payment_link_id UUID REFERENCES payment_links(id),
    invoice_number VARCHAR(100) NOT NULL,
    subtotal BIGINT NOT NULL,
    discount BIGINT NOT NULL DEFAULT 0,
    tax BIGINT NOT NULL DEFAULT 0,
    total BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SETTLEMENTS & DISPUTES
CREATE TABLE IF NOT EXISTS settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    settlement_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    gross_amount BIGINT NOT NULL,
    fees BIGINT NOT NULL DEFAULT 0,
    gst BIGINT NOT NULL DEFAULT 0,
    refunds BIGINT NOT NULL DEFAULT 0,
    adjustments BIGINT NOT NULL DEFAULT 0,
    net_amount BIGINT NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'PROCESSED',
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    payment_id UUID NOT NULL REFERENCES payments(id),
    customer_id UUID REFERENCES customers(id),
    amount BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEEDS_RESPONSE',
    response_deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. WEBHOOKS & DELIVERIES
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    url VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    secret_encrypted VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id VARCHAR(64) UNIQUE NOT NULL,
    webhook_id UUID NOT NULL REFERENCES webhooks(id),
    event_id VARCHAR(64) NOT NULL,
    attempt_number INT NOT NULL DEFAULT 1,
    http_status INT,
    response_body TEXT,
    response_time INT,
    status VARCHAR(30) NOT NULL DEFAULT 'DELIVERED',
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. API LOGS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID REFERENCES merchants(id),
    user_id UUID,
    environment VARCHAR(20) NOT NULL DEFAULT 'LIVE',
    method VARCHAR(10) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_code INT NOT NULL,
    amount VARCHAR(50),
    latency_ms INT NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    request_headers JSONB,
    request_body JSONB,
    response_headers JSONB,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id VARCHAR(64) UNIQUE NOT NULL,
    merchant_id UUID REFERENCES merchants(id),
    user_id UUID,
    user_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(50),
    user_agent TEXT,
    before_data JSONB,
    after_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. KYC & BANK ACCOUNTS
CREATE TABLE IF NOT EXISTS merchant_kyc (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID UNIQUE NOT NULL REFERENCES merchants(id),
    status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    business_name VARCHAR(255),
    legal_name VARCHAR(255),
    business_type VARCHAR(50),
    pan VARCHAR(20),
    gstin VARCHAR(30),
    verification_level VARCHAR(30) DEFAULT 'FULL',
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS merchant_bank_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    account_holder_name VARCHAR(255) NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_number_encrypted VARCHAR(255) NOT NULL,
    account_number_last4 VARCHAR(4) NOT NULL,
    ifsc_encrypted VARCHAR(255) NOT NULL,
    ifsc_masked VARCHAR(20) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'VERIFIED',
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
CREATE INDEX IF NOT EXISTS idx_orders_merchant ON orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_customers_merchant ON customers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_merchant ON api_logs(merchant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_merchant ON audit_logs(merchant_id);
