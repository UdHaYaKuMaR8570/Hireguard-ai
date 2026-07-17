package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.FraudRingNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j Relationship Properties: PART_OF_RING
 * Directed Edge: (Company | Recruiter)-[:PART_OF_RING]->(FraudRing)
 * Directly connects individual entities to a confirmed or high-probability fraud ring cluster.
 * Any node inheriting this relationship incurs severe trust score deduction modifiers.
 */
@RelationshipProperties
public class PartOfRing {

    @RelationshipId
    private Long id;

    @Property("joinedRingDate")
    private Instant joinedRingDate;

    @Property("confidenceLevel")
    private Double confidenceLevel;

    @TargetNode
    private FraudRingNode fraudRing;

    public PartOfRing() {
    }

    public PartOfRing(Instant joinedRingDate, Double confidenceLevel, FraudRingNode fraudRing) {
        this.joinedRingDate = joinedRingDate;
        this.confidenceLevel = confidenceLevel;
        this.fraudRing = fraudRing;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getJoinedRingDate() {
        return joinedRingDate;
    }

    public void setJoinedRingDate(Instant joinedRingDate) {
        this.joinedRingDate = joinedRingDate;
    }

    public Double getConfidenceLevel() {
        return confidenceLevel;
    }

    public void setConfidenceLevel(Double confidenceLevel) {
        this.confidenceLevel = confidenceLevel;
    }

    public FraudRingNode getFraudRing() {
        return fraudRing;
    }

    public void setFraudRing(FraudRingNode fraudRing) {
        this.fraudRing = fraudRing;
    }
}
