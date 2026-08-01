package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Reported;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: To detect users who submit numerous complaints, or potentially 
 * malicious coordinated reporting behavior.
 */
@Node("User")
public class UserNode {
    @Id
    private String id; // Matches MongoDB User ID

    @Relationship(type = "REPORTED", direction = Relationship.Direction.OUTGOING)
    private Set<Reported> complaints = new HashSet<>();

    public UserNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Set<Reported> getComplaints() { return complaints; }
    public void setComplaints(Set<Reported> complaints) { this.complaints = complaints; }
}
