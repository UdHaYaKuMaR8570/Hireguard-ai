import React from 'react';
import RiskBadge from './RiskBadge';
import { Shield, CheckCircle2, HelpCircle } from 'lucide-react';

/**
 * Large highlighted Trust Score card styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const TrustScoreCard = ({ trustSummary }) => {
  if (!trustSummary) {
    return (
      <div className="nexora-card p-6 bg-white border border-[#0d0d0d] text-center text-[#555550]">
        <HelpCircle className="h-8 w-8 mx-auto mb-2 text-[#888880]" />
        No Phase 2 Trust Report available for this employer document yet.
      </div>
    );
  }

  const { trustScore = 0, riskLevel = 'UNASSIGNED', reasons = [] } = trustSummary;

  return (
    <div className="nexora-panel p-6 sm:p-8 bg-white border border-[#0d0d0d] relative overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Large Score Circle */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#f2f2ef] rounded-2xl border border-[#0d0d0d]">
          <div className="w-32 h-32 rounded-full border-4 border-[#0d0d0d] flex flex-col items-center justify-center bg-white shadow-md">
            <span className="text-3xl font-heading font-black text-[#0d0d0d] tracking-tight">
              {Number(trustScore).toFixed(1)}
            </span>
            <span className="text-[10px] uppercase font-heading font-bold text-[#777770] mt-0.5">
              / 100 PTS
            </span>
          </div>
          <div className="mt-4">
            <RiskBadge riskLevel={riskLevel} className="px-4 py-1.5 text-xs" />
          </div>
        </div>

        {/* Explainability Bullet List */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#e0e0dc] pb-3">
            <Shield className="h-5 w-5 text-[#0d0d0d]" />
            <h3 className="text-lg font-heading font-bold text-[#0d0d0d]">
              Explainable Trust Analysis & Risk Reasons
            </h3>
          </div>

          <ul className="space-y-3 text-sm text-[#0d0d0d]">
            {reasons && reasons.length > 0 ? (
              reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2.5 bg-[#f2f2ef] p-3.5 rounded-xl border border-[#d4d4cf] font-medium text-xs leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-[#0d0d0d] shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </li>
              ))
            ) : (
              <li className="text-[#777770] italic">No specific risk reason flags generated yet.</li>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default TrustScoreCard;
