package com.hireguard.config;

import org.neo4j.driver.AuthTokens;
import org.neo4j.driver.Driver;
import org.neo4j.driver.GraphDatabase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.neo4j.config.AbstractNeo4jConfig;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Spring Boot Configuration for Neo4j (Graph Relationship Intelligence Store).
 * Configures the Neo4j Java driver using externalized application.properties keys
 * and enables Spring Data Neo4j repository support.
 */
@Configuration
@EnableTransactionManagement
@EnableNeo4jRepositories(basePackages = "com.hireguard.repository.neo4j")
public class Neo4jConfig extends AbstractNeo4jConfig {

    @Value("${spring.neo4j.uri:bolt://localhost:7687}")
    private String neo4jUri;

    @Value("${spring.neo4j.authentication.username:neo4j}")
    private String username;

    @Value("${spring.neo4j.authentication.password:password}")
    private String password;

    @Override
    @Bean
    public Driver driver() {
        return GraphDatabase.driver(neo4jUri, AuthTokens.basic(username, password));
    }
}
