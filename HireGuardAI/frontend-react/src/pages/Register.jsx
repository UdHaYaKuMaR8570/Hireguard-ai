import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { User, Mail, Lock, UserPlus, AlertCircle, Briefcase } from 'lucide-react';

/**
 * Registration Page (`Register.jsx`) styled in the NEXORA® Ultra-Modern Halftone Minimalist Theme.
 */
const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JOB_SEEKER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerUser({ name, email, password, role });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your inputs and ensure the email is not already registered.';
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
            <UserPlus className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-heading font-black text-[#0d0d0d]">Create Your Account</h2>
          <p className="text-xs text-[#666660] mt-1">
            Join the defense against counterfeit employment scams
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-[#ffe4e6] border border-[#e11d48] rounded-xl flex items-start gap-2.5 text-xs text-[#9f1239]">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#e11d48] mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Jenkins"
                className="input-nexora pl-11"
              />
            </div>
          </div>

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
              Password (Min 8 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-[#888880]" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-nexora pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-heading font-bold text-[#0d0d0d] mb-1.5 uppercase tracking-wider">
              Account Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-3.5 h-4 w-4 text-[#888880] pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-nexora pl-11 appearance-none cursor-pointer bg-white"
              >
                <option value="JOB_SEEKER">Job Seeker / Applicant</option>
                <option value="EMPLOYER">Employer / Company Representative</option>
                <option value="ADMIN">Admin / Research Investigator</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-pill-black py-3 text-xs uppercase tracking-wider mt-3 shadow-md"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Registering...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Complete Registration ↗
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#e0e0dc] text-center text-xs text-[#666660]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0d0d0d] font-bold underline underline-offset-4 hover:opacity-70">
            Sign In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
