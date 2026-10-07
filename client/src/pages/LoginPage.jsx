import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, User, LayoutDashboard } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = async (demoEmail, demoPassword, targetRole) => {
    setError('');
    setLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'staff') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed. Make sure DB is seeded.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data && data.user) {
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else if (data.user.role === 'staff') {
          navigate('/staff');
        } else {
          navigate('/customer');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-extrabold text-[#161f2e]">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to manage your digital tokens or operate counter desks</p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3.5 mb-6 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Logins */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider block text-center">
              ⚡ Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('customer@queueless.com', 'customer123', 'customer')}
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-extrabold text-xs py-2 px-2 rounded-lg transition-all text-center shadow-xs"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('staff@queueless.com', 'staff123', 'staff')}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-extrabold text-xs py-2 px-2 rounded-lg transition-all text-center shadow-xs"
              >
                Staff
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@queueless.com', 'admin123', 'admin')}
                className="bg-[#161f2e] hover:bg-slate-800 text-white font-extrabold text-xs py-2 px-2 rounded-lg transition-all text-center shadow-xs"
              >
                Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@queueless.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Sign In & Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-bold">
              New User Register
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
