-- V7__post_split_indexes.sql
-- PostgreSQL Accountant Datastore - Add operational indexes for core financial tables
CREATE INDEX IF NOT EXISTS idx_payments_status_updated ON payments(status, updated_at);
CREATE INDEX IF NOT EXISTS idx_orders_merchant_id ON orders(merchant_id);
