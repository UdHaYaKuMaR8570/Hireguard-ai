package com.hireguard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Configurable signal weights for HireGuard AI Trust Score Engine.
 * Configured in application.properties under hireguard.trust.weights.*
 */
@Component
@ConfigurationProperties(prefix = "hireguard.trust.weights")
public class TrustScoreConfig {

    private double whoisWeight = 0.15;            // 15%
    private double emailWeight = 0.15;            // 15%
    private double companyRegistrationWeight = 0.20; // 20%
    private double blacklistWeight = 0.20;        // 20%
    private double complaintWeight = 0.15;        // 15%
    private double aiAnalysisWeight = 0.15;       // 15%

    public double getWhoisWeight() {
        return whoisWeight;
    }

    public void setWhoisWeight(double whoisWeight) {
        this.whoisWeight = whoisWeight;
    }

    public double getEmailWeight() {
        return emailWeight;
    }

    public void setEmailWeight(double emailWeight) {
        this.emailWeight = emailWeight;
    }

    public double getCompanyRegistrationWeight() {
        return companyRegistrationWeight;
    }

    public void setCompanyRegistrationWeight(double companyRegistrationWeight) {
        this.companyRegistrationWeight = companyRegistrationWeight;
    }

    public double getBlacklistWeight() {
        return blacklistWeight;
    }

    public void setBlacklistWeight(double blacklistWeight) {
        this.blacklistWeight = blacklistWeight;
    }

    public double getComplaintWeight() {
        return complaintWeight;
    }

    public void setComplaintWeight(double complaintWeight) {
        this.complaintWeight = complaintWeight;
    }

    public double getAiAnalysisWeight() {
        return aiAnalysisWeight;
    }

    public void setAiAnalysisWeight(double aiAnalysisWeight) {
        this.aiAnalysisWeight = aiAnalysisWeight;
    }
}
