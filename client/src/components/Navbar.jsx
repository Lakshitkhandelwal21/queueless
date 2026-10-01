import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';
import { User, LogOut, Heart, HelpCircle, Compass, Layers, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="bg-[#161f2e] text-white border-b border-slate-700/60 sticky top-0 z-40 shadow-md font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Far Action Pill (Sign In / User Profile) */}
            <div>
              {isAuthenticated ? (
                <div className="flex items-center gap-2 border border-slate-600 rounded-lg px-3.5 py-1.5 bg-slate-800/40 text-xs font-semibold text-slate-200">
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Hi, {user?.name?.split(' ')[0]}</span>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 border border-slate-500/80 hover:border-white rounded-lg px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white transition-all bg-slate-800/30"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Center Brand Title */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-slate-950 font-bold shadow-sm">
                <Compass className="w-4 h-4 text-slate-950" />
              </div>
              <span className="font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                QueueLess Virtual Queuing
              </span>
            </Link>

            {/* Right Navigation Menu */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-300">
              <Link to="/" className="hover:text-white transition-colors bg-slate-800/50 px-3 py-1.5 rounded-md">
                Home
              </Link>
              
              <a href="#categories" className="hidden md:inline hover:text-white transition-colors">
                Categories
              </a>

              <a href="#popular-queues" className="hidden md:inline hover:text-white transition-colors">
                Popular Queues
              </a>

              <a href="#faqs" className="hidden lg:inline hover:text-white transition-colors">
                FAQs
              </a>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {user?.role === 'customer' && (
                    <Link
                      to="/customer"
                      className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 hover:border-emerald-500 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                      <span>My Ticket</span>
                    </Link>
                  )}

                  {user?.role === 'staff' && (
                    <Link
                      to="/staff"
                      className="bg-[#22c55e] text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#16a34a] transition-all"
                    >
                      Counter Desk
                    </Link>
                  )}

                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="bg-[#22c55e] text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#16a34a] transition-all"
                    >
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('register')}
                  className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 hover:border-emerald-500 text-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  <Heart className="w-3.5 h-3.5 text-slate-400" />
                  <span>Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
};

export default Navbar;
