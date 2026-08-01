package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.JobPostNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Posted {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private JobPostNode jobPost;

    public Posted() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPostNode getJobPost() { return jobPost; }
    public void setJobPost(JobPostNode jobPost) { this.jobPost = jobPost; }
}
