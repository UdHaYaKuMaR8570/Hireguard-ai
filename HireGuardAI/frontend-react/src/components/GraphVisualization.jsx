import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import graphService from '../services/graphService';
import { Network, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * GraphVisualization Component (Phase 5 — Live Neo4j Topology)
 *
 * Fetches real node/edge topology from GET /api/graph/{id}/topology (GraphController).
 * Falls back gracefully to a static placeholder if Neo4j or the backend is unreachable.
 */
const GraphVisualization = ({ companyId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [isLiveData, setIsLiveData] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchGraph = async () => {
      setLoading(true);
      try {
        const data = await graphService.getCompanyGraphTopology(companyId || 'cmp-demo-stub');
        if (isMounted && data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
          setIsLiveData(data.isLiveData === true);
        }
      } catch (err) {
        console.error('Graph topology load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchGraph();
    return () => { isMounted = false; };
  }, [companyId, setNodes, setEdges]);

  return (
    <div className="nexora-card p-6 bg-white border border-[#0d0d0d]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-[#e0e0dc]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#e0f2fe] rounded-xl text-[#0284c7] border border-[#bae6fd]">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-[#0d0d0d]">
              Neo4j Dual-Graph Topology
            </h3>
            <p className="text-xs text-[#555550] mt-0.5">
              Entity relationship map (Company ↔ Recruiter ↔ Job Post ↔ Scam Cluster)
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border font-heading font-bold shrink-0 ${
          isLiveData
            ? 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]'
            : 'bg-[#f2f2ef] text-[#777770] border-[#d4d4cf]'
        }`}>
          {isLiveData ? (
            <><CheckCircle className="h-3.5 w-3.5" /> Live Neo4j Data</>
          ) : (
            <><AlertCircle className="h-3.5 w-3.5" /> Fallback Topology</>
          )}
        </div>
      </div>

      {/* React Flow Graph Container */}
      <div className="h-[380px] w-full bg-[#f8fafc] rounded-2xl border border-[#e0e0dc] overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f2f2ef]/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0284c7]" />
              <p className="text-xs text-[#555550] font-heading font-medium">
                Querying Neo4j graph topology...
              </p>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
            attributionPosition="bottom-right"
          >
            <Background color="#cbd5e1" gap={20} size={1} />
            <Controls className="bg-white border border-[#d4d4cf] shadow-sm" />
          </ReactFlow>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-[#555550] pt-3 border-t border-[#e0e0dc]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] inline-block" /> Employer Node
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#334155] inline-block" /> Recruiter / Job Post
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48] inline-block" /> Scam Pattern Flag
        </span>
        <span className="text-[#888880] italic ml-auto">Interactive Zoom / Drag Enabled</span>
      </div>

    </div>
  );
};

export default GraphVisualization;
