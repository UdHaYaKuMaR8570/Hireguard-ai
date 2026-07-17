# HireGuard AI — Phase 1 Database & Graph Architecture Documentation

## 1. Executive Summary & Polyglot Persistence Philosophy

Modern employment scams have evolved from isolated phishing attempts into sophisticated, distributed **fraud rings**. Attackers frequently register multiple shell companies, spin up ephemeral domains, recycle scam job description templates (archetypes), and deploy fictitious or compromised recruiter identities across multiple platforms.

To combat this, **HireGuard AI** implements a **Polyglot Persistence Architecture** that separates data responsibilities based on access patterns and structural characteristics:

```
+-----------------------------------------------------------------------------------+
|                                 HIREGUARD AI ENGINE                               |
+----------------------------------------+------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
+------------------------------+                       +------------------------------+
|     MongoDB Document Store   |                       |    Neo4j Graph Database      |
|     (Application & Storage)  |                       |  (Relationship & Intelligence)|
+------------------------------+                       +------------------------------+
| - Users & Authentication     |                       | - Company <-> Recruiter      |
| - Company Profiles & Bio     |                       | - Company <-> Website Domain |
| - Job Post Descriptions      |                       | - Recruiter <-> Job Posts    |
| - Detailed Complaint Proofs  |                       | - Job Post <-> Scam Pattern  |
| - Trust Reports & Audit Logs |                       | - Multi-Hop Fraud Rings      |
+------------------------------+                       +------------------------------+
```

### Why Polyglot Persistence?
1. **MongoDB (Document Store)**: Highly optimized for storing heavy, structured and semi-structured application entities. A `Complaint` or `JobPost` document can contain extensive text descriptions, base64/URL proof attachments, historical audit logs, and complex metadata. Storing these large objects in a relational or graph database would degrade traversal throughput and complicate schema evolution.
2. **Neo4j (Graph Database)**: Optimized specifically for **index-free adjacency** and graph traversals (`O(1)` pointer hops per edge). By storing *only* the topological skeleton (node IDs, risk flags, and relational edges), Neo4j can traverse 5+ hops in milliseconds (e.g., finding all companies linked to a recruiter who previously posted job ads exhibiting a known check-cashing scam archetype).

---

## 2. Complete MongoDB Collection Design & Schemas

All MongoDB collections use **Spring Data MongoDB Auditing** (`@CreatedDate` and `@LastModifiedDate`) to maintain immutable creation and update timestamps (`createdAt`, `updatedAt`). Enums are stored explicitly as `String` values (`@Field(targetType = FieldType.STRING)`) to ensure database readability and prevent index corruption or ordinal shifting over time. Relationships between documents use ID referencing (normalized `String` identifiers) rather than deep document embedding.

### 2.1 `users` Collection
Stores platform stakeholders including job seekers submitting complaints, corporate verifiers, and system administrators.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique identifier.
  * `name` (`String`): Full name of the user.
  * `email` (`String`, Unique): Primary contact email address.
  * `passwordHash` (`String`): BCrypt/Argon2 hashed credential.
  * `role` (`String` Enum): `["JOB_SEEKER", "VERIFIER", "ADMIN", "EMPLOYER"]`.
  * `accountStatus` (`String` Enum): `["ACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]`.
  * `createdAt` (`Instant`): Timestamp of registration (`@CreatedDate`).
  * `updatedAt` (`Instant`): Timestamp of last profile update (`@LastModifiedDate`).

### 2.2 `companies` Collection
Stores complete employer profiles, business registration metadata, and domain verification records.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique identifier (mirrored in Neo4j `Company` node).
  * `name` (`String`): Legal or operating trade name.
  * `website` (`String`): Primary official domain/website URL.
  * `domainAge` (`Integer`): Domain age in days (derived from WHOIS checks).
  * `registrationStatus` (`String` Enum): `["VERIFIED", "UNVERIFIED", "SUSPICIOUS", "BLACKLISTED"]`.
  * `countryOfRegistration` (`String`): ISO country code of corporate formation.
  * `taxIdentifierMasked` (`String`): Masked employer identification number (EIN/CIN).
  * `createdAt` (`Instant`): First ingestion timestamp (`@CreatedDate`).
  * `updatedAt` (`Instant`): Last update timestamp (`@LastModifiedDate`).
