package com.hireguard.dto.response;

import java.time.Instant;

/**
 * Response DTO encapsulating Employer/Company profile details and trust status.
 * Never exposes direct internal database entity fields without DTO mapping.
 */
public class CompanyResponse {

    private String id;
    private String name;
    private String website;
    private Integer domainAge;
    private String registrationStatus;
    private String countryOfRegistration;
    private String taxIdentifierMasked;
    private Instant createdAt;
    private Instant updatedAt;
    private TrustScoreResponse trustSummary; // Optional embedded trust summary

    public CompanyResponse() {
    }

    public CompanyResponse(String id, String name, String website, Integer domainAge, String registrationStatus, String countryOfRegistration, String taxIdentifierMasked, Instant createdAt, Instant updatedAt, TrustScoreResponse trustSummary) {
        this.id = id;
        this.name = name;
        this.website = website;
        this.domainAge = domainAge;
        this.registrationStatus = registrationStatus;
        this.countryOfRegistration = countryOfRegistration;
        this.taxIdentifierMasked = taxIdentifierMasked;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.trustSummary = trustSummary;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public Integer getDomainAge() {
        return domainAge;
    }

    public void setDomainAge(Integer domainAge) {
        this.domainAge = domainAge;
    }

    public String getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(String registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public String getCountryOfRegistration() {
        return countryOfRegistration;
    }

    public void setCountryOfRegistration(String countryOfRegistration) {
        this.countryOfRegistration = countryOfRegistration;
    }

    public String getTaxIdentifierMasked() {
        return taxIdentifierMasked;
    }

    public void setTaxIdentifierMasked(String taxIdentifierMasked) {
        this.taxIdentifierMasked = taxIdentifierMasked;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public TrustScoreResponse getTrustSummary() {
        return trustSummary;
    }

    public void setTrustSummary(TrustScoreResponse trustSummary) {
        this.trustSummary = trustSummary;
    }
}
