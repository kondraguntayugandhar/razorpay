-- V5__upi_support.sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS upi_reference_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS vpa VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_payments_upi_reference_id ON payments(upi_reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_vpa ON payments(vpa);
