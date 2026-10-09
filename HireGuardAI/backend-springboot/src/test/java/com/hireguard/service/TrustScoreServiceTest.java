package com.hireguard.service;

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
import com.hireguard.repository.mongodb.CompanyRepository;
import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.mongodb.JobPostRepository;
import com.hireguard.repository.mongodb.TrustReportRepository;
import com.hireguard.repository.mongodb.VerificationAuditLogRepository;
import com.hireguard.trust.impl.GraphAwareTrustScoreEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

class TrustScoreServiceTest {

    private GraphAwareTrustScoreEngine trustScoreEngine;
    private CompanyRepository companyRepository;
    private TrustReportRepository trustReportRepository;
    private VerificationAuditLogRepository auditLogRepository;
    private ComplaintRepository complaintRepository;
    private JobPostRepository jobPostRepository;
    private GraphService graphService;
    private AiServiceClient aiServiceClient;
    private BlacklistVerificationService blacklistService;
    private CompanyRegistrationService registrationService;
    private EmailValidationService emailValidationService;

    @BeforeEach
    void setUp() {
        companyRepository = Mockito.mock(CompanyRepository.class);
        trustReportRepository = Mockito.mock(TrustReportRepository.class);
        auditLogRepository = Mockito.mock(VerificationAuditLogRepository.class);
        complaintRepository = Mockito.mock(ComplaintRepository.class);
        jobPostRepository = Mockito.mock(JobPostRepository.class);
        graphService = Mockito.mock(GraphService.class);
        aiServiceClient = Mockito.mock(AiServiceClient.class);
        blacklistService = Mockito.mock(BlacklistVerificationService.class);
        registrationService = Mockito.mock(CompanyRegistrationService.class);
        emailValidationService = Mockito.mock(EmailValidationService.class);
        TrustScoreConfig trustScoreConfig = new TrustScoreConfig();

        trustScoreEngine = new GraphAwareTrustScoreEngine(
                companyRepository, trustReportRepository, auditLogRepository,
                complaintRepository, jobPostRepository,
                graphService, aiServiceClient, blacklistService, registrationService,
                emailValidationService, trustScoreConfig
        );
    }

    @Test
    void testVerifiedCompanyTrustScore() {
        Company company = new Company();
        company.setId("c1");
        company.setName("Acme Corp");
        company.setWebsite("acme.com");
        company.setDomainAge(48);
        company.setRegistrationStatus(VerificationStatus.VERIFIED);

        Mockito.when(companyRepository.findById("c1")).thenReturn(Optional.of(company));
        Mockito.when(blacklistService.checkBlacklist(any(), any(), any())).thenReturn(BlacklistVerificationResult.clear());
        Mockito.when(registrationService.verifyCompanyRegistration(anyString(), any())).thenReturn(
                CompanyRegistrationResult.unavailable("Acme Corp", null, "Provider unconfigured")
        );
        Mockito.when(complaintRepository.findByCompanyId("c1")).thenReturn(Collections.emptyList());
        Mockito.when(jobPostRepository.findByCompanyId("c1")).thenReturn(Collections.emptyList());
        Mockito.when(auditLogRepository.findByCompanyId("c1")).thenReturn(Collections.emptyList());

        // Email validation returns low risk for a clean company
        Mockito.when(emailValidationService.validateRecruiterEmail(any(), any(), any())).thenReturn(
                new EmailValidationResult("LOW", Collections.singletonList("No email issues"))
        );

        AiServiceClient.AiPredictionResult aiResult = new AiServiceClient.AiPredictionResult(true, 5, "LOW", Collections.singletonList("No AI anomalies"));
        Mockito.when(aiServiceClient.predictScam(anyString(), anyString(), anyString())).thenReturn(aiResult);

        GraphService.GraphAnalysisResult graphResult = new GraphService.GraphAnalysisResult(0, Collections.emptyList());
        Mockito.when(graphService.analyzeCompanyGraph("c1")).thenReturn(graphResult);

        TrustScoreResponse response = trustScoreEngine.getTrustScore("c1");
        assertNotNull(response);
        assertTrue(response.getTrustScore() >= 80.0, "Verified company with clean signals should have score >= 80, got: " + response.getTrustScore());
        assertEquals("LOW_RISK", response.getRiskLevel());
    }

