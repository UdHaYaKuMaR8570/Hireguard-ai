package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Owns;
import com.hireguard.model.neo4j.relationships.PartOfRing;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Enables discovering complex patterns, such as multiple companies 
 * sharing the same IP/Websites, or being linked to the same Fraud Rings.
 */
@Node("Company")
public class CompanyNode {
    @Id
    private String id; // Matches MongoDB ID
    private String name;

    @Relationship(type = "OWNS", direction = Relationship.Direction.OUTGOING)
    private Set<Owns> websites = new HashSet<>();

    @Relationship(type = "PART_OF_RING", direction = Relationship.Direction.OUTGOING)
    private Set<PartOfRing> fraudRings = new HashSet<>();

    // Using WorksFor from Recruiter side, or HasRecruiter from Company side.
    // The requirement is (Company)-[:HAS_RECRUITER]->(Recruiter)
    @Relationship(type = "HAS_RECRUITER", direction = Relationship.Direction.OUTGOING)
    private Set<RecruiterNode> recruiters = new HashSet<>();

    public CompanyNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<Owns> getWebsites() { return websites; }
    public void setWebsites(Set<Owns> websites) { this.websites = websites; }
    public Set<PartOfRing> getFraudRings() { return fraudRings; }
    public void setFraudRings(Set<PartOfRing> fraudRings) { this.fraudRings = fraudRings; }
    public Set<RecruiterNode> getRecruiters() { return recruiters; }
    public void setRecruiters(Set<RecruiterNode> recruiters) { this.recruiters = recruiters; }
}
