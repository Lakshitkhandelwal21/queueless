import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Clock,
  History,
  Bell,
  User,
  Shield,
  Layers,
  Monitor,
  QrCode,
  LogOut,
  SlidersHorizontal,
  BarChart3,
  CheckCircle2,
  Users,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen font-sans">
      <div>
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#22c55e] flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-emerald-500/20">
            Q
          </div>
          <div>
            <h1 className="font-extrabold text-xl text-white tracking-tight leading-none">
              QueueLess
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 block">
              Virtual Queuing
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="p-4 space-y-6">
          
          {/* Customer Navigation */}
          {(!user || user.role === 'customer') && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2 block">
                Customer Menu
              </span>
              <nav className="space-y-1">
                <Link
                  to="/customer"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/customer')
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/')
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Find Queue</span>
                </Link>

                <Link
                  to="/customer"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/customer') && location.hash === '#history'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Queue History</span>
                </Link>

                <Link
                  to="/customer"
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-4 h-4" />
                    <span>Notifications</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                    New
                  </span>
                </Link>
              </nav>
            </div>
          )}

          {/* Staff Navigation */}
          {user?.role === 'staff' && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2 block">
                Staff Counter Menu
              </span>
              <nav className="space-y-1">
                <Link
                  to="/staff"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/staff')
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Staff Dashboard</span>
                </Link>

                <Link
                  to="/staff"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Queue Control</span>
                </Link>
              </nav>
            </div>
          )}

          {/* Admin Navigation */}
          {user?.role === 'admin' && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2 block">
                Admin Command Menu
              </span>
              <nav className="space-y-1">
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive('/admin')
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>

                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics & Services</span>
                </Link>
              </nav>
            </div>
          )}

          {/* Fast Access Section */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2 block">
              Fast Access & TV
            </span>
            <nav className="space-y-1">
              <Link
                to="/kiosk"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>On-Site Kiosk</span>
              </Link>

              <Link
                to="/tv"
                target="_blank"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <Monitor className="w-4 h-4 text-cyan-400" />
                <span>Public TV Display</span>
              </Link>
            </nav>
          </div>

        </div>
      </div>

      {/* Sidebar Footer User Info */}
      <div className="p-4 border-t border-slate-800">
        {isAuthenticated ? (
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-emerald-400 capitalize font-medium">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <User className="w-4 h-4" />
            <span>Sign In Account</span>
          </Link>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
