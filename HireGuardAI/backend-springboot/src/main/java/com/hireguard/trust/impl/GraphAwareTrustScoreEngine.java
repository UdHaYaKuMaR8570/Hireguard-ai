package com.hireguard.trust.impl;

import com.hireguard.client.AiServiceClient;
import com.hireguard.config.TrustScoreConfig;
import com.hireguard.dto.response.BlacklistVerificationResult;
import com.hireguard.dto.response.CompanyRegistrationResult;
import com.hireguard.dto.response.EmailValidationResult;
import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.enums.VerificationStatus;
import com.hireguard.externalservices.BlacklistVerificationService;
import com.hireguard.externalservices.CompanyRegistrationService;
import com.hireguard.externalservices.EmailValidationService;
import com.hireguard.model.mongodb.Company;
import com.hireguard.model.mongodb.Complaint;
import com.hireguard.model.mongodb.JobPost;
import com.hireguard.model.mongodb.TrustReport;
import com.hireguard.repository.mongodb.CompanyRepository;
import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.mongodb.JobPostRepository;
import com.hireguard.repository.mongodb.TrustReportRepository;
import com.hireguard.repository.mongodb.VerificationAuditLogRepository;
import com.hireguard.service.GraphService;
import com.hireguard.service.TrustScoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service Implementation: GraphAwareTrustScoreEngine (@Primary)
 *
 * Multi-Signal Weighted Scoring Engine combining:
 * 1. WHOIS/Domain Verification (Config Weight: 15%)
 * 2. Email Validation (Config Weight: 15%)
 * 3. Company Registration Check (Config Weight: 20%)
 * 4. Blacklist / Reputation Check (Config Weight: 20%)
 * 5. Complaint & Status History (Config Weight: 15%)
 * 6. AI/NLP Scam Analysis & Graph Penalties (Config Weight: 15%)
 *
 * Each signal computes a component score in the range [0.0, 100.0] (higher = more trustworthy).
 * The final trust score is a weighted sum of all components, bounded to [0.0, 100.0].
 */
@Primary
@Service
public class GraphAwareTrustScoreEngine implements TrustScoreService {

    private static final Logger log = LoggerFactory.getLogger(GraphAwareTrustScoreEngine.class);

    private final CompanyRepository companyRepository;
    private final TrustReportRepository trustReportRepository;
    private final VerificationAuditLogRepository auditLogRepository;
    private final ComplaintRepository complaintRepository;
    private final JobPostRepository jobPostRepository;
    private final GraphService graphService;
    private final AiServiceClient aiServiceClient;
    private final BlacklistVerificationService blacklistVerificationService;
    private final CompanyRegistrationService companyRegistrationService;
    private final EmailValidationService emailValidationService;
    private final TrustScoreConfig trustScoreConfig;

    public GraphAwareTrustScoreEngine(CompanyRepository companyRepository,
                                      TrustReportRepository trustReportRepository,
                                      VerificationAuditLogRepository auditLogRepository,
                                      ComplaintRepository complaintRepository,
                                      JobPostRepository jobPostRepository,
                                      GraphService graphService,
                                      AiServiceClient aiServiceClient,
                                      BlacklistVerificationService blacklistVerificationService,
                                      CompanyRegistrationService companyRegistrationService,
                                      EmailValidationService emailValidationService,
                                      TrustScoreConfig trustScoreConfig) {
        this.companyRepository = companyRepository;
        this.trustReportRepository = trustReportRepository;
        this.auditLogRepository = auditLogRepository;
        this.complaintRepository = complaintRepository;
        this.jobPostRepository = jobPostRepository;
        this.graphService = graphService;
        this.aiServiceClient = aiServiceClient;
        this.blacklistVerificationService = blacklistVerificationService;
        this.companyRegistrationService = companyRegistrationService;
        this.emailValidationService = emailValidationService;
        this.trustScoreConfig = trustScoreConfig;
    }

