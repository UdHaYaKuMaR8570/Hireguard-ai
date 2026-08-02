import api from './api';

/**
 * Graph Service (Phase 5 — Live Neo4j Topology API)
 *
 * Calls the Spring Boot GraphController endpoint GET /api/graph/{id}/topology,
 * which queries Neo4j and returns React Flow compatible node/edge data.
 *
 * Graceful degradation: if the backend or Neo4j is unreachable, falls back
 * to a static placeholder topology so the UI always renders without crashing.
 */

const FALLBACK_TOPOLOGY = (companyId) => ({
  companyId,
  isLiveData: false,
  nodes: [
    {
      id: 'company-node',
      type: 'default',
      data: { label: `Company: ${companyId.substring(0, 12)}` },
      position: { x: 250, y: 60 },
      style: {
        background: '#0284c7',
        color: '#fff',
        border: '2px solid #38bdf8',
        borderRadius: '8px',
        padding: '10px',
        fontWeight: '600',
        fontSize: '12px',
      },
    },
    {
      id: 'sync-pending',
      data: { label: 'Graph Sync Pending — Verify company to populate nodes' },
      position: { x: 150, y: 220 },
      style: {
        background: '#1e293b',
        color: '#94a3b8',
        border: '1px solid #475569',
        borderRadius: '6px',
        fontSize: '11px',
      },
    },
  ],
  edges: [
    {
      id: 'e-pending',
      source: 'company-node',
      target: 'sync-pending',
      label: 'SYNC_NEEDED',
      animated: false,
      style: { stroke: '#64748b', strokeDasharray: '5,5' },
    },
  ],
});

const graphService = {
  /**
   * Fetches real Neo4j graph topology data from the backend for a given company ID.
   * Returns React Flow compatible nodes and edges.
   *
   * @param {string} companyId - MongoDB company ID
   * @returns {Promise<{companyId, isLiveData, nodes, edges}>}
   */
  getCompanyGraphTopology: async (companyId) => {
    if (!companyId || companyId === 'cmp-demo-stub') {
      // Return fallback for demo/unknown IDs
      await new Promise((resolve) => setTimeout(resolve, 200));
      return FALLBACK_TOPOLOGY(companyId || 'demo');
    }

    try {
      const response = await api.get(`/api/graph/${companyId}/topology`);
      const data = response.data;

      if (!data || !data.nodes || data.nodes.length === 0) {
        console.warn('[GraphService] Backend returned empty topology — using fallback');
        return FALLBACK_TOPOLOGY(companyId);
      }

      return {
        companyId: data.companyId,
        isLiveData: data.isLiveData === true,
        nodes: data.nodes,
        edges: data.edges || [],
      };
    } catch (err) {
      console.warn('[GraphService] Failed to fetch graph topology from backend:', err?.message || err);
      // Graceful degradation: return static fallback so the graph UI still renders
      return FALLBACK_TOPOLOGY(companyId);
    }
  },
};

export default graphService;
