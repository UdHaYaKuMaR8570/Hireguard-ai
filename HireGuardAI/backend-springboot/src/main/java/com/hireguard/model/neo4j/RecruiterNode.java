package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Posted;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Recruiters can move between fake companies or post multiple scam jobs. 
 * Graph traversals quickly reveal if a recruiter is a known bad actor.
 */
@Node("Recruiter")
public class RecruiterNode {
    @Id
    private String id;
    private String name;

    @Relationship(type = "POSTED", direction = Relationship.Direction.OUTGOING)
    private Set<Posted> jobPosts = new HashSet<>();

    public RecruiterNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<Posted> getJobPosts() { return jobPosts; }
    public void setJobPosts(Set<Posted> jobPosts) { this.jobPosts = jobPosts; }
}
