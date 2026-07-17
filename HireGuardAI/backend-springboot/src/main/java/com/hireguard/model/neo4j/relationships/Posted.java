package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.JobPostNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

/**
 * Neo4j Relationship Properties: POSTED
 * Directed Edge: (Recruiter)-[:POSTED]->(JobPost)
 * Links recruiters to the specific job listings they broadcast.
 * Enables 'Blast Posting Pattern' detection where multiple high scam-probability
 * job posts originate from the same compromised or fictitious recruiter profile.
 */
@RelationshipProperties
public class Posted {

    @RelationshipId
    private Long id;

    @Property("postedAt")
    private Instant postedAt;

    @Property("platform")
    private String platform;

    @TargetNode
    private JobPostNode jobPost;

    public Posted() {
    }

    public Posted(Instant postedAt, String platform, JobPostNode jobPost) {
        this.postedAt = postedAt;
        this.platform = platform;
        this.jobPost = jobPost;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Instant getPostedAt() {
        return postedAt;
    }

    public void setPostedAt(Instant postedAt) {
        this.postedAt = postedAt;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public JobPostNode getJobPost() {
        return jobPost;
    }

    public void setJobPost(JobPostNode jobPost) {
        this.jobPost = jobPost;
    }
}
