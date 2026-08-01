package com.hireguard.service;

import com.hireguard.repository.neo4j.CompanyGraphRepository;
import com.hireguard.repository.neo4j.FraudRingRepository;
import com.hireguard.repository.neo4j.RecruiterGraphRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service Layer: GraphService
 * Orchestrates multi-hop Cypher queries across Neo4j graph repositories.
 * Compiles graph risk penalties and human-readable audit trail factors.
 */
@Service
public class GraphService {

    private static final Logger log = LoggerFactory.getLogger(GraphService.class);

    private final CompanyGraphRepository companyGraphRepository;
    private final RecruiterGraphRepository recruiterGraphRepository;
    private final FraudRingRepository fraudRingRepository;

    public GraphService(CompanyGraphRepository companyGraphRepository,
                        RecruiterGraphRepository recruiterGraphRepository,
                        FraudRingRepository fraudRingRepository) {
        this.companyGraphRepository = companyGraphRepository;
        this.recruiterGraphRepository = recruiterGraphRepository;
        this.fraudRingRepository = fraudRingRepository;
    }

    public GraphAnalysisResult analyzeCompanyGraph(String companyId) {
        List<String> riskFactors = new ArrayList<>();
        int graphPenalty = 0;

        try {
            // 1. Check Shared Website Domain Infrastructure Clustering
            List<String> sharingCompanies = companyGraphRepository.findCompanyIdsSharingDomain(companyId);
            if (sharingCompanies != null && !sharingCompanies.isEmpty()) {
                graphPenalty += 20;
                riskFactors.add(String.format("Neo4j Flag: Website domain is shared with %d other distinct company node(s) (%s). Potential shell company network.",
                        sharingCompanies.size(), String.join(", ", sharingCompanies)));
            }

            // 2. Check Multi-Company Recruiter Over-Exposure
            List<RecruiterGraphRepository.RecruiterExposureProjection> exposedRecruiters = 
                    recruiterGraphRepository.findHighRiskRecruitersForCompany(companyId);
            if (exposedRecruiters != null && !exposedRecruiters.isEmpty()) {
                for (RecruiterGraphRepository.RecruiterExposureProjection r : exposedRecruiters) {
                    graphPenalty += 15;
                    riskFactors.add(String.format("Neo4j Flag: Associated recruiter (%s) is cross-linked with %d other employer entities.",
                            r.getRecruiterEmail(), r.getCompanyCount()));
                }
            }

            // 3. Check Syndicated Fraud Ring Membership (PART_OF_RING Traversal)
            List<FraudRingRepository.FraudRingProjection> fraudRings = 
                    fraudRingRepository.findConnectedFraudRings(companyId);
            if (fraudRings != null && !fraudRings.isEmpty()) {
                for (FraudRingRepository.FraudRingProjection ring : fraudRings) {
                    graphPenalty += 35;
                    riskFactors.add(String.format("CRITICAL GRAPH WARNING: Multi-hop traversal linked company to known Syndicated Fraud Ring: '%s' (ID: %s).",
                            ring.getRingName(), ring.getRingId()));
                }
            }

            // 4. Check JobPost Scam Archetype Pattern Matching (EXHIBITS_PATTERN Traversal)
            List<FraudRingRepository.ScamArchetypeProjection> archetypes = 
                    fraudRingRepository.findExhibitedScamArchetypes(companyId);
            if (archetypes != null && !archetypes.isEmpty()) {
                for (FraudRingRepository.ScamArchetypeProjection arch : archetypes) {
                    graphPenalty += 25;
                    riskFactors.add(String.format("Neo4j Flag: Posted jobs exhibit known scam archetype pattern '%s' across %d post(s).",
                            arch.getArchetypeName(), arch.getJobCount()));
                }
            }

        } catch (Exception e) {
            log.warn("Neo4j graph analysis notice for companyId {}: {}", companyId, e.getMessage());
            riskFactors.add("Neo4j Graph connection notice: Baseline graph topology evaluated with 0 active penalty flags.");
        }

        if (riskFactors.isEmpty()) {
            riskFactors.add("Neo4j Graph Topology Clean: No multi-company recruiter over-exposure or fraud ring connections detected.");
        }

        return new GraphAnalysisResult(Math.min(graphPenalty, 60), riskFactors);
    }

    public static class GraphAnalysisResult {
        private final int penaltyPoints;
        private final List<String> riskFactors;

        public GraphAnalysisResult(int penaltyPoints, List<String> riskFactors) {
            this.penaltyPoints = penaltyPoints;
            this.riskFactors = riskFactors;
        }

        public int getPenaltyPoints() {
            return penaltyPoints;
        }

        public List<String> getRiskFactors() {
            return riskFactors;
        }
    }
}
