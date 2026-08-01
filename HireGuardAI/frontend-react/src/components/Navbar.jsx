import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Search, LayoutDashboard, FileWarning, LogOut, User, Lock, ArrowUpRight } from 'lucide-react';

/**
 * Responsive Navigation Bar styled in the NEXORA® Ultra-Modern Halftone Minimalist Aesthetic.
 */
const Navbar = () => {
  const { isAuthenticated, user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#f2f2ef]/90 backdrop-blur-md border-b border-[#e0e0dc] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo matching NEXORA® */}
          <Link to="/" className="flex items-center gap-1 group">
            <span className="text-2xl font-heading font-black tracking-tight text-[#0d0d0d] group-hover:opacity-80 transition-opacity uppercase">
              HIREGUARD®
            </span>
          </Link>

          {/* Minimalist Center Links */}
          <div className="hidden md:flex items-center gap-8 font-heading text-sm font-semibold tracking-tight text-[#0d0d0d]">
            <Link to="/search" className="hover:opacity-60 transition-opacity">
              Insights
            </Link>
            <Link to="/search" className="hover:opacity-60 transition-opacity">
              Solutions
            </Link>
            <Link to="/search" className="hover:opacity-60 transition-opacity">
              Pricing
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="hover:opacity-60 transition-opacity">
                  Dashboard
                </Link>
                <Link to="/report-scam" className="hover:opacity-60 transition-opacity">
                  Report Scam
                </Link>
                <Link to="/admin" className="hover:opacity-60 transition-opacity">
                  Admin Queue
                </Link>
              </>
            )}
          </div>

          {/* Right Auth Actions (Pill Buttons) */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-[#ffffff] border border-[#0d0d0d] rounded-full text-xs font-semibold text-[#0d0d0d]">
                  <User className="h-3.5 w-3.5" />
                  <span>{user?.name || user?.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#0d0d0d] hover:opacity-60 transition-opacity"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-heading font-semibold text-[#0d0d0d] hover:opacity-60 transition-opacity px-2 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-pill-black text-xs px-5 py-2.5"
                >
                  Try Now
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
