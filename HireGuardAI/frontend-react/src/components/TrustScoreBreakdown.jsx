import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Building, 
  Cpu, 
  Share2, 
  CheckCircle2, 
  MinusCircle 
} from 'lucide-react';

/**
 * Extracts and maps the 4 core verification signals strictly from real backend response data.
 * Supports both EmployerVerificationResponse and TrustScoreResponse shapes.
 */
export function extractVerificationSignals(trustSummary) {
  if (!trustSummary) return [];

  const { 
    signals = {}, 
    verification = {}, 
    reasons = [], 
    warnings = [], 
    graphRiskFactors = [] 
  } = trustSummary;

  // -------------------------------------------------------------
  // 1. Blacklist Database Check
  // -------------------------------------------------------------
  let blacklistStatus = 'unevaluated';
  let blacklistText = 'Not evaluated';
  let blacklistDetails = [];

  if (verification?.blacklist) {
    const bl = verification.blacklist;
    if (bl.blacklisted) {
      blacklistStatus = 'flagged';
      blacklistText = bl.reason 
        ? `Found on blacklist: ${bl.reason}` 
        : `Found on blacklist (${bl.matchedType || 'Match detected'})`;
    } else {
      blacklistStatus = 'pass';
      blacklistText = bl.reason || 'Not on blacklist (No matching scam entries found)';
    }
    if (bl.reasons && bl.reasons.length > 0) {
      blacklistDetails = bl.reasons;
    }
  } else if (signals.blacklist !== undefined) {
    if (signals.blacklist === 0) {
      blacklistStatus = 'flagged';
      blacklistText = 'Found on blacklist (Score: 0/100)';
    } else {
      blacklistStatus = 'pass';
      blacklistText = 'Not on blacklist (Repository clear)';
    }
  } else {
    // Check reasons list for Blacklist Audit log
    const blReason = reasons.find(r => /blacklist/i.test(r));
    if (blReason) {
      if (/no active|no match|clear|clean/i.test(blReason)) {
        blacklistStatus = 'pass';
        blacklistText = blReason;
      } else {
        blacklistStatus = 'flagged';
        blacklistText = blReason;
      }
      blacklistDetails = [blReason];
    }
  }

  // -------------------------------------------------------------
  // 2. Employer Verification (WHOIS + MCA)
  // -------------------------------------------------------------
  let employerStatus = 'unevaluated';
  let employerText = 'Not evaluated';
  let employerDetails = [];

  const whois = verification?.whois;
  const reg = verification?.companyRegistration;
  const whoisScore = signals.whois;
  const regScore = signals.companyRegistration;

  if (whois || reg || whoisScore !== undefined || regScore !== undefined) {
    const parts = [];

    // WHOIS domain info
    if (whois) {
      if (whois.domainAgeMonths !== undefined && whois.domainAgeMonths !== null) {
        const yrs = (whois.domainAgeMonths / 12).toFixed(1);
        parts.push(`Domain registered ${whois.domainAgeMonths >= 12 ? `${yrs} yrs` : `${whois.domainAgeMonths} mos`} ago`);
      } else if (whois.message) {
        parts.push(whois.message);
      }
    }

    // MCA Government Registration
    if (reg) {
      if (reg.status) {
        parts.push(`MCA status: ${reg.status.replace('_', ' ')}`);
      }
      if (reg.reasons && reg.reasons.length > 0) {
        employerDetails.push(...reg.reasons);
      }
    }

    if (parts.length > 0) {
      employerText = parts.join(' • ');
    } else if (regScore !== undefined || whoisScore !== undefined) {
      employerText = `Domain Score: ${whoisScore ?? 'N/A'}/100, MCA Score: ${regScore ?? 'N/A'}/100`;
    }

    const isRegUnavail = reg?.status === 'VERIFICATION_UNAVAILABLE' || regScore === 70;
    const isRegVerified = reg?.verified === true || regScore === 100;
    const isRegFailed = reg?.status === 'DISSOLVED' || regScore === 10;
    const isWhoisGood = whois?.success === true || (whoisScore !== undefined && whoisScore >= 65);

    if (isRegFailed || (whoisScore !== undefined && whoisScore < 50)) {
      employerStatus = 'flagged';
    } else if (isRegVerified && isWhoisGood) {
      employerStatus = 'pass';
    } else if (isRegUnavail && isWhoisGood) {
      employerStatus = 'pass';
    } else if (isRegVerified || isWhoisGood) {
      employerStatus = 'pass';
    } else if (isRegUnavail) {
      employerStatus = 'unevaluated';
      employerText = 'MCA Provider unconfigured (Not evaluated)';
    } else {
      employerStatus = 'flagged';
    }
  } else {
    // Check reasons for Government Registration or WHOIS audit
    const regReason = reasons.find(r => /Government Registration Audit|Registration/i.test(r));
    const whoisReason = reasons.find(r => /WHOIS|Domain/i.test(r));
    if (regReason || whoisReason) {
      const items = [whoisReason, regReason].filter(Boolean);
      employerText = items.join(' • ');
      employerDetails = items;

      if (regReason && /unverified|rejected|suspicious/i.test(regReason)) {
        employerStatus = 'flagged';
      } else if (regReason && /unconfigured|unavailable/i.test(regReason)) {
        employerStatus = 'unevaluated';
      } else if (regReason && /active and verified|verified/i.test(regReason)) {
        employerStatus = 'pass';
      }
    }
  }

  // -------------------------------------------------------------
  // 3. AI Risk Assessment (NLP / DistilBERT)
  // -------------------------------------------------------------
  let aiStatus = 'unevaluated';
  let aiText = 'Not evaluated';
  let aiDetails = [];

  const aiUnavailableReason = reasons.find(r => /AI NLP microservice unavailable|AI service unavailable/i.test(r));
  const aiReason = reasons.find(r => /Python AI Transformer Scan|AI Scam Classifier|AI Analysis/i.test(r));
  const aiScore = signals.aiAnalysis;

  if (aiUnavailableReason) {
    aiStatus = 'unevaluated';
    aiText = 'AI microservice unavailable (Not evaluated)';
    aiDetails = [aiUnavailableReason];
  } else if (aiReason) {
    aiText = aiReason;
    aiDetails = [aiReason];
    if (/high risk|probability [5-9]\d%|probability 100%/i.test(aiReason)) {
      aiStatus = 'flagged';
    } else {
      aiStatus = 'pass';
    }
  } else if (aiScore !== undefined) {
    if (aiScore === 75 && reasons.some(r => r.includes('unavailable'))) {
      aiStatus = 'unevaluated';
      aiText = 'AI microservice unavailable (Not evaluated)';
    } else if (aiScore >= 70) {
      aiStatus = 'pass';
      aiText = `Low scam probability detected in posting (${100 - aiScore}% risk, Score: ${aiScore}/100)`;
    } else {
      aiStatus = 'flagged';
      aiText = `Elevated scam probability detected (${100 - aiScore}% risk, Score: ${aiScore}/100)`;
    }
  }

  // -------------------------------------------------------------
  // 4. Graph Network Check (Neo4j)
  // -------------------------------------------------------------
  let graphStatus = 'unevaluated';
  let graphText = 'Not evaluated (Graph network traversal not run for this check)';
  let graphDetails = [];

  if (graphRiskFactors && graphRiskFactors.length > 0) {
    graphDetails = graphRiskFactors;
    const isClean = graphRiskFactors.some(g => /clean|no multi-company|no high-risk/i.test(g));
    if (isClean && graphRiskFactors.length === 1) {
      graphStatus = 'pass';
      graphText = graphRiskFactors[0];
    } else {
      graphStatus = 'flagged';
      graphText = graphRiskFactors[0];
    }
  } else {
    const graphReason = reasons.find(r => /Neo4j Graph|Graph Topology|Graph Anomaly/i.test(r));
    if (graphReason) {
      graphDetails = [graphReason];
      if (/clean|no multi-company/i.test(graphReason)) {
        graphStatus = 'pass';
        graphText = graphReason;
      } else {
        graphStatus = 'flagged';
        graphText = graphReason;
      }
    } else if (signals.graphAnalysis !== undefined) {
      if (signals.graphAnalysis >= 80) {
        graphStatus = 'pass';
        graphText = `No fraud ring connections detected (Score: ${signals.graphAnalysis}/100)`;
      } else {
        graphStatus = 'flagged';
        graphText = `Suspicious graph connections detected (Score: ${signals.graphAnalysis}/100)`;
      }
    }
  }

  return [
    {
      id: 'blacklist',
      title: 'Blacklist Check',
      category: 'Internal & Global Repositories',
      icon: Database,
      status: blacklistStatus,
      statusText: blacklistText,
      details: blacklistDetails,
      score: signals.blacklist
    },
    {
      id: 'employer',
      title: 'Employer Verification (WHOIS + MCA)',
      category: 'Infrastructure & Government Audit',
      icon: Building,
      status: employerStatus,
      statusText: employerText,
      details: employerDetails,
      score: signals.companyRegistration ?? signals.whois
    },
    {
      id: 'ai',
      title: 'AI Risk Assessment',
      category: 'DistilBERT Transformer NLP Analysis',
      icon: Cpu,
      status: aiStatus,
      statusText: aiText,
      details: aiDetails,
      score: signals.aiAnalysis
    },
    {
      id: 'graph',
      title: 'Graph Network Check',
      category: 'Neo4j Fraud Ring & Multi-Hop Anomaly',
      icon: Share2,
      status: graphStatus,
      statusText: graphText,
      details: graphDetails,
      score: signals.graphAnalysis
    }
  ];
}

