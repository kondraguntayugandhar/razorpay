package com.thirdprd.payment.merchant;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MerchantRegistrationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testMerchantRegistrationFlow() throws Exception {
        Map<String, Object> registrationPayload = new HashMap<>();
        registrationPayload.put("businessName", "Meridian Home & Living Pvt Ltd");
        registrationPayload.put("businessType", "PRIVATE_LTD");
        registrationPayload.put("email", "contact@meridianhomeliving.in");
        registrationPayload.put("phone", "+91 9845123670");
        registrationPayload.put("password", "MeridianSecurePass2026!");
        registrationPayload.put("pan", "AAMCM4567K");
        registrationPayload.put("gstin", "29AAMCM4567K1ZP");
        registrationPayload.put("address", "142, 4th Cross, Indiranagar");
        registrationPayload.put("city", "Bengaluru");
        registrationPayload.put("state", "Karnataka");
        registrationPayload.put("pincode", "560038");
        registrationPayload.put("bankAccountNumber", "50100234567890");
        registrationPayload.put("ifscCode", "HDFC0001234");

        mockMvc.perform(post("/api/v1/merchant/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registrationPayload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.merchantId", startsWith("merch_FP")))
                .andExpect(jsonPath("$.data.businessName", is("Meridian Home & Living Pvt Ltd")))
                .andExpect(jsonPath("$.data.kycStatus", is("NOT_VERIFIED")))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }
}
