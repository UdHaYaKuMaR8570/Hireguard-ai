import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import companyService from '../services/companyService';
import CompanyCard from '../components/CompanyCard';
import { Lock, ShieldAlert, CheckCircle, RefreshCw, AlertCircle, Database, Layers } from 'lucide-react';

/**
 * Admin Verification & Audit Dashboard (`AdminDashboard.jsx`).
 * Aggregates Phase 2 `GET /api/company/search` query endpoint to allow investigative inspection without modifying backend APIs.
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Lock className="h-4 w-4" />
              Investigator Audit Level
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
              Admin Verification & Scam Audit Queue
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Central audit log of all registered employer documents (`GET /api/company/search`) across MongoDB (`27017`).
            </p>
          </div>

          <button
            onClick={fetchQueue}
            disabled={loading}
            className="btn-secondary py-2 px-4 text-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-sm text-rose-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-5 border-slate-800/80">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Indexed Employers</span>
            <div className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Database className="h-6 w-6 text-cyan-400" />
              {companies.length} Document(s)
            </div>
          </div>

          <div className="glass-card p-5 border-slate-800/80">
            <span className="text-xs text-slate-500 font-semibold uppercase">Verified Baseline Trust</span>
            <div className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-emerald-400" />
              {companies.filter(c => c.registrationStatus === 'VERIFIED').length} Verified
            </div>
          </div>

          <div className="glass-card p-5 border-slate-800/80">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Verification</span>
            <div className="text-2xl font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Layers className="h-6 w-6 text-amber-400" />
              {companies.filter(c => c.registrationStatus !== 'VERIFIED').length} Unverified
            </div>
          </div>
        </div>

        {/* Queue Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
            <p className="text-xs text-slate-400">Querying Phase 2 MongoDB index...</p>
          </div>
        ) : companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="glass-panel p-12 text-center max-w-xl mx-auto border-slate-800/80">
            <ShieldAlert className="h-12 w-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300 mb-1">No Employer Documents in Queue</h3>
            <p className="text-xs text-slate-500">
              The MongoDB `companies` collection is currently empty (`[]`). Onboard a company via Company Search to populate this admin table!
            </p>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
