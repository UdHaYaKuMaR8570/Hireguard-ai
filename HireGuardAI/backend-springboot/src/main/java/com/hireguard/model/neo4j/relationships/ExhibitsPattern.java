package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ScamArchetypeNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class ExhibitsPattern {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private ScamArchetypeNode scamArchetype;

    public ExhibitsPattern() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ScamArchetypeNode getScamArchetype() { return scamArchetype; }
    public void setScamArchetype(ScamArchetypeNode scamArchetype) { this.scamArchetype = scamArchetype; }
}
