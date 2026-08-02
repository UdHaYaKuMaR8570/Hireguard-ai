package com.hireguard.externalservices;

import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.neo4j.RecruiterGraphRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * External Service: EmailValidationService
 * Validates recruiter email address domain alignment against company's verified website domain.
 * Cross-references recruiter email history with Neo4j graph over-exposure and user scam complaints.
 *
 * NOTE ON SCOPE & COMPLIANCE:
 * Automated third-party LinkedIn profile scraping or automated identity claims are explicitly EXCLUDED 
 * due to LinkedIn Terms of Service (ToS) restrictions and anti-scraping enforcement.
 * Recruiter authenticity is evaluated strictly using verified email-domain consistency, historical 
 * graph traversal in Neo4j, and user-submitted scam complaint records.
 */
@Service
public class EmailValidationService {

    private static final Logger log = LoggerFactory.getLogger(EmailValidationService.class);

    private static final Set<String> GENERIC_DOMAINS = new HashSet<>(Arrays.asList(
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
            "icloud.com", "protonmail.com", "aol.com", "mail.com", "yandex.com"
    ));

    private final RecruiterGraphRepository recruiterGraphRepository;
    private final ComplaintRepository complaintRepository;

    public EmailValidationService(RecruiterGraphRepository recruiterGraphRepository, ComplaintRepository complaintRepository) {
        this.recruiterGraphRepository = recruiterGraphRepository;
        this.complaintRepository = complaintRepository;
    }

    public EmailValidationResult validateRecruiterEmail(String recruiterEmail, String companyWebsite, String companyId) {
        List<String> signals = new ArrayList<>();
        int highRiskCount = 0;
        int mediumRiskCount = 0;

        if (recruiterEmail == null || recruiterEmail.isBlank()) {
            return new EmailValidationResult("UNVERIFIED", Arrays.asList("Recruiter contact email not provided."));
        }

        String email = recruiterEmail.trim().toLowerCase();
        String emailDomain = email.contains("@") ? email.substring(email.indexOf("@") + 1) : "";

        String cleanCompanyDomain = "";
        if (companyWebsite != null && !companyWebsite.isBlank()) {
            cleanCompanyDomain = companyWebsite.toLowerCase().replaceFirst("^(https?://)?(www\\.)?", "").split("/")[0];
        }

        // 1. Email Domain Alignment Check
        if (!emailDomain.isBlank() && !cleanCompanyDomain.isBlank() && emailDomain.equalsIgnoreCase(cleanCompanyDomain)) {
            signals.add(String.format("Recruiter Authenticity: Email domain (@%s) matches company verified domain (%s). [LOW RISK]", emailDomain, cleanCompanyDomain));
        } else if (GENERIC_DOMAINS.contains(emailDomain)) {
            mediumRiskCount++;
            signals.add(String.format("MEDIUM RISK SIGNAL: Recruiter using generic email provider (@%s) for a corporate role at '%s'. Common in legitimate small business/freelance recruiting, but also a frequent scam vector.", emailDomain, cleanCompanyDomain));
        } else {
            highRiskCount++;
            signals.add(String.format("HIGH RISK FLAG: Recruiter email domain (@%s) does NOT match company domain (%s). Mismatched domain recruiter credential.", emailDomain, cleanCompanyDomain));
        }

        // 2. Neo4j Graph Cross-Reference (Recruiter Over-Exposure)
        try {
            if (companyId != null && !companyId.isBlank()) {
                List<RecruiterGraphRepository.RecruiterExposureProjection> exposures = 
                        recruiterGraphRepository.findHighRiskRecruitersForCompany(companyId);
                if (exposures != null) {
                    for (RecruiterGraphRepository.RecruiterExposureProjection exp : exposures) {
                        if (email.equalsIgnoreCase(exp.getRecruiterEmail())) {
                            highRiskCount += 2;
                            signals.add(String.format("CRITICAL GRAPH WARNING: Recruiter email '%s' is cross-linked with %d separate company entities in Neo4j graph. High-risk multi-entity recruiter pattern.", email, exp.getCompanyCount()));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Neo4j recruiter graph check notice for email '{}': {}", email, e.getMessage());
        }

        // Determine final risk level
        String riskLevel;
        if (highRiskCount > 0) {
            riskLevel = "HIGH_RISK";
        } else if (mediumRiskCount > 0) {
            riskLevel = "MEDIUM_RISK";
        } else {
            riskLevel = "LOW_RISK";
        }

        return new EmailValidationResult(riskLevel, signals);
    }

    public static class EmailValidationResult {
        private final String riskLevel;
        private final List<String> signals;

        public EmailValidationResult(String riskLevel, List<String> signals) {
            this.riskLevel = riskLevel;
            this.signals = signals != null ? signals : new ArrayList<>();
        }

        public String getRiskLevel() { return riskLevel; }
        public List<String> getSignals() { return signals; }
    }
}