    @Override
    public TrustScoreResponse getTrustScore(String companyId) {
        Optional<Company> companyOpt = companyRepository.findById(companyId);
        String companyName = companyOpt.map(Company::getName).orElse("");
        String website = companyOpt.map(Company::getWebsite).orElse("");
        Integer domainAge = companyOpt.map(Company::getDomainAge).orElse(null);
        VerificationStatus status = companyOpt.map(Company::getRegistrationStatus).orElse(null);

        List<String> reasons = new ArrayList<>();

        // ==========================================
        // SIGNAL 1: WHOIS / Domain Age (15%)
        // ==========================================
        double whoisScore = evaluateWhoisSignal(domainAge, website, reasons);

        // ==========================================
        // SIGNAL 2: Email Validation (15%)
        // ==========================================
        double emailScore = evaluateEmailSignal(companyId, website, reasons);

        // ==========================================
        // SIGNAL 3: Company Registration (20%)
        // ==========================================
        double registrationScore = evaluateRegistrationSignal(companyName, status, reasons);

        // ==========================================
        // SIGNAL 4: Blacklist Check (20%)
        // ==========================================
        double blacklistScore = evaluateBlacklistSignal(website, companyName, reasons);

        // ==========================================
        // SIGNAL 5: Complaint History (15%)
        // ==========================================
        double complaintScore = evaluateComplaintSignal(companyId, reasons);

        // ==========================================
        // SIGNAL 6: AI/NLP + Neo4j Graph (15%)
        // ==========================================
        double aiGraphScore = evaluateAiAndGraphSignal(companyId, companyName, reasons);

        // ==========================================
        // WEIGHTED COMBINATION
        // ==========================================
        double finalTrustScore =
                (whoisScore * trustScoreConfig.getWhoisWeight()) +
                (emailScore * trustScoreConfig.getEmailWeight()) +
                (registrationScore * trustScoreConfig.getCompanyRegistrationWeight()) +
                (blacklistScore * trustScoreConfig.getBlacklistWeight()) +
                (complaintScore * trustScoreConfig.getComplaintWeight()) +
                (aiGraphScore * trustScoreConfig.getAiAnalysisWeight());

        // Bound final trust score to [0.0, 100.0]
        finalTrustScore = Math.max(0.0, Math.min(100.0, finalTrustScore));

        log.info("Trust Score Breakdown for '{}' [id={}]: WHOIS={} Email={} Reg={} Blacklist={} Complaints={} AI+Graph={} => Final={}",
                companyName, companyId,
                String.format("%.1f", whoisScore), String.format("%.1f", emailScore),
                String.format("%.1f", registrationScore), String.format("%.1f", blacklistScore),
                String.format("%.1f", complaintScore), String.format("%.1f", aiGraphScore),
                String.format("%.1f", finalTrustScore));

        // Map to Risk Level Tier
        com.hireguard.enums.RiskLevel enumRiskLevel;
        String riskLevelStr;
        if (finalTrustScore >= 80.0) {
            enumRiskLevel = com.hireguard.enums.RiskLevel.LOW;
            riskLevelStr = "LOW_RISK";
        } else if (finalTrustScore >= 50.0) {
            enumRiskLevel = com.hireguard.enums.RiskLevel.MEDIUM;
            riskLevelStr = "MODERATE_RISK";
        } else {
            enumRiskLevel = com.hireguard.enums.RiskLevel.HIGH;
            riskLevelStr = "HIGH_RISK";
        }

        // Collect graph risk factors for response
        List<String> graphFactors = new ArrayList<>();
        try {
            GraphService.GraphAnalysisResult graphResult = graphService.analyzeCompanyGraph(companyId);
            graphFactors = graphResult.getRiskFactors();
        } catch (Exception e) {
            graphFactors.add("Neo4j graph analysis unavailable.");
        }

        // Persist TrustReport document to MongoDB for historical tracking
        TrustReport report = new TrustReport();
        report.setCompanyId(companyId);
        report.setTrustScore(finalTrustScore);
        report.setRiskLevel(enumRiskLevel);
        report.setReasons(reasons);
        report.setGraphRiskFactors(graphFactors);
        report.setGeneratedAt(Instant.now());
        try {
            trustReportRepository.save(report);
        } catch (Exception e) {
            // Non-blocking log if DB save fails
            log.warn("Failed to persist TrustReport for companyId '{}': {}", companyId, e.getMessage());
        }

        return new TrustScoreResponse(
                companyId,
                finalTrustScore,
                riskLevelStr,
                reasons,
                graphFactors,
                report.getGeneratedAt(),
                false
        );
    }

    // ==========================================
    // SIGNAL EVALUATION METHODS
    // ==========================================

