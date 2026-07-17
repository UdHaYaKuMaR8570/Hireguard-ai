package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * MongoDB Document Entity: Company
 * Stores complete corporate profile details, domain verification records, and trust flags.
 * Includes recommended B-Tree indexes on name and registrationStatus for fast search/filtering.
 */
@Document(collection = "companies")
@CompoundIndexes({
    @CompoundIndex(name = "cmp_name_status_idx", def = "{'name': 1, 'registrationStatus': 1}")
})
public class Company {

    @Id
    private String id;

    @Indexed
    private String name;

    private String website;

    private Integer domainAge;

    @Indexed
    @Field(targetType = FieldType.STRING)
    private RegistrationStatus registrationStatus;

    private String countryOfRegistration;

    private String taxIdentifierMasked;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public enum RegistrationStatus {
        VERIFIED,
        UNVERIFIED,
        SUSPICIOUS,
        BLACKLISTED
    }

    public Company() {
    }

    public Company(String id, String name, String website, Integer domainAge, RegistrationStatus registrationStatus, String countryOfRegistration, String taxIdentifierMasked) {
        this.id = id;
        this.name = name;
        this.website = website;
        this.domainAge = domainAge;
        this.registrationStatus = registrationStatus;
        this.countryOfRegistration = countryOfRegistration;
        this.taxIdentifierMasked = taxIdentifierMasked;
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

    public RegistrationStatus getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(RegistrationStatus registrationStatus) {
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

    @Override
    public String toString() {
        return "Company{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", website='" + website + '\'' +
                ", domainAge=" + domainAge +
                ", registrationStatus=" + registrationStatus +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
