package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * MongoDB Document Entity: Complaint
 * Stores user and automated scam complaints, evidence URLs, and investigation statuses.
 * Includes recommended B-Tree indexes on companyId, status, and createdAt for fast queries.
 */
@Document(collection = "complaints")
public class Complaint {

    @Id
    private String id;

    @Indexed
    private String companyId;

    @Indexed
    private String userId;

    @Field(targetType = FieldType.STRING)
    private ComplaintReason reason;

    private String proof;

    private String description;

    @Indexed
    @Field(targetType = FieldType.STRING)
    private ComplaintStatus status;

    @Indexed
    @CreatedDate
    private Instant createdAt;

    public enum ComplaintReason {
        ADVANCE_FEE_DEMAND,
        FAKE_CHECK_SCAM,
        IDENTITY_THEFT_ATTEMPT,
        PHISHING_LINK,
        UNAUTHORIZED_REPRESENTATION,
        OTHER
    }

    public enum ComplaintStatus {
        SUBMITTED,
        UNDER_INVESTIGATION,
        VERIFIED_SCAM,
        DISMISSED
    }

    public Complaint() {
    }

    public Complaint(String id, String companyId, String userId, ComplaintReason reason, String proof, String description, ComplaintStatus status) {
        this.id = id;
        this.companyId = companyId;
        this.userId = userId;
        this.reason = reason;
        this.proof = proof;
        this.description = description;
        this.status = status;
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

    public ComplaintReason getReason() {
        return reason;
    }

    public void setReason(ComplaintReason reason) {
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

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "Complaint{" +
                "id='" + id + '\'' +
                ", companyId='" + companyId + '\'' +
                ", userId='" + userId + '\'' +
                ", reason=" + reason +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}
