package com.hireguard.trust.impl;

import com.hireguard.client.AiServiceClient;
import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.enums.VerificationStatus;
import com.hireguard.model.mongodb.Company;
import com.hireguard.model.mongodb.TrustReport;
import com.hireguard.repository.mongodb.CompanyRepository;
import com.hireguard.repository.mongodb.TrustReportRepository;
import com.hireguard.service.GraphService;
import com.hireguard.service.TrustScoreService;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service Implementation: GraphAwareTrustScoreEngine (@Primary)
 *
 * SCORING METHODOLOGY FORMULA (Paper Methodology Section):
 * =========================================================================================
 *  TrustScore = BaseScore (100.0) - MongoStatusPenalty - AiPenalty - GraphPenalty
 *
 * 1. BaseScore = 100.0 points.
 * 2. MongoStatusPenalty:
 *    - VERIFIED: -0 pts
 *    - PENDING: -15 pts
 *    - UNVERIFIED / Default: -25 pts
 *    - REJECTED / SUSPENDED: -50 pts
 * 3. AiPenalty = (AiScamProbability * 0.40)
 *    - Evaluated from Python FastAPI microservice (/predict).
 *    - If AI container is unreachable (degraded state), AiPenalty = 0.
 * 4. GraphPenalty:
 *    - Domain Clustering (shared website domain): -20 pts
 *    - Multi-Company Recruiter Over-Exposure: -15 pts
 *    - Scam Archetype Matching (EXHIBITS_PATTERN): -25 pts
 *    - Syndicated Fraud Ring Membership (PART_OF_RING): -35 pts
 *    - Total GraphPenalty is bounded to max -60 pts.
 *
 * 5. Bounded Trust Score = max(0.0, min(100.0, RawTrustScore)).
 * 6. Risk Level Mapping:
 *    - TrustScore >= 80.0 -> LOW_RISK
 *    - 50.0 <= TrustScore < 80.0 -> MODERATE_RISK
 *    - TrustScore < 50.0 -> HIGH_RISK
 * =========================================================================================
 */
@Primary
@Service
public class GraphAwareTrustScoreEngine implements TrustScoreService {

    private final CompanyRepository companyRepository;
    private final TrustReportRepository trustReportRepository;
    private final com.hireguard.repository.mongodb.VerificationAuditLogRepository auditLogRepository;
    private final GraphService graphService;
    private final AiServiceClient aiServiceClient;

    public GraphAwareTrustScoreEngine(CompanyRepository companyRepository,
                                      TrustReportRepository trustReportRepository,
                                      com.hireguard.repository.mongodb.VerificationAuditLogRepository auditLogRepository,
                                      GraphService graphService,
                                      AiServiceClient aiServiceClient) {
        this.companyRepository = companyRepository;
        this.trustReportRepository = trustReportRepository;
        this.auditLogRepository = auditLogRepository;
        this.graphService = graphService;
        this.aiServiceClient = aiServiceClient;
    }

    @Override
    public TrustScoreResponse getTrustScore(String companyId) {
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        String companyName = companyOpt.map(Company::getName).orElse("");
        VerificationStatus status = companyOpt.map(Company::getRegistrationStatus).orElse(null);

        List<String> reasons = new ArrayList<>();
        double score = 100.0;

        // Fetch recent verification audit logs to include as reasons
        List<com.hireguard.model.mongodb.VerificationAuditLog> auditLogs = auditLogRepository.findByCompanyId(companyId);
        if (auditLogs != null) {
            for (com.hireguard.model.mongodb.VerificationAuditLog log : auditLogs) {
                // only add recent logs within the last 5 minutes to avoid duplicates from old scans
                if (log.getTimestamp().isAfter(Instant.now().minusSeconds(300))) {
                    reasons.add(log.getCheckType() + " Audit: " + log.getResult());
                }
            }
        }

        // 1. Evaluate MongoDB Verification Status Penalty
        if (status == VerificationStatus.VERIFIED) {
            reasons.add("MongoDB Verification Audit: Employer registration status is fully VERIFIED (+0 penalty).");
        } else if (status == VerificationStatus.PENDING) {
            score -= 15.0;
            reasons.add("MongoDB Verification Audit: Employer status is PENDING verification (-15 pts penalty).");
        } else if (status == VerificationStatus.REJECTED || status == VerificationStatus.SUSPICIOUS) {
            score -= 40.0;
            reasons.add("MongoDB Verification Audit: Employer status is REJECTED/SUSPICIOUS (-40 pts penalty).");
        } else {
            score -= 25.0;
            reasons.add("MongoDB Verification Audit: Employer status is unverified (-25 pts penalty).");
        }

        // 2. Evaluate Python AI NLP Microservice Scam Probability
        AiServiceClient.AiPredictionResult aiResult = aiServiceClient.predictScam(
                "Representative profile lookup for employer: " + companyName,
                companyName,
                ""
        );

        if (aiResult.isServiceAvailable()) {
            double aiPenalty = aiResult.getScamProbability() * 0.40;
            score -= aiPenalty;
            reasons.add(String.format("Python AI Transformer Scan: Evaluated scam probability %d%% (-%.1f pts penalty).",
                    aiResult.getScamProbability(), aiPenalty));
            reasons.addAll(aiResult.getReasons());
        } else {
            reasons.addAll(aiResult.getReasons());
        }

        // 3. Evaluate Neo4j Multi-Hop Graph Anomaly Traversals
        GraphService.GraphAnalysisResult graphResult = graphService.analyzeCompanyGraph(companyId);
        score -= graphResult.getPenaltyPoints();
        List<String> graphFactors = graphResult.getRiskFactors();

        // 4. Bound final trust score (0.0 to 100.0)
        double finalTrustScore = Math.max(0.0, Math.min(100.0, score));

        // 5. Map to Risk Level Tier
        com.hireguard.enums.RiskLevel enumRiskLevel;
        String riskLevelStr;
        if (finalTrustScore >= 80.0) {
            enumRiskLevel = com.hireguard.enums.RiskLevel.LOW;
            riskLevelStr = "LOW_RISK";
        } else if (finalTrustScore >= 50.0) {
            enumRiskLevel = com.hireguard.enums.RiskLevel.MEDIUM;
            riskLevelStr = "MODERATE_RISK";
        } else {
            enumRiskLevel = com.hireguard.enums.RiskLevel.HIGH;
            riskLevelStr = "HIGH_RISK";
        }

        // Persist TrustReport document to MongoDB for historical tracking
        TrustReport report = new TrustReport();
        report.setCompanyId(companyId);
        report.setTrustScore(finalTrustScore);
        report.setRiskLevel(enumRiskLevel);
        report.setReasons(reasons);
        report.setGraphRiskFactors(graphFactors);
        report.setGeneratedAt(Instant.now());
        try {
            trustReportRepository.save(report);
        } catch (Exception e) {
            // Non-blocking log if DB save fails
        }

        return new TrustScoreResponse(
                companyId,
                finalTrustScore,
                riskLevelStr,
                reasons,
                graphFactors,
                report.getGeneratedAt(),
                false // Live calculated report, not a static stub
        );
    }
}
