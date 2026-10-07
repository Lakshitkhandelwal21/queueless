import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { X, User, Mail, Lock, Shield, LayoutDashboard, UserCheck } from 'lucide-react';

const AuthModal = ({ isOpen, onClose, initialTab = 'login', onSuccess }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDemoLogin = async (demoEmail, demoPassword, targetRole) => {
    setError('');
    setLoading(true);
    try {
      const data = await login(demoEmail, demoPassword);
      onClose();
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
      let data;
      if (activeTab === 'login') {
        data = await login(email, password);
      } else {
        data = await register({ name, email, phone, password, role });
      }

      onClose();
      if (onSuccess) onSuccess();

      if (data && data.user) {
        if (data.user.role === 'admin') navigate('/admin');
        else if (data.user.role === 'staff') navigate('/staff');
        else navigate('/customer');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 font-sans">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 text-slate-900 animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header Navigation */}
        <div className="flex border-b border-slate-200 mt-6 px-8">
          <button
            onClick={() => { setActiveTab('login'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 text-center ${
              activeTab === 'login'
                ? 'border-[#161f2e] text-[#161f2e]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 text-center ${
              activeTab === 'register'
                ? 'border-[#161f2e] text-[#161f2e]'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            New User Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl p-3 font-medium text-center">
              {error}
            </div>
          )}

          {/* Quick Demo Login Buttons */}
          {activeTab === 'login' && (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block text-center">
                ⚡ Quick 1-Click Demo Logins
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('customer@queueless.com', 'customer123', 'customer')}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-extrabold text-[10px] py-1.5 px-2 rounded-lg transition-all text-center"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('staff@queueless.com', 'staff123', 'staff')}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-300 font-extrabold text-[10px] py-1.5 px-2 rounded-lg transition-all text-center"
                >
                  Staff
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@queueless.com', 'admin123', 'admin')}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] py-1.5 px-2 rounded-lg transition-all text-center"
                >
                  Admin
                </button>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lakshit Khandelwal"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] focus:bg-white transition-all font-medium"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. customer@queueless.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] focus:bg-white transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] focus:bg-white transition-all font-medium"
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Account Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#161f2e] font-medium"
              >
                <option value="customer">Customer / Patient</option>
                <option value="staff">Staff Operator</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : activeTab === 'login' ? (
              'Sign In & Continue'
            ) : (
              'Register & Search'
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AuthModal;