* **Indexing Strategy**:
  * `name` (`@Indexed`): B-Tree index for fast substring and prefix lookups during company search and auto-complete.
  * `registrationStatus` (`@Indexed`): Fast filtering for audit pipelines targeting `SUSPICIOUS` or `UNVERIFIED` employers.
  * `name + registrationStatus` (Compound Index): Optimizes dashboard queries filtering companies by status sorted by name.

### 2.3 `job_posts` Collection
Stores individual job advertisements scraped, submitted via API, or reported by users.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique identifier (mirrored in Neo4j `JobPost` node).
  * `companyId` (`String`): Foreign key referencing `companies._id`.
  * `title` (`String`): Job listing title (e.g., "Remote Data Entry Clerk").
  * `description` (`String`): Full raw text description of the job ad.
  * `postedBy` (`String`): Recruiter identifier or email string who posted the ad.
  * `salaryRange` (`String`): Advertised compensation structure.
  * `sourcePlatform` (`String`): Origin platform (e.g., "LinkedIn", "Indeed", "Direct Website").
  * `createdAt` (`Instant`): Timestamp when the ad was posted or discovered (`@CreatedDate`).

### 2.4 `complaints` Collection
Stores user-submitted or automated fraud reports, evidence artifacts, and adjudication statuses.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique identifier (mirrored in Neo4j `Complaint` node).
  * `companyId` (`String`): Foreign key referencing `companies._id`.
  * `userId` (`String`): Foreign key referencing `users._id`.
  * `reason` (`String` Enum): `["ADVANCE_FEE_DEMAND", "FAKE_CHECK_SCAM", "IDENTITY_THEFT_ATTEMPT", "PHISHING_LINK", "UNAUTHORIZED_REPRESENTATION", "OTHER"]`.
  * `proof` (`String`): URL or storage path to uploaded evidence (screenshots, email headers, offer letters).
  * `description` (`String`): Detailed narrative of the scam interaction.
  * `status` (`String` Enum): `["SUBMITTED", "UNDER_INVESTIGATION", "VERIFIED_SCAM", "DISMISSED"]`.
  * `createdAt` (`Instant`): Timestamp of complaint submission (`@CreatedDate`).
* **Indexing Strategy**:
  * `companyId` (`@Indexed`): Essential for aggregating all complaints against a specific employer during real-time trust scoring.
  * `status` (`@Indexed`): Allows verifiers to quickly fetch queues of `SUBMITTED` or `UNDER_INVESTIGATION` complaints.
  * `createdAt` (`@Indexed`): Enables temporal sliding-window queries (e.g., spike detection in complaints over the last 14 days).

### 2.5 `trust_reports` Collection
Stores immutable snapshots of generated employer trust scores, risk levels, and contributing explanations.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique report identifier.
  * `companyId` (`String`): Foreign key referencing `companies._id`.
  * `trustScore` (`Double`): Normalized score from `0.0` (Confirmed Scam) to `100.0` (Highly Trusted).
  * `riskLevel` (`String` Enum): `["CRITICAL_RISK", "HIGH_RISK", "MODERATE_RISK", "LOW_RISK", "TRUSTED"]`.
  * `reasons` (`List<String>`): Human-readable explainability strings detailing why the score was assigned.
  * `graphRiskFactors` (`List<String>`): Specific topological triggers (e.g., "Linked to Recruiter Node in FraudRing #FR-901").
  * `generatedAt` (`Instant`): Timestamp of calculation (`@CreatedDate`).

### 2.6 `verification_audit_logs` Collection
Audit trail tracking all automated checks (NLP classification, WHOIS domain verification, Graph risk scans) and human verifier overrides.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique audit entry ID.
  * `companyId` (`String`): Foreign key referencing `companies._id`.
  * `checkType` (`String` Enum): `["DOMAIN_WHOIS_CHECK", "NLP_SCAM_PROBABILITY_SCAN", "GRAPH_RING_DETECTION", "MANUAL_VERIFIER_REVIEW"]`.
  * `result` (`String` Enum): `["PASSED", "FLAGGED", "FAILED", "INCONCLUSIVE"]`.
  * `details` (`String`): JSON summary or descriptive text of the check output.
  * `timestamp` (`Instant`): Exact execution time (`@CreatedDate`).

