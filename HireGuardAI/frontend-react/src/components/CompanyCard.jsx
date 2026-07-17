import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { Building2, Globe, MapPin, ShieldCheck, ArrowRight, CheckCircle, Clock } from 'lucide-react';

/**
 * Card component displaying summary information for a single Employer/Company.
 * Used in Company Search results and admin lists.
 */
const CompanyCard = ({ company }) => {
  if (!company) return null;

  const {
    id,
    name,
    website,
    countryOfRegistration = 'Unknown',
    registrationStatus = 'UNVERIFIED',
    trustSummary = {}
  } = company;

  const riskLevel = trustSummary.riskLevel || 'UNASSIGNED';
  const trustScore = trustSummary.trustScore !== undefined ? trustSummary.trustScore : 'N/A';

  return (
    <div className="glass-card p-6 flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-cyan-400">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                {name}
              </h3>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
              >
                <Globe className="h-3 w-3 shrink-0" />
                {website?.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <RiskBadge riskLevel={riskLevel} />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800/60 mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-slate-500" />
            <span>Country: <strong className="text-slate-100">{countryOfRegistration}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {registrationStatus === 'VERIFIED' ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span>Status: <strong className="text-slate-100">{registrationStatus}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer CTA & Score Preview */}
      <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 mt-auto">
        <div className="text-xs">
          <span className="text-slate-500">Trust Score:</span>{' '}
          <strong className="text-sm font-bold text-slate-200">
            {typeof trustScore === 'number' ? `${trustScore.toFixed(1)} / 100` : trustScore}
          </strong>
        </div>
        <Link
          to={`/company/${id}`}
          className="btn-secondary text-xs py-1.5 px-3 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all"
        >
          View Analysis
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
