package com.hireguard.dto.response;

import java.time.Instant;
import java.util.List;

/**
 * Response DTO encapsulating Employer Trust Score metrics and explainability factors.
 * Note: In Phase 2, if no existing report is found, a temporary rule-based stub response
 * is returned. Real AI/NLP and Neo4j graph-scoring engine logic arrives in Phases 4 and 5.
 */
public class TrustScoreResponse {

    private String companyId;
    private Double trustScore;
    private String riskLevel;
    private List<String> reasons;
    private List<String> graphRiskFactors;
    private Instant generatedAt;
    private Boolean isTemporaryStub; // True if returned by Phase 2 static rules

    public TrustScoreResponse() {
    }

    public TrustScoreResponse(String companyId, Double trustScore, String riskLevel, List<String> reasons, List<String> graphRiskFactors, Instant generatedAt, Boolean isTemporaryStub) {
        this.companyId = companyId;
        this.trustScore = trustScore;
        this.riskLevel = riskLevel;
        this.reasons = reasons;
        this.graphRiskFactors = graphRiskFactors;
        this.generatedAt = generatedAt;
        this.isTemporaryStub = isTemporaryStub;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public Double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Double trustScore) {
        this.trustScore = trustScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<String> getGraphRiskFactors() {
        return graphRiskFactors;
    }

    public void setGraphRiskFactors(List<String> graphRiskFactors) {
        this.graphRiskFactors = graphRiskFactors;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Boolean getIsTemporaryStub() {
        return isTemporaryStub;
    }

    public void setIsTemporaryStub(Boolean temporaryStub) {
        isTemporaryStub = temporaryStub;
    }
}
