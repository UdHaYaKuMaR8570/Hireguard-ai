import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import companyService from '../services/companyService';
import { COMPLAINT_REASONS } from '../utils/constants';
import { FileWarning, AlertCircle, CheckCircle2, Building2, Link as LinkIcon, FileText } from 'lucide-react';

/**
 * Scam Incident Reporting Page (`ReportScam.jsx`) styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
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
    <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex p-3 bg-[#0d0d0d] text-white rounded-full mb-3 shadow-md">
          <FileWarning className="h-7 w-7" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-[#0d0d0d]">
          Submit Scam Incident & Evidence Report
        </h1>
        <p className="text-xs sm:text-sm text-[#555550] mt-2">
          Your report directly updates the MongoDB complaint collection (`POST /api/complaints`) and triggers risk recalculations.
        </p>
      </div>

      <div className="nexora-card p-6 sm:p-8 bg-white border border-[#0d0d0d]">
        
        {/* Success Alert */}
        {successMsg && (
          <div className="mb-6 p-4 bg-[#ecfdf5] border border-[#10b981] rounded-2xl flex items-center justify-between text-sm text-[#047857]">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button
              onClick={() => navigate(`/company/${companyId}`)}
              className="btn-pill-black text-xs py-1.5 px-4 shrink-0 ml-4"
            >
              View Profile ↗
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-[#ffe4e6] border border-[#e11d48] rounded-2xl flex items-start gap-3 text-sm text-[#9f1239]">
            <AlertCircle className="h-5 w-5 text-[#e11d48] shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Company ID Input */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Target Company Document ID (`companyId`) *
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="text"
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                placeholder="e.g., cmp-41829abc (Copy from Company Search or URL)"
                className="input-nexora pl-11 font-mono text-xs"
              />
            </div>
            {companyName && (
              <span className="text-xs font-heading font-bold text-[#0d0d0d] mt-1 block">
                Filing against: <strong>{companyName}</strong>
              </span>
            )}
          </div>

          {/* Scam Category Dropdown */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Fraud Incident Classification (`reason`) *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="input-nexora appearance-none cursor-pointer text-xs py-3.5 bg-white"
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
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Evidence Link / Screenshot URL (`proof`) (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="url"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                placeholder="https://s3.amazonaws.com/evidence/check_screenshot_01.png"
                className="input-nexora pl-11 text-xs"
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Incident Details & Timeline (`description`) *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe exact recruiter behavior, domain names used, demands made, and why you suspect this job post is counterfeit..."
                className="input-nexora pl-11 py-3 text-xs leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pill-black py-3.5 text-xs font-bold uppercase tracking-wider shadow-md"
          >
            {loading ? 'Submitting to Backend...' : 'Submit Evidence Report (`POST /api/complaints`) ↗'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default ReportScam;