    /**
     * Signal 1: WHOIS / Domain Age scoring.
     * Uses the stored domainAge (months) from the Company document to produce a trust component.
     * - Domain > 36 months → full score (100)
     * - Domain 24–36 months → 85
     * - Domain 12–24 months → 65
     * - Domain 6–12 months → 40
     * - Domain < 6 months → 15 (very risky, likely throwaway)
     * - No data → 50 (neutral)
     */
    private double evaluateWhoisSignal(Integer domainAge, String website, List<String> reasons) {
        if (domainAge == null) {
            reasons.add("WHOIS Audit: Domain age data unavailable — neutral scoring applied.");
            return 50.0;
        }

        if (domainAge > 36) {
            reasons.add(String.format("WHOIS Audit: Domain is well-established (%d months old). Strong trust signal.", domainAge));
            return 100.0;
        } else if (domainAge >= 24) {
            reasons.add(String.format("WHOIS Audit: Domain has moderate history (%d months old).", domainAge));
            return 85.0;
        } else if (domainAge >= 12) {
            reasons.add(String.format("WHOIS Audit: Domain is relatively new (%d months old). Minor risk signal.", domainAge));
            return 65.0;
        } else if (domainAge >= 6) {
            reasons.add(String.format("MEDIUM RISK: Domain '%s' registered only %d months ago.", website, domainAge));
            return 40.0;
        } else {
            reasons.add(String.format("HIGH RISK FLAG: Domain registered very recently (%d months). High potential for throwaway scam domain.", domainAge));
            return 15.0;
        }
    }

    /**
     * Signal 2: Email Validation scoring.
     * Retrieves the most recent recruiter email from audit logs or graph and evaluates it
     * using EmailValidationService for domain alignment, free provider usage, typosquatting.
     * Converts the email riskScore (0–100, where 100 = highest risk) to a trust component (inverted).
     */
    private double evaluateEmailSignal(String companyId, String website, List<String> reasons) {
        try {
            // Retrieve the most recent recruiter email from verification audit logs
            String recruiterEmail = findRecruiterEmailForCompany(companyId);

            if (recruiterEmail == null || recruiterEmail.isBlank()) {
                reasons.add("Email Audit: No recruiter email on file — neutral scoring applied.");
                return 50.0;
            }

            EmailValidationResult emailResult = emailValidationService.validateRecruiterEmail(recruiterEmail, website, companyId);

            // Convert email riskScore (0 = safest, 100 = riskiest) → trust component (100 = safest, 0 = riskiest)
            double emailTrust = 100.0 - emailResult.getRiskScore();

            // Include email validation reasons in the trust report
            if (emailResult.getReasons() != null) {
                reasons.addAll(emailResult.getReasons());
            }

            return Math.max(0.0, Math.min(100.0, emailTrust));
        } catch (Exception e) {
            log.warn("Email validation signal evaluation failed for companyId '{}': {}", companyId, e.getMessage());
            reasons.add("Email Audit: Evaluation encountered an error — neutral scoring applied.");
            return 50.0;
        }
    }

    /**
     * Signal 3: Company Registration scoring.
     * Checks government registration status via MCA/configured provider.
     * - Verified/Active → 100
     * - Unavailable → 60 (neutral, no penalty for missing credentials)
     * - Unverified → 25
     * Also incorporates the MongoDB VerificationStatus.
     */
    private double evaluateRegistrationSignal(String companyName, VerificationStatus mongoStatus, List<String> reasons) {
        double regScore = 60.0; // Default neutral

        // External registration check
        CompanyRegistrationResult regResult = companyRegistrationService.verifyCompanyRegistration(companyName, null);
        if (regResult.isVerified()) {
            regScore = 100.0;
            reasons.add("Government Registration Audit: Company active and verified.");
        } else if ("VERIFICATION_UNAVAILABLE".equals(regResult.getStatus())) {
            regScore = 60.0;
            reasons.add("Government Registration Audit: Provider unconfigured (neutral signal).");
        } else {
            regScore = 25.0;
            reasons.add("Government Registration Audit: Company registration unverified (-75 from base).");
        }

        // Blend with MongoDB verification status
        if (mongoStatus == VerificationStatus.VERIFIED) {
            regScore = Math.max(regScore, 90.0);
            reasons.add("MongoDB Verification Audit: Employer registration status fully VERIFIED.");
        } else if (mongoStatus == VerificationStatus.PENDING) {
            regScore = Math.min(regScore, 55.0);
            reasons.add("MongoDB Verification Audit: Employer status is PENDING verification.");
        } else if (mongoStatus == VerificationStatus.REJECTED || mongoStatus == VerificationStatus.SUSPICIOUS) {
            regScore = Math.min(regScore, 15.0);
            reasons.add("MongoDB Verification Audit: Employer status is REJECTED/SUSPICIOUS.");
        } else if (mongoStatus != null) {
            regScore = Math.min(regScore, 40.0);
            reasons.add("MongoDB Verification Audit: Employer status is unverified.");
        }

        return Math.max(0.0, Math.min(100.0, regScore));
    }

