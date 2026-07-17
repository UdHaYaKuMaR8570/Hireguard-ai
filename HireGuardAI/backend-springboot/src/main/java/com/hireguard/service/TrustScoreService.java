package com.hireguard.service;

import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.model.mongodb.TrustReport;
import com.hireguard.repository.mongodb.TrustReportRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

/**
 * Service Layer: TrustScoreService
 * Encapsulates employer trust score retrieval.
 *
 * TODO: Per Phase 2 rules, this service currently returns existing trust_reports documents
 * if present in MongoDB, or a temporary static/rule-based stub if absent.
 * In Phase 4 (AI/NLP Service Integration) and Phase 5 (Neo4j Graph Integration),
 * this stub will be replaced by live transformer probability scans and multi-hop graph topology checks.
 */
@Service
public class TrustScoreService {

    private final TrustReportRepository trustReportRepository;

    public TrustScoreService(TrustReportRepository trustReportRepository) {
        this.trustReportRepository = trustReportRepository;
    }

    public TrustScoreResponse getTrustScore(String companyId) {
        Optional<TrustReport> existingReport = trustReportRepository.findFirstByCompanyIdOrderByGeneratedAtDesc(companyId);

        if (existingReport.isPresent()) {
            TrustReport report = existingReport.get();
            return new TrustScoreResponse(
                    report.getCompanyId(),
                    report.getTrustScore(),
                    report.getRiskLevel() != null ? report.getRiskLevel().name() : "UNASSIGNED",
                    report.getReasons(),
                    report.getGraphRiskFactors(),
                    report.getGeneratedAt(),
                    false // Not a stub, retrieved from database
            );
        }

        // TEMPORARY STUB: Return static/rule-based baseline placeholder when no report exists yet
        return new TrustScoreResponse(
                companyId,
                75.0,
                "MODERATE_RISK",
                Arrays.asList(
                        "[TEMPORARY STUB] Baseline trust score assigned pending verification.",
                        "No verified AI/NLP scam probability anomalies detected in initial scan.",
                        "Graph analysis queued for Phase 5 execution."
                ),
                Arrays.asList("No high-risk recruiter network connections flagged yet."),
                Instant.now(),
                true // Flagged as temporary stub
        );
    }
}
