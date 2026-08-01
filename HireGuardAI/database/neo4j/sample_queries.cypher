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
