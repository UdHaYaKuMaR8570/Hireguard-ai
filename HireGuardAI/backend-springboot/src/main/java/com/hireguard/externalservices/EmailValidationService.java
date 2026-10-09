package com.hireguard.externalservices;

import com.hireguard.dto.response.EmailValidationResult;
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
import java.util.regex.Pattern;

/**
 * External Service: EmailValidationService
 * Validates recruiter email address domain alignment against company's verified website domain.
 * Evaluates syntax, free provider usage, typosquatting/mismatch vectors, and Neo4j graph over-exposure.
 */
@Service
public class EmailValidationService {

    private static final Logger log = LoggerFactory.getLogger(EmailValidationService.class);

    private static final Pattern EMAIL_SYNTAX_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");

    private static final Set<String> GENERIC_DOMAINS = new HashSet<>(Arrays.asList(
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", 
            "icloud.com", "protonmail.com", "proton.me", "aol.com", "mail.com", "yandex.com"
    ));

    private final RecruiterGraphRepository recruiterGraphRepository;
    private final ComplaintRepository complaintRepository;

    public EmailValidationService(RecruiterGraphRepository recruiterGraphRepository, ComplaintRepository complaintRepository) {
        this.recruiterGraphRepository = recruiterGraphRepository;
        this.complaintRepository = complaintRepository;
    }

    public EmailValidationResult validateRecruiterEmail(String recruiterEmail, String companyWebsite, String companyId) {
        List<String> signals = new ArrayList<>();
        int riskScore = 0;

        if (recruiterEmail == null || recruiterEmail.isBlank()) {
            signals.add("Recruiter contact email not provided.");
            return new EmailValidationResult(
                    "", "", false, false, false, false, 50, "UNVERIFIED", signals
            );
        }

        String email = recruiterEmail.trim().toLowerCase();
        boolean syntaxValid = EMAIL_SYNTAX_PATTERN.matcher(email).matches();

        if (!syntaxValid) {
            signals.add(String.format("HIGH RISK FLAG: Recruiter email '%s' has invalid syntax formatting.", email));
            return new EmailValidationResult(
                    email, "", false, false, false, false, 90, "HIGH", signals
            );
        }

        String emailDomain = email.contains("@") ? email.substring(email.indexOf("@") + 1) : "";
        String cleanCompanyDomain = "";
        if (companyWebsite != null && !companyWebsite.isBlank()) {
            cleanCompanyDomain = companyWebsite.toLowerCase().replaceFirst("^(https?://)?(www\\.)?", "").split("/")[0];
        }

        boolean freeEmailProvider = GENERIC_DOMAINS.contains(emailDomain);
        boolean domainMatch = false;
        boolean possibleDomainMismatch = false;

        // 1. Email Domain Alignment Check
        if (!emailDomain.isBlank() && !cleanCompanyDomain.isBlank() && emailDomain.equalsIgnoreCase(cleanCompanyDomain)) {
            domainMatch = true;
            signals.add(String.format("Recruiter email domain (@%s) matches verified company domain (%s).", emailDomain, cleanCompanyDomain));
        } else if (freeEmailProvider) {
            riskScore += 35;
            signals.add(String.format("NOTICE: Recruiter is using a free email provider (@%s) for company domain '%s'. Common in small businesses, but requires caution.", emailDomain, cleanCompanyDomain));
        } else if (!cleanCompanyDomain.isBlank()) {
            riskScore += 45;
            signals.add(String.format("HIGH RISK FLAG: Recruiter email domain (@%s) does NOT match company domain (%s).", emailDomain, cleanCompanyDomain));

            // Check for typosquatting / similarity
            if (isTypoSquattedDomain(emailDomain, cleanCompanyDomain)) {
                possibleDomainMismatch = true;
                riskScore += 30;
                signals.add(String.format("CRITICAL WARNING: Domain '@%s' resembles typosquatting variant of company domain '%s'.", emailDomain, cleanCompanyDomain));
            }
        }

        // 2. Neo4j Graph Cross-Reference (Recruiter Over-Exposure)
        try {
            if (companyId != null && !companyId.isBlank()) {
                List<RecruiterGraphRepository.RecruiterExposureProjection> exposures = 
                        recruiterGraphRepository.findHighRiskRecruitersForCompany(companyId);
                if (exposures != null) {
                    for (RecruiterGraphRepository.RecruiterExposureProjection exp : exposures) {
                        if (email.equalsIgnoreCase(exp.getRecruiterEmail())) {
                            riskScore += 40;
                            signals.add(String.format("CRITICAL GRAPH WARNING: Recruiter email '%s' is cross-linked with %d separate company entities in Neo4j graph.", email, exp.getCompanyCount()));
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Neo4j recruiter graph check notice for email '{}': {}", email, e.getMessage());
        }

        riskScore = Math.min(100, Math.max(0, riskScore));
        String riskLevel = riskScore >= 70 ? "HIGH" : (riskScore >= 30 ? "MEDIUM" : "LOW");

        return new EmailValidationResult(
                email, emailDomain, syntaxValid, domainMatch, freeEmailProvider,
                possibleDomainMismatch, riskScore, riskLevel, signals
        );
    }

    /**
     * Detect typosquatting variants (e.g. cornpany.com vs company.com, company-job.com vs company.com, etc.)
     */
    private boolean isTypoSquattedDomain(String emailDomain, String targetDomain) {
        if (emailDomain.isEmpty() || targetDomain.isEmpty()) return false;
        String eBase = emailDomain.split("\\.")[0];
        String tBase = targetDomain.split("\\.")[0];

        // Check for hyphenated spoof variants (e.g. company-careers.com, company-job.com)
        if (eBase.contains(tBase) || tBase.contains(eBase)) {
            return true;
        }

        // Check Levenshtein distance for close typos (distance of 1 or 2 characters)
        int distance = computeLevenshteinDistance(eBase, tBase);
        return distance > 0 && distance <= 2 && Math.abs(eBase.length() - tBase.length()) <= 2;
    }

    private int computeLevenshteinDistance(String lhs, String rhs) {
        int[][] dp = new int[lhs.length() + 1][rhs.length() + 1];
        for (int i = 0; i <= lhs.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= rhs.length(); j++) dp[0][j] = j;

        for (int i = 1; i <= lhs.length(); i++) {
            for (int j = 1; j <= rhs.length(); j++) {
                int cost = lhs.charAt(i - 1) == rhs.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1), dp[i - 1][j - 1] + cost);
            }
        }
        return dp[lhs.length()][rhs.length()];
    }
}
