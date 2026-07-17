import React from 'react';
import RiskBadge from './RiskBadge';
import { ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * Large highlighted Trust Score card rendering Phase 2 baseline score and explainability bullet list.
 * Gracefully handles stub/placeholder responses (`isTemporaryStub`) with appropriate disclaimers.
 */
const TrustScoreCard = ({ trustSummary }) => {
  if (!trustSummary) {
    return (
      <div className="glass-card p-6 border-slate-800 text-center text-slate-400">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-slate-600" />
        No Phase 2 Trust Report available for this employer document yet.
      </div>
    );
  }

  const { trustScore = 0, riskLevel = 'UNASSIGNED', reasons = [], isTemporaryStub } = trustSummary;

  // Score color ring
  let scoreColorClass = 'text-slate-400 border-slate-700';
  if (trustScore >= 80) scoreColorClass = 'text-emerald-400 border-emerald-500/50 shadow-emerald-500/10';
  else if (trustScore >= 50) scoreColorClass = 'text-amber-400 border-amber-500/50 shadow-amber-500/10';
  else scoreColorClass = 'text-rose-400 border-rose-500/50 shadow-rose-500/10';

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden border-slate-800/80">
      
      {/* Top Banner indicating temporary baseline status from Phase 2 */}
      {isTemporaryStub && (
        <div className="mb-6 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            <strong>Phase 2 Baseline Rule:</strong> This score (`75.0`) is a temporary stub generated upon company verification. Full AI/NLP + Neo4j graph traversal scoring is scheduled for Phase 5.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Large Score Circle */}
        <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-2xl border border-slate-800/80">
          <div className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl ${scoreColorClass}`}>
            <span className="text-3xl font-extrabold tracking-tight">
              {Number(trustScore).toFixed(1)}
            </span>
            <span className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
              / 100 PTS
            </span>
          </div>
          <div className="mt-4">
            <RiskBadge riskLevel={riskLevel} className="px-4 py-1.5 text-sm" />
          </div>
        </div>

        {/* Explainability Bullet List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ShieldAlert className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-slate-100">
              Explainable Trust Analysis & Risk Reasons
            </h3>
          </div>

          <ul className="space-y-3 text-sm text-slate-300">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2.5 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
                  <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No specific risk reason flags generated yet.</li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default TrustScoreCard;
