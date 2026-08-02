package com.hireguard.service;

import com.hireguard.dto.request.CompanyVerifyRequest;
import com.hireguard.dto.response.CompanyResponse;
import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.enums.VerificationStatus;
import com.hireguard.exception.ResourceNotFoundException;
import com.hireguard.externalservices.CompanyVerificationService;
import com.hireguard.externalservices.EmailValidationService;
import com.hireguard.model.mongodb.Company;
import com.hireguard.repository.mongodb.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Layer: CompanyService
 * Encapsulates employer onboarding, real company/recruiter verification, company profile lookups, and name searching.
 * Connects with TrustScoreService to embed trust score summaries into response DTOs.
 */
@Service
public class CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);

    private final CompanyRepository companyRepository;
    private final TrustScoreService trustScoreService;
    private final CompanyVerificationService companyVerificationService;
    private final EmailValidationService emailValidationService;
    private final GraphNodeSyncService graphNodeSyncService;

    public CompanyService(CompanyRepository companyRepository,
                          TrustScoreService trustScoreService,
                          CompanyVerificationService companyVerificationService,
                          EmailValidationService emailValidationService,
                          GraphNodeSyncService graphNodeSyncService) {
        this.companyRepository = companyRepository;
        this.trustScoreService = trustScoreService;
        this.companyVerificationService = companyVerificationService;
        this.emailValidationService = emailValidationService;
        this.graphNodeSyncService = graphNodeSyncService;
    }

    public CompanyResponse verifyCompany(CompanyVerifyRequest request) {
        log.info("Executing real verification audit for employer '{}' (website: '{}', recruiter: '{}')",
                request.getCompanyName(), request.getWebsite(), request.getRecruiterEmail());

        // Check if company already exists by website or name
        Optional<Company> existingByWebsite = companyRepository.findByWebsiteIgnoreCase(request.getWebsite());
        Company company = existingByWebsite.orElseGet(() -> 
                companyRepository.findByNameIgnoreCase(request.getCompanyName()).orElse(null)
        );

        boolean isNew = (company == null);
        if (isNew) {
            company = new Company();
            company.setId("cmp-" + UUID.randomUUID().toString().substring(0, 8));
            company.setName(request.getCompanyName());
            company.setCreatedAt(Instant.now());
            company.setCountryOfRegistration("US");
            company.setTaxIdentifierMasked("XX-XXX0000");
        }

        company.setWebsite(request.getWebsite());
        company.setUpdatedAt(Instant.now());

        // 1. Run real Company Domain Verification (WHOIS, Website Reachability, SSL Check)
        CompanyVerificationService.VerificationResult domainResult = 
                companyVerificationService.verifyCompanyDomain(company.getId(), request.getCompanyName(), request.getWebsite());

        company.setRegistrationStatus(domainResult.getStatus());
        if (domainResult.getDomainAgeMonths() != null) {
            company.setDomainAge(domainResult.getDomainAgeMonths());
        } else if (company.getDomainAge() == null) {
            company.setDomainAge(12); // Fallback estimate if WHOIS lookup disabled
        }

        // 2. Run Recruiter Email Validation (Domain Alignment & Graph History)
        EmailValidationService.EmailValidationResult emailResult = 
                emailValidationService.validateRecruiterEmail(request.getRecruiterEmail(), request.getWebsite(), company.getId());

        log.info("Verification Complete for '{}' — Domain Status: {}, Email Risk: {}",
                company.getName(), domainResult.getStatus(), emailResult.getRiskLevel());

        Company savedCompany = companyRepository.save(company);

        // Phase 5: Sync company and recruiter data into Neo4j graph for trust topology queries
        graphNodeSyncService.syncCompanyToGraph(
                savedCompany.getId(),
                savedCompany.getName(),
                savedCompany.getWebsite(),
                request.getRecruiterEmail()
        );

        // Fetch trust score (returns live Graph-Aware Trust Score with embedded audit reasons)
        TrustScoreResponse trustSummary = trustScoreService.getTrustScore(savedCompany.getId());

        return mapToResponse(savedCompany, trustSummary);
    }

    public CompanyResponse getCompanyById(String id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        TrustScoreResponse trustSummary = trustScoreService.getTrustScore(company.getId());
        return mapToResponse(company, trustSummary);
    }

    public List<CompanyResponse> searchCompaniesByName(String name) {
        List<Company> companies = (name == null || name.isBlank()) ? 
                companyRepository.findAll() : companyRepository.findByNameContainingIgnoreCase(name);

        return companies.stream()
                .map(company -> mapToResponse(company, trustScoreService.getTrustScore(company.getId())))
                .collect(Collectors.toList());
    }

    private CompanyResponse mapToResponse(Company company, TrustScoreResponse trustSummary) {
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
                trustSummary
        );
    }
}