    /**
     * Signal 4: Blacklist Check scoring.
     * Cross-references domain, company name, and email against the blacklist database.
     * - Not blacklisted → 100
     * - Blacklisted → severity-based penalty (CRITICAL=5, HIGH=15, else=30)
     */
    private double evaluateBlacklistSignal(String website, String companyName, List<String> reasons) {
        BlacklistVerificationResult blacklistResult = blacklistVerificationService.checkBlacklist(website, companyName, null);
        if (blacklistResult.isBlacklisted()) {
            reasons.addAll(blacklistResult.getReasons());
            // Severity-based scoring
            String severity = blacklistResult.getSeverity();
            if ("CRITICAL".equalsIgnoreCase(severity)) {
                return 5.0;
            } else if ("HIGH".equalsIgnoreCase(severity)) {
                return 15.0;
            } else {
                return 30.0;
            }
        } else {
            reasons.add("Blacklist Audit: No active domain/company blacklist matches found.");
            return 100.0;
        }
    }

    /**
     * Signal 5: Complaint History scoring.
     * Queries all complaints filed against this company and scores based on volume.
     * - 0 complaints → 100
     * - 1 complaint → 75
     * - 2-3 complaints → 50
     * - 4-5 complaints → 25
     * - 6+ complaints → 5
     */
    private double evaluateComplaintSignal(String companyId, List<String> reasons) {
        try {
            List<Complaint> complaints = complaintRepository.findByCompanyId(companyId);
            int count = (complaints != null) ? complaints.size() : 0;

            if (count == 0) {
                reasons.add("Complaint History Audit: No user complaints filed against this employer.");
                return 100.0;
            } else if (count == 1) {
                reasons.add(String.format("Complaint History Audit: %d complaint filed. Minor concern.", count));
                return 75.0;
            } else if (count <= 3) {
                reasons.add(String.format("MEDIUM RISK: %d complaints filed against this employer.", count));
                return 50.0;
            } else if (count <= 5) {
                reasons.add(String.format("HIGH RISK: %d complaints filed against this employer.", count));
                return 25.0;
            } else {
                reasons.add(String.format("CRITICAL RISK: %d complaints filed against this employer — extremely high complaint volume.", count));
                return 5.0;
            }
        } catch (Exception e) {
            log.warn("Complaint history evaluation failed for companyId '{}': {}", companyId, e.getMessage());
            reasons.add("Complaint History Audit: Evaluation unavailable — neutral scoring applied.");
            return 50.0;
        }
    }

