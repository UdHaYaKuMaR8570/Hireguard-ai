package com.hireguard.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for unified multi-check verification: POST /api/verification/employer
 */
public class EmployerVerificationRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String domain;
    private String recruiterEmail;
    private String jobDescription;
    private String registrationNumber;

    public EmployerVerificationRequest() {
    }

    public EmployerVerificationRequest(String companyName, String domain, String recruiterEmail, String jobDescription) {
        this.companyName = companyName;
        this.domain = domain;
        this.recruiterEmail = recruiterEmail;
        this.jobDescription = jobDescription;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public String getRecruiterEmail() {
        return recruiterEmail;
    }

    public void setRecruiterEmail(String recruiterEmail) {
        this.recruiterEmail = recruiterEmail;
    }

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }
}
