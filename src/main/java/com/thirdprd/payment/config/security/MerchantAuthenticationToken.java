package com.thirdprd.payment.config.security;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;
import java.util.UUID;

public class MerchantAuthenticationToken extends AbstractAuthenticationToken {

    private final UUID merchantId;
    private final String keyId;

    public MerchantAuthenticationToken(UUID merchantId, String keyId, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.merchantId = merchantId;
        this.keyId = keyId;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return keyId;
    }

    @Override
    public Object getPrincipal() {
        return merchantId;
    }

    public UUID getMerchantId() {
        return merchantId;
    }

    public String getKeyId() {
        return keyId;
    }
}
