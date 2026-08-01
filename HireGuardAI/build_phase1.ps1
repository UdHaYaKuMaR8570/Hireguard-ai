$base_dir = "d:\New folder\JOB SCAM PREVENTION\HireGuardAI"

$files = @{
    "backend-springboot\src\main\java\com\hireguard\enums\RiskLevel.java" = @"
package com.hireguard.enums;

public enum RiskLevel {
    LOW,
    MEDIUM,
    HIGH
}
"@
    "backend-springboot\src\main\java\com\hireguard\enums\VerificationStatus.java" = @"
package com.hireguard.enums;

public enum VerificationStatus {
    VERIFIED,
    PENDING,
    SUSPICIOUS,
    REJECTED
}
"@
    "backend-springboot\src\main\java\com\hireguard\enums\ComplaintStatus.java" = @"
package com.hireguard.enums;

public enum ComplaintStatus {
    OPEN,
    UNDER_REVIEW,
    RESOLVED
}
"@
    "backend-springboot\src\main\java\com\hireguard\constants\TrustScoreConstants.java" = @"
package com.hireguard.constants;

/**
 * Centralized constants for trust scoring to avoid magic numbers.
 */
public final class TrustScoreConstants {
    private TrustScoreConstants() {}

    public static final int MAX_TRUST_SCORE = 100;
    public static final int MIN_TRUST_SCORE = 0;
    
    public static final int THRESHOLD_HIGH_RISK = 30;
    public static final int THRESHOLD_MEDIUM_RISK = 70;
}
"@
    "backend-springboot\src\main\java\com\hireguard\config\MongoConfig.java" = @"
package com.hireguard.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB Configuration
 * Enables auditing to automatically populate @CreatedDate and @LastModifiedDate.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
"@
    "backend-springboot\src\main\java\com\hireguard\config\Neo4jConfig.java" = @"
package com.hireguard.config;

import org.springframework.context.annotation.Configuration;

/**
 * Neo4j Configuration
 */
@Configuration
public class Neo4jConfig {
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\User.java" = @"
package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Represents a system user.
 * 
 * Why MongoDB: Users are primary application entities with mostly flat attributes.
 * Their core lifecycle does not require graph traversals.
 */
@Document(collection = `"users`")
public class User {
    @Id
    private String id;
    private String name;
    private String email;
    private String password;
    private String role;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public User() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\Company.java" = @"
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
@Document(collection = `"companies`")
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
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\JobPost.java" = @"
package com.hireguard.model.mongodb;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Why MongoDB: Job descriptions contain heavy text and rich content suitable for a document store.
 */
@Document(collection = `"job_posts`")
public class JobPost {
    @Id
    private String id;
    private String companyId;
    private String title;
    private String description;
    private String postedBy;

    @CreatedDate
    private Instant createdAt;

    public JobPost() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\Complaint.java" = @"
package com.hireguard.model.mongodb;

import com.hireguard.enums.ComplaintStatus;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/**
 * Why MongoDB: Contains arbitrary text data (reason) and references to cloud storage (proof).
 */
@Document(collection = `"complaints`")
public class Complaint {
    @Id
    private String id;
    
    @Indexed
    private String companyId;
    
    private String userId;
    private String reason;
    private String proof;
    
    @Indexed
    @Field(targetType = FieldType.STRING)
    private ComplaintStatus status;

    @Indexed
    @CreatedDate
    private Instant createdAt;

    public Complaint() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getProof() { return proof; }
    public void setProof(String proof) { this.proof = proof; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\TrustReport.java" = @"
package com.hireguard.model.mongodb;

import com.hireguard.enums.RiskLevel;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;
import java.util.List;

/**
 * Why MongoDB: Pre-aggregated report snapshot for fast retrieval, 
 * avoiding complex graph traversals at read-time for standard views.
 */
@Document(collection = `"trust_reports`")
public class TrustReport {
    @Id
    private String id;
    private String companyId;
    private Double trustScore;
    
    @Field(targetType = FieldType.STRING)
    private RiskLevel riskLevel;
    
    private List<String> reasons;
    private Instant generatedAt;

    public TrustReport() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public Double getTrustScore() { return trustScore; }
    public void setTrustScore(Double trustScore) { this.trustScore = trustScore; }
    public RiskLevel getRiskLevel() { return riskLevel; }
    public void setRiskLevel(RiskLevel riskLevel) { this.riskLevel = riskLevel; }
    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
    public Instant getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(Instant generatedAt) { this.generatedAt = generatedAt; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\VerificationAuditLog.java" = @"
package com.hireguard.model.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = `"verification_audit_logs`")
public class VerificationAuditLog {
    @Id
    private String id;
    private String companyId;
    private String checkType;
    private String result;
    private Instant timestamp;

    public VerificationAuditLog() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCompanyId() { return companyId; }
    public void setCompanyId(String companyId) { this.companyId = companyId; }
    public String getCheckType() { return checkType; }
    public void setCheckType(String checkType) { this.checkType = checkType; }
    public String getResult() { return result; }
    public void setResult(String result) { this.result = result; }
    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\mongodb\ScamPattern.java" = @"
package com.hireguard.model.mongodb;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = `"scam_patterns`")
public class ScamPattern {
    @Id
    private String id;
    private String patternName;
    private String description;
    private List<String> exampleKeywords;

    public ScamPattern() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getPatternName() { return patternName; }
    public void setPatternName(String patternName) { this.patternName = patternName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getExampleKeywords() { return exampleKeywords; }
    public void setExampleKeywords(List<String> exampleKeywords) { this.exampleKeywords = exampleKeywords; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\WorksFor.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class WorksFor {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private CompanyNode company;

    public WorksFor() {}
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CompanyNode getCompany() { return company; }
    public void setCompany(CompanyNode company) { this.company = company; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\Posted.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.JobPostNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Posted {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private JobPostNode jobPost;

    public Posted() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public JobPostNode getJobPost() { return jobPost; }
    public void setJobPost(JobPostNode jobPost) { this.jobPost = jobPost; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\Reported.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ComplaintNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Reported {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private ComplaintNode complaint;

    public Reported() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ComplaintNode getComplaint() { return complaint; }
    public void setComplaint(ComplaintNode complaint) { this.complaint = complaint; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\Owns.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.WebsiteNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class Owns {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private WebsiteNode website;

    public Owns() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public WebsiteNode getWebsite() { return website; }
    public void setWebsite(WebsiteNode website) { this.website = website; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\ExhibitsPattern.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.ScamArchetypeNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class ExhibitsPattern {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private ScamArchetypeNode scamArchetype;

    public ExhibitsPattern() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ScamArchetypeNode getScamArchetype() { return scamArchetype; }
    public void setScamArchetype(ScamArchetypeNode scamArchetype) { this.scamArchetype = scamArchetype; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\PartOfRing.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.FraudRingNode;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

@RelationshipProperties
public class PartOfRing {
    @RelationshipId
    private Long id;
    
    @TargetNode
    private FraudRingNode fraudRing;

    public PartOfRing() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public FraudRingNode getFraudRing() { return fraudRing; }
    public void setFraudRing(FraudRingNode fraudRing) { this.fraudRing = fraudRing; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\relationships\About.java" = @"
package com.hireguard.model.neo4j.relationships;

import com.hireguard.model.neo4j.CompanyNode;
import org.springframework.data.neo4j.core.schema.Property;
import org.springframework.data.neo4j.core.schema.RelationshipId;
import org.springframework.data.neo4j.core.schema.RelationshipProperties;
import org.springframework.data.neo4j.core.schema.TargetNode;

import java.time.Instant;

@RelationshipProperties
public class About {
    @RelationshipId
    private Long id;
    
    @Property(`"reportedAt`")
    private Instant reportedAt;
    
    @TargetNode
    private CompanyNode company;

    public About() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Instant getReportedAt() { return reportedAt; }
    public void setReportedAt(Instant reportedAt) { this.reportedAt = reportedAt; }
    public CompanyNode getCompany() { return company; }
    public void setCompany(CompanyNode company) { this.company = company; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\UserNode.java" = @"
package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Reported;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: To detect users who submit numerous complaints, or potentially 
 * malicious coordinated reporting behavior.
 */
@Node(`"User`")
public class UserNode {
    @Id
    private String id; // Matches MongoDB User ID

    @Relationship(type = `"REPORTED`", direction = Relationship.Direction.OUTGOING)
    private Set<Reported> complaints = new HashSet<>();

    public UserNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Set<Reported> getComplaints() { return complaints; }
    public void setComplaints(Set<Reported> complaints) { this.complaints = complaints; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\CompanyNode.java" = @"
package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Owns;
import com.hireguard.model.neo4j.relationships.PartOfRing;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Enables discovering complex patterns, such as multiple companies 
 * sharing the same IP/Websites, or being linked to the same Fraud Rings.
 */
@Node(`"Company`")
public class CompanyNode {
    @Id
    private String id; // Matches MongoDB ID
    private String name;

    @Relationship(type = `"OWNS`", direction = Relationship.Direction.OUTGOING)
    private Set<Owns> websites = new HashSet<>();

    @Relationship(type = `"PART_OF_RING`", direction = Relationship.Direction.OUTGOING)
    private Set<PartOfRing> fraudRings = new HashSet<>();

    // Using WorksFor from Recruiter side, or HasRecruiter from Company side.
    // The requirement is (Company)-[:HAS_RECRUITER]->(Recruiter)
    @Relationship(type = `"HAS_RECRUITER`", direction = Relationship.Direction.OUTGOING)
    private Set<RecruiterNode> recruiters = new HashSet<>();

    public CompanyNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<Owns> getWebsites() { return websites; }
    public void setWebsites(Set<Owns> websites) { this.websites = websites; }
    public Set<PartOfRing> getFraudRings() { return fraudRings; }
    public void setFraudRings(Set<PartOfRing> fraudRings) { this.fraudRings = fraudRings; }
    public Set<RecruiterNode> getRecruiters() { return recruiters; }
    public void setRecruiters(Set<RecruiterNode> recruiters) { this.recruiters = recruiters; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\RecruiterNode.java" = @"
package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.Posted;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Recruiters can move between fake companies or post multiple scam jobs. 
 * Graph traversals quickly reveal if a recruiter is a known bad actor.
 */
@Node(`"Recruiter`")
public class RecruiterNode {
    @Id
    private String id;
    private String name;

    @Relationship(type = `"POSTED`", direction = Relationship.Direction.OUTGOING)
    private Set<Posted> jobPosts = new HashSet<>();

    public RecruiterNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Set<Posted> getJobPosts() { return jobPosts; }
    public void setJobPosts(Set<Posted> jobPosts) { this.jobPosts = jobPosts; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\JobPostNode.java" = @"
package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.ExhibitsPattern;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Links job posts directly to scam archetypes, allowing graph queries 
 * to find clusters of similar jobs posted by different companies.
 */
@Node(`"JobPost`")
public class JobPostNode {
    @Id
    private String id; // Matches MongoDB JobPost ID
    private String title;

    @Relationship(type = `"EXHIBITS_PATTERN`", direction = Relationship.Direction.OUTGOING)
    private Set<ExhibitsPattern> scamArchetypes = new HashSet<>();

    public JobPostNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Set<ExhibitsPattern> getScamArchetypes() { return scamArchetypes; }
    public void setScamArchetypes(Set<ExhibitsPattern> scamArchetypes) { this.scamArchetypes = scamArchetypes; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\ComplaintNode.java" = @"
package com.hireguard.model.neo4j;

import com.hireguard.model.neo4j.relationships.About;
import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;
import org.springframework.data.neo4j.core.schema.Relationship;

import java.util.HashSet;
import java.util.Set;

/**
 * Why Neo4j: Acts as the connecting node between Users and Companies. 
 * Allows analyzing complaint volumes and networks over time.
 */
@Node(`"Complaint`")
public class ComplaintNode {
    @Id
    private String id; // Matches MongoDB Complaint ID

    @Relationship(type = `"ABOUT`", direction = Relationship.Direction.OUTGOING)
    private Set<About> companies = new HashSet<>();

    public ComplaintNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Set<About> getCompanies() { return companies; }
    public void setCompanies(Set<About> companies) { this.companies = companies; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\WebsiteNode.java" = @"
package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: Different shell companies often share the same website or domain infrastructure.
 */
@Node(`"Website`")
public class WebsiteNode {
    @Id
    private String url;

    public WebsiteNode() {}

    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\FraudRingNode.java" = @"
package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: High-level categorization node to group disconnected companies 
 * that share known scam attributes.
 */
@Node(`"FraudRing`")
public class FraudRingNode {
    @Id
    private String id;
    private String ringName;

    public FraudRingNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRingName() { return ringName; }
    public void setRingName(String ringName) { this.ringName = ringName; }
}
"@
    "backend-springboot\src\main\java\com\hireguard\model\neo4j\ScamArchetypeNode.java" = @"
package com.hireguard.model.neo4j;

import org.springframework.data.neo4j.core.schema.Id;
import org.springframework.data.neo4j.core.schema.Node;

/**
 * Why Neo4j: Maps the conceptual type of scam (e.g., `"Advance Fee Fraud`") 
 * to actual job posts, enabling similarity detection.
 */
@Node(`"ScamArchetype`")
public class ScamArchetypeNode {
    @Id
    private String id;
    private String name;

    public ScamArchetypeNode() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
"@
    "database\mongodb\sample_users.json" = @"
[
  {
    `"_id`": `"usr_001`",
    `"name`": `"Alice Smith`",
    `"email`": `"alice@example.com`",
    `"role`": `"USER`",
    `"createdAt`": `"2024-01-01T10:00:00Z`"
  }
]
"@
    "database\mongodb\sample_companies.json" = @"
[
  {
    `"_id`": `"comp_001`",
    `"name`": `"Global Tech Remote`",
    `"website`": `"globaltechremote-jobs.com`",
    `"domainAge`": 14,
    `"registrationStatus`": `"SUSPICIOUS`",
    `"createdAt`": `"2024-03-01T12:00:00Z`"
  }
]
"@
    "database\mongodb\sample_complaints.json" = @"
[
  {
    `"_id`": `"comp_001`",
    `"companyId`": `"comp_001`",
    `"userId`": `"usr_001`",
    `"reason`": `"Asked for `$500 upfront for equipment.`",
    `"status`": `"UNDER_REVIEW`",
    `"createdAt`": `"2024-03-05T08:30:00Z`"
  }
]
"@
    "database\neo4j\schema.cypher" = @"
// Constraints and indexes for Neo4j

CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE;
CREATE CONSTRAINT company_id_unique IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT recruiter_id_unique IF NOT EXISTS FOR (r:Recruiter) REQUIRE r.id IS UNIQUE;
CREATE CONSTRAINT jobpost_id_unique IF NOT EXISTS FOR (j:JobPost) REQUIRE j.id IS UNIQUE;
CREATE CONSTRAINT complaint_id_unique IF NOT EXISTS FOR (c:Complaint) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT website_url_unique IF NOT EXISTS FOR (w:Website) REQUIRE w.url IS UNIQUE;
CREATE CONSTRAINT fraudring_id_unique IF NOT EXISTS FOR (f:FraudRing) REQUIRE f.id IS UNIQUE;
CREATE CONSTRAINT scamarch_id_unique IF NOT EXISTS FOR (s:ScamArchetype) REQUIRE s.id IS UNIQUE;

// Indexes for common queries
CREATE INDEX company_name_idx IF NOT EXISTS FOR (c:Company) ON (c.name);
"@
    "database\neo4j\sample_queries.cypher" = @"
// 1. Find Fraud Rings connected to a specific company
MATCH (c:Company {id: 'comp_001'})-[:PART_OF_RING]->(f:FraudRing)
RETURN c, f;

// 2. Discover shared infrastructure (Companies owning the same Website)
MATCH (c1:Company)-[:OWNS]->(w:Website)<-[:OWNS]-(c2:Company)
WHERE c1.id <> c2.id
RETURN c1.name, c2.name, w.url;

// 3. Find Recruiters posting jobs that exhibit known Scam Archetypes
MATCH (r:Recruiter)-[:POSTED]->(j:JobPost)-[:EXHIBITS_PATTERN]->(s:ScamArchetype)
RETURN r.name, j.title, s.name;

// 4. Identify coordinated complaints (Users reporting multiple connected Companies)
MATCH (u:User)-[:REPORTED]->(comp:Complaint)-[a:ABOUT]->(c:Company)
WITH u, count(c) as companiesReported
WHERE companiesReported > 3
RETURN u.id, companiesReported
ORDER BY companiesReported DESC;
"@
    "documentation\Architecture.md" = @"
# HireGuard AI - Architecture Design

## Phase 1: Database Architecture

### Overview
HireGuard uses a polyglot persistence strategy, combining the strengths of MongoDB and Neo4j.
- **MongoDB** is our primary system of record. It handles documents, unstructured text (like job descriptions and complaints), and flexible schemas.
- **Neo4j** is our trust graph. It focuses exclusively on relationship data to uncover fraud rings, shared infrastructure, and suspicious patterns.

### Why Polyglot Persistence?
Using a single database would force compromises. 
- Relational databases struggle with highly connected fraud detection queries (many JOINs).
- Graph databases are not ideal for storing large blobs of text or high-throughput CRUD operations on isolated entities.
- Document databases excel at hierarchical data and fast reads but lack native graph traversal for deep relationship discovery.

By syncing core entities (via IDs) to the graph, we isolate the analytical fraud-detection workload to Neo4j, while MongoDB serves the standard frontend queries.
"@
    "README.md" = @"
# HireGuard AI

Graph-Based Employer Trust Verification and Scam Prevention System.

## Project Phases
- [x] **Phase 1**: Database Architecture Design
- [ ] **Phase 2**: Spring Boot Backend Development
- [ ] **Phase 3**: React Frontend Development
- [ ] **Phase 4**: AI/NLP Service Integration (Flask)
- [ ] **Phase 5**: Neo4j Trust Graph Integration
- [ ] **Phase 6**: Chrome Extension Development
- [ ] **Phase 7**: Testing and Deployment

### Setup Instructions
(Coming soon in Phase 2)
"@
}

foreach ($item in $files.GetEnumerator()) {
    $full_path = Join-Path $base_dir $item.Name
    $dir = Split-Path $full_path -Parent
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    Set-Content -Path $full_path -Value $item.Value -Encoding UTF8
}
Write-Host "Done"
