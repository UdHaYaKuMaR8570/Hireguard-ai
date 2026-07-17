import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import companyService from '../services/companyService';
import { COMPLAINT_REASONS } from '../utils/constants';
import { FileWarning, AlertCircle, CheckCircle2, ShieldAlert, Building2, Link as LinkIcon, FileText } from 'lucide-react';

/**
 * Scam Incident Reporting Page (`ReportScam.jsx`) communicating with `POST /api/complaints`.
 * Enforces validation rules matching Phase 2 `ComplaintRequest` DTO (`companyId`, `reason`, `proof`, `description`).
 */
const ReportScam = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [companyId, setCompanyId] = useState(searchParams.get('companyId') || '');
  const [companyName, setCompanyName] = useState(searchParams.get('companyName') || '');
  const [reason, setReason] = useState(COMPLAINT_REASONS[0].value);
  const [proof, setProof] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await companyService.submitComplaint({
        companyId: companyId.trim(),
        reason,
        proof: proof.trim(),
        description: description.trim(),
      });

      setSuccessMsg(`Evidence report successfully logged (` + result.id + `). Phase 2 Scam Pattern verification triggered!`);
      // Reset fields after successful submission
      setDescription('');
      setProof('');
    } catch (err) {
      console.error('Complaint submission error:', err);
      const msg = err.response?.data?.message || 'Failed to submit complaint. Ensure company ID exists and your JWT token is valid (`POST /api/complaints`).';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 mb-3 shadow-lg shadow-rose-500/10">
          <FileWarning className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-100">
          Submit Scam Incident & Evidence Report
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Your report directly updates the Phase 2 MongoDB complaint collection (`POST /api/complaints`) and triggers risk recalculations.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 border-slate-800/80">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start justify-between text-sm text-emerald-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => navigate(`/company/${companyId}`)}
              className="btn-secondary text-xs py-1 px-3 bg-emerald-950/80 hover:bg-emerald-900/80 border-emerald-700 text-emerald-200 shrink-0 ml-4"
            >
              View Employer Profile
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Company ID Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Target Company Document ID (`companyId`) *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="e.g., cmp-41829abc (Copy from Company Search or URL)"
                className="input-field pl-10 font-mono text-sm"
              />
            </div>
            {companyName && (
              <span className="text-xs text-cyan-400 mt-1 block">
                Filing against: <strong>{companyName}</strong>
              </span>
            )}
          </div>

          {/* Scam Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Fraud Incident Classification (`reason`) *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-field bg-slate-950/90 appearance-none cursor-pointer text-sm py-3"
            >
              {COMPLAINT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Evidence URL / Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Evidence Link / Screenshot URL (`proof`) (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="url"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="https://s3.amazonaws.com/evidence/check_screenshot_01.png"
                className="input-field pl-10 text-sm"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Provide a public cloud link (S3, Google Drive, Imgur) to email headers, counterfeit checks, or chat logs.
            </span>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Incident Details & Timeline (`description`) *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact recruiter behavior, domain names used, demands made, and why you suspect this job post is counterfeit..."
                className="input-field pl-10 py-3 text-sm leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 text-base font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 shadow-rose-500/20"
          >
            {loading ? 'Submitting to Phase 2 Backend...' : 'Submit Evidence Report (`POST /api/complaints`)'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ReportScam;
