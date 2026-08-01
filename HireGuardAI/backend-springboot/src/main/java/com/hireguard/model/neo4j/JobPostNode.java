package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.ExhibitsPattern;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Links job posts directly to scam archetypes, allowing graph queries 
 * to find clusters of similar jobs posted by different companies.
 */
@Node("JobPost")
public class JobPostNode {
    @Id
    private String id; // Matches MongoDB JobPost ID
    private String title;

    @Relationship(type = "EXHIBITS_PATTERN", direction = Relationship.Direction.OUTGOING)
    private Set<ExhibitsPattern> scamArchetypes = new HashSet<>();

    public JobPostNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Set<ExhibitsPattern> getScamArchetypes() { return scamArchetypes; }
    public void setScamArchetypes(Set<ExhibitsPattern> scamArchetypes) { this.scamArchetypes = scamArchetypes; }
}
