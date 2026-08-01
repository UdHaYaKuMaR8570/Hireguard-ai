import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import companyService from '../services/companyService';
import CompanyCard from '../components/CompanyCard';
import useAuth from '../hooks/useAuth';
import { Search, Building2, PlusCircle, AlertCircle, CheckCircle2, Globe, Mail, Shield } from 'lucide-react';

/**
 * Company Search Page (`CompanySearch.jsx`) styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const CompanySearch = () => {
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Search Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-3xl sm:text-5xl font-heading font-black text-[#0d0d0d] mb-3">
          Search Employer Verification Database
        </h1>
        <p className="text-sm sm:text-base text-[#555550]">
          Query MongoDB (`GET /api/company/search`) for registered companies or onboard unverified recruiter domains instantly.
        </p>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#888880]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter company name (e.g., Apex Global Careers, Google, Microsoft...)"
              className="input-nexora pl-12 py-3.5 text-sm"
            />
          </div>
          <button type="submit" className="btn-pill-black py-3.5 px-7 shrink-0 text-xs uppercase tracking-wider">
            Search Database ↗
          </button>
        </form>
      </div>

      {/* Onboarding Success Banner */}
      {onboardSuccess && (
        <div className="mb-8 p-4 bg-[#ecfdf5] border border-[#10b981] rounded-2xl flex items-center justify-between text-sm text-[#047857]">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-[#10b981] shrink-0" />
            <span>{onboardSuccess}</span>
          </div>
          <button onClick={() => setOnboardSuccess(null)} className="text-xs underline text-[#047857]">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-8 p-4 bg-[#ffe4e6] border border-[#e11d48] rounded-2xl flex items-start gap-3 text-sm text-[#9f1239]">
          <AlertCircle className="h-5 w-5 text-[#e11d48] shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">API Connection Error:</strong>
            {error}
          </div>
        </div>
      )}

      {/* Results Grid / Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d0d0d] mb-4"></div>
          <p className="text-sm text-[#555550] font-heading font-medium">Scanning dual-database employer index...</p>
        </div>
      ) : companies.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6 text-sm text-[#555550]">
            <span>Found <strong className="text-[#0d0d0d] font-bold">{companies.length}</strong> employer profile(s)</span>
            <button
              onClick={() => {
                setShowOnboardForm(!showOnboardForm);
                if (!showOnboardForm && query) setOnboardName(query);
              }}
              className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#0d0d0d] hover:opacity-70 transition-opacity"
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
        <div className="nexora-card p-8 sm:p-12 text-center max-w-2xl mx-auto bg-white border border-[#0d0d0d]">
          <Building2 className="h-12 w-12 text-[#888880] mx-auto mb-4" />
          <h3 className="text-xl font-heading font-bold text-[#0d0d0d] mb-2">No Companies Matching "{query}"</h3>
          <p className="text-xs sm:text-sm text-[#555550] max-w-md mx-auto mb-6 leading-relaxed">
            This employer domain has not been indexed in our MongoDB collection yet. You can verify and onboard them immediately to generate a baseline trust score!
          </p>

          {!showOnboardForm ? (
            <button
              onClick={() => {
                setShowOnboardForm(true);
                if (query) setOnboardName(query);
              }}
              className="btn-pill-black mx-auto text-xs py-3 px-6"
            >
              <PlusCircle className="h-4 w-4" />
              Verify & Onboard Employer Now (`POST /api/company/verify`)
            </button>
          ) : null}
        </div>
      )}

      {/* Inline Onboarding Form */}
      {showOnboardForm && (
        <div className="mt-10 nexora-card p-6 sm:p-8 max-w-xl mx-auto bg-white border border-[#0d0d0d] relative">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#e0e0dc]">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#0d0d0d]" />
              <h3 className="text-base font-heading font-bold text-[#0d0d0d]">Onboard Employer Profile</h3>
            </div>
            <button
              onClick={() => setShowOnboardForm(false)}
              className="text-xs text-[#666660] hover:text-[#0d0d0d]"
            >
              Cancel
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="p-4 bg-[#fef3c7] border border-[#d97706] rounded-xl text-xs text-[#92400e] text-center">
              <p className="mb-3">
                <strong>Authentication Required:</strong> Phase 2 security rules strictly require a valid JWT Bearer token (`POST /api/company/verify`) to onboard new employers.
              </p>
              <Link to="/login" className="btn-pill-black py-1.5 px-4 text-xs inline-flex">
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left">
              {onboardError && (
                <div className="p-3 bg-[#ffe4e6] border border-[#e11d48] rounded-xl text-xs text-[#9f1239]">
                  {onboardError}
                </div>
              )}

              <div>
                <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1">Company Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-[#888880]" />
                  <input
                    type="text"
                    required
                    value={onboardName}
                    onChange={(e) => setOnboardName(e.target.value)}
                    placeholder="e.g., Apex Global Careers LLC"
                    className="input-nexora pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1">Official Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-3.5 h-4 w-4 text-[#888880]" />
                  <input
                    type="url"
                    required
                    value={onboardWebsite}
                    onChange={(e) => setOnboardWebsite(e.target.value)}
                    placeholder="https://apex-talent-global-careers.com"
                    className="input-nexora pl-10 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1">Recruiter Email / Contact</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#888880]" />
                  <input
                    type="email"
                    required
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    placeholder="elena.recruiting@apex-talent-global.com"
                    className="input-nexora pl-10 text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={onboardLoading}
                className="w-full btn-pill-black py-3 text-xs mt-2"
              >
                {onboardLoading ? 'Verifying & Creating Profile...' : 'Submit to Dual-Database (`POST /api/company/verify`) ↗'}
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};

export default CompanySearch;
