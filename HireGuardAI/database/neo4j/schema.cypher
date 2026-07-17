// ============================================================================
// HireGuard AI — Neo4j Graph Database Schema & Initial Constraints
// ============================================================================
// This script initializes node uniqueness constraints, performance indexes, and
// structural seed data for employer trust scoring and scam ring detection.
// ============================================================================

// 1. NODE UNIQUENESS CONSTRAINTS (Ensures 1:1 mapping with MongoDB entity _id)
CREATE CONSTRAINT company_id_unique IF NOT EXISTS
FOR (c:Company) REQUIRE c.nodeId IS UNIQUE;

CREATE CONSTRAINT recruiter_id_unique IF NOT EXISTS
FOR (r:Recruiter) REQUIRE r.nodeId IS UNIQUE;

CREATE CONSTRAINT website_id_unique IF NOT EXISTS
FOR (w:Website) REQUIRE w.nodeId IS UNIQUE;

CREATE CONSTRAINT jobpost_id_unique IF NOT EXISTS
FOR (j:JobPost) REQUIRE j.nodeId IS UNIQUE;

CREATE CONSTRAINT complaint_id_unique IF NOT EXISTS
FOR (cp:Complaint) REQUIRE cp.nodeId IS UNIQUE;

CREATE CONSTRAINT fraudring_id_unique IF NOT EXISTS
FOR (f:FraudRing) REQUIRE f.nodeId IS UNIQUE;

CREATE CONSTRAINT archetype_id_unique IF NOT EXISTS
FOR (a:ScamArchetype) REQUIRE a.nodeId IS UNIQUE;

// 2. PERFORMANCE INDEXES (Speeds up multi-hop graph traversals & lookups)
CREATE INDEX company_name_idx IF NOT EXISTS FOR (c:Company) ON (c.name);
CREATE INDEX company_status_idx IF NOT EXISTS FOR (c:Company) ON (c.registrationStatus);
CREATE INDEX recruiter_email_idx IF NOT EXISTS FOR (r:Recruiter) ON (r.email);
CREATE INDEX website_domain_idx IF NOT EXISTS FOR (w:Website) ON (w.domain);
CREATE INDEX jobpost_prob_idx IF NOT EXISTS FOR (j:JobPost) ON (j.scamProbability);

// 3. SAMPLE INITIAL SEED GRAPH (Enables immediate verification of queries)
// Clear existing test nodes with the same IDs before inserting
MATCH (n) WHERE n.nodeId IN ['cmp-001', 'cmp-002', 'cmp-003', 'cmp-004', 
                             'rec-501', 'rec-502', 'web-701', 'web-702', 
                             'job-901', 'job-902', 'job-903', 
                             'cpl-801', 'cpl-802', 'ring-100', 
                             'arch-001', 'arch-002'] DETACH DELETE n;

// Create Scam Archetype Nodes
CREATE (a1:ScamArchetype {nodeId: 'arch-001', archetypeCode: 'ARCH-001', name: 'Advance Fee & Security Deposit Scam'})
CREATE (a2:ScamArchetype {nodeId: 'arch-002', archetypeCode: 'ARCH-002', name: 'Check Overpayment & Equipment Procurement Scam'})

// Create Fraud Ring Node
CREATE (ring:FraudRing {nodeId: 'ring-100', ringName: 'Eastern European Shell-Recruiter Syndicate #100', riskScore: 98.5, detectedAt: datetime('2026-07-10T12:00:00Z')})

// Create Company Nodes
CREATE (c1:Company {nodeId: 'cmp-001', name: 'Apex Global Solutions Inc.', registrationStatus: 'SUSPICIOUS'})
CREATE (c2:Company {nodeId: 'cmp-002', name: 'Nexus Systems Technology LLC', registrationStatus: 'SUSPICIOUS'})
CREATE (c3:Company {nodeId: 'cmp-003', name: 'TechSphere Dynamics Corp', registrationStatus: 'VERIFIED'})
CREATE (c4:Company {nodeId: 'cmp-004', name: 'Vanguard Financial Logistics', registrationStatus: 'BLACKLISTED'})

// Create Recruiter Nodes
CREATE (r1:Recruiter {nodeId: 'rec-501', name: 'Elena Rostova', email: 'elena.recruiting@apex-talent-global.com', isFlagged: true})
CREATE (r2:Recruiter {nodeId: 'rec-502', name: 'Dave Miller', email: 'dave.m@techsphere-dynamics.com', isFlagged: false})

