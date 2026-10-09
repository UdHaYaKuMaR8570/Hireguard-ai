package com.hireguard.dto.response;

import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO representing outcome of blacklist database audit.
 */
public class BlacklistVerificationResult {

    private boolean blacklisted;
    private String matchedType; // DOMAIN, EMAIL, COMPANY, PHONE
    private String matchedValue;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String source; // INTERNAL_REPORTS, EXTERNAL_FEED
    private String reason;
    private int riskScore; // 0 (clear) to 100 (critical match)
    private List<String> reasons;

    public BlacklistVerificationResult() {
        this.reasons = new ArrayList<>();
    }

    public BlacklistVerificationResult(boolean blacklisted, String matchedType, String matchedValue,
                                       String severity, String source, String reason,
                                       int riskScore, List<String> reasons) {
        this.blacklisted = blacklisted;
        this.matchedType = matchedType;
        this.matchedValue = matchedValue;
        this.severity = severity;
        this.source = source;
        this.reason = reason;
        this.riskScore = riskScore;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    public static BlacklistVerificationResult clear() {
        List<String> reasons = new ArrayList<>();
        reasons.add("No matching blacklist entry found in active repository.");
        return new BlacklistVerificationResult(
                false, null, null, "NONE", "INTERNAL_REPORTS", "No match", 0, reasons
        );
    }

    public boolean isBlacklisted() {
        return blacklisted;
    }

    public void setBlacklisted(boolean blacklisted) {
        this.blacklisted = blacklisted;
    }

    public String getMatchedType() {
        return matchedType;
    }

    public void setMatchedType(String matchedType) {
        this.matchedType = matchedType;
    }

    public String getMatchedValue() {
        return matchedValue;
    }

    public void setMatchedValue(String matchedValue) {
        this.matchedValue = matchedValue;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
    }

    public List<String> getReasons() {
        return reasons;
    }

    public void setReasons(List<String> reasons) {
        this.reasons = reasons;
    }
}
