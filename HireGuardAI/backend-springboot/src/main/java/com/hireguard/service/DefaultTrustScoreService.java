package com.hireguard.service;

import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.model.mongodb.TrustReport;
import com.hireguard.repository.mongodb.TrustReportRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Optional;

/**
 * Service Implementation: DefaultTrustScoreService
 * Phase 2 fallback implementation. Overridden by GraphAwareTrustScoreEngine (@Primary) in Phase 5.
 */
@Service
public class DefaultTrustScoreService implements TrustScoreService {

    private final TrustReportRepository trustReportRepository;

    public DefaultTrustScoreService(TrustReportRepository trustReportRepository) {
        this.trustReportRepository = trustReportRepository;
    }

    @Override
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
                    false
            );
        }

        return new TrustScoreResponse(
                companyId,
                75.0,
                "MODERATE_RISK",
                Arrays.asList(
                        "Baseline trust score assigned pending verification.",
                        "No verified AI/NLP scam probability anomalies detected in initial scan."
                ),
                Arrays.asList("No high-risk recruiter network connections flagged yet."),
                Instant.now(),
                true
        );
    }
}
