package com.hireguard.externalservices;

import com.hireguard.dto.response.CompanyRegistrationResult;
import com.hireguard.externalservices.provider.impl.McaCompanyRegistrationProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

class CompanyRegistrationServiceTest {

    private CompanyRegistrationService registrationService;

    @BeforeEach
    void setUp() {
        McaCompanyRegistrationProvider provider = new McaCompanyRegistrationProvider(new RestTemplate());
        registrationService = new CompanyRegistrationService(provider);
    }

    @Test
    void testUnconfiguredProviderReturnsUnavailable() {
        CompanyRegistrationResult result = registrationService.verifyCompanyRegistration("ABC Tech", "U12345");
        assertNotNull(result);
        assertFalse(result.isVerified());
        assertEquals("VERIFICATION_UNAVAILABLE", result.getStatus());
        assertEquals(0, result.getRiskScore());
        assertTrue(result.getReasons().get(0).contains("not configured"));
    }
}
