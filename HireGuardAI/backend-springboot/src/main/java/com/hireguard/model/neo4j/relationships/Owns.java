package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.WebsiteNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j Relationship Properties: OWNS
 * Directed Edge: (Company)-[:OWNS]->(Website)
 * Maps corporate entities to their digital web domains.
 * Enables detection of 'Shared Infrastructure Clusters' where multiple seemingly
 * separate shell companies operate off the exact same newly registered domain or URL.
 */
@RelationshipProperties
public class Owns {

    @RelationshipId
    private Long id;

    @Property("verifiedOwnership")
    private Boolean verifiedOwnership;

    @Property("registeredAt")
    private Instant registeredAt;

    @TargetNode
    private WebsiteNode website;

    public Owns() {
    }

    public Owns(Boolean verifiedOwnership, Instant registeredAt, WebsiteNode website) {
        this.verifiedOwnership = verifiedOwnership;
        this.registeredAt = registeredAt;
        this.website = website;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Boolean getVerifiedOwnership() {
        return verifiedOwnership;
    }

    public void setVerifiedOwnership(Boolean verifiedOwnership) {
        this.verifiedOwnership = verifiedOwnership;
    }

    public Instant getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(Instant registeredAt) {
        this.registeredAt = registeredAt;
    }

    public WebsiteNode getWebsite() {
        return website;
    }

    public void setWebsite(WebsiteNode website) {
        this.website = website;
    }
}
