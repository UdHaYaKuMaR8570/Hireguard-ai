// ============================================================================
// HireGuard AI — Neo4j Sample Fraud Detection Queries
// ============================================================================
// These Cypher queries demonstrate graph-based investigative techniques used by
// HireGuard AI to uncover complex multi-hop job scams and recruiter collusion.
// ============================================================================

// ----------------------------------------------------------------------------
// QUERY 1: Nomad Recruiter Pattern (Recruiters linked to multiple suspicious companies)
// ----------------------------------------------------------------------------
// Description: Identifies recruiter profiles that claim to recruit for multiple 
// distinct companies where at least two of the companies have a registration status
// of 'SUSPICIOUS' or 'BLACKLISTED'. This exposes fake recruitment agencies or
// spoofed identity accounts operating across shell company clusters.
// ----------------------------------------------------------------------------
MATCH (r:Recruiter)-[:WORKS_FOR]->(c:Company)
WHERE c.registrationStatus IN ['SUSPICIOUS', 'BLACKLISTED']
WITH r, count(DISTINCT c) AS suspiciousCompanyCount, collect(c.name) AS companyNames
WHERE suspiciousCompanyCount >= 2
RETURN r.nodeId AS RecruiterId,
       r.name AS RecruiterName,
       r.email AS RecruiterEmail,
       suspiciousCompanyCount AS SuspiciousCompaniesLinked,
       companyNames AS AssociatedCompanies
ORDER BY suspiciousCompanyCount DESC;


// ----------------------------------------------------------------------------
// QUERY 2: High-Probability Scam Post Blast & Archetype Exposure
// ----------------------------------------------------------------------------
// Description: Finds companies where recruiters have posted job listings exhibiting
// high scam probabilities (> 0.80) that match known scam archetypes, along with the
// websites owned by these companies to facilitate rapid domain takedowns.
// ----------------------------------------------------------------------------
MATCH (c:Company)-[:OWNS]->(w:Website)
MATCH (c)-[:HAS_RECRUITER]->(r:Recruiter)-[:POSTED]->(j:JobPost)-[:EXHIBITS_PATTERN]->(a:ScamArchetype)
WHERE j.scamProbability > 0.80
RETURN c.name AS CompanyName,
       c.registrationStatus AS Status,
       w.domain AS WebsiteDomain,
       r.email AS RecruiterEmail,
       j.title AS JobTitle,
       j.scamProbability AS ScamProbability,
       a.name AS ScamArchetypeDetected
ORDER BY j.scamProbability DESC;


// ----------------------------------------------------------------------------
// QUERY 3: Temporal Complaint Spike & Multi-Hop Ring Traversal
// ----------------------------------------------------------------------------
// Description: Leverages the temporal property (reportedAt) on the ABOUT relationship
// to detect companies experiencing recent complaint velocity, and traverses one
// hop further to see if those companies belong to a confirmed Fraud Ring.
// ----------------------------------------------------------------------------
MATCH (cp:Complaint)-[about:ABOUT]->(c:Company)
WHERE about.reportedAt >= datetime('2026-07-01T00:00:00Z')
OPTIONAL MATCH (c)-[ringRel:PART_OF_RING]->(f:FraudRing)
RETURN c.name AS CompanyName,
       count(cp) AS RecentComplaintCount,
       collect(cp.reason) AS ComplaintReasons,
       coalesce(f.ringName, 'No Ring Assigned') AS AssociatedFraudRing,
       coalesce(f.riskScore, 0.0) AS RingRiskScore
ORDER BY RecentComplaintCount DESC, RingRiskScore DESC;


// ----------------------------------------------------------------------------
// QUERY 4: Shell Company Domain Age & Shared Infrastructure Detection
// ----------------------------------------------------------------------------
// Description: Identifies suspicious or unverified employers whose verified website 
// domain was registered within the last 14 days (ephemeral infrastructure) OR where
// multiple companies share the exact same website node or recruiter subtree.
// ----------------------------------------------------------------------------
MATCH (c:Company)-[:OWNS]->(w:Website)
WHERE w.domainAgeDays <= 14 OR c.registrationStatus = 'SUSPICIOUS'
OPTIONAL MATCH (r:Recruiter)-[:WORKS_FOR]->(c)
RETURN c.nodeId AS CompanyId,
       c.name AS CompanyName,
       c.registrationStatus AS Status,
       w.domain AS Domain,
       w.domainAgeDays AS DomainAgeInDays,
       collect(r.email) AS ActiveRecruiters
ORDER BY w.domainAgeDays ASC;
