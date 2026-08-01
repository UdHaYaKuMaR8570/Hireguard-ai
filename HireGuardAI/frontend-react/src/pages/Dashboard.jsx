import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { ShieldCheck, Search, FileWarning, ArrowRight, Lock, Activity, Database, ArrowUpRight } from 'lucide-react';

/**
 * Logged-In User Dashboard (`Dashboard.jsx`) styled in the NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#f2f2ef]">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto overflow-y-auto">
        
        {/* Welcome Banner */}
        <div className="nexora-panel p-6 sm:p-8 mb-8 bg-white border border-[#0d0d0d]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#0d0d0d] text-xs font-heading font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4 text-[#0d0d0d]" />
                Dual-Database Protected Session
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-[#0d0d0d]">
                Welcome back, {user?.name || 'Authorized Investigator'}!
              </h1>
              <p className="text-sm text-[#555550] mt-1">
                Your account (`{user?.email}`) is active with role <strong className="text-[#0d0d0d] font-bold">{user?.role || 'JOB_SEEKER'}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#f2f2ef] px-4 py-2 rounded-full border border-[#0d0d0d] shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-xs font-heading font-bold text-[#0d0d0d]">Backend Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <h2 className="text-lg font-heading font-bold text-[#0d0d0d] mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#0d0d0d]" />
          Investigative Shortcuts & Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <Link
            to="/search"
            className="nexora-card p-6 bg-white border border-[#0d0d0d] flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-[#0d0d0d] text-white rounded-full w-fit mb-4">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1 group-hover:opacity-70 transition-opacity">
                Search & Onboard Employers
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Query verified companies from MongoDB or verify/onboard a new recruiter domain immediately (`POST /api/company/verify`).
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-heading font-bold text-[#0d0d0d]">
              Open Search Engine
              <ArrowUpRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/report-scam"
            className="nexora-card p-6 bg-white border border-[#0d0d0d] flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-[#0d0d0d] text-white rounded-full w-fit mb-4">
                <FileWarning className="h-5 w-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1 group-hover:opacity-70 transition-opacity">
                Report Scam Incident
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Submit fraud evidence (`POST /api/complaints`) against suspicious job posts, advance fee demands, or counterfeit check scams.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-heading font-bold text-[#0d0d0d]">
              Submit Evidence Report
              <ArrowUpRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin"
            className="nexora-card p-6 bg-white border border-[#0d0d0d] flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-[#0d0d0d] text-white rounded-full w-fit mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-heading font-bold text-[#0d0d0d] mb-1 group-hover:opacity-70 transition-opacity">
                Admin Verification Queue
              </h3>
              <p className="text-xs text-[#555550] leading-relaxed">
                Inspect registered employers and audit submitted scam reports using Phase 2 query endpoints without modifying backend logic.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-heading font-bold text-[#0d0d0d]">
              Inspect Audit Queue
              <ArrowUpRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Architecture Status Panel */}
        <div className="nexora-card p-6 bg-white border border-[#0d0d0d]">
          <div className="flex items-center gap-2 mb-3 text-sm font-heading font-bold text-[#0d0d0d]">
            <Database className="h-4 w-4 text-[#0d0d0d]" />
            System Architecture Status Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#555550]">
            <div className="bg-[#f2f2ef] p-4 rounded-xl border border-[#d4d4cf]">
              <span className="font-bold text-[#0d0d0d] block mb-1">Dual-Database Persistence:</span>
              MongoDB (`hireguard` @ port `27017`) stores structured profiles & scam reports. Neo4j (`hireguard-graph` @ port `7687`) stores graph nodes (`CompanyNode`, `RecruiterNode`, `JobPostNode`).
            </div>
            <div className="bg-[#f2f2ef] p-4 rounded-xl border border-[#d4d4cf]">
              <span className="font-bold text-[#0d0d0d] block mb-1">JWT Security Filter Chain:</span>
              Stateless Bearer token filtering (`JwtFilter`) actively protects all sensitive routes (`/api/complaints`, `/api/company/verify`, `/api/auth/me`).
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
