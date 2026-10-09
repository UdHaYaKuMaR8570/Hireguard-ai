package com.hireguard.dto.response;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Response DTO for POST /api/verification/employer
 * Returns unified Multi-Verification pipeline report with signal breakdown.
 */
public class EmployerVerificationResponse {

    private String companyName;
    private double trustScore;
    private String riskLevel;
    private int confidenceScore;
    private Map<String, Object> signals;
    private Map<String, Object> verification;
    private List<String> reasons;
    private List<String> warnings;

    public EmployerVerificationResponse() {
        this.signals = new HashMap<>();
        this.verification = new HashMap<>();
        this.reasons = new ArrayList<>();
        this.warnings = new ArrayList<>();
    }

    public EmployerVerificationResponse(String companyName, double trustScore, String riskLevel,
                                        int confidenceScore, Map<String, Object> signals,
                                        Map<String, Object> verification, List<String> reasons,
                                        List<String> warnings) {
        this.companyName = companyName;
        this.trustScore = trustScore;
        this.riskLevel = riskLevel;
        this.confidenceScore = confidenceScore;
        this.signals = signals != null ? signals : new HashMap<>();
        this.verification = verification != null ? verification : new HashMap<>();
        this.reasons = reasons != null ? reasons : new ArrayList<>();
        this.warnings = warnings != null ? warnings : new ArrayList<>();
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public double getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(double trustScore) {
        this.trustScore = trustScore;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public int getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(int confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Map<String, Object> getSignals() {
        return signals;
    }

    public void setSignals(Map<String, Object> signals) {
        this.signals = signals;
    }

    public Map<String, Object> getVerification() {
        return verification;
    }

    public void setVerification(Map<String, Object> verification) {
        this.verification = verification;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
