import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import companyService from '../services/companyService';
import CompanyCard from '../components/CompanyCard';
import useAuth from '../hooks/useAuth';
import { Search, Building2, PlusCircle, AlertCircle, CheckCircle2, Globe, Mail, ShieldAlert } from 'lucide-react';

/**
 * Company Search Page (`CompanySearch.jsx`) calling `GET /api/company/search?name=`.
 * Includes seamless inline onboarding (`POST /api/company/verify`) when a company is not yet indexed.
 */
const CompanySearch = () => {
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Onboarding Modal/Form state
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [onboardName, setOnboardName] = useState('');
  const [onboardWebsite, setOnboardWebsite] = useState('');
  const [onboardEmail, setOnboardEmail] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [onboardError, setOnboardError] = useState(null);
  const [onboardSuccess, setOnboardSuccess] = useState(null);

  const fetchCompanies = useCallback(async (searchQuery = '') => {
    setLoading(true);
    setError(null);
    try {
      const results = await companyService.searchCompanies(searchQuery);
      setCompanies(results || []);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch company database. Ensure your Phase 2 backend and MongoDB containers are running (`docker ps`).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompanies(query);
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardError(null);
    setOnboardSuccess(null);
    setOnboardLoading(true);

    try {
      const newCompany = await companyService.verifyCompany({
        companyName: onboardName,
        website: onboardWebsite,
        recruiterEmail: onboardEmail
      });
      
      setOnboardSuccess(`Successfully verified & onboarded "${newCompany.name}" (ID: ${newCompany.id})! Baseline trust score assigned.`);
      setShowOnboardForm(false);
      setOnboardName('');
      setOnboardWebsite('');
      setOnboardEmail('');
      // Refresh list to show newly onboarded company
      fetchCompanies(query);
    } catch (err) {
      console.error('Onboard error:', err);
      const msg = err.response?.data?.message || 'Company verification failed. Please check inputs or ensure you are signed in.';
      setOnboardError(msg);
    } finally {
      setOnboardLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Search Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mb-3">
          Search Employer Verification Database
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          Query MongoDB (`GET /api/company/search`) for registered companies or onboard unverified recruiter domains instantly.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter company name (e.g., Apex Global Careers, Google, Microsoft...)"
              className="input-field pl-12 py-3 text-base shadow-inner"
            />
          </div>
          <button type="submit" className="btn-primary py-3 px-6 shrink-0 text-base">
            Search Database
          </button>
        </form>
      </div>

      {/* Onboarding Success Banner */}
      {onboardSuccess && (
        <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-sm text-emerald-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{onboardSuccess}</span>
          </div>
          <button onClick={() => setOnboardSuccess(null)} className="text-xs underline text-emerald-400 hover:text-emerald-300">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-sm text-rose-300">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">API Connection Error:</strong>
            {error}
          </div>
        </div>
      )}

      {/* Results Grid / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
          <p className="text-sm text-slate-400 font-medium">Scanning dual-database employer index...</p>
        </div>
      ) : companies.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6 text-sm text-slate-400">
            <span>Found <strong className="text-cyan-400 font-bold">{companies.length}</strong> employer profile(s)</span>
            <button
              onClick={() => {
                setShowOnboardForm(!showOnboardForm);
                if (!showOnboardForm && query) setOnboardName(query);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Onboard New Employer
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State with Actionable Onboarding Form */
        <div className="glass-panel p-8 sm:p-12 text-center max-w-2xl mx-auto border-slate-800/80">
          <Building2 className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-2">No Companies Matching "{query}"</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
            This employer domain has not been indexed in our MongoDB collection yet. You can verify and onboard them immediately to generate a Phase 2 baseline trust score!
          </p>

          {!showOnboardForm ? (
            <button
              onClick={() => {
                setShowOnboardForm(true);
                if (query) setOnboardName(query);
              }}
              className="btn-primary mx-auto text-sm px-6 py-2.5"
            >
              <PlusCircle className="h-4 w-4" />
              Verify & Onboard Employer Now (`POST /api/company/verify`)
            </button>
          ) : null}
        </div>
      )}

      {/* Inline Onboarding Form (`POST /api/company/verify`) */}
      {showOnboardForm && (
        <div className="mt-10 glass-panel p-6 sm:p-8 max-w-xl mx-auto border-cyan-500/30 relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-cyan-400" />
              <h3 className="text-base font-bold text-slate-100">Onboard Employer Profile</h3>
            </div>
            <button
              onClick={() => setShowOnboardForm(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 text-center">
              <p className="mb-3">
                <strong>Authentication Required:</strong> Phase 2 security rules strictly require a valid JWT Bearer token (`POST /api/company/verify`) to onboard new employers.
              </p>
              <Link to="/login" className="btn-secondary py-1.5 px-4 text-xs inline-flex">
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left">
              {onboardError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                  {onboardError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    placeholder="e.g., Apex Global Careers LLC"
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="url"
                    required
                    value={onboardWebsite}
                    onChange={(e) => setOnboardWebsite(e.target.value)}
                    placeholder="https://apex-talent-global-careers.com"
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Recruiter Email / Contact</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder="elena.recruiting@apex-talent-global.com"
                    className="input-field pl-9 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={onboardLoading}
                className="w-full btn-primary py-2.5 text-sm mt-2"
              >
                {onboardLoading ? 'Verifying & Creating Profile...' : 'Submit to Dual-Database (`POST /api/company/verify`)'}
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

export default CompanySearch;
