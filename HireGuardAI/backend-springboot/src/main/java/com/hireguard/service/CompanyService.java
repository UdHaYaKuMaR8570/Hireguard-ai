package com.hireguard.service;

import com.hireguard.dto.request.CompanyVerifyRequest;
import com.hireguard.dto.response.CompanyResponse;
import com.hireguard.dto.response.TrustScoreResponse;
import com.hireguard.exception.ResourceNotFoundException;
import com.hireguard.model.mongodb.Company;
import com.hireguard.repository.mongodb.CompanyRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service Layer: CompanyService
 * Encapsulates employer onboarding, company profile lookups, and name searching.
 * Connects with TrustScoreService to embed trust score summaries into response DTOs.
 */
@Service
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final TrustScoreService trustScoreService;

    public CompanyService(CompanyRepository companyRepository, TrustScoreService trustScoreService) {
        this.companyRepository = companyRepository;
        this.trustScoreService = trustScoreService;
    }

    public CompanyResponse verifyCompany(CompanyVerifyRequest request) {
        // Check if company already exists by website or name
        Optional<Company> existingByWebsite = companyRepository.findByWebsiteIgnoreCase(request.getWebsite());
        Company company = existingByWebsite.orElseGet(() -> 
                companyRepository.findByNameIgnoreCase(request.getCompanyName()).orElse(null)
        );

        if (company == null) {
            // Create new Company document
            company = new Company();
            company.setId("cmp-" + UUID.randomUUID().toString().substring(0, 8));
            company.setName(request.getCompanyName());
            company.setWebsite(request.getWebsite());
            company.setDomainAge(30); // Rule-based placeholder value for new domain ingestion
            company.setRegistrationStatus(com.hireguard.enums.VerificationStatus.PENDING);
            company.setCountryOfRegistration("US");
            company.setTaxIdentifierMasked("XX-XXX0000");
            company.setCreatedAt(Instant.now());
            company.setUpdatedAt(Instant.now());
        } else {
            // Update existing company timestamp and website
            company.setWebsite(request.getWebsite());
            company.setUpdatedAt(Instant.now());
        }

        Company savedCompany = companyRepository.save(company);
        
        // Fetch trust score (returns existing report or Phase 2 temporary stub)
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
