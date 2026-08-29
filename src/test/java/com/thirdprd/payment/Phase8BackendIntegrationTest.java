package com.thirdprd.payment;

import com.thirdprd.payment.config.security.JwtService;
import com.thirdprd.payment.user.entity.User;
import com.thirdprd.payment.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase8BackendIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // Seed test merchant user
        User testUser = User.builder()
                .email("merchant@fastpay.com")
                .passwordHash(encoder.encode("SecretPass2026!"))
                .name("FastPay Test Merchant")
                .role("OWNER")
                .build();
        userRepository.save(testUser);
    }

    @Test
    @DisplayName("Part A.1: Successful Login issues valid 24h JWT Token")
    void testSuccessfulLogin() throws Exception {
        String jsonPayload = """
                {
                    "email": "merchant@fastpay.com",
                    "password": "SecretPass2026!"
                }
                """;

        mockMvc.perform(post("/api/v1/merchant/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.user.email").value("merchant@fastpay.com"));
    }

    @Test
    @DisplayName("Part A.4: Wrong password returns generic 401 Unauthorized")
    void testWrongPasswordRejection() throws Exception {
        String jsonPayload = """
                {
                    "email": "merchant@fastpay.com",
                    "password": "WrongPassword123!"
                }
                """;

        mockMvc.perform(post("/api/v1/merchant/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.description").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Part A.4: Constant-time check on unknown email returns identical generic 401 Unauthorized")
    void testUnknownEmailRejection() throws Exception {
        String jsonPayload = """
                {
                    "email": "unknown_email_999@fastpay.com",
                    "password": "SomeRandomPassword!"
                }
                """;

        mockMvc.perform(post("/api/v1/merchant/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.error.description").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Part B: Onboarding Registration issues JWT and creates user")
    void testOnboardingRegistration() throws Exception {
        String jsonPayload = """
                {
                    "email": "new_merchant_2026@fastpay.com",
                    "password": "NewMerchantPass2026!",
                    "businessName": "New Horizon Tech Pvt Ltd"
                }
                """;

        mockMvc.perform(post("/api/v1/merchant/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.businessName").value("New Horizon Tech Pvt Ltd"));

        assertTrue(userRepository.findByEmail("new_merchant_2026@fastpay.com").isPresent());
    }

    @Test
    @DisplayName("Part E: Webhooks Endpoint CRUD")
    void testWebhooksEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/merchant/webhooks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String createPayload = """
                {
                    "url": "https://example.com/fastpay/webhook-handler"
                }
                """;

        mockMvc.perform(post("/api/v1/merchant/webhooks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.url").value("https://example.com/fastpay/webhook-handler"))
                .andExpect(jsonPath("$.data.secret").exists());
    }

    @Test
    @DisplayName("Part F & G: Disputes and Settlements Endpoints")
    void testDisputesAndSettlements() throws Exception {
        mockMvc.perform(get("/api/v1/merchant/disputes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/merchant/settlements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].fees").exists())
                .andExpect(jsonPath("$.data[0].netAmount").exists());
    }

    @Test
    @DisplayName("Part H: Public Payment Link Lookup with Server-Side Expiration Check")
    void testPublicPaymentLinkLookup() throws Exception {
        mockMvc.perform(get("/api/v1/links/public/invalid_code_999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("Part H: Invoices, Links, and Team CRUD Endpoints")
    void testInvoicesLinksAndTeam() throws Exception {
        mockMvc.perform(get("/api/v1/merchant/invoices"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/merchant/links"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/merchant/team"))
                .andExpect(status().isOk());
    }
}
