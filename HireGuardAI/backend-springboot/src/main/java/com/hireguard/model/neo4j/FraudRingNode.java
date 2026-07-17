package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

import java.time.Instant;

/**
 * Neo4j Graph Node: FraudRing
 * Synthetic cluster node grouping employers, recruiters, and shared domains uncovered
 * by graph traversals to be operating in coordinated collusion.
 */
@Node("FraudRing")
public class FraudRingNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("ringName")
    private String ringName;

    @Property("detectedAt")
    private Instant detectedAt;

    @Property("riskScore")
    private Double riskScore;

    public FraudRingNode() {
    }

    public FraudRingNode(String nodeId, String ringName, Instant detectedAt, Double riskScore) {
        this.nodeId = nodeId;
        this.ringName = ringName;
        this.detectedAt = detectedAt;
        this.riskScore = riskScore;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getRingName() {
        return ringName;
    }

    public void setRingName(String ringName) {
        this.ringName = ringName;
    }

    public Instant getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(Instant detectedAt) {
        this.detectedAt = detectedAt;
    }

    public Double getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Double riskScore) {
        this.riskScore = riskScore;
    }
}
