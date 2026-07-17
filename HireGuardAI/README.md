# HireGuard AI — An Explainable Graph-Based System for Employer Trust Scoring and Job Scam Prevention

## Project Overview
**HireGuard AI** is an enterprise-grade, explainable AI and graph-based system designed to detect job scams, score employer trustworthiness, and expose coordinated employment fraud rings. By leveraging multi-modal data architecture—combining **MongoDB** for high-volume document storage with **Neo4j** for deep relationship network intelligence—HireGuard AI identifies not only isolated fraudulent job posts but complex, multi-hop fraud networks across recruiters, shell companies, shared domains, and scam archetypes.

---

## Architecture Overview: Phase 1 (Database & Graph Architecture)

In Phase 1, we establish a robust, dual-database architecture that adheres to the **Polyglot Persistence** design principle:
1. **MongoDB (Document Storage — Application Data)**: Serves as the primary operational data store for users, company profiles, detailed job posts, evidence-backed complaints, trust audit logs, and trust reports. It handles high-throughput CRUD operations and stores rich text/media metadata without deep relational joins.
2. **Neo4j (Graph Storage — Relationship Intelligence)**: Scoped strictly to graph topography and relational connections. Neo4j stores lightweight nodes (`Company`, `Recruiter`, `Website`, `JobPost`, `Complaint`, `FraudRing`, `ScamArchetype`) interconnected by directed edges (`WORKS_FOR`, `POSTED`, `OWNS`, `REPORTED`, `ABOUT`, `EXHIBITS_PATTERN`, `PART_OF_RING`). By avoiding redundant document data storage in Neo4j, graph traversals remain lightning-fast and memory-efficient for real-time fraud pattern detection.

---

## Folder Structure (Phase 1 Scope)

```text
HireGuardAI/
├── backend-springboot/
│   └── src/main/java/com/hireguard/
│       ├── model/
│       │   ├── mongodb/
│       │   │   ├── User.java
│       │   │   ├── Company.java
│       │   │   ├── JobPost.java
│       │   │   ├── Complaint.java
│       │   │   ├── TrustReport.java
│       │   │   ├── VerificationAuditLog.java
│       │   │   └── ScamPattern.java
│       │   └── neo4j/
│       │       ├── CompanyNode.java
│       │       ├── RecruiterNode.java
│       │       ├── WebsiteNode.java
│       │       ├── ComplaintNode.java
│       │       ├── FraudRingNode.java
│       │       ├── ScamArchetypeNode.java
│       │       ├── JobPostNode.java
│       │       └── relationships/
│       │           ├── WorksFor.java
│       │           ├── Posted.java
│       │           ├── Reported.java
│       │           ├── Owns.java
│       │           ├── ExhibitsPattern.java
│       │           ├── PartOfRing.java
│       │           └── About.java
│       └── config/
│           ├── MongoConfig.java
│           └── Neo4jConfig.java
├── database/
│   ├── mongodb/
│   │   ├── sample_users.json
│   │   ├── sample_companies.json
│   │   └── sample_complaints.json
│   └── neo4j/
│       ├── schema.cypher
│       └── sample_queries.cypher
├── documentation/
│   └── Architecture.md
└── README.md
```

---

## Development Workflow Roadmap

* **PHASE 1: Database Architecture Design (CURRENT PHASE - COMPLETED)**
* **PHASE 2: Spring Boot Backend Development (Pending Approval)**
* **PHASE 3: React Frontend Development (Pending)**
* **PHASE 4: AI/NLP Service Integration (Pending)**
* **PHASE 5: Neo4j Employer Trust Graph Integration (Pending)**
* **PHASE 6: Chrome Extension Development (Pending)**
* **PHASE 7: Testing and Deployment (Pending)**

---

## Verification and Testing Steps for Phase 1

### 1. MongoDB Schema & Index Verification
To verify the MongoDB schema and sample datasets locally or via Docker:
```bash
# 1. Start local MongoDB (or via Docker: docker run -d -p 27017:27017 mongo:latest)
# 2. Import sample datasets into the 'hireguard' database:
mongoimport --db hireguard --collection users --file database/mongodb/sample_users.json --jsonArray
mongoimport --db hireguard --collection companies --file database/mongodb/sample_companies.json --jsonArray
mongoimport --db hireguard --collection complaints --file database/mongodb/sample_complaints.json --jsonArray

# 3. Connect via mongosh and verify recommended indexes exist:
mongosh hireguard --eval "db.companies.getIndexes(); db.complaints.getIndexes();"
```

### 2. Neo4j Graph Schema & Fraud Query Verification
To verify Neo4j constraints, indexes, and graph pattern queries:
```bash
# 1. Start local Neo4j instance (or via Docker: docker run -d -p 7474:7474 -p 7687:7687 -e NEO4J_AUTH=neo4j/password neo4j:latest)
# 2. Apply schema constraints and indexes using cypher-shell:
cypher-shell -u neo4j -p password -f database/neo4j/schema.cypher

# 3. Execute sample fraud detection queries:
cypher-shell -u neo4j -p password -f database/neo4j/sample_queries.cypher
```

### 3. Spring Boot Entity Compilation & Verification
To verify that all `@Document` and `@Node` entity classes compile clean without structural or dependency errors:
```bash
cd backend-springboot
mvn clean compile
```
*(Note: Phase 2 will introduce the complete `pom.xml`, repositories, services, and REST controllers upon explicit approval).*
