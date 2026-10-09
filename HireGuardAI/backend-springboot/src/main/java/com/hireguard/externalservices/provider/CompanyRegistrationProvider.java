package com.hireguard.externalservices.provider;

import com.hireguard.dto.response.CompanyRegistrationResult;

/**
 * Interface contract for external government/MCA company registration verification providers.
 */
public interface CompanyRegistrationProvider {

    CompanyRegistrationResult verifyCompany(String companyName, String registrationNumber);
}
