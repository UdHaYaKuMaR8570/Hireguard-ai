import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from './RiskBadge';
import { Building2, Globe, MapPin, ArrowRight, CheckCircle, Clock } from 'lucide-react';

/**
 * Card component displaying summary information for an Employer/Company
 * styled in the Luxury Dark Gold & Serif Theme.
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
    <div className="glass-card p-6 flex flex-col justify-between group hover:border-[#d4af37] transition-all">
      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#161514] rounded-lg border border-[#c59b27]/40 text-[#d4af37]">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif tracking-wider font-bold text-[#f3f0e8] group-hover:text-[#d4af37] transition-colors line-clamp-1">
                {name}
              </h3>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#a39e93] hover:text-[#d4af37] flex items-center gap-1 mt-0.5 truncate max-w-[200px]"
              >
                <Globe className="h-3 w-3 shrink-0" />
                {website?.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <RiskBadge riskLevel={riskLevel} />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-3 text-xs text-[#c8c3b8] bg-[#161514]/70 p-3 rounded-lg border border-[#c59b27]/20 mb-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#c59b27]" />
            <span>Country: <strong className="text-[#f3f0e8]">{countryOfRegistration}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            {registrationStatus === 'VERIFIED' ? (
              <CheckCircle className="h-3.5 w-3.5 text-[#34d399]" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-[#c59b27]" />
            )}
            <span>Status: <strong className="text-[#f3f0e8]">{registrationStatus}</strong></span>
          </div>
        </div>
      </div>

      {/* Footer CTA & Score Preview */}
      <div className="flex items-center justify-between border-t border-[#c59b27]/20 pt-4 mt-auto">
        <div className="text-xs font-serif">
          <span className="text-[#a39e93] uppercase tracking-wider">Trust Score:</span>{' '}
          <strong className="text-sm font-bold text-[#d4af37]">
            {typeof trustScore === 'number' ? `${trustScore.toFixed(1)} / 100` : trustScore}
          </strong>
        </div>
        <Link
          to={`/company/${id}`}
          className="btn-secondary text-[11px] py-1.5 px-3 group-hover:border-[#d4af37] transition-all"
        >
          View Analysis
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;