    @Test
    void testSuspiciousCompanyLowTrustScore() {
        Company company = new Company();
        company.setId("c2");
        company.setName("FakeJobs Inc");
        company.setWebsite("fakejobs-scam.com");
        company.setDomainAge(2); // Very new domain
        company.setRegistrationStatus(VerificationStatus.REJECTED);

        Mockito.when(companyRepository.findById("c2")).thenReturn(Optional.of(company));

        // Blacklisted
        Mockito.when(blacklistService.checkBlacklist(any(), any(), any())).thenReturn(
                new BlacklistVerificationResult(true, "DOMAIN", "fakejobs-scam.com", "HIGH", "INTERNAL",
                        "Known scam domain", 85, Collections.singletonList("Blacklisted domain"))
        );
        Mockito.when(registrationService.verifyCompanyRegistration(anyString(), any())).thenReturn(
                CompanyRegistrationResult.unavailable("FakeJobs Inc", null, "Provider unconfigured")
        );

        // Multiple complaints
        java.util.List<com.hireguard.model.mongodb.Complaint> complaints = new ArrayList<>();
        for (int i = 0; i < 7; i++) {
            complaints.add(new com.hireguard.model.mongodb.Complaint());
        }
        Mockito.when(complaintRepository.findByCompanyId("c2")).thenReturn(complaints);
        Mockito.when(jobPostRepository.findByCompanyId("c2")).thenReturn(Collections.emptyList());
        Mockito.when(auditLogRepository.findByCompanyId("c2")).thenReturn(Collections.emptyList());

        AiServiceClient.AiPredictionResult aiResult = new AiServiceClient.AiPredictionResult(true, 75, "HIGH", Collections.singletonList("Scam patterns detected"));
        Mockito.when(aiServiceClient.predictScam(anyString(), anyString(), anyString())).thenReturn(aiResult);

        GraphService.GraphAnalysisResult graphResult = new GraphService.GraphAnalysisResult(30, Collections.singletonList("Fraud ring connection"));
        Mockito.when(graphService.analyzeCompanyGraph("c2")).thenReturn(graphResult);

        TrustScoreResponse response = trustScoreEngine.getTrustScore("c2");
        assertNotNull(response);
        assertTrue(response.getTrustScore() < 50.0, "Suspicious company should have score < 50, got: " + response.getTrustScore());
        assertEquals("HIGH_RISK", response.getRiskLevel());
    }

    @Test
    void testDifferentCompaniesGetDifferentScores() {
        // Company A: Clean & established
        Company companyA = new Company();
        companyA.setId("a1");
        companyA.setName("Google LLC");
        companyA.setWebsite("google.com");
        companyA.setDomainAge(300);
        companyA.setRegistrationStatus(VerificationStatus.VERIFIED);

        // Company B: New & unverified
        Company companyB = new Company();
        companyB.setId("b1");
        companyB.setName("QuickMoney Corp");
        companyB.setWebsite("quickmoney-work.com");
        companyB.setDomainAge(3);
        companyB.setRegistrationStatus(VerificationStatus.PENDING);

        Mockito.when(companyRepository.findById("a1")).thenReturn(Optional.of(companyA));
        Mockito.when(companyRepository.findById("b1")).thenReturn(Optional.of(companyB));

        Mockito.when(blacklistService.checkBlacklist(any(), any(), any())).thenReturn(BlacklistVerificationResult.clear());
        Mockito.when(registrationService.verifyCompanyRegistration(anyString(), any())).thenReturn(
                CompanyRegistrationResult.unavailable("test", null, "Unconfigured")
        );
        Mockito.when(complaintRepository.findByCompanyId("a1")).thenReturn(Collections.emptyList());
        Mockito.when(complaintRepository.findByCompanyId("b1")).thenReturn(Collections.singletonList(new com.hireguard.model.mongodb.Complaint()));
        Mockito.when(jobPostRepository.findByCompanyId(anyString())).thenReturn(Collections.emptyList());
        Mockito.when(auditLogRepository.findByCompanyId(anyString())).thenReturn(Collections.emptyList());

        AiServiceClient.AiPredictionResult lowRisk = new AiServiceClient.AiPredictionResult(true, 5, "LOW", Collections.singletonList("Clean"));
        AiServiceClient.AiPredictionResult medRisk = new AiServiceClient.AiPredictionResult(true, 40, "MEDIUM", Collections.singletonList("Some signals"));
        Mockito.when(aiServiceClient.predictScam(anyString(), Mockito.eq("Google LLC"), anyString())).thenReturn(lowRisk);
        Mockito.when(aiServiceClient.predictScam(anyString(), Mockito.eq("QuickMoney Corp"), anyString())).thenReturn(medRisk);

        GraphService.GraphAnalysisResult cleanGraph = new GraphService.GraphAnalysisResult(0, Collections.emptyList());
        Mockito.when(graphService.analyzeCompanyGraph(anyString())).thenReturn(cleanGraph);

        TrustScoreResponse responseA = trustScoreEngine.getTrustScore("a1");
        TrustScoreResponse responseB = trustScoreEngine.getTrustScore("b1");

        assertNotNull(responseA);
        assertNotNull(responseB);
        assertNotEquals(responseA.getTrustScore(), responseB.getTrustScore(),
                "Different companies with different profiles MUST get different trust scores");
        assertTrue(responseA.getTrustScore() > responseB.getTrustScore(),
                "Established verified company should score higher than new unverified one. A=" + responseA.getTrustScore() + " B=" + responseB.getTrustScore());
    }
}
