import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import companyService from '../services/companyService';
import CompanyCard from '../components/CompanyCard';
import { Lock, ShieldAlert, CheckCircle, RefreshCw, AlertCircle, Database, Layers } from 'lucide-react';

/**
 * Admin Verification & Audit Dashboard (`AdminDashboard.jsx`) styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const AdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await companyService.searchCompanies('');
      setCompanies(results || []);
    } catch (err) {
      console.error('Admin queue error:', err);
      setError('Could not retrieve employer index from Phase 2 backend.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#f2f2ef]">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e0e0dc]">
          <div>
            <div className="flex items-center gap-2 text-[#0d0d0d] text-xs font-heading font-bold uppercase tracking-wider mb-1">
              <Lock className="h-4 w-4 text-[#0d0d0d]" />
              Investigator Audit Level
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#0d0d0d]">
              Admin Verification & Scam Audit Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#555550] mt-1">
              Central audit log of all registered employer documents (`GET /api/company/search`) across MongoDB (`27017`).
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="btn-pill-black py-2 px-4 text-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#ffe4e6] border border-[#e11d48] rounded-2xl flex items-center gap-3 text-sm text-[#9f1239]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="nexora-card p-5 bg-white border border-[#0d0d0d]">
            <span className="text-xs text-[#777770] font-heading font-bold uppercase">Total Indexed Employers</span>
            <div className="text-2xl font-heading font-black text-[#0d0d0d] mt-1 flex items-center gap-2">
              <Database className="h-6 w-6 text-[#0d0d0d]" />
              {companies.length} Document(s)
            </div>
          </div>

          <div className="nexora-card p-5 bg-white border border-[#0d0d0d]">
            <span className="text-xs text-[#777770] font-heading font-bold uppercase">Verified Baseline Trust</span>
            <div className="text-2xl font-heading font-black text-[#0d0d0d] mt-1 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-[#10b981]" />
              {companies.filter(c => c.registrationStatus === 'VERIFIED').length} Verified
            </div>
          </div>

          <div className="nexora-card p-5 bg-white border border-[#0d0d0d]">
            <span className="text-xs text-[#777770] font-heading font-bold uppercase">Pending Verification</span>
            <div className="text-2xl font-heading font-black text-[#0d0d0d] mt-1 flex items-center gap-2">
              <Layers className="h-6 w-6 text-[#d97706]" />
              {companies.filter(c => c.registrationStatus !== 'VERIFIED').length} Unverified
            </div>
          </div>
        </div>

        {/* Queue Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0d0d0d] mb-3"></div>
            <p className="text-xs text-[#555550] font-heading font-medium">Querying Phase 2 MongoDB index...</p>
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="nexora-card p-12 text-center max-w-xl mx-auto bg-white border border-[#0d0d0d]">
            <ShieldAlert className="h-12 w-12 text-[#888880] mx-auto mb-3" />
            <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1">No Employer Documents in Queue</h3>
            <p className="text-xs text-[#555550]">
              The MongoDB `companies` collection is currently empty (`[]`). Onboard a company via Company Search to populate this admin table!
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
