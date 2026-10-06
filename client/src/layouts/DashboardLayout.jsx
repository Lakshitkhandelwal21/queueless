import React from 'react';
import Sidebar from '../components/Sidebar';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { Bell, Search, Layers, Activity } from 'lucide-react';

const DashboardLayout = ({ children, title = 'Dashboard' }) => {
  const { connected } = useSocket();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans selection:bg-[#22c55e] selection:text-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Mockup Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          {/* Top Browser Address Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[11px] font-mono text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>localhost:5173</span>
            </div>
            <h2 className="text-lg font-extrabold text-[#0f172a] tracking-tight">{title}</h2>
          </div>

          {/* Right Header Status & User Greeting */}
          <div className="flex items-center gap-4">
            {/* Live Socket Status Badge */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span>{connected ? 'Live Socket Sync' : 'Offline'}</span>
            </div>

            {/* User Greeting */}
            {user && (
              <div className="hidden sm:block text-right">
                <span className="text-xs font-bold text-slate-800 block">
                  Good morning, {user.name?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase">
                  {user.role} Account
                </span>
              </div>
            )}
          </div>

        </header>

        {/* Page Main Content Area */}
        <main className="p-6 sm:p-8 flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
