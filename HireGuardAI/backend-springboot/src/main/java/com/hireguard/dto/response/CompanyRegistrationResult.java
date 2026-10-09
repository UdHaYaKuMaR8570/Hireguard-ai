package com.hireguard.dto.response;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Response DTO representing outcome of government/MCA company registration verification.
 */
public class CompanyRegistrationResult {

    private String companyName;
    private String registrationNumber;
    private String status; // ACTIVE, INACTIVE, DISSOLVED, VERIFICATION_UNAVAILABLE
    private boolean verified;
    private String source; // MCA_PROVIDER, GOVT_API
    private Instant verificationTimestamp;
    private int riskScore; // 0 to 100
    private List<String> reasons;

    public CompanyRegistrationResult() {
        this.reasons = new ArrayList<>();
        this.verificationTimestamp = Instant.now();
    }

    public CompanyRegistrationResult(String companyName, String registrationNumber, String status,
                                     boolean verified, String source, Instant verificationTimestamp,
                                     int riskScore, List<String> reasons) {
        this.companyName = companyName;
        this.registrationNumber = registrationNumber;
        this.status = status;
        this.verified = verified;
        this.source = source;
        this.verificationTimestamp = verificationTimestamp != null ? verificationTimestamp : Instant.now();
        this.riskScore = riskScore;
        this.reasons = reasons != null ? reasons : new ArrayList<>();
    }

    public static CompanyRegistrationResult unavailable(String companyName, String registrationNumber, String reasonMessage) {
        List<String> reasons = new ArrayList<>();
        reasons.add(reasonMessage != null ? reasonMessage : "Government registration verification service is unavailable.");
        return new CompanyRegistrationResult(
                companyName,
                registrationNumber,
                "VERIFICATION_UNAVAILABLE",
                false,
                "MCA_PROVIDER",
                Instant.now(),
                0, // 0 risk penalty for unavailable service
                reasons
        );
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public Instant getVerificationTimestamp() {
        return verificationTimestamp;
    }

    public void setVerificationTimestamp(Instant verificationTimestamp) {
        this.verificationTimestamp = verificationTimestamp;
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