/**
 * TrustScoreBreakdown: Clear 4-signal verification checklist with expandable audit details.
 */
const TrustScoreBreakdown = ({ trustSummary }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const signalsList = extractVerificationSignals(trustSummary);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return {
          icon: CheckCircle2,
          iconClass: 'text-emerald-500',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30',
          label: 'Pass / Clear'
        };
      case 'flagged':
        return {
          icon: AlertTriangle,
          iconClass: 'text-rose-500',
          badgeClass: 'bg-rose-500/10 text-rose-600 border border-rose-500/30',
          label: 'Flagged / Risk'
        };
      default:
        return {
          icon: MinusCircle,
          iconClass: 'text-slate-400',
          badgeClass: 'bg-slate-100 text-slate-500 border border-slate-300',
          label: 'Not Evaluated'
        };
    }
  };

  return (
    <div className="nexora-card p-6 bg-white border border-[#0d0d0d] space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e0dc]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[#0d0d0d]" />
          <h4 className="text-base font-heading font-bold text-[#0d0d0d]">
            Verification Pipeline Signals
          </h4>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-heading font-bold text-[#555550] hover:text-[#0d0d0d] transition-colors cursor-pointer"
        >
          {isExpanded ? (
            <>
              Hide Full Details <ChevronUp className="h-3.5 w-3.5" />
            </>
          ) : (
            <>
              Expand Full Details <ChevronDown className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Stepper / Checklist */}
      <div className="space-y-3">
        {signalsList.map((signal, index) => {
          const config = getStatusBadge(signal.status);
          const StatusIcon = config.icon;
          const CategoryIcon = signal.icon;

          return (
            <div 
              key={signal.id}
              className={`rounded-xl border transition-all p-3.5 ${
                signal.status === 'flagged' 
                  ? 'bg-rose-50/40 border-rose-200' 
                  : signal.status === 'pass'
                  ? 'bg-[#f9f9f6] border-[#e0e0dc]'
                  : 'bg-slate-50/70 border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className="mt-0.5 shrink-0">
                    <StatusIcon className={`h-4 w-4 ${config.iconClass}`} />
                  </div>

                  {/* Signal Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-heading font-bold text-xs text-[#0d0d0d]">
                        {signal.title}
                      </span>
                      <span className="text-[10px] text-[#777770] font-mono">
                        ({signal.category})
                      </span>
                    </div>

                    {/* Headline Status from Real API */}
                    <p className={`text-xs mt-1 font-medium leading-relaxed ${
                      signal.status === 'flagged' ? 'text-rose-700 font-semibold' : 'text-[#333330]'
                    }`}>
                      {signal.statusText}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="shrink-0 flex items-center gap-2">
                  {signal.score !== undefined && (
                    <span className="text-[11px] font-mono text-[#777770] hidden sm:inline-block">
                      {signal.score}/100
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${config.badgeClass}`}>
                    {config.label}
                  </span>
                </div>
              </div>

              {/* Expanded Detail Sub-Items */}
              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-[#e8e8e4] text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-heading font-semibold text-[#666660]">
                    <CategoryIcon className="h-3.5 w-3.5 text-[#0d0d0d]" />
                    <span>Audit Trail Log</span>
                  </div>
                  {signal.details && signal.details.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-[#444440] pl-1 font-mono text-[11px]">
                      {signal.details.map((detail, idx) => (
                        <li key={idx} className="leading-normal">{detail}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-[#777770] italic">
                      {signal.status === 'unevaluated' 
                        ? 'Service not invoked or not configured for this analysis run.'
                        : 'No additional sub-flags reported by verification worker.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrustScoreBreakdown;
