package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.FraudRingNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class PartOfRing {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private FraudRingNode fraudRing;

    public PartOfRing() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FraudRingNode getFraudRing() { return fraudRing; }
    public void setFraudRing(FraudRingNode fraudRing) { this.fraudRing = fraudRing; }
}
