package com.hireguard.dto.response;

import java.time.Instant;

/**
 * Response DTO encapsulating Scam Complaint records submitted against employers.
 */
public class ComplaintResponse {

    private String id;
    private String companyId;
    private String userId;
    private String reason;
    private String proof;
    private String description;
    private String status;
    private Instant createdAt;

    public ComplaintResponse() {
    }

    public ComplaintResponse(String id, String companyId, String userId, String reason, String proof, String description, String status, Instant createdAt) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.reason = reason;
        this.proof = proof;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
