package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class WorksFor {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private CompanyNode company;

    public WorksFor() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CompanyNode getCompany() { return company; }
    public void setCompany(CompanyNode company) { this.company = company; }
}
