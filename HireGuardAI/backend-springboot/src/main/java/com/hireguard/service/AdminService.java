package com.hireguard.service;

import com.hireguard.dto.response.CompanyResponse;
import com.hireguard.dto.response.ComplaintResponse;
import com.hireguard.model.mongodb.Company;
import com.hireguard.model.mongodb.Complaint;
import com.hireguard.repository.mongodb.CompanyRepository;
import com.hireguard.repository.mongodb.ComplaintRepository;
import com.hireguard.repository.mongodb.TrustReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service Layer: AdminService (Phase 2 — Admin Endpoints)
 *
 * Provides aggregate queries across all MongoDB collections for the
 * Admin Verification & Audit Dashboard. Returns summary statistics,
 * full company lists, and complaint queues for admin-level review.
 *
 * Access is restricted to users with ADMIN role via SecurityConfig.
 */
@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final CompanyRepository companyRepository;
    private final ComplaintRepository complaintRepository;
    private final TrustReportRepository trustReportRepository;
    private final TrustScoreService trustScoreService;

    public AdminService(CompanyRepository companyRepository,
                        ComplaintRepository complaintRepository,
                        TrustReportRepository trustReportRepository,
                        TrustScoreService trustScoreService) {
        this.companyRepository = companyRepository;
        this.complaintRepository = complaintRepository;
        this.trustReportRepository = trustReportRepository;
        this.trustScoreService = trustScoreService;
    }

    /**
     * Returns a platform-wide statistics summary for the admin dashboard.
     * Includes total counts, verification breakdown, and risk distribution.
     */
    public Map<String, Object> getPlatformStats() {
        log.info("[Admin] Aggregating platform-wide statistics");

        List<Company> allCompanies = companyRepository.findAll();
        List<Complaint> allComplaints = complaintRepository.findAll();

        long totalCompanies = allCompanies.size();
        long totalComplaints = allComplaints.size();

        long verifiedCount = allCompanies.stream()
                .filter(c -> c.getRegistrationStatus() != null &&
                             c.getRegistrationStatus() == com.hireguard.enums.VerificationStatus.VERIFIED)
                .count();
        long pendingCount = allCompanies.stream()
                .filter(c -> c.getRegistrationStatus() == com.hireguard.enums.VerificationStatus.PENDING)
                .count();
        long suspiciousCount = allCompanies.stream()
                .filter(c -> c.getRegistrationStatus() == com.hireguard.enums.VerificationStatus.SUSPICIOUS ||
                             c.getRegistrationStatus() == com.hireguard.enums.VerificationStatus.REJECTED)
                .count();

        long openComplaints = allComplaints.stream()
                .filter(c -> c.getStatus() == com.hireguard.enums.ComplaintStatus.OPEN)
                .count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCompanies", totalCompanies);
        stats.put("totalComplaints", totalComplaints);
        stats.put("verifiedCompanies", verifiedCount);
        stats.put("pendingCompanies", pendingCount);
        stats.put("suspiciousCompanies", suspiciousCount);
        stats.put("openComplaints", openComplaints);
        stats.put("totalTrustReports", trustReportRepository.count());

        log.info("[Admin] Stats: companies={}, complaints={}, verified={}, pending={}, suspicious={}",
                totalCompanies, totalComplaints, verifiedCount, pendingCount, suspiciousCount);

        return stats;
    }

    /**
     * Returns all company documents with their trust summaries for admin review.
     */
    public List<CompanyResponse> getAllCompanies() {
        log.info("[Admin] Fetching all company documents from MongoDB");
        List<Company> all = companyRepository.findAll();
        return all.stream()
                .map(company -> {
                    try {
                        var trust = trustScoreService.getTrustScore(company.getId());
                        return new CompanyResponse(
                                company.getId(),
                                company.getName(),
                                company.getWebsite(),
                                company.getDomainAge(),
                                company.getRegistrationStatus() != null ? company.getRegistrationStatus().name() : "UNVERIFIED",
                                company.getCountryOfRegistration(),
                                company.getTaxIdentifierMasked(),
                                company.getCreatedAt(),
                                company.getUpdatedAt(),
                                trust
                        );
                    } catch (Exception e) {
                        log.warn("[Admin] Could not fetch trust score for company '{}': {}", company.getId(), e.getMessage());
                        return new CompanyResponse(
                                company.getId(),
                                company.getName(),
                                company.getWebsite(),
                                company.getDomainAge(),
                                company.getRegistrationStatus() != null ? company.getRegistrationStatus().name() : "UNVERIFIED",
                                company.getCountryOfRegistration(),
                                company.getTaxIdentifierMasked(),
                                company.getCreatedAt(),
                                company.getUpdatedAt(),
                                null
                        );
                    }
                })
                .collect(Collectors.toList());
    }

    /**
     * Returns all complaint documents filed across the platform for admin review.
     */
    public List<ComplaintResponse> getAllComplaints() {
        log.info("[Admin] Fetching all complaint documents from MongoDB");
        return complaintRepository.findAll().stream()
                .map(complaint -> new ComplaintResponse(
                        complaint.getId(),
                        complaint.getCompanyId(),
                        complaint.getUserId(),
                        complaint.getReason() != null ? complaint.getReason().name() : "OTHER",
                        complaint.getProof(),
                        complaint.getDescription(),
                        complaint.getStatus() != null ? complaint.getStatus().name() : "OPEN",
                        complaint.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
