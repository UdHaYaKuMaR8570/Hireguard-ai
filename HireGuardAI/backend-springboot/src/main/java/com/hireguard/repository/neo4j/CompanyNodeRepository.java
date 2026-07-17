package com.hireguard.repository.neo4j;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.stereotype.Repository;

/**
 * Spring Data Neo4j Repository skeleton for CompanyNode graph entities.
 * Note: Per Phase 2 development rules, this is strictly a connection/repository skeleton
 * directly extending Neo4jRepository without custom Cypher queries or graph-traversal endpoints.
 * Complex multi-hop fraud detection and graph analysis algorithms arrive in Phase 5.
 */
@Repository
public interface CompanyNodeRepository extends Neo4jRepository<CompanyNode, String> {
}
