package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: Maps the conceptual type of scam (e.g., "Advance Fee Fraud") 
 * to actual job posts, enabling similarity detection.
 */
@Node("ScamArchetype")
public class ScamArchetypeNode {
    @Id
    private String id;
    private String name;

    public ScamArchetypeNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