### 2.7 `scam_patterns` Collection
Catalog of known recruitment scam archetypes used for pattern matching and explainability generation.
* **Schema Definition**:
  * `_id` (`String` / UUID): Unique pattern identifier (mirrored in Neo4j `ScamArchetype` node).
  * `patternName` (`String`): Name of archetype (e.g., "Equipment Procurement Check Scam").
  * `description` (`String`): Comprehensive operational breakdown of the scam mechanism.
  * `exampleKeywords` (`List<String>`): Phrases triggering NLP detection (e.g., `["wire transfer for equipment", "cashier's check immediately", "telegram interview only"]`).
  * `severityWeight` (`Double`): Impact multiplier used in trust score deduction algorithms.

---

## 3. Neo4j Graph Schema & Relationship Intelligence

The Neo4j graph schema is engineered specifically to model **relationships and topological anomalies**. It does not replicate large document descriptions or file paths; instead, nodes contain minimal identifying properties (`nodeId`, `name`/`label`, and critical flags), allowing maximum graph caching in RAM.

### 3.1 Node Definitions (`@Node`)

1. **`Company` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `name` (`String`), `registrationStatus` (`String`).
   * **Purpose**: Anchor node for employer graph analysis.
2. **`Recruiter` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `email` (`String`), `name` (`String`), `isFlagged` (`Boolean`).
   * **Purpose**: Tracks individual recruiter identities or email handles across multiple postings and companies.
3. **`Website` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `url` (`String`), `domain` (`String`), `domainAgeDays` (`Integer`).
   * **Purpose**: Represents digital infrastructure. Enables detection of multiple companies sharing newly registered domains.
4. **`JobPost` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `title` (`String`), `scamProbability` (`Double`).
   * **Purpose**: Represents the actual job advertisement within the network.
5. **`Complaint` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `reason` (`String`), `status` (`String`).
   * **Purpose**: Graph representation of fraud allegations.
6. **`FraudRing` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `ringName` (`String`), `detectedAt` (`Instant`), `riskScore` (`Double`).
   * **Purpose**: Synthetic cluster node grouping entities discovered by graph analysis to be acting in coordinated collusion.
7. **`ScamArchetype` Node**:
   * **Properties**: `nodeId` (`String`, Primary Key), `archetypeCode` (`String`), `name` (`String`).
   * **Purpose**: Represents categorical scam techniques (e.g., `ARCH-001: Advance Fee Scam`).

---

## 4. Relationship Explanation & Enabled Fraud Detection Patterns

Every edge in Neo4j serves a specific investigative and pattern-matching function:

