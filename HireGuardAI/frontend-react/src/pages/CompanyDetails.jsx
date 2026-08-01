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
 * Employer Analysis & Trust Report Page (`CompanyDetails.jsx`) styled in NEXORA® Ultra-Modern Halftone Minimalist Theme.
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
      const [companyData, trustData] = await Promise.all([
        companyService.getCompanyById(id),
        companyService.getCompanyTrustScore(id)
      ]);

      setCompany(companyData);
      setTrustSummary(trustData);

      if (isAuthenticated) {
        try {
          const complaintHistory = await companyService.getCompanyComplaints(id);
          setComplaints(complaintHistory || []);
        } catch (cplErr) {
          console.warn('Could not load complaints:', cplErr);
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
      <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0d0d0d] mb-4"></div>
        <p className="text-sm text-[#555550] font-heading font-medium">Aggregating employer profile, trust score, and complaint records...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] p-6 flex flex-col items-center justify-center text-center">
        <div className="nexora-card p-8 max-w-md w-full bg-white border border-[#0d0d0d]">
          <AlertCircle className="h-12 w-12 text-[#e11d48] mx-auto mb-4" />
          <h2 className="text-xl font-heading font-bold text-[#0d0d0d] mb-2">Employer Profile Not Found</h2>
          <p className="text-xs text-[#9f1239] mb-6 leading-relaxed">{error || 'This employer document does not exist in the database.'}</p>
          <Link to="/search" className="btn-pill-black text-xs mx-auto w-fit">
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
    <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e0e0dc]">
        <div>
          <Link to="/search" className="inline-flex items-center text-xs font-heading font-bold text-[#555550] hover:text-[#0d0d0d] mb-3 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Search Directory
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl border border-[#0d0d0d] text-[#0d0d0d]">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-heading font-black text-[#0d0d0d]">{name}</h1>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm text-[#555550] hover:text-[#0d0d0d] flex items-center gap-1.5 mt-0.5 font-mono"
              >
                <Globe className="h-3.5 w-3.5" />
                {website}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <RiskBadge riskLevel={riskLevel} className="px-4 py-2 text-xs" />
          <Link
            to={`/report-scam?companyId=${id}&companyName=${encodeURIComponent(name)}`}
            className="btn-pill-black text-xs py-2.5 px-5"
          >
            <FileWarning className="h-4 w-4 mr-1.5" />
            Report Scam Incident ↗
          </Link>
        </div>
      </div>

      {/* Metadata Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="nexora-card p-4 bg-white border border-[#0d0d0d]">
          <span className="text-xs text-[#777770] font-heading font-bold block mb-1">Registration Status</span>
          <div className="flex items-center gap-2 font-heading font-bold text-[#0d0d0d] text-sm">
            {registrationStatus === 'VERIFIED' ? (
              <CheckCircle className="h-4 w-4 text-[#10b981]" />
            ) : (
              <Clock className="h-4 w-4 text-[#d97706]" />
            )}
            {registrationStatus}
          </div>
        </div>

        <div className="nexora-card p-4 bg-white border border-[#0d0d0d]">
          <span className="text-xs text-[#777770] font-heading font-bold block mb-1">Country / Jurisdiction</span>
          <div className="flex items-center gap-2 font-heading font-bold text-[#0d0d0d] text-sm">
            <MapPin className="h-4 w-4 text-[#0d0d0d]" />
            {countryOfRegistration}
          </div>
        </div>

        <div className="nexora-card p-4 bg-white border border-[#0d0d0d]">
          <span className="text-xs text-[#777770] font-heading font-bold block mb-1">Domain Age Index</span>
          <div className="font-heading font-bold text-[#0d0d0d] text-sm">
            {domainAge} Days
          </div>
        </div>

        <div className="nexora-card p-4 bg-white border border-[#0d0d0d]">
          <span className="text-xs text-[#777770] font-heading font-bold block mb-1">Document ID</span>
          <code className="text-xs font-mono text-[#0d0d0d] font-bold truncate block">
            {id}
          </code>
        </div>
      </div>

      {/* Section 1: Trust Score & Explainability Report */}
      <section>
        <TrustScoreCard trustSummary={trustSummary || company.trustSummary} />
      </section>

      {/* Section 2: Phase 5 Graph Visualization */}
      <section>
        <GraphVisualization companyId={id} />
      </section>

      {/* Section 3: Complaint History Queue */}
      <section className="nexora-card p-6 sm:p-8 bg-white border border-[#0d0d0d]">
        <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e0e0dc]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#ffe4e6] rounded-xl text-[#e11d48] border border-[#e11d48]">
              <MessageSquareWarning className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-bold text-[#0d0d0d]">
                Submitted Scam Complaints & Evidence History
              </h3>
              <p className="text-xs text-[#555550]">
                Reports filed by verified job seekers against this employer (`GET /api/company/{id}/complaints`).
              </p>
            </div>
          </div>

          <span className="text-xs font-heading font-bold px-3.5 py-1 bg-[#f2f2ef] border border-[#0d0d0d] rounded-full text-[#0d0d0d]">
            {complaints.length} Report(s) on File
          </span>
        </div>

        {!isAuthenticated ? (
          <div className="p-6 bg-[#f2f2ef] border border-[#0d0d0d] rounded-2xl text-center text-sm text-[#555550]">
            <ShieldAlert className="h-8 w-8 mx-auto mb-2 text-[#d97706]" />
            <p className="mb-3">
              <strong>Protected Access:</strong> You must be signed in with a valid JWT token to view detailed complaint logs and evidence attachments.
            </p>
            <Link to="/login" className="btn-pill-black py-2 px-5 text-xs inline-flex mx-auto">
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
          <div className="p-8 bg-[#f2f2ef] rounded-2xl border border-[#d4d4cf] text-center text-sm text-[#777770]">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-[#10b981]" />
            No active scam reports or counterfeit check complaints have been filed against this employer domain.
          </div>
        )}
      </section>

    </div>
  );
};

export default CompanyDetails;
