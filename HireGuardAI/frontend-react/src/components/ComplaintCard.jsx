import React from 'react';
import { COMPLAINT_REASONS } from '../utils/constants';
import { AlertCircle, Calendar, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

/**
 * Card component displaying an individual Scam Complaint report.
 */
const ComplaintCard = ({ complaint }) => {
  if (!complaint) return null;

  const { id, reason, description, proof, status = 'SUBMITTED', createdAt } = complaint;

  // Find human readable label for reason code
  const reasonObj = COMPLAINT_REASONS.find((r) => r.value === reason);
  const reasonLabel = reasonObj ? reasonObj.label : reason;

  // Status badge coloring
  let statusBadgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  let StatusIcon = Clock;
  if (status === 'VERIFIED' || status === 'CONFIRMED_FRAUD') {
    statusBadgeClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    StatusIcon = ShieldAlert;
  } else if (status === 'RESOLVED' || status === 'DISMISSED') {
    statusBadgeClass = 'bg-slate-800 text-slate-400 border-slate-700';
    StatusIcon = CheckCircle2;
  }

  return (
    <div className="glass-card p-5 border-slate-800/80 hover:border-slate-700 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <h4 className="font-bold text-slate-100 text-sm sm:text-base">
            {reasonLabel}
          </h4>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusBadgeClass} self-start sm:self-auto`}>
          <StatusIcon className="h-3 w-3" />
          {status}
        </span>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4 bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
        "{description}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 pt-3 border-t border-slate-800/60">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          <span>Report ID: <code className="text-slate-400 font-mono">{id?.substring(0, 8) || 'N/A'}</code></span>
        </div>

        {proof && (
          <a
            href={proof}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
          >
            View Evidence Attachment
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
