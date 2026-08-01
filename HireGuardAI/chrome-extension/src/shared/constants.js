/**
 * HireGuard AI Chrome Extension Shared Constants
 */
const API_BASE_URL = 'http://localhost:8080';

const ACTIONS = {
  EXTRACT_JOB_DETAILS: 'EXTRACT_JOB_DETAILS',
  ANALYZE_JOB: 'ANALYZE_JOB',
  GET_COMPANY_SCORE: 'GET_COMPANY_SCORE'
};

const RISK_BADGES = {
  LOW_RISK: {
    label: 'LOW RISK',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)'
  },
  MODERATE_RISK: {
    label: 'MODERATE RISK',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)'
  },
  HIGH_RISK: {
    label: 'HIGH RISK',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)'
  },
  UNASSIGNED: {
    label: 'UNKNOWN RISK',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.4)'
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_BASE_URL, ACTIONS, RISK_BADGES };
}
