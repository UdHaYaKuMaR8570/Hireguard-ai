import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ShieldAlert, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

/**
 * Login Page (`Login.jsx`) communicating with `POST /api/auth/login`.
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
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Background glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md glass-panel p-8 border-slate-800/80">
        
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/20 mb-3">
            <ShieldAlert className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-100">Sign In to HireGuard AI</h2>
          <p className="text-xs text-slate-400 mt-1">
            Secure access to dual-database employer verification & trust scores
          </p>
        </div>

        {/* Expired / Error Alerts */}
        {isExpired && !error && (
          <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2.5 text-xs text-amber-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            Your session expired or authentication is required. Please sign in again.
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.j.seeker@email.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-sm font-semibold shadow-cyan-500/20 mt-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
