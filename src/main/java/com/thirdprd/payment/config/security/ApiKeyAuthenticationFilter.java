package com.thirdprd.payment.config.security;

import com.thirdprd.payment.merchant.entity.MerchantApiKey;
import com.thirdprd.payment.merchant.repository.MerchantApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final MerchantApiKeyRepository apiKeyRepository;

    public ApiKeyAuthenticationFilter(MerchantApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String apiKey = authHeader.substring(7).trim();

            Optional<MerchantApiKey> keyOptional = apiKeyRepository.findByKeyIdAndRevokedAtIsNull(apiKey);
            if (keyOptional.isPresent()) {
                MerchantApiKey merchantApiKey = keyOptional.get();
                MerchantAuthenticationToken authToken = new MerchantAuthenticationToken(
                        merchantApiKey.getMerchantId(),
                        merchantApiKey.getKeyId(),
                        List.of(new SimpleGrantedAuthority("ROLE_MERCHANT"))
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}
