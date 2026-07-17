package com.hireguard.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for Employer/Company Verification (`POST /api/company/verify`).
 * Accepts company name, website domain, and recruiter contact email.
 */
public class CompanyVerifyRequest {

    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @NotBlank(message = "Website URL cannot be blank")
    private String website;

    @NotBlank(message = "Recruiter email cannot be blank")
    @Email(message = "Recruiter contact must be a valid email address")
    private String recruiterEmail;

    public CompanyVerifyRequest() {
    }

    public CompanyVerifyRequest(String companyName, String website, String recruiterEmail) {
        this.companyName = companyName;
        this.website = website;
        this.recruiterEmail = recruiterEmail;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getRecruiterEmail() {
        return recruiterEmail;
    }

    public void setRecruiterEmail(String recruiterEmail) {
        this.recruiterEmail = recruiterEmail;
    }
}
