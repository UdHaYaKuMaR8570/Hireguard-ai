package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

/**
 * Neo4j Relationship Properties: WORKS_FOR
 * Directed Edge: (Recruiter)-[:WORKS_FOR]->(Company)
 * Tracks the relationship and verification status between a recruiter handle and an employer.
 * Enables detection of the 'Nomad/Spoofed Recruiter Pattern' where a single recruiter
 * claims to recruit for multiple unverified or suspicious shell companies.
 */
@RelationshipProperties
public class WorksFor {

    @RelationshipId
    private Long id;

    @Property("sinceDate")
    private String sinceDate;

    @Property("isVerified")
    private Boolean isVerified;

    @TargetNode
    private CompanyNode company;

    public WorksFor() {
    }

    public WorksFor(String sinceDate, Boolean isVerified, CompanyNode company) {
        this.sinceDate = sinceDate;
        this.isVerified = isVerified;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSinceDate() {
        return sinceDate;
    }

    public void setSinceDate(String sinceDate) {
        this.sinceDate = sinceDate;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public CompanyNode getCompany() {
        return company;
    }

    public void setCompany(CompanyNode company) {
        this.company = company;
    }
}
