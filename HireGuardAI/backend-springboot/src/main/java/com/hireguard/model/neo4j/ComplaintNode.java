package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.About;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Acts as the connecting node between Users and Companies. 
 * Allows analyzing complaint volumes and networks over time.
 */
@Node("Complaint")
public class ComplaintNode {
    @Id
    private String id; // Matches MongoDB Complaint ID

    @Relationship(type = "ABOUT", direction = Relationship.Direction.OUTGOING)
    private Set<About> companies = new HashSet<>();

    public ComplaintNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Set<About> getCompanies() { return companies; }
    public void setCompanies(Set<About> companies) { this.companies = companies; }
}
