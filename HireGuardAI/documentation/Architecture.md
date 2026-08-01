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
