package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.About;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

/**
 * Neo4j Graph Node: Complaint
 * Graph anchor for scam allegations.
 * Connects to targeted employers via the ABOUT relationship which includes the
 * critical temporal property 'reportedAt' for velocity and spike analysis.
 */
@Node("Complaint")
public class ComplaintNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("reason")
    private String reason;

    @Property("status")
    private String status;

    @Relationship(type = "ABOUT", direction = Relationship.Direction.OUTGOING)
    private About targetCompany;

    public ComplaintNode() {
    }

    public ComplaintNode(String nodeId, String reason, String status) {
        this.nodeId = nodeId;
        this.reason = reason;
        this.status = status;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public About getTargetCompany() {
        return targetCompany;
    }

    public void setTargetCompany(About targetCompany) {
        this.targetCompany = targetCompany;
    }
}
