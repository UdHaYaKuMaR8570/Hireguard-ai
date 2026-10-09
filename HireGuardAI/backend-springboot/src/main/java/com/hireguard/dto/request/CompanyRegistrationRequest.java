package com.hireguard.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for POST /api/verification/company-registration
 */
public class CompanyRegistrationRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String registrationNumber;
    private String jurisdiction;

    public CompanyRegistrationRequest() {
    }

    public CompanyRegistrationRequest(String companyName, String registrationNumber) {
        this.companyName = companyName;
        this.registrationNumber = registrationNumber;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getJurisdiction() {
        return jurisdiction;
    }

    public void setJurisdiction(String jurisdiction) {
        this.jurisdiction = jurisdiction;
    }
}
