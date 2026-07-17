import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Search, Lock, Database, Cpu, ArrowRight, CheckCircle2, AlertTriangle, Network } from 'lucide-react';

/**
 * Public Landing Page (`Home.jsx`) introducing HireGuard AI's explainable trust scoring architecture.
 */
const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Glowing Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-blue-600/15 blur-[140px] rounded-full pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-8 shadow-lg shadow-cyan-500/5 animate-pulse">
          <ShieldAlert className="h-4 w-4" />
          <span>Final-Year IEEE Research Project — Industry Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight">
          Explainable Graph-Based <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            Employer Trust Scoring
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Combat modern employment fraud and counterfeit job recruiters through dual-database persistence (`MongoDB` + `Neo4j`), explainable AI risk scoring, and real-time graph anomaly verification.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/search"
            className="w-full sm:w-auto btn-primary px-8 py-3.5 text-base font-semibold shadow-cyan-500/25"
          >
            <Search className="h-5 w-5 mr-1.5" />
            Search Verified Employers
          </Link>
          <Link
            to="/register"
            className="w-full sm:w-auto btn-secondary px-8 py-3.5 text-base font-semibold border-slate-700 hover:border-slate-600"
          >
            Create Job Seeker Account
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          <div className="glass-card p-6 border-slate-800/80">
            <div className="p-3 bg-cyan-500/10 rounded-xl w-fit text-cyan-400 border border-cyan-500/20 mb-4">
              <Database className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Dual-Graph Persistence</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Phase 1 & 2 architecture linking document profiles in MongoDB with high-speed graph relationships in Neo4j to expose recruiter networks.
            </p>
          </div>

          <div className="glass-card p-6 border-slate-800/80">
            <div className="p-3 bg-blue-500/10 rounded-xl w-fit text-blue-400 border border-blue-500/20 mb-4">
              <Cpu className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Explainable AI Scoring</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Never trust black-box numbers. Every employer risk classification comes with human-readable audit reasons and evidence chains.
            </p>
          </div>

          <div className="glass-card p-6 border-slate-800/80">
            <div className="p-3 bg-amber-500/10 rounded-xl w-fit text-amber-400 border border-amber-500/20 mb-4">
              <Network className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Scam Pattern Detection</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Community-driven reporting queue identifying advance-fee demands, counterfeit checks, and malicious phishing domains before damage occurs.
            </p>
          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-8 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-slate-400">HireGuard AI — IEEE Research Architecture (Phase 3 Frontend)</span>
          <span>Dual-Cluster Status: <strong className="text-emerald-400">Online (`27017` / `7687`)</strong></span>
        </div>
      </footer>

    </div>
  );
};

export default Home;
