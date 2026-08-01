package com.hireguard.model.mongodb;

import com.hireguard.enums.ComplaintStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Why MongoDB: Contains arbitrary text data (reason) and references to cloud storage (proof).
 */
@Document(collection = "complaints")
public class Complaint {
    @Id
    private String id;
    
    @Indexed
    private String companyId;
    
    public enum ComplaintReason {
        SCAM, HARASSMENT, FAKE_COMPANY, OTHER
    }

    private String userId;
    private ComplaintReason reason;
    private String proof;
    private String description;

    @Indexed
    @Field(targetType = FieldType.STRING)
    private ComplaintStatus status;

    @Indexed
    @CreatedDate
    private Instant createdAt;

    public Complaint() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public ComplaintReason getReason() { return reason; }
    public void setReason(ComplaintReason reason) { this.reason = reason; }
    public String getProof() { return proof; }
    public void setProof(String proof) { this.proof = proof; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
