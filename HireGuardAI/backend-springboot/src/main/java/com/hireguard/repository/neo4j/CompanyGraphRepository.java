package com.hireguard.repository.neo4j;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Neo4j Repository: CompanyGraphRepository
 * Exposes Cypher graph traversal queries targeting CompanyNode entities.
 */
@Repository
public interface CompanyGraphRepository extends Neo4jRepository<CompanyNode, String> {

    /**
     * FRAUD PATTERN DETECTED: Shared Website / Domain Infrastructure Clustering
     * Finds other company nodes in the graph that share the exact same website domain string or registered root.
     * Multiple distinct registered entities operating under identical website domains often indicates shell company creation
     * or fraudulent domain cloaking.
     */
    @Query("MATCH (c:CompanyNode {companyId: $companyId}), (other:CompanyNode) " +
           "WHERE c.companyId <> other.companyId AND c.website = other.website " +
           "RETURN other.companyId")
    List<String> findCompanyIdsSharingDomain(@Param("companyId") String companyId);

    /**
     * FRAUD PATTERN DETECTED: Recruiter Cross-Linking Across Flagged Employers
     * Finds company IDs linked via recruiters who are also associated with high-risk or unverified entities.
     */
    @Query("MATCH (c:CompanyNode {companyId: $companyId})<-[:RECRUITS_FOR]-(r:RecruiterNode)-[:RECRUITS_FOR]->(other:CompanyNode) " +
           "WHERE c.companyId <> other.companyId " +
           "RETURN DISTINCT other.companyId")
    List<String> findCrossLinkedCompanyIds(@Param("companyId") String companyId);
}
