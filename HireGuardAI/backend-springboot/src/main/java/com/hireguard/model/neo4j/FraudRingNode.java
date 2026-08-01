package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: High-level categorization node to group disconnected companies 
 * that share known scam attributes.
 */
@Node("FraudRing")
public class FraudRingNode {
    @Id
    private String id;
    private String ringName;

    public FraudRingNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRingName() { return ringName; }
    public void setRingName(String ringName) { this.ringName = ringName; }
}
