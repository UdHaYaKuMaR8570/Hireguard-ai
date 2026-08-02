import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import adminService from '../services/adminService';
import companyService from '../services/companyService';
import CompanyCard from '../components/CompanyCard';
import {
  Lock, ShieldAlert, CheckCircle, RefreshCw, AlertCircle,
  Database, Layers, FileWarning, BarChart3, Users, TrendingDown,
  ExternalLink, Clock, CircleDot
} from 'lucide-react';

/**
 * Admin Verification & Audit Dashboard (AdminDashboard.jsx)
 *
 * Fully functional admin panel backed by real Phase 2 + 5 backend endpoints:
 *   GET /api/admin/stats       — Platform statistics (ADMIN role)
 *   GET /api/admin/companies   — All employer documents (ADMIN role)
 *   GET /api/admin/complaints  — All complaint reports (ADMIN role)
 *
 * Falls back to public GET /api/company/search if the user is not yet ADMIN role.
 */
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('companies');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdminRole, setIsAdminRole] = useState(true);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try admin endpoints first (requires ADMIN role JWT)
      const [statsData, companiesData, complaintsData] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getAllCompanies(),
        adminService.getAllComplaints(),
      ]);

      setStats(statsData);
      setCompanies(companiesData || []);
      setComplaints(complaintsData || []);
      setIsAdminRole(true);
    } catch (adminErr) {
      // Fallback for non-ADMIN users — use the public company search endpoint
      console.warn('[AdminDashboard] Admin endpoints not accessible (likely non-ADMIN role). Falling back to public search.');
      setIsAdminRole(false);
      try {
        const publicCompanies = await companyService.searchCompanies('');
        setCompanies(publicCompanies || []);
        // Build stats from public data
        setStats({
          totalCompanies: publicCompanies?.length || 0,
          totalComplaints: '—',
          verifiedCompanies: publicCompanies?.filter(c => c.registrationStatus === 'VERIFIED').length || 0,
          pendingCompanies: publicCompanies?.filter(c => c.registrationStatus === 'PENDING').length || 0,
          suspiciousCompanies: publicCompanies?.filter(c => c.registrationStatus === 'SUSPICIOUS').length || 0,
          openComplaints: '—',
          totalTrustReports: '—',
        });
        setComplaints([]);
      } catch (fallbackErr) {
        console.error('[AdminDashboard] Fallback also failed:', fallbackErr);
        setError('Could not retrieve data from backend. Ensure the Spring Boot service is running on port 8080.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const StatCard = ({ icon: Icon, label, value, iconColor, bgColor }) => (
    <div className="nexora-card p-5 bg-white border border-[#0d0d0d] flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${bgColor} shrink-0`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div>
        <span className="text-xs text-[#777770] font-heading font-bold uppercase tracking-wider block mb-0.5">{label}</span>
        <div className="text-2xl font-heading font-black text-[#0d0d0d]">{value ?? '—'}</div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#f2f2ef]">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-[#e0e0dc]">
          <div>
            <div className="flex items-center gap-2 text-[#0d0d0d] text-xs font-heading font-bold uppercase tracking-wider mb-1">
              <Lock className="h-4 w-4" />
              {isAdminRole ? 'Admin Audit Level — Full Access' : 'Standard Access — Limited View'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#0d0d0d]">
              Admin Verification &amp; Scam Audit Queue
            </h1>
            <p className="text-xs sm:text-sm text-[#555550] mt-1">
              {isAdminRole
                ? 'Full platform audit across MongoDB collections (companies, complaints, trust_reports).'
                : 'Showing public company index. Upgrade to ADMIN role for full audit access.'}
            </p>
          </div>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="btn-pill-black py-2.5 px-5 text-xs shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Queue
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-[#ffe4e6] border border-[#e11d48] rounded-2xl flex items-center gap-3 text-sm text-[#9f1239]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Strip */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Database}
              label="Total Companies"
              value={stats.totalCompanies}
              iconColor="text-[#0d0d0d]"
              bgColor="bg-[#f2f2ef]"
            />
            <StatCard
              icon={CheckCircle}
              label="Verified"
              value={stats.verifiedCompanies}
              iconColor="text-[#10b981]"
              bgColor="bg-[#ecfdf5]"
            />
            <StatCard
              icon={Layers}
              label="Pending / Unverified"
              value={stats.pendingCompanies}
              iconColor="text-[#d97706]"
              bgColor="bg-[#fef3c7]"
            />
            <StatCard
              icon={TrendingDown}
              label="Suspicious / Rejected"
              value={stats.suspiciousCompanies}
              iconColor="text-[#e11d48]"
              bgColor="bg-[#ffe4e6]"
            />
            <StatCard
              icon={FileWarning}
              label="Total Complaints"
              value={stats.totalComplaints}
              iconColor="text-[#0d0d0d]"
              bgColor="bg-[#f2f2ef]"
            />
            <StatCard
              icon={CircleDot}
              label="Open Complaints"
              value={stats.openComplaints}
              iconColor="text-[#e11d48]"
              bgColor="bg-[#ffe4e6]"
            />
            <StatCard
              icon={BarChart3}
              label="Trust Reports Generated"
              value={stats.totalTrustReports}
              iconColor="text-[#0d0d0d]"
              bgColor="bg-[#f2f2ef]"
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#e8e8e4] p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-5 py-2 text-xs font-heading font-bold rounded-lg transition-all ${
              activeTab === 'companies'
                ? 'bg-white text-[#0d0d0d] shadow-sm'
                : 'text-[#777770] hover:text-[#0d0d0d]'
            }`}
          >
            <Database className="h-3.5 w-3.5 inline mr-1.5" />
            Companies ({companies.length})
          </button>
          {isAdminRole && (
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-5 py-2 text-xs font-heading font-bold rounded-lg transition-all ${
                activeTab === 'complaints'
                  ? 'bg-white text-[#0d0d0d] shadow-sm'
                  : 'text-[#777770] hover:text-[#0d0d0d]'
              }`}
            >
              <FileWarning className="h-3.5 w-3.5 inline mr-1.5" />
              Complaints ({complaints.length})
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0d0d0d] mb-3" />
            <p className="text-xs text-[#555550] font-heading font-medium">
              Querying MongoDB collections via Phase 2 backend...
            </p>
          </div>
        ) : activeTab === 'companies' ? (
          companies.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="nexora-card p-12 text-center max-w-xl mx-auto bg-white border border-[#0d0d0d]">
              <ShieldAlert className="h-12 w-12 text-[#888880] mx-auto mb-3" />
              <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1">
                No Employer Documents in Queue
              </h3>
              <p className="text-xs text-[#555550]">
                The MongoDB `companies` collection is empty. Onboard a company via Company Search to populate this table.
              </p>
            </div>
          )
        ) : (
          /* Complaints Tab */
          complaints.length > 0 ? (
            <div className="space-y-3">
              {complaints.map((cpl) => (
                <div key={cpl.id} className="nexora-card p-5 bg-white border border-[#0d0d0d] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-heading font-bold px-2.5 py-0.5 rounded-full border ${
                        cpl.status === 'OPEN'
                          ? 'bg-[#ffe4e6] text-[#e11d48] border-[#e11d48]'
                          : 'bg-[#ecfdf5] text-[#10b981] border-[#10b981]'
                      }`}>
                        {cpl.status}
                      </span>
                      <span className="text-xs font-mono text-[#888880]">{cpl.id}</span>
                    </div>
                    <p className="text-sm font-heading font-bold text-[#0d0d0d] mb-0.5">
                      {cpl.reason} — Company: <code className="font-mono text-xs text-[#555550]">{cpl.companyId}</code>
                    </p>
                    <p className="text-xs text-[#555550] line-clamp-2">{cpl.description}</p>
                    {cpl.proof && cpl.proof !== 'No external proof link provided.' && (
                      <a href={cpl.proof} target="_blank" rel="noopener noreferrer"
                         className="text-xs text-[#0d0d0d] underline underline-offset-2 flex items-center gap-1 mt-1 w-fit">
                        <ExternalLink className="h-3 w-3" />
                        Evidence Link
                      </a>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-xs text-[#888880]">
                      <Clock className="h-3 w-3" />
                      {cpl.createdAt ? new Date(cpl.createdAt).toLocaleString() : 'Unknown date'}
                    </div>
                  </div>
                  <Link
                    to={`/company/${cpl.companyId}`}
                    className="btn-pill-black text-xs py-2 px-4 shrink-0 self-start"
                  >
                    View Profile ↗
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="nexora-card p-12 text-center max-w-xl mx-auto bg-white border border-[#0d0d0d]">
              <CheckCircle className="h-12 w-12 text-[#10b981] mx-auto mb-3" />
              <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1">
                No Complaints on File
              </h3>
              <p className="text-xs text-[#555550]">
                The MongoDB `complaints` collection is empty. No scam reports have been filed yet.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
