package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ScamArchetypeNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

/**
 * Neo4j Relationship Properties: EXHIBITS_PATTERN
 * Directed Edge: (JobPost)-[:EXHIBITS_PATTERN]->(ScamArchetype)
 * Connects flagged job posts to categorical scam vectors (e.g. Advance Fee, Check Overpayment)
 * along with the confidence score calculated during NLP transformer classification.
 */
@RelationshipProperties
public class ExhibitsPattern {

    @RelationshipId
    private Long id;

    @Property("confidenceScore")
    private Double confidenceScore;

    @Property("detectedBy")
    private String detectedBy;

    @TargetNode
    private ScamArchetypeNode scamArchetype;

    public ExhibitsPattern() {
    }

    public ExhibitsPattern(Double confidenceScore, String detectedBy, ScamArchetypeNode scamArchetype) {
        this.confidenceScore = confidenceScore;
        this.detectedBy = detectedBy;
        this.scamArchetype = scamArchetype;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public String getDetectedBy() {
        return detectedBy;
    }

    public void setDetectedBy(String detectedBy) {
        this.detectedBy = detectedBy;
    }

    public ScamArchetypeNode getScamArchetype() {
        return scamArchetype;
    }

    public void setScamArchetype(ScamArchetypeNode scamArchetype) {
        this.scamArchetype = scamArchetype;
    }
}
