import React, { useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import graphService from '../services/graphService';
import { Network, AlertTriangle, Shield, Cpu } from 'lucide-react';

/**
 * GraphVisualization Component (TEMPORARY PLACEHOLDER)
 *
 * TODO [TEMPORARY STUB]: Per Phase 3 development rules, real Neo4j graph traversal and Cypher query
 * endpoints are reserved for Phase 5. This component displays a static, simulated graph topology
 * using React Flow to establish the layout without wiring to non-existent backend endpoints.
 */
const GraphVisualization = ({ companyId }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStubGraph = async () => {
      setLoading(true);
      try {
        const data = await graphService.getCompanyGraphTopology(companyId || 'cmp-demo-stub');
        if (isMounted && data) {
          setNodes(data.nodes || []);
          setEdges(data.edges || []);
        }
      } catch (err) {
        console.error('Placeholder graph load error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStubGraph();
    return () => { isMounted = false; };
  }, [companyId, setNodes, setEdges]);

  return (
    <div className="glass-panel p-6 border-slate-800/80">
      
      {/* Header & Phase 5 Disclaimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/30">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Neo4j Dual-Graph Topology Preview
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
                Phase 5 Placeholder
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulated entity relationship mapping (Company ↔ Recruiter ↔ Job Post ↔ Scam Cluster).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800">
          <Cpu className="h-4 w-4 text-cyan-400 animate-pulse" />
          <span>Cypher Traversal Engine: <strong className="text-amber-400">Scheduled (Phase 5)</strong></span>
        </div>
      </div>

      {/* Temporary Disclaimer Banner */}
      <div className="mb-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start gap-2.5 text-xs text-slate-300">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300">TEMPORARY STATIC PLACEHOLDER:</strong> This layout is generated from localized sample data (`graphService.js`) purely to verify interactive canvas integration. Real fraud-cluster detection and Cypher queries will be integrated directly with the Phase 1 Neo4j node/relationship entities in Phase 5.
        </div>
      </div>

      {/* React Flow Canvas Container */}
      <div className="h-[400px] w-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
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
            <Background color="#334155" gap={20} size={1} />
            <Controls className="bg-slate-900 border border-slate-700 text-slate-300" />
          </ReactFlow>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Employer Node
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span> Recruiter / Job Post
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Scam Pattern Flag
          </span>
        </div>
        <span className="text-slate-500 italic">Interactive Zoom / Drag Enabled</span>
      </div>

    </div>
  );
};

export default GraphVisualization;
