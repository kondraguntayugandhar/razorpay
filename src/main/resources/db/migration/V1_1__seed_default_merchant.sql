INSERT INTO merchants (id, name, email, status)
VALUES ('11111111-1111-1111-1111-111111111111', 'Acme Store', 'merchant@acme.com', 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO merchant_api_keys (id, merchant_id, key_id, key_secret_hash, is_test_mode)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'rzp_test_acme_key_001', 'hash_secret_001', TRUE)
ON CONFLICT DO NOTHING;
