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
