package com.hireguard.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for submitting a Scam Complaint (`POST /api/complaints`).
 */
public class ComplaintRequest {

    @NotBlank(message = "Company ID cannot be blank")
    private String companyId;

    @NotBlank(message = "Complaint reason enum string cannot be blank")
    private String reason; // ADVANCE_FEE_DEMAND, FAKE_CHECK_SCAM, IDENTITY_THEFT_ATTEMPT, PHISHING_LINK, UNAUTHORIZED_REPRESENTATION, OTHER

    private String proof; // Optional evidence storage URL or base64 data

    @NotBlank(message = "Description of the incident cannot be blank")
    private String description;

    public ComplaintRequest() {
    }

    public ComplaintRequest(String companyId, String reason, String proof, String description) {
        this.companyId = companyId;
        this.reason = reason;
        this.proof = proof;
        this.description = description;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getProof() {
        return proof;
    }

    public void setProof(String proof) {
        this.proof = proof;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
