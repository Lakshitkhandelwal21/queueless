import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { LogOut, User, LayoutDashboard, Monitor, Shield, ArrowUpRight, QrCode } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-[#e2e8f0] text-slate-900 border-b border-slate-300 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Geometric Logo (Refined Adexis Style) */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-slate-950 flex items-center justify-center rounded-sm">
              <span className="font-mono text-lg font-black text-[#22c55e] tracking-tighter">Q</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-950 font-sans">
              QueueLess
            </span>
          </Link>

          {/* Centered Menu Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-800">
            <a href="#services" className="hover:text-slate-950 transition-colors">Services</a>
            <a href="#features" className="hover:text-slate-950 transition-colors">How It Works</a>
            <Link to="/kiosk" className="hover:text-slate-950 transition-colors">Kiosk Mode</Link>
            <Link to="/tv" target="_blank" className="hover:text-slate-950 transition-colors flex items-center gap-1">
              <span>Public TV</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </Link>
          </div>

          {/* Actions & Role CTA */}
          <div className="flex items-center gap-3">
            {/* Live Socket Status Dot */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-300/80 px-2.5 py-1 rounded">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-600 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{connected ? 'Live Sync' : 'Offline'}</span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {user?.role === 'customer' && (
                  <Link
                    to="/customer"
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs px-4 py-2 rounded transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Ticket</span>
                  </Link>
                )}

                {user?.role === 'staff' && (
                  <Link
                    to="/staff"
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs px-4 py-2 rounded transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Counter Desk</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs px-4 py-2 rounded transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-700 hover:text-rose-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-800 hover:text-slate-950 px-3 py-2 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs px-5 py-2.5 rounded transition-all shadow-sm"
                >
                  Contact / Get Started
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
