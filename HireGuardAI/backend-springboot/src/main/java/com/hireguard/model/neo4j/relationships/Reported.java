package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ComplaintNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j Relationship Properties: REPORTED
 * Directed Edge: (User)-[:REPORTED]->(Complaint)
 * Anchors user allegation events into the graph, enabling investigative traversal
 * from reporting users or victim clusters to the targeted employer network.
 */
@RelationshipProperties
public class Reported {

    @RelationshipId
    private Long id;

    @Property("submissionTimestamp")
    private Instant submissionTimestamp;

    @TargetNode
    private ComplaintNode complaint;

    public Reported() {
    }

    public Reported(Instant submissionTimestamp, ComplaintNode complaint) {
        this.submissionTimestamp = submissionTimestamp;
        this.complaint = complaint;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getSubmissionTimestamp() {
        return submissionTimestamp;
    }

    public void setSubmissionTimestamp(Instant submissionTimestamp) {
        this.submissionTimestamp = submissionTimestamp;
    }

    public ComplaintNode getComplaint() {
        return complaint;
    }

    public void setComplaint(ComplaintNode complaint) {
        this.complaint = complaint;
    }
}
