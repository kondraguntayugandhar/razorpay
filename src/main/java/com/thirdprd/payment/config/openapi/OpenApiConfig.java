package com.thirdprd.payment.config.openapi;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        SecurityScheme bearerAuthScheme = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("HMAC-SHA256 Merchant Session JWT Token");

        SecurityScheme apiKeyScheme = new SecurityScheme()
                .type(SecurityScheme.Type.APIKEY)
                .in(SecurityScheme.In.HEADER)
                .name("X-API-KEY")
                .description("Merchant Server-Side API Secret Key");

        return new OpenAPI()
                .info(new Info()
                        .title("FastPay Payment Gateway & Merchant Platform API")
                        .version("v1.0.0")
                        .description("Production-grade payment gateway API supporting UPI, Card, Netbanking, Idempotent Refunds, Webhooks Engine, and Merchant Platform Dashboard.")
                        .contact(new Contact()
                                .name("FastPay Engineering Team")
                                .email("engineering@fastpay.dev"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://api.fastpay.dev").description("Production Server")
                ))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", bearerAuthScheme)
                        .addSecuritySchemes("ApiKeyAuth", apiKeyScheme))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth").addList("ApiKeyAuth"));
    }
}
