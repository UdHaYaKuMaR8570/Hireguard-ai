/**
 * Graph Service (Stub / Placeholder)
 *
 * TODO [TEMPORARY STUB]: Per Phase 3 development rules, real Neo4j graph-scoring and Cypher traversal
 * endpoints arrive in Phase 5. This service currently returns static, rule-based placeholder topology
 * data so the GraphVisualization UI layout can render without assuming non-existent backend APIs.
 */

const graphService = {
  getCompanyGraphTopology: async (companyId) => {
    // Simulate slight network latency for realistic UI loading state handling
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      companyId,
      isTemporaryMock: true,
      nodes: [
        {
          id: 'company-node',
          type: 'default',
          data: { label: `Company ID: ${companyId.substring(0, 8)}` },
          position: { x: 250, y: 50 },
          style: { background: '#0284c7', color: '#fff', border: '2px solid #38bdf8', borderRadius: '8px', padding: '10px', fontWeight: 'bold' }
        },
        {
          id: 'recruiter-node-1',
          data: { label: 'Recruiter Domain: @apex-careers.com' },
          position: { x: 100, y: 180 },
          style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '6px' }
        },
        {
          id: 'job-post-node-1',
          data: { label: 'Job Post: Remote Data Entry ($45/hr)' },
          position: { x: 400, y: 180 },
          style: { background: '#1e293b', color: '#cbd5e1', border: '1px solid #475569', borderRadius: '6px' }
        },
        {
          id: 'scam-pattern-node',
          data: { label: '[TEMPORARY PLACEHOLDER] Nomad Recruiter Cluster Flag' },
          position: { x: 250, y: 300 },
          style: { background: '#450a0a', color: '#fca5a5', border: '1.5px dashed #f87171', borderRadius: '6px' }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'company-node', target: 'recruiter-node-1', label: 'EMPLOYS', animated: true, style: { stroke: '#38bdf8' } },
        { id: 'e1-3', source: 'company-node', target: 'job-post-node-1', label: 'POSTED', animated: true, style: { stroke: '#38bdf8' } },
        { id: 'e2-4', source: 'recruiter-node-1', target: 'scam-pattern-node', label: 'MATCHES_PATTERN (Phase 5 Logic)', style: { stroke: '#f87171', strokeDasharray: '5,5' } }
      ]
    };
  }
};

export default graphService;
