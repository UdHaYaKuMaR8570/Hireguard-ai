import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Shield, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

/**
 * Login Page (`Login.jsx`) styled in the NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';
  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginUser({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Invalid email or password. Please verify your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#f2f2ef] flex items-center justify-center px-4 py-12">
      
      <div className="w-full max-w-md nexora-card p-8 bg-white border border-[#0d0d0d]">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-[#0d0d0d] text-white rounded-full mb-3 shadow-md">
            <Shield className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-heading font-black text-[#0d0d0d]">Sign In to HireGuard®</h2>
          <p className="text-xs text-[#666660] mt-1">
            Secure access to dual-database employer verification & trust scores
          </p>
        </div>

        {/* Expired / Error Alerts */}
        {isExpired && !error && (
          <div className="mb-6 p-3.5 bg-[#fef3c7] border border-[#d97706] rounded-xl flex items-center gap-2.5 text-xs text-[#92400e]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#d97706]" />
            Your session expired or authentication is required. Please sign in again.
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-[#ffe4e6] border border-[#e11d48] rounded-xl flex items-start gap-2.5 text-xs text-[#9f1239]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#e11d48] mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.j.seeker@email.com"
                className="input-nexora pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-nexora pl-11"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pill-black py-3 text-xs uppercase tracking-wider mt-2 shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In to Dashboard ↗
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#e0e0dc] text-center text-xs text-[#666660]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#0d0d0d] font-bold underline underline-offset-4 hover:opacity-70">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
