package com.hireguard.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for email validation endpoint POST /api/verification/email
 */
public class EmailVerificationRequest {

    @NotBlank(message = "Recruiter email is required")
    private String email;

    private String companyDomain;
    private String companyName;

    public EmailVerificationRequest() {
    }

    public EmailVerificationRequest(String email, String companyDomain) {
        this.email = email;
        this.companyDomain = companyDomain;
    }

    public EmailVerificationRequest(String email, String companyDomain, String companyName) {
        this.email = email;
        this.companyDomain = companyDomain;
        this.companyName = companyName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCompanyDomain() {
        return companyDomain;
    }

    public void setCompanyDomain(String companyDomain) {
        this.companyDomain = companyDomain;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }
}
