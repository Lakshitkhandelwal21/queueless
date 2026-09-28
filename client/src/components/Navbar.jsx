import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { LogOut, User, LayoutDashboard, Monitor, QrCode, Shield, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { connected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-400">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>Queue<span className="text-white">Less</span></span>
          </Link>

          {/* Connection Status Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
            <span className="text-slate-300">{connected ? 'Live Sync' : 'Disconnected'}</span>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {user?.role === 'customer' && (
                  <Link to="/customer" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-400 transition-colors">
                    <User className="w-4 h-4" />
                    <span>My Ticket</span>
                  </Link>
                )}

                {user?.role === 'staff' && (
                  <Link to="/staff" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-400 transition-colors">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Staff Counter</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link to="/admin" className="flex items-center gap-1 text-sm font-medium hover:text-indigo-400 transition-colors">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link to="/tv" target="_blank" className="hidden md:flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors">
                  <Monitor className="w-4 h-4" />
                  <span>TV Display</span>
                </Link>

                <div className="h-4 w-px bg-slate-700 mx-1"></div>

                {/* User Role Tag & Logout */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {user?.role}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Register
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
