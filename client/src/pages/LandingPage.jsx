import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Clock, ArrowRight, QrCode, Shield, CheckCircle2, Sparkles, Building2, Smartphone, BellRing, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32 border-b border-slate-800/80 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Virtual Queue Experience</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-8 leading-[1.1]">
            Step Out of Line. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Queue Remotely in Comfort.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-12 leading-relaxed">
            QueueLess replaces physical queues with digital tokens, live position updates, and audio alerts. 
            Arrive right when your counter is ready.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] text-sm"
            >
              <span>Join Queue Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/kiosk"
              className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold px-8 py-4 rounded-2xl border border-slate-800 flex items-center gap-2.5 transition-all text-sm backdrop-blur-md"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Launch On-Site Kiosk</span>
            </Link>
          </div>

          {/* Stat Pills */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-slate-800/60 pt-10">
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Virtual Line Sync</p>
            </div>
            <div>
              <p className="text-2xl font-black text-indigo-400">&lt; 100ms</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Real-time Alert Latency</p>
            </div>
            <div>
              <p className="text-2xl font-black text-cyan-400">Zero</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Physical Waiting Lines</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">Atomic</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Race-Guard Protection</p>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-slate-950/60 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Remote Mobile Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a token on your smartphone and monitor your live queue position and estimated wait time anywhere.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <BellRing className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Turn Audio Chimes</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive instant synthesized sound notifications the second your token is called by counter staff.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Public Lobby TV Board</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Dedicated departure-style TV display boards for waiting rooms with complete PII customer privacy.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Service Centers Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-1 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">ACTIVE LOCATIONS</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Available Service Centers</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-md">Select an organization to browse available service queues and take digital tickets.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <p>No active service centers found. Log in as Admin or run seed script to initialize.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl p-6 transition-all hover:shadow-2xl hover:shadow-indigo-950/40 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{org.name}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[11px] px-3 py-1 rounded-full font-semibold border border-emerald-500/20">
                      Open
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">{org.description || 'Primary public service center.'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{org.address || 'Central Office'}</span>
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <Link
                    to="/login"
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
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

      {/* Handcrafted Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">QueueLess Platform</span>
            <span>• Handcrafted Virtual Queue System</span>
          </div>
          <p>© 2026 QueueLess. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
