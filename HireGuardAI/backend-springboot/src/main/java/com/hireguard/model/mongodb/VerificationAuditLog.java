package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * MongoDB Document Entity: VerificationAuditLog
 * Maintains an immutable audit trail of automated verifications (WHOIS, NLP scans,
 * Neo4j graph ring checks) and manual verifier actions taken against a company.
 */
@Document(collection = "verification_audit_logs")
public class VerificationAuditLog {

    @Id
    private String id;

    @Indexed
    private String companyId;

    @Field(targetType = FieldType.STRING)
    private CheckType checkType;

    @Field(targetType = FieldType.STRING)
    private CheckResult result;

    private String details;

    @CreatedDate
    private Instant timestamp;

    public enum CheckType {
        DOMAIN_WHOIS_CHECK,
        NLP_SCAM_PROBABILITY_SCAN,
        GRAPH_RING_DETECTION,
        MANUAL_VERIFIER_REVIEW
    }

    public enum CheckResult {
        PASSED,
        FLAGGED,
        FAILED,
        INCONCLUSIVE
    }

    public VerificationAuditLog() {
    }

    public VerificationAuditLog(String id, String companyId, CheckType checkType, CheckResult result, String details) {
        this.id = id;
        this.companyId = companyId;
        this.checkType = checkType;
        this.result = result;
        this.details = details;
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

    public CheckType getCheckType() {
        return checkType;
    }

    public void setCheckType(CheckType checkType) {
        this.checkType = checkType;
    }

    public CheckResult getResult() {
        return result;
    }

    public void setResult(CheckResult result) {
        this.result = result;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "VerificationAuditLog{" +
                "id='" + id + '\'' +
                ", companyId='" + companyId + '\'' +
                ", checkType=" + checkType +
                ", result=" + result +
                ", timestamp=" + timestamp +
                '}';
    }
}