    /**
     * Signal 6: AI/NLP + Graph Penalty scoring.
     * Aggregates REAL job post descriptions from MongoDB and sends them to the Python AI service.
     * Also applies Neo4j graph traversal penalties (fraud rings, recruiter over-exposure).
     */
    private double evaluateAiAndGraphSignal(String companyId, String companyName, List<String> reasons) {
        double aiScore = 100.0;

        // --- AI/NLP Component: Aggregate real job post texts for this company ---
        try {
            List<JobPost> jobPosts = jobPostRepository.findByCompanyId(companyId);

            if (jobPosts != null && !jobPosts.isEmpty()) {
                // Aggregate all job descriptions into a combined text (capped at 5000 chars to avoid payload bloat)
                String aggregatedDescriptions = jobPosts.stream()
                        .filter(jp -> jp.getDescription() != null && !jp.getDescription().isBlank())
                        .map(jp -> jp.getTitle() + ": " + jp.getDescription())
                        .collect(Collectors.joining(" | "));

                if (aggregatedDescriptions.length() > 5000) {
                    aggregatedDescriptions = aggregatedDescriptions.substring(0, 5000);
                }

                // Find any recruiter email from job posts for the AI service
                String recruiterEmail = jobPosts.stream()
                        .filter(jp -> jp.getPostedBy() != null && !jp.getPostedBy().isBlank())
                        .map(JobPost::getPostedBy)
                        .findFirst()
                        .orElse("");

                AiServiceClient.AiPredictionResult aiResult = aiServiceClient.predictScam(
                        aggregatedDescriptions,
                        companyName,
                        recruiterEmail
                );

                if (aiResult.isServiceAvailable()) {
                    // Convert scamProbability (0–100, where 100 = most scammy) to trust component (inverted)
                    aiScore = 100.0 - aiResult.getScamProbability();
                    reasons.add(String.format("Python AI Transformer Scan: Evaluated %d job post(s) — scam probability %d%% (trust component: %.1f).",
                            jobPosts.size(), aiResult.getScamProbability(), aiScore));
                    reasons.addAll(aiResult.getReasons());
                } else {
                    reasons.addAll(aiResult.getReasons());
                    aiScore = 70.0; // Slightly conservative when AI service is down
                }
            } else {
                // No job posts stored yet — fall back to company name analysis only
                AiServiceClient.AiPredictionResult aiResult = aiServiceClient.predictScam(
                        "Employment profile analysis for employer: " + companyName,
                        companyName,
                        ""
                );

                if (aiResult.isServiceAvailable()) {
                    aiScore = 100.0 - aiResult.getScamProbability();
                    reasons.add(String.format("Python AI Transformer Scan: No job posts on file. Company name analysis — scam probability %d%%.",
                            aiResult.getScamProbability()));
                    reasons.addAll(aiResult.getReasons());
                } else {
                    reasons.addAll(aiResult.getReasons());
                    aiScore = 70.0;
                }
            }
        } catch (Exception e) {
            log.warn("AI/NLP signal evaluation failed for companyId '{}': {}", companyId, e.getMessage());
            reasons.add("Python AI Service: Evaluation encountered an error — conservative scoring applied.");
            aiScore = 60.0;
        }

        // --- Graph Penalty Component ---
        try {
            GraphService.GraphAnalysisResult graphResult = graphService.analyzeCompanyGraph(companyId);
            int graphPenalty = graphResult.getPenaltyPoints();
            if (graphPenalty > 0) {
                aiScore -= graphPenalty;
                reasons.add(String.format("Neo4j Graph Penalty: -%d points deducted from AI+Graph signal.", graphPenalty));
            }
            // Include graph risk factor explanations
            for (String factor : graphResult.getRiskFactors()) {
                if (!reasons.contains(factor)) {
                    reasons.add(factor);
                }
            }
        } catch (Exception e) {
            log.warn("Neo4j graph analysis failed for companyId '{}': {}", companyId, e.getMessage());
            reasons.add("Neo4j Graph: Analysis unavailable — no graph penalty applied.");
        }

        return Math.max(0.0, Math.min(100.0, aiScore));
    }

    // ==========================================
    // HELPER METHODS
    // ==========================================

    /**
     * Attempts to find the most recent recruiter email associated with a company.
     * Searches verification audit logs for the latest recruiter email reference.
     */
    private String findRecruiterEmailForCompany(String companyId) {
        try {
            // Check job posts for a recruiter email (postedBy field)
            List<JobPost> jobPosts = jobPostRepository.findByCompanyId(companyId);
            if (jobPosts != null) {
                for (JobPost jp : jobPosts) {
                    if (jp.getPostedBy() != null && !jp.getPostedBy().isBlank() && jp.getPostedBy().contains("@")) {
                        return jp.getPostedBy();
                    }
                }
            }

            // Fall back to audit logs for email references
            List<com.hireguard.model.mongodb.VerificationAuditLog> logs = auditLogRepository.findByCompanyId(companyId);
            if (logs != null) {
                for (com.hireguard.model.mongodb.VerificationAuditLog logEntry : logs) {
                    String result = logEntry.getResult();
                    if (result != null && result.contains("@") && result.contains(".")) {
                        // Extract email-like string from audit result
                        String[] words = result.split("\\s+");
                        for (String word : words) {
                            String cleaned = word.replaceAll("[^a-zA-Z0-9@._+-]", "");
                            if (cleaned.contains("@") && cleaned.contains(".")) {
                                return cleaned;
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Failed to retrieve recruiter email for companyId '{}': {}", companyId, e.getMessage());
        }
        return null;
    }
}
