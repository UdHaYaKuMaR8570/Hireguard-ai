package com.hireguard.model.mongodb;

import com.hireguard.enums.VerificationStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Company profile details.
 * 
 * Why MongoDB: Stores extensive, unstructured or flexible attributes like descriptions, 
 * metadata, and historical domain age which are retrieved as single documents.
 */
@Document(collection = "companies")
public class Company {
    @Id
    private String id;
    
    @Indexed
    private String name;
    
    private String website;
    private Integer domainAge;
    
    @Indexed
    @Field(targetType = FieldType.STRING)
    private VerificationStatus registrationStatus;
    
    private String countryOfRegistration;
    private String taxIdentifierMasked;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public Company() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public Integer getDomainAge() { return domainAge; }
    public void setDomainAge(Integer domainAge) { this.domainAge = domainAge; }
    public VerificationStatus getRegistrationStatus() { return registrationStatus; }
    public void setRegistrationStatus(VerificationStatus registrationStatus) { this.registrationStatus = registrationStatus; }
    public String getCountryOfRegistration() { return countryOfRegistration; }
    public void setCountryOfRegistration(String countryOfRegistration) { this.countryOfRegistration = countryOfRegistration; }
    public String getTaxIdentifierMasked() { return taxIdentifierMasked; }
    public void setTaxIdentifierMasked(String taxIdentifierMasked) { this.taxIdentifierMasked = taxIdentifierMasked; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
