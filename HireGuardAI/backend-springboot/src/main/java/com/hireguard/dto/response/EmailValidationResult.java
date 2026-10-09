package com.hireguard.dto.response;

import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO representing detailed outcome of recruiter email validation audit.
 */
public class EmailValidationResult {

    private String email;
    private String emailDomain;
    private boolean syntaxValid;
    private boolean domainMatch;
    private boolean freeEmailProvider;
    private boolean possibleDomainMismatch;
    private int riskScore; // 0 (best/lowest risk) to 100 (highest risk)
    private String riskLevel; // LOW, MEDIUM, HIGH, UNVERIFIED
    private List<String> reasons;

    public EmailValidationResult() {
        this.reasons = new ArrayList<>();
    }

    public EmailValidationResult(String email, String emailDomain, boolean syntaxValid,
                                  boolean domainMatch, boolean freeEmailProvider,
                                  boolean possibleDomainMismatch, int riskScore,
                                  String riskLevel, List<String> reasons) {
        this.email = email;
        this.emailDomain = emailDomain;
        this.syntaxValid = syntaxValid;
        this.domainMatch = domainMatch;
        this.freeEmailProvider = freeEmailProvider;
        this.possibleDomainMismatch = possibleDomainMismatch;
        this.riskScore = riskScore;
        this.riskLevel = riskLevel;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    // Constructor for backwards compatibility with legacy simple status
    public EmailValidationResult(String riskLevel, List<String> reasons) {
        this.riskLevel = riskLevel;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEmailDomain() {
        return emailDomain;
    }

    public void setEmailDomain(String emailDomain) {
        this.emailDomain = emailDomain;
    }

    public boolean isSyntaxValid() {
        return syntaxValid;
    }

    public void setSyntaxValid(boolean syntaxValid) {
        this.syntaxValid = syntaxValid;
    }

    public boolean isDomainMatch() {
        return domainMatch;
    }

    public void setDomainMatch(boolean domainMatch) {
        this.domainMatch = domainMatch;
    }

    public boolean isFreeEmailProvider() {
        return freeEmailProvider;
    }

    public void setFreeEmailProvider(boolean freeEmailProvider) {
        this.freeEmailProvider = freeEmailProvider;
    }

    public boolean isPossibleDomainMismatch() {
        return possibleDomainMismatch;
    }

    public void setPossibleDomainMismatch(boolean possibleDomainMismatch) {
        this.possibleDomainMismatch = possibleDomainMismatch;
    }

    public int getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(int riskScore) {
        this.riskScore = riskScore;
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
}
