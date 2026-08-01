/**
 * Application-wide constants and UI configuration mapping.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const RISK_LEVEL_CONFIG = {
  LOW_RISK: {
    label: "Low Risk",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
    color: "#10b981",
  },
  MODERATE_RISK: {
    label: "Moderate Risk",
    badgeClass: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    color: "#f59e0b",
  },
  HIGH_RISK: {
    label: "High Risk",
    badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
    color: "#f43f5e",
  },
  CRITICAL_RISK: {
    label: "Critical Risk",
    badgeClass: "bg-red-600/20 text-red-400 border border-red-600/50 animate-pulse",
    color: "#dc2626",
  },
  UNASSIGNED: {
    label: "Unassigned / Pending",
    badgeClass: "bg-slate-800 text-slate-400 border border-slate-700",
    color: "#64748b",
  },
};

export const COMPLAINT_REASONS = [
  { value: "SCAM", label: "Scam (Advance fee demand, fake check, phishing link)" },
  { value: "HARASSMENT", label: "Harassment (Recruiter misconduct or threats)" },
  { value: "FAKE_COMPANY", label: "Fake Company (Unauthorized representation or impersonation)" },
  { value: "OTHER", label: "Other Job Fraud Incident" },
];
