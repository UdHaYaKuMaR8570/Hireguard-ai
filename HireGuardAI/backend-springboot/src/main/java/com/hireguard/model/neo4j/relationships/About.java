package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

@RelationshipProperties
public class About {
    @RelationshipId
    private Long id;
    
    @Property("reportedAt")
    private Instant reportedAt;
    
    @TargetNode
    private CompanyNode company;

    public About() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Instant getReportedAt() { return reportedAt; }
    public void setReportedAt(Instant reportedAt) { this.reportedAt = reportedAt; }
    public CompanyNode getCompany() { return company; }
    public void setCompany(CompanyNode company) { this.company = company; }
}
