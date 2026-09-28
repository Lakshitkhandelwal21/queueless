import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { Clock, Users, ArrowRight, Monitor, QrCode, Shield, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-6">
            <CheckCircle2 className="w-3.5 h-3.5" /> Virtual Queue Management Platform
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Wait in Freedom, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              Not in Physical Lines.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            QueueLess digitizes waiting lines for hospitals, banks, civic centers, and offices. 
            Join remotely, track your token position live, and arrive right when your counter is ready.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <span>Join Queue Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/kiosk"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Launch On-Site Kiosk</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Active Organizations Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <h2 className="text-2xl font-bold text-white mb-2">Available Service Centers</h2>
        <p className="text-slate-400 text-sm mb-8">Select an organization to browse available queues and join remotely.</p>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : organizations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <p>No active organizations found. Run seed script or log in as Admin to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{org.name}</h3>
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/20">
                      Open
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{org.description || 'Civic and public service center.'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{org.address || 'Central Office'}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <span>View Service Queues</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900 py-8 text-center text-xs text-slate-500">
        <p>© 2026 QueueLess — Real-Time Virtual Queue Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
