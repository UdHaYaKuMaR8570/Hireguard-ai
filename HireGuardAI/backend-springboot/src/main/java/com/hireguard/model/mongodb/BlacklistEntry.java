package com.hireguard.model.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * MongoDB Document Entity: BlacklistEntry
 * Stores blacklisted domain names, recruiter email addresses, company names, or phone numbers.
 */
@Document(collection = "blacklist_entries")
public class BlacklistEntry {

    @Id
    private String id;

    private String type; // DOMAIN, EMAIL, COMPANY, PHONE
    private String value; // e.g. scammer-domain.com, hr@fakecompany.com
    private String reason;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String source; // INTERNAL_REPORTS, USER_COMPLAINT_CLUSTER, EXTERNAL_FEED
    private Instant createdAt;
    private Instant updatedAt;
    private boolean active = true;

    public BlacklistEntry() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public BlacklistEntry(String type, String value, String reason, String severity, String source) {
        this.type = type;
        this.value = value;
        this.reason = reason;
        this.severity = severity;
        this.source = source;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
        this.active = true;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
