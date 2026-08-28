CREATE TABLE provider_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'HEALTHY',
    last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    consecutive_failures INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO provider_health (provider, status) VALUES ('MOCK_PROVIDER', 'HEALTHY');
INSERT INTO provider_health (provider, status) VALUES ('MOCK_PROVIDER_B', 'HEALTHY');
