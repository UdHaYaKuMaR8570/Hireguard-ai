import React from 'react';
import { COMPLAINT_REASONS } from '../utils/constants';
import { AlertCircle, Calendar, ExternalLink, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

/**
 * Card component displaying an individual Scam Complaint report styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const ComplaintCard = ({ complaint }) => {
  if (!complaint) return null;

  const { id, reason, description, proof, status = 'SUBMITTED' } = complaint;

  const reasonObj = COMPLAINT_REASONS.find((r) => r.value === reason);
  const reasonLabel = reasonObj ? reasonObj.label : reason;

  return (
    <div className="nexora-card p-5 bg-white border border-[#0d0d0d]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-[#e11d48] shrink-0" />
          <h4 className="font-heading font-bold text-[#0d0d0d] text-sm">
            {reasonLabel}
          </h4>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-heading font-bold bg-[#f2f2ef] border border-[#0d0d0d] text-[#0d0d0d] self-start sm:self-auto">
          <Clock className="h-3 w-3" />
          {status}
        </span>
      </div>

      <p className="text-xs text-[#555550] leading-relaxed mb-4 bg-[#f2f2ef] p-3.5 rounded-xl border border-[#d4d4cf]">
        "{description}"
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#777770] pt-3 border-t border-[#e0e0dc]">
        <div className="flex items-center gap-1.5 font-mono">
          <Calendar className="h-3.5 w-3.5" />
          <span>Report ID: <code className="text-[#0d0d0d] font-bold">{id?.substring(0, 8) || 'N/A'}</code></span>
        </div>

        {proof && (
          <a
            href={proof}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[#0d0d0d] font-heading font-bold hover:underline"
          >
            View Attachment ↗
          </a>
        )}
      </div>
    </div>
  );
};

export default ComplaintCard;
