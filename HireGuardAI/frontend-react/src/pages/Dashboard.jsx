import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { ShieldCheck, Search, FileWarning, ArrowRight, CheckCircle2, User, Lock, Activity, Database } from 'lucide-react';

/**
 * Logged-In User Dashboard (`Dashboard.jsx`) providing an overview of recent actions,
 * session security profile, and quick navigation shortcuts to Phase 2 endpoints.
 */
const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-6xl mx-auto overflow-y-auto">
        
        {/* Welcome Banner */}
        <div className="glass-panel p-6 sm:p-8 mb-8 border-slate-800/80 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" />
                Dual-Database Protected Session
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
                Welcome back, {user?.name || 'Authorized Investigator'}!
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Your account (`{user?.email}`) is active with role <strong className="text-cyan-400">{user?.role || 'JOB_SEEKER'}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
              <span className="text-xs font-semibold text-slate-300">Phase 2 Backend Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Action Grid */}
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-cyan-400" />
          Investigative Shortcuts & Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          <Link
            to="/search"
            className="glass-card p-6 border-slate-800/80 hover:border-cyan-500/50 flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-cyan-500/10 rounded-xl w-fit text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
                Search & Onboard Employers
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Query verified companies from MongoDB or verify/onboard a new recruiter domain immediately (`POST /api/company/verify`).
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-cyan-400">
              Open Search Engine
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/report-scam"
            className="glass-card p-6 border-slate-800/80 hover:border-amber-500/50 flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-amber-500/10 rounded-xl w-fit text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <FileWarning className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-amber-400 transition-colors">
                Report Scam Incident
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Submit fraud evidence (`POST /api/complaints`) against suspicious job posts, advance fee demands, or counterfeit check scams.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-amber-400">
              Submit Evidence Report
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin"
            className="glass-card p-6 border-slate-800/80 hover:border-rose-500/50 flex flex-col justify-between group"
          >
            <div>
              <div className="p-3 bg-rose-500/10 rounded-xl w-fit text-rose-400 mb-4 group-hover:scale-110 transition-transform">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-100 mb-1 group-hover:text-rose-400 transition-colors">
                Admin Verification Queue
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect registered employers and audit submitted scam reports using Phase 2 query endpoints without modifying backend logic.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-semibold text-rose-400">
              Inspect Audit Queue
              <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Dual-Database Architecture Status Panel */}
        <div className="glass-panel p-6 border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold text-slate-200">
            <Database className="h-4 w-4 text-cyan-400" />
            System Architecture Status Overview
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400">
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">Phase 1 & 2 Dual-Database Persistence:</span>
              MongoDB (`hireguard` @ port `27017`) stores structured profiles & scam reports. Neo4j (`hireguard-graph` @ port `7687`) stores graph nodes (`CompanyNode`, `RecruiterNode`, `JobPostNode`).
            </div>
            <div className="bg-slate-950/60 p-3.5 rounded-lg border border-slate-800">
              <span className="font-bold text-slate-200 block mb-1">JWT Security Filter Chain:</span>
              Stateless Bearer token filtering (`JwtFilter`) actively protects all sensitive routes (`/api/complaints`, `/api/company/verify`, `/api/auth/me`).
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
