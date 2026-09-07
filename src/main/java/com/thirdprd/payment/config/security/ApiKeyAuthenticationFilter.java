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
    private final JwtService jwtService;

    public ApiKeyAuthenticationFilter(MerchantApiKeyRepository apiKeyRepository, JwtService jwtService) {
        this.apiKeyRepository = apiKeyRepository;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();

            if (token.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\":false,\"error\":{\"code\":\"UNAUTHORIZED\",\"message\":\"Empty Authorization bearer key. Please log in.\"}}");
                return;
            }

            if (jwtService != null && jwtService.validateToken(token)) {
                String merchantIdStr = jwtService.getMerchantIdFromToken(token);
                java.util.UUID merchantId = (merchantIdStr != null) ? java.util.UUID.fromString(merchantIdStr) : java.util.UUID.fromString("2441365e-670a-4957-b3cd-fdf7375c8474");
                MerchantAuthenticationToken authToken = new MerchantAuthenticationToken(
                        merchantId,
                        token,
                        List.of(new SimpleGrantedAuthority("ROLE_MERCHANT"))
                );
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                Optional<MerchantApiKey> keyOptional = apiKeyRepository.findByKeyIdAndRevokedAtIsNull(token);
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
        }

        filterChain.doFilter(request, response);
    }
}
