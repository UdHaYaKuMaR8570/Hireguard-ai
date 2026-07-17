package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * MongoDB Document Entity: JobPost
 * Stores detailed job descriptions, compensation details, and recruiter metadata.
 * References the associated company via companyId rather than embedding large documents.
 */
@Document(collection = "job_posts")
public class JobPost {

    @Id
    private String id;

    @Indexed
    private String companyId;

    private String title;

    private String description;

    @Indexed
    private String postedBy;

    private String salaryRange;

    private String sourcePlatform;

    @CreatedDate
    private Instant createdAt;

    public JobPost() {
    }

    public JobPost(String id, String companyId, String title, String description, String postedBy, String salaryRange, String sourcePlatform) {
        this.id = id;
        this.companyId = companyId;
        this.title = title;
        this.description = description;
        this.postedBy = postedBy;
        this.salaryRange = salaryRange;
        this.sourcePlatform = sourcePlatform;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPostedBy() {
        return postedBy;
    }

    public void setPostedBy(String postedBy) {
        this.postedBy = postedBy;
    }

    public String getSalaryRange() {
        return salaryRange;
    }

    public void setSalaryRange(String salaryRange) {
        this.salaryRange = salaryRange;
    }

    public String getSourcePlatform() {
        return sourcePlatform;
    }

    public void setSourcePlatform(String sourcePlatform) {
        this.sourcePlatform = sourcePlatform;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "JobPost{" +
                "id='" + id + '\'' +
                ", companyId='" + companyId + '\'' +
                ", title='" + title + '\'' +
                ", postedBy='" + postedBy + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
