package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: Different shell companies often share the same website or domain infrastructure.
 */
@Node("Website")
public class WebsiteNode {
    @Id
    private String url;

    public WebsiteNode() {}

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
