package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Owns;
import com.hireguard.model.neo4j.relationships.PartOfRing;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.ArrayList;
import java.util.List;

/**
 * Neo4j Graph Node: Company
 * Lightweight relationship anchor representing corporate employers.
 * Does not store full bios or audit histories (stored in MongoDB); instead, tracks
 * structural connections to websites, recruiters, and fraud rings.
 */
@Node("Company")
public class CompanyNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("name")
    private String name;

    @Property("registrationStatus")
    private String registrationStatus;

    @Relationship(type = "OWNS", direction = Relationship.Direction.OUTGOING)
    private List<Owns> ownedWebsites = new ArrayList<>();

    @Relationship(type = "HAS_RECRUITER", direction = Relationship.Direction.OUTGOING)
    private List<RecruiterNode> recruiters = new ArrayList<>();

    @Relationship(type = "PART_OF_RING", direction = Relationship.Direction.OUTGOING)
    private List<PartOfRing> fraudRings = new ArrayList<>();

    public CompanyNode() {
    }

    public CompanyNode(String nodeId, String name, String registrationStatus) {
        this.nodeId = nodeId;
        this.name = name;
        this.registrationStatus = registrationStatus;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(String registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public List<Owns> getOwnedWebsites() {
        return ownedWebsites;
    }

    public void setOwnedWebsites(List<Owns> ownedWebsites) {
        this.ownedWebsites = ownedWebsites;
    }

    public List<RecruiterNode> getRecruiters() {
        return recruiters;
    }

    public void setRecruiters(List<RecruiterNode> recruiters) {
        this.recruiters = recruiters;
    }

    public List<PartOfRing> getFraudRings() {
        return fraudRings;
    }

    public void setFraudRings(List<PartOfRing> fraudRings) {
        this.fraudRings = fraudRings;
    }
}
