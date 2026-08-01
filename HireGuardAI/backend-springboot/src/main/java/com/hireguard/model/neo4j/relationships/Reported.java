package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ComplaintNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Reported {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private ComplaintNode complaint;

    public Reported() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ComplaintNode getComplaint() { return complaint; }
    public void setComplaint(ComplaintNode complaint) { this.complaint = complaint; }
}
