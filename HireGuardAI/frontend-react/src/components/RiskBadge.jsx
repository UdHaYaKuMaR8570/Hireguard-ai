import React from 'react';
import { RISK_LEVEL_CONFIG } from '../utils/constants';

/**
 * Reusable color-coded badge displaying employer risk classifications (`LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`).
 */
const RiskBadge = ({ riskLevel = 'UNASSIGNED', className = '' }) => {
  const config = RISK_LEVEL_CONFIG[riskLevel] || RISK_LEVEL_CONFIG.UNASSIGNED;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${config.badgeClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: config.color }}></span>
      {config.label}
    </span>
  );
};

export default RiskBadge;
