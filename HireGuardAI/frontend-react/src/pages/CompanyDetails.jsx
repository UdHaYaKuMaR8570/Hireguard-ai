import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import companyService from '../services/companyService';
import TrustScoreCard from '../components/TrustScoreCard';
import RiskBadge from '../components/RiskBadge';
import ComplaintCard from '../components/ComplaintCard';
import GraphVisualization from '../components/GraphVisualization';
import useAuth from '../hooks/useAuth';
import { Building2, Globe, MapPin, CheckCircle, Clock, ShieldAlert, FileWarning, ArrowLeft, AlertCircle, MessageSquareWarning } from 'lucide-react';

/**
 * Employer Analysis & Trust Report Page (`CompanyDetails.jsx`).
 * Aggregates Phase 2 `GET /api/company/{id}`, `GET /api/company/{id}/trust-score`,
 * and `GET /api/company/{id}/complaints` with embedded Neo4j Graph topology placeholder.
 */
const CompanyDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [company, setCompany] = useState(null);
  const [trustSummary, setTrustSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFullAnalysis = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);

    try {
      // Parallel fetch of company details and trust score report
      const [companyData, trustData] = await Promise.all([
        companyService.getCompanyById(id),
        companyService.getCompanyTrustScore(id)
      ]);

      setCompany(companyData);
      setTrustSummary(trustData);

      // If user is authenticated, attempt to fetch Phase 2 complaint history queue
      if (isAuthenticated) {
        try {
          const complaintHistory = await companyService.getCompanyComplaints(id);
          setComplaints(complaintHistory || []);
        } catch (cplErr) {
          console.warn('Could not load complaints (requires authentication or empty queue):', cplErr);
          setComplaints([]);
        }
      }
    } catch (err) {
      console.error('Analysis fetch error:', err);
      setError(err.response?.data?.message || `Failed to fetch analysis profile for ID "${id}". Verify the company exists in your MongoDB database.`);
    } finally {
      setLoading(false);
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    fetchFullAnalysis();
  }, [fetchFullAnalysis]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-sm text-slate-400 font-medium">Aggregating employer profile, trust score, and complaint records...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-950 p-6 flex flex-col items-center justify-center text-center">
        <div className="glass-panel p-8 max-w-md w-full border-rose-500/30">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">Employer Profile Not Found</h2>
          <p className="text-xs text-rose-300 mb-6 leading-relaxed">{error || 'This employer document does not exist in the database.'}</p>
          <Link to="/search" className="btn-secondary text-xs mx-auto w-fit">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Return to Company Search
          </Link>
        </div>
      </div>
    );
  }

  const { name, website, countryOfRegistration = 'Unknown', registrationStatus = 'UNVERIFIED', domainAge = 'N/A' } = company;
  const riskLevel = trustSummary?.riskLevel || company?.trustSummary?.riskLevel || 'UNASSIGNED';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <Link to="/search" className="inline-flex items-center text-xs text-slate-400 hover:text-cyan-400 mb-3 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Search Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-cyan-400">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{name}</h1>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 mt-0.5"
              >
                <Globe className="h-3.5 w-3.5" />
                {website}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <RiskBadge riskLevel={riskLevel} className="px-4 py-2 text-sm" />
          <Link
            to={`/report-scam?companyId=${id}&companyName=${encodeURIComponent(name)}`}
            className="btn-primary text-xs py-2 px-4 bg-gradient-to-r from-amber-500 to-rose-600 shadow-amber-500/20"
          >
            <FileWarning className="h-4 w-4 mr-1.5" />
            Report Scam Incident
          </Link>
        </div>
      </div>

      {/* Metadata Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-slate-800/80">
          <span className="text-xs text-slate-500 block mb-1">Registration Status</span>
          <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
            {registrationStatus === 'VERIFIED' ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <Clock className="h-4 w-4 text-amber-400" />
            )}
            {registrationStatus}
          </div>
        </div>

        <div className="glass-card p-4 border-slate-800/80">
          <span className="text-xs text-slate-500 block mb-1">Country / Jurisdiction</span>
          <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
            <MapPin className="h-4 w-4 text-cyan-400" />
            {countryOfRegistration}
          </div>
        </div>

        <div className="glass-card p-4 border-slate-800/80">
          <span className="text-xs text-slate-500 block mb-1">Domain Age Index</span>
          <div className="font-bold text-slate-200 text-sm">
            {domainAge} Days
          </div>
        </div>

        <div className="glass-card p-4 border-slate-800/80">
          <span className="text-xs text-slate-500 block mb-1">Document ID</span>
          <code className="text-xs font-mono text-cyan-400 font-bold truncate block">
            {id}
          </code>
        </div>
      </div>

      {/* Section 1: Phase 2 Trust Score & Explainability Report (`TrustScoreCard.jsx`) */}
      <section>
        <TrustScoreCard trustSummary={trustSummary || company.trustSummary} />
      </section>

      {/* Section 2: Phase 3 Graph Visualization Placeholder (`GraphVisualization.jsx`) */}
      <section>
        <GraphVisualization companyId={id} />
      </section>

      {/* Section 3: Complaint History Queue (`GET /api/company/{id}/complaints`) */}
      <section className="glass-panel p-6 sm:p-8 border-slate-800/80">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/30">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Submitted Scam Complaints & Evidence History
              </h3>
              <p className="text-xs text-slate-400">
                Reports filed by verified job seekers against this employer (`GET /api/company/{id}/complaints`).
              </p>
            </div>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-slate-300">
            {complaints.length} Report(s) on File
          </span>
        </div>

        {!isAuthenticated ? (
          <div className="p-6 bg-slate-950/80 border border-slate-800 rounded-xl text-center text-sm text-slate-400">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-amber-400" />
            <p className="mb-3">
              <strong>Protected Access:</strong> You must be signed in with a valid JWT token to view detailed complaint logs and evidence attachments.
            </p>
            <Link to="/login" className="btn-secondary py-1.5 px-4 text-xs inline-flex mx-auto">
              Sign In to View Reports
            </Link>
          </div>
        ) : complaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((cpl) => (
              <ComplaintCard key={cpl.id} complaint={cpl} />
            ))}
          </div>
        ) : (
          <div className="p-8 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center text-sm text-slate-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-400 opacity-80" />
            No active scam reports or counterfeit check complaints have been filed against this employer domain.
          </div>
        )}
      </section>

    </div>
  );
};

export default CompanyDetails;
