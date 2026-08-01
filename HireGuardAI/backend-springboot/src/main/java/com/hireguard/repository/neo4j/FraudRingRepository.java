package com.hireguard.repository.neo4j;

import com.hireguard.model.neo4j.FraudRingNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Neo4j Repository: FraudRingRepository
 * Exposes Cypher multi-hop graph traversal queries for detecting syndicated fraud rings and scam archetypes.
 */
@Repository
public interface FraudRingRepository extends Neo4jRepository<FraudRingNode, String> {

    /**
     * FRAUD PATTERN DETECTED: Syndicated Fraud Ring Membership (PART_OF_RING Traversal)
     * Performs a 1-to-3 hop path traversal starting from a company node through recruiters, job posts,
     * or websites to detect if the entity connects to a known FraudRingNode cluster.
     */
    @Query("MATCH (c:CompanyNode {companyId: $companyId})-[*1..3]-(ring:FraudRingNode) " +
           "RETURN ring.ringId AS ringId, ring.name AS ringName")
    List<FraudRingProjection> findConnectedFraudRings(@Param("companyId") String companyId);

    /**
     * FRAUD PATTERN DETECTED: JobPost Pattern Matching (EXHIBITS_PATTERN Traversal)
     * Traverses from the company to its posted jobs to check if any job post exhibits a known ScamArchetype pattern
     * (e.g. "Check Refund Scam", "Telegram Interview Phishing", "Equipment Deposit Extortion").
     */
    @Query("MATCH (c:CompanyNode {companyId: $companyId})<-[:POSTED_BY]-(j:JobPostNode)-[:EXHIBITS_PATTERN]->(arch:ScamArchetypeNode) " +
           "RETURN arch.name AS archetypeName, count(j) AS jobCount")
    List<ScamArchetypeProjection> findExhibitedScamArchetypes(@Param("companyId") String companyId);

    interface FraudRingProjection {
        String getRingId();
        String getRingName();
    }

    interface ScamArchetypeProjection {
        String getArchetypeName();
        Long getJobCount();
    }
}
