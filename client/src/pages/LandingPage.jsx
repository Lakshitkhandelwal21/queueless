import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { ArrowRight, Clock, Building2, Monitor, QrCode, CheckCircle2, ChevronRight, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await api.get('/organizations');
        if (res.data.success) {
          setOrganizations(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load organizations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrgs();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0e10] text-slate-100 flex flex-col font-sans selection:bg-[#22c55e] selection:text-slate-950">
      <Navbar />

      {/* Hero Section (Matching Adexis Corporate Design Reference) */}
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36 border-b border-slate-800/60 bg-[#0d0e10]">
        
        {/* Subtle Geometric Diagonal Accent Line */}
        <div className="absolute inset-0 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M -100 200 L 500 500 L 1100 100" stroke="#22c55e" strokeWidth="2.5" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.08]">
              Virtual Queue Solutions for <br />
              Your Business Growth.
            </h1>

            <p className="text-base sm:text-lg text-slate-300 mb-10 leading-relaxed max-w-2xl font-normal">
              Gain operational clarity, eliminate physical waiting lines, and optimize customer service flow 
              with a dedicated virtual queue management partner focused on your long-term success.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold px-8 py-4 rounded text-base flex items-center gap-2 transition-all shadow-lg shadow-[#22c55e]/20"
              >
                <span>Schedule Your Virtual Queue</span>
                <ArrowRight className="w-5 h-5 text-slate-950" />
              </Link>

              <Link
                to="/kiosk"
                className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-6 py-4 rounded text-base flex items-center gap-2 transition-all"
              >
                <QrCode className="w-5 h-5 text-[#22c55e]" />
                <span>On-Site Kiosk Mode</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Corporate Features Overview */}
      <section id="features" className="py-20 bg-[#121417] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#0d0e10] border border-slate-800 p-8 rounded-sm hover:border-[#22c55e]/50 transition-all group">
              <div className="w-10 h-10 bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-6">
                <Zap className="w-5 h-5 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#22c55e] transition-colors">
                Real-Time Socket Sync
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Instant WebSocket synchronization pushes live queue updates to customer phones and staff desks in under 100ms.
              </p>
            </div>

            <div className="bg-[#0d0e10] border border-slate-800 p-8 rounded-sm hover:border-[#22c55e]/50 transition-all group">
              <div className="w-10 h-10 bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-6">
                <ShieldCheck className="w-5 h-5 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#22c55e] transition-colors">
                Atomic Race Guard
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Database-level conditional updates prevent double ticket assignments during high-volume peak hours.
              </p>
            </div>

            <div className="bg-[#0d0e10] border border-slate-800 p-8 rounded-sm hover:border-[#22c55e]/50 transition-all group">
              <div className="w-10 h-10 bg-[#22c55e]/10 border border-[#22c55e]/30 flex items-center justify-center mb-6">
                <BarChart3 className="w-5 h-5 text-[#22c55e]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#22c55e] transition-colors">
                Operational Analytics
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Comprehensive reporting covering customer volume, average wait times, no-show metrics, and CSV export.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Available Services Directory */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#22c55e]">ENTERPRISE LOCATIONS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-1">Available Service Centers</h2>
          </div>
          <p className="text-sm text-slate-400 max-w-md">Browse available centers and enter virtual queues remotely.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#22c55e]"></div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="bg-[#121417] border border-slate-800 rounded-sm p-12 text-center text-slate-400">
            <p>No active service centers available. Run seed script or log in as Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-[#121417] border border-slate-800 hover:border-[#22c55e]/60 rounded-sm p-8 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#22c55e] transition-colors">{org.name}</h3>
                    <span className="bg-[#22c55e]/10 text-[#22c55e] text-xs px-3 py-1 font-bold border border-[#22c55e]/30">
                      Open
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-6 leading-relaxed">{org.description || 'Public & civic service center.'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{org.address || 'Central Office'}</span>
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-[#22c55e] hover:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>View Queues</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Corporate Footer */}
      <footer className="border-t border-slate-800 bg-[#0a0b0d] py-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-950 flex items-center justify-center rounded-sm">
              <span className="font-mono text-sm font-black text-[#22c55e]">Q</span>
            </div>
            <span className="font-bold text-slate-200">QueueLess Virtual Queue System</span>
          </div>
          <p>© 2026 QueueLess. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
