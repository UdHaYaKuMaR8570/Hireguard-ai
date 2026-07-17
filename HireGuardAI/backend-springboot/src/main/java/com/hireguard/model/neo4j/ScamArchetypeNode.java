package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

/**
 * Neo4j Graph Node: ScamArchetype
 * Categorical scam vector node (e.g. Advance Fee, Check Overpayment) used to cluster
 * job advertisements that exhibit similar NLP classification patterns.
 */
@Node("ScamArchetype")
public class ScamArchetypeNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("archetypeCode")
    private String archetypeCode;

    @Property("name")
    private String name;

    public ScamArchetypeNode() {
    }

    public ScamArchetypeNode(String nodeId, String archetypeCode, String name) {
        this.nodeId = nodeId;
        this.archetypeCode = archetypeCode;
        this.name = name;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getArchetypeCode() {
        return archetypeCode;
    }

    public void setArchetypeCode(String archetypeCode) {
        this.archetypeCode = archetypeCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
