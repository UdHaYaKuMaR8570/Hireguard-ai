package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j Relationship Properties: ABOUT
 * Directed Edge: (Complaint)-[:ABOUT {reportedAt}]->(Company)
 * Includes the critical temporal property 'reportedAt' which allows graph algorithms
 * and sliding-window Cypher queries to detect rapid velocity spikes in scam reports.
 */
@RelationshipProperties
public class About {

    @RelationshipId
    private Long id;

    @Property("reportedAt")
    private Instant reportedAt;

    @TargetNode
    private CompanyNode company;

    public About() {
    }

    public About(Instant reportedAt, CompanyNode company) {
        this.reportedAt = reportedAt;
        this.company = company;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(Instant reportedAt) {
        this.reportedAt = reportedAt;
    }

    public CompanyNode getCompany() {
        return company;
    }

    public void setCompany(CompanyNode company) {
        this.company = company;
    }
}
