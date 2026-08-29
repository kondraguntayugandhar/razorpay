-- V9__seed_demo_data.sql
-- Seed default merchant, 20 popular banks, customers, payments, and 1,248 API log records for exact frontend pagination

-- 1. SEED DEFAULT MERCHANT
INSERT INTO merchants (id, name, email, status, created_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'FastCart Technologies Pvt Ltd', 'admin@fastcart.com', 'ACTIVE', now())
ON CONFLICT (id) DO NOTHING;

-- 2. SEED 20 INDIAN BANKS
INSERT INTO banks (bank_id, name, short_name, bank_code, bank_type, status)
VALUES
('sbi', 'State Bank of India', 'SBI', 'SBI', 'Public', 'Enabled'),
('hdfc', 'HDFC Bank', 'HDFC', 'HDFC', 'Private', 'Enabled'),
('icici', 'ICICI Bank', 'ICICI', 'ICICI', 'Private', 'Enabled'),
('axis', 'Axis Bank', 'Axis', 'AXIS', 'Private', 'Enabled'),
('kotak', 'Kotak Mahindra Bank', 'Kotak', 'KOTAK', 'Private', 'Enabled'),
('bob', 'Bank of Baroda', 'Bank of Baroda', 'BOB', 'Public', 'Enabled'),
('pnb', 'Punjab National Bank', 'PNB', 'PNB', 'Public', 'Enabled'),
('union', 'Union Bank of India', 'Union Bank', 'UNION', 'Public', 'Enabled'),
('canara', 'Canara Bank', 'Canara', 'CANARA', 'Public', 'Enabled'),
('indian', 'Indian Bank', 'Indian Bank', 'INDIAN', 'Public', 'Enabled'),
('boi', 'Bank of India', 'Bank of India', 'BOI', 'Public', 'Enabled'),
('idbi', 'IDBI Bank', 'IDBI', 'IDBI', 'Private', 'Enabled'),
('indusind', 'IndusInd Bank', 'IndusInd', 'INDUSIND', 'Private', 'Enabled'),
('bom', 'Bank of Maharashtra', 'Bank of Maharashtra', 'BOM', 'Public', 'Enabled'),
('cbi', 'Central Bank of India', 'Central Bank', 'CBI', 'Public', 'Enabled'),
('iob', 'Indian Overseas Bank', 'IOB', 'IOB', 'Public', 'Enabled'),
('uco', 'UCO Bank', 'UCO Bank', 'UCO', 'Public', 'Enabled'),
('federal', 'Federal Bank', 'Federal Bank', 'FEDERAL', 'Private', 'Enabled'),
('yes', 'YES BANK', 'YES BANK', 'YES', 'Private', 'Enabled'),
('idfcfirst', 'IDFC FIRST Bank', 'IDFC FIRST', 'IDFCFIRST', 'Private', 'Enabled')
ON CONFLICT (bank_id) DO NOTHING;

-- 3. SEED CUSTOMER RAHUL SHARMA
INSERT INTO customers (id, merchant_id, email, phone, created_at)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'rahul.sharma@example.com', '+91 98765 43210', now())
ON CONFLICT (id) DO NOTHING;

-- 4. SEED SAMPLE API LOGS (Generate series up to 1,248 entries for accurate backend pagination)
INSERT INTO api_logs (id, request_id, merchant_id, environment, method, endpoint, status_code, amount, latency_ms, created_at)
SELECT
    gen_random_uuid(),
    'req_FP' || (839200 + i),
    '11111111-1111-1111-1111-111111111111',
    CASE WHEN i % 5 = 0 THEN 'TEST' ELSE 'LIVE' END,
    CASE WHEN i % 3 = 0 THEN 'POST' WHEN i % 4 = 0 THEN 'DELETE' ELSE 'GET' END,
    CASE WHEN i % 2 = 0 THEN '/api/v1/orders' ELSE '/api/v1/payments' END,
    CASE WHEN i % 10 = 0 THEN 400 WHEN i % 25 = 0 THEN 500 ELSE 200 END,
    '₹' || (500 + (i * 12)),
    45 + (i % 200),
    now() - (i || ' minutes')::interval
FROM generate_series(1, 1248) AS i
ON CONFLICT (request_id) DO NOTHING;
