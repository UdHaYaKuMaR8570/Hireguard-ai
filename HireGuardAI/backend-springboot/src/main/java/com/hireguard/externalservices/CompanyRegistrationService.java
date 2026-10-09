package com.hireguard.externalservices;

import com.hireguard.dto.response.CompanyRegistrationResult;
import com.hireguard.externalservices.provider.CompanyRegistrationProvider;
import org.springframework.stereotype.Service;

/**
 * External Service: CompanyRegistrationService
 * Orchestrates company government registration checks across configured providers.
 */
@Service
public class CompanyRegistrationService {

    private final CompanyRegistrationProvider registrationProvider;

    public CompanyRegistrationService(CompanyRegistrationProvider registrationProvider) {
        this.registrationProvider = registrationProvider;
    }

    public CompanyRegistrationResult verifyCompanyRegistration(String companyName, String registrationNumber) {
        if (companyName == null || companyName.isBlank()) {
            return CompanyRegistrationResult.unavailable("Unknown Company", registrationNumber, "Company name not provided.");
        }

        return registrationProvider.verifyCompany(companyName.trim(), registrationNumber);
    }
}