| Relationship Edge | Source -> Target | Properties | Why It Exists & Fraud Pattern Enabled |
| :--- | :--- | :--- | :--- |
| **`WORKS_FOR`** / **`HAS_RECRUITER`** | `Recruiter` -> `Company` <br> `Company` -> `Recruiter` | `sinceDate` (`String`), `isVerified` (`Boolean`) | **Recruiter Nomad / Spoofing Pattern**: Detects when a single suspicious recruiter handle (`email` or contact handle) claims to work for multiple seemingly unrelated companies simultaneously, or represents a legitimate company without official domain verification. |
| **`POSTED`** | `Recruiter` -> `JobPost` | `postedAt` (`Instant`), `platform` (`String`) | **Blast Posting Pattern**: Links recruiters directly to their output. If a single recruiter posts dozens of job ads across different companies that exhibit high NLP scam scores, the graph flags the entire recruiter subtree. |
| **`OWNS`** | `Company` -> `Website` | `verifiedOwnership` (`Boolean`), `registeredAt` (`Instant`) | **Shared Infrastructure / Shell Company Cluster**: Identifies when multiple unverified or seemingly distinct corporate entities point to or share the same website domain, IP host, or newly registered domain (< 30 days old). |
| **`REPORTED`** | `User` (or `Complaint`) -> `Complaint` | `submissionTimestamp` (`Instant`) | **Allegation Tracking**: Anchors complaints in the topological structure, allowing rapid traversal from an alleged victim or report event to the underlying company and recruiter. |
| **`ABOUT`** | `Complaint` -> `Company` | **`reportedAt`** (`Instant`, Temporal Property) | **Temporal Spike & Coordinated Allegation Detection**: The `@RelationshipProperties` temporal attribute `reportedAt` enables time-windowed graph queries. It allows the system to distinguish between a historical, resolved complaint from 3 years ago vs. a sudden, coordinated spike of 15 complaints reported (`reportedAt`) within the last 48 hours. |
| **`EXHIBITS_PATTERN`** | `JobPost` -> `ScamArchetype` | `confidenceScore` (`Double`), `detectedBy` (`String`) | **Archetype Clustering**: Connects job posts to known scam vectors. Enables queries that find all companies currently advertising jobs that match `ARCH-002 (Check Overpayment Scam)`. |
| **`PART_OF_RING`** | `Company` (or `Recruiter`) -> `FraudRing` | `joinedRingDate` (`Instant`), `confidenceLevel` (`Double`) | **Coordinated Fraud Ring Exposing**: Directly links disparate entities into a confirmed or high-probability `FraudRing` node. Once any company or recruiter is tagged `PART_OF_RING`, all connected entities inherit severe risk penalty modifiers during trust scoring. |

---

## 5. Spring Boot Entity Mapping Plan

To maintain structural clarity and avoid classloader conflicts across MongoDB and Neo4j drivers, entities are isolated into dedicated sub-packages with distinct annotations:

```
com.hireguard.model/
├── mongodb/ (Annotated with @Document)
│   ├── User.java                  -> @Document(collection = "users")
│   ├── Company.java               -> @Document(collection = "companies")
│   ├── JobPost.java               -> @Document(collection = "job_posts")
│   ├── Complaint.java             -> @Document(collection = "complaints")
│   ├── TrustReport.java           -> @Document(collection = "trust_reports")
│   ├── VerificationAuditLog.java  -> @Document(collection = "verification_audit_logs")
│   └── ScamPattern.java           -> @Document(collection = "scam_patterns")
└── neo4j/ (Annotated with @Node and @RelationshipProperties)
    ├── CompanyNode.java           -> @Node("Company")
    ├── RecruiterNode.java         -> @Node("Recruiter")
    ├── WebsiteNode.java           -> @Node("Website")
    ├── JobPostNode.java           -> @Node("JobPost")
    ├── ComplaintNode.java         -> @Node("Complaint")
    ├── FraudRingNode.java         -> @Node("FraudRing")
    ├── ScamArchetypeNode.java     -> @Node("ScamArchetype")
    └── relationships/
        ├── WorksFor.java          -> @RelationshipProperties (for WORKS_FOR)
        ├── Posted.java            -> @RelationshipProperties (for POSTED)
        ├── Owns.java              -> @RelationshipProperties (for OWNS)
        ├── Reported.java          -> @RelationshipProperties (for REPORTED)
        ├── About.java             -> @RelationshipProperties (for ABOUT with reportedAt)
        ├── ExhibitsPattern.java   -> @RelationshipProperties (for EXHIBITS_PATTERN)
        └── PartOfRing.java        -> @RelationshipProperties (for PART_OF_RING)
```

### Key Technical Mapping Rules Applied:
1. **Auditing Lifecycle Integration**: All MongoDB models implement `@CreatedDate` and `@LastModifiedDate` using `java.time.Instant`.
2. **Strict String Enums**: All enum properties are accompanied by `@Field(targetType = FieldType.STRING)` in MongoDB models and standard string mappings in Neo4j nodes.
3. **Decoupled Identifiers**: Every Neo4j node explicitly designates a `@Id @Property("nodeId") String nodeId`. This `nodeId` matches exactly with the MongoDB `_id` (`String`), allowing fast cross-database hydration without embedding graph logic inside MongoDB entities or document payload inside Neo4j nodes.
