package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.PartOfRing;
import com.hireguard.model.neo4j.relationships.Posted;
import com.hireguard.model.neo4j.relationships.WorksFor;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Neo4j Graph Node: Recruiter
 * Represents individual recruiter identities or email handles across multiple job postings.
 * Links to companies via WORKS_FOR and to job listings via POSTED.
 */
@Node("Recruiter")
public class RecruiterNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("email")
    private String email;

    @Property("name")
    private String name;

    @Property("isFlagged")
    private Boolean isFlagged;

    @Relationship(type = "WORKS_FOR", direction = Relationship.Direction.OUTGOING)
    private List<WorksFor> companiesWorkedFor = new ArrayList<>();

    @Relationship(type = "POSTED", direction = Relationship.Direction.OUTGOING)
    private List<Posted> postedJobs = new ArrayList<>();

    @Relationship(type = "PART_OF_RING", direction = Relationship.Direction.OUTGOING)
    private List<PartOfRing> fraudRings = new ArrayList<>();

    public RecruiterNode() {
    }

    public RecruiterNode(String nodeId, String email, String name, Boolean isFlagged) {
        this.nodeId = nodeId;
        this.email = email;
        this.name = name;
        this.isFlagged = isFlagged;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getIsFlagged() {
        return isFlagged;
    }

    public void setIsFlagged(Boolean isFlagged) {
        this.isFlagged = isFlagged;
    }

    public List<WorksFor> getCompaniesWorkedFor() {
        return companiesWorkedFor;
    }

    public void setCompaniesWorkedFor(List<WorksFor> companiesWorkedFor) {
        this.companiesWorkedFor = companiesWorkedFor;
    }

    public List<Posted> getPostedJobs() {
        return postedJobs;
    }

    public void setPostedJobs(List<Posted> postedJobs) {
        this.postedJobs = postedJobs;
    }

    public List<PartOfRing> getFraudRings() {
        return fraudRings;
    }

    public void setFraudRings(List<PartOfRing> fraudRings) {
        this.fraudRings = fraudRings;
    }
}
