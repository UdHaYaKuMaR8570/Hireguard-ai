package com.hireguard.repository.neo4j;

import com.hireguard.model.neo4j.RecruiterNode;
import org.springframework.data.neo4j.repository.Neo4jRepository;
import org.springframework.data.neo4j.repository.query.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Neo4j Repository: RecruiterGraphRepository
 * Exposes Cypher graph queries targeting RecruiterNode entities and cross-company links.
 */
@Repository
public interface RecruiterGraphRepository extends Neo4jRepository<RecruiterNode, String> {

    /**
     * FRAUD PATTERN DETECTED: Multi-Company Recruiter Over-Exposure
     * Traverses the graph to count how many distinct companies a recruiter node claims to represent.
     * Legitimate corporate recruiters represent 1 company (or 1 agency); recruiters linked to >3 unrelated companies
     * indicate high-risk credential sharing or syndicated phishing operations.
     */
    @Query("MATCH (c:CompanyNode {companyId: $companyId})<-[:RECRUITS_FOR]-(r:RecruiterNode)-[:RECRUITS_FOR]->(other:CompanyNode) " +
           "RETURN r.email AS recruiterEmail, count(DISTINCT other) AS companyCount " +
           "HAVING companyCount > 1")
    List<RecruiterExposureProjection> findHighRiskRecruitersForCompany(@Param("companyId") String companyId);

    interface RecruiterExposureProjection {
        String getRecruiterEmail();
        Long getCompanyCount();
    }
}
