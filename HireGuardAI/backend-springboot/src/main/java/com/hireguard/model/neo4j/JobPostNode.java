package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.ExhibitsPattern;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Neo4j Graph Node: JobPost
 * Lightweight graph representation of a job listing.
 * Tracks the calculated NLP scam probability score and links to matched scam archetypes.
 */
@Node("JobPost")
public class JobPostNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("title")
    private String title;

    @Property("scamProbability")
    private Double scamProbability;

    @Relationship(type = "EXHIBITS_PATTERN", direction = Relationship.Direction.OUTGOING)
    private List<ExhibitsPattern> exhibitedPatterns = new ArrayList<>();

    public JobPostNode() {
    }

    public JobPostNode(String nodeId, String title, Double scamProbability) {
        this.nodeId = nodeId;
        this.title = title;
        this.scamProbability = scamProbability;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Double getScamProbability() {
        return scamProbability;
    }

    public void setScamProbability(Double scamProbability) {
        this.scamProbability = scamProbability;
    }

    public List<ExhibitsPattern> getExhibitedPatterns() {
        return exhibitedPatterns;
    }

    public void setExhibitedPatterns(List<ExhibitsPattern> exhibitedPatterns) {
        this.exhibitedPatterns = exhibitedPatterns;
    }
}
