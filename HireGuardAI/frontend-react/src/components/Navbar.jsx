import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, Search, LayoutDashboard, FileWarning, LogOut, User, Lock } from 'lucide-react';

/**
 * Responsive Navigation Bar component with cybersecurity SaaS styling.
 * Adapts menu links dynamically based on user authentication status.
 */
const Navbar = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                HireGuard
              </span>
              <span className="text-xs font-semibold text-cyan-500 ml-1.5 px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800/50 rounded">
                AI
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
              <Search className="h-4 w-4 text-cyan-500" />
              Company Search
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-cyan-500" />
                  Dashboard
                </Link>
                <Link to="/report-scam" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
                  <FileWarning className="h-4 w-4 text-amber-500" />
                  Report Scam
                </Link>
                <Link to="/admin" className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors">
                  <Lock className="h-4 w-4 text-rose-500" />
                  Admin Queue
                </Link>
              </>
            )}
          </div>

          {/* Right Profile & Auth Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full">
                  <User className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-slate-200">{user?.name || user?.email}</span>
                  <span className="text-xs text-slate-500 uppercase px-1.5 py-0.5 bg-slate-800 rounded">
                    {user?.role || 'JOB_SEEKER'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm shadow-md"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