// Create Website Nodes
CREATE (w1:Website {nodeId: 'web-701', url: 'https://apex-talent-global-careers.com', domain: 'apex-talent-global-careers.com', domainAgeDays: 12})
CREATE (w2:Website {nodeId: 'web-702', url: 'https://nexus-systems-careers.net', domain: 'nexus-systems-careers.net', domainAgeDays: 8})

// Create Job Post Nodes
CREATE (j1:JobPost {nodeId: 'job-901', title: 'Remote Data Entry & Supply Coordinator', scamProbability: 0.94})
CREATE (j2:JobPost {nodeId: 'job-902', title: 'Virtual Administrative Assistant ($45/hr)', scamProbability: 0.89})
CREATE (j3:JobPost {nodeId: 'job-903', title: 'Senior Java Backend Engineer', scamProbability: 0.05})

// Create Complaint Nodes
CREATE (cp1:Complaint {nodeId: 'cpl-801', reason: 'FAKE_CHECK_SCAM', status: 'VERIFIED_SCAM'})
CREATE (cp2:Complaint {nodeId: 'cpl-802', reason: 'ADVANCE_FEE_DEMAND', status: 'UNDER_INVESTIGATION'})

// 4. CREATE RELATIONSHIPS
// Recruiter <-> Company (WORKS_FOR & HAS_RECRUITER)
CREATE (r1)-[:WORKS_FOR {sinceDate: '2026-06-01', isVerified: false}]->(c1)
CREATE (c1)-[:HAS_RECRUITER {sinceDate: '2026-06-01', isVerified: false}]->(r1)
// Notice how Elena (r1) ALSO claims to work for Nexus (c2) — Nomad Recruiter Pattern!
CREATE (r1)-[:WORKS_FOR {sinceDate: '2026-06-15', isVerified: false}]->(c2)
CREATE (c2)-[:HAS_RECRUITER {sinceDate: '2026-06-15', isVerified: false}]->(r1)

CREATE (r2)-[:WORKS_FOR {sinceDate: '2024-03-10', isVerified: true}]->(c3)
CREATE (c3)-[:HAS_RECRUITER {sinceDate: '2024-03-10', isVerified: true}]->(r2)

// Company OWNS Website
CREATE (c1)-[:OWNS {verifiedOwnership: false, registeredAt: datetime('2026-06-20T00:00:00Z')}]->(w1)
CREATE (c2)-[:OWNS {verifiedOwnership: false, registeredAt: datetime('2026-06-24T00:00:00Z')}]->(w2)

// Recruiter POSTED JobPost
CREATE (r1)-[:POSTED {postedAt: datetime('2026-07-01T10:00:00Z'), platform: 'Telegram/LinkedIn'}]->(j1)
CREATE (r1)-[:POSTED {postedAt: datetime('2026-07-03T14:30:00Z'), platform: 'Direct Email'}]->(j2)
CREATE (r2)-[:POSTED {postedAt: datetime('2026-06-15T09:00:00Z'), platform: 'LinkedIn Verified'}]->(j3)

// JobPost EXHIBITS_PATTERN ScamArchetype
CREATE (j1)-[:EXHIBITS_PATTERN {confidenceScore: 0.95, detectedBy: 'NLP-Transformer'}]->(a2)
CREATE (j2)-[:EXHIBITS_PATTERN {confidenceScore: 0.91, detectedBy: 'NLP-Transformer'}]->(a1)

// Complaint ABOUT Company (with temporal reportedAt property as requested)
CREATE (cp1)-[:ABOUT {reportedAt: datetime('2026-07-08T16:20:00Z')}]->(c1)
CREATE (cp2)-[:ABOUT {reportedAt: datetime('2026-07-11T19:45:00Z')}]->(c2)

// Company & Recruiter PART_OF_RING FraudRing
CREATE (c1)-[:PART_OF_RING {joinedRingDate: datetime('2026-07-10T12:00:00Z'), confidenceLevel: 0.99}]->(ring)
CREATE (c2)-[:PART_OF_RING {joinedRingDate: datetime('2026-07-10T12:00:00Z'), confidenceLevel: 0.96}]->(ring)
CREATE (c4)-[:PART_OF_RING {joinedRingDate: datetime('2026-07-10T12:00:00Z'), confidenceLevel: 0.94}]->(ring)
CREATE (r1)-[:PART_OF_RING {joinedRingDate: datetime('2026-07-10T12:00:00Z'), confidenceLevel: 0.98}]->(ring);
