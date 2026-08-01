package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.WebsiteNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Owns {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private WebsiteNode website;

    public Owns() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WebsiteNode getWebsite() { return website; }
    public void setWebsite(WebsiteNode website) { this.website = website; }
}
