package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Property;

/**
 * Neo4j Graph Node: Website
 * Represents digital domains and hosting URLs.
 * Enables detection of 'Shared Infrastructure Clusters' where multiple companies
 * share newly registered ephemeral domains (< 30 days old).
 */
@Node("Website")
public class WebsiteNode {

    @Id
    @Property("nodeId")
    private String nodeId;

    @Property("url")
    private String url;

    @Property("domain")
    private String domain;

    @Property("domainAgeDays")
    private Integer domainAgeDays;

    public WebsiteNode() {
    }

    public WebsiteNode(String nodeId, String url, String domain, Integer domainAgeDays) {
        this.nodeId = nodeId;
        this.url = url;
        this.domain = domain;
        this.domainAgeDays = domainAgeDays;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getDomain() {
        return domain;
    }

    public void setDomain(String domain) {
        this.domain = domain;
    }

    public Integer getDomainAgeDays() {
        return domainAgeDays;
    }

    public void setDomainAgeDays(Integer domainAgeDays) {
        this.domainAgeDays = domainAgeDays;
    }
}
