import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
  Users,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Download,
  Plus,
  Shield,
  Layers,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const [todayKPIs, setTodayKPIs] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // Form states for adding service/counter
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceTime, setNewServiceTime] = useState(10);
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterNum, setNewCounterNum] = useState(1);

  const fetchAnalytics = async () => {
    try {
      const [todayRes, weeklyRes, servicesRes, countersRes, staffRes] = await Promise.all([
        api.get('/analytics/today'),
        api.get('/analytics/weekly'),
        api.get('/services'),
        api.get('/counters'),
        api.get('/staff'),
      ]);

      if (todayRes.data.success) setTodayKPIs(todayRes.data.data);
      if (weeklyRes.data.success) setWeeklyData(weeklyRes.data.data);
      if (servicesRes.data.success) setServices(servicesRes.data.data);
      if (countersRes.data.success) setCounters(countersRes.data.data);
      if (staffRes.data.success) setStaffList(staffRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCSV = () => {
    if (!weeklyData || weeklyData.length === 0) return;
    const headers = ['Date', 'Total Tickets', 'Served Tickets', 'No Shows'];
    const csvRows = [headers.join(',')];

    weeklyData.forEach((row) => {
      csvRows.push([row.date, row.total, row.served, row.noShow].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `queueless_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const orgRes = await api.get('/organizations');
      if (!orgRes.data.data || orgRes.data.data.length === 0) {
        alert('Please seed database or create an Organization first.');
        return;
      }
      const orgId = orgRes.data.data[0]._id;

      await api.post('/services', {
        organizationId: orgId,
        name: newServiceName,
        averageServiceTime: Number(newServiceTime),
      });

      setNewServiceName('');
      fetchAnalytics();
    } catch (err) {
      alert('Error creating service');
    }
  };

  const handleAddCounter = async (e) => {
    e.preventDefault();
    try {
      const orgRes = await api.get('/organizations');
      if (!orgRes.data.data || orgRes.data.data.length === 0) return;
      const orgId = orgRes.data.data[0]._id;

      await api.post('/counters', {
        organizationId: orgId,
        name: newCounterName,
        counterNumber: Number(newCounterNum),
      });

      setNewCounterName('');
      fetchAnalytics();
    } catch (err) {
      alert('Error creating counter');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> EXECUTIVE COMMAND CENTER
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Admin Overview</h1>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Analytics CSV</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Analytics & History
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'services'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Services & Counters Config
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Today</span>
                <p className="text-4xl font-black text-white mt-2">{todayKPIs?.totalTickets || 0}</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Currently Waiting</span>
                <p className="text-4xl font-black text-amber-400 mt-2">{todayKPIs?.waitingTickets || 0}</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Served Completed</span>
                <p className="text-4xl font-black text-emerald-400 mt-2">{todayKPIs?.servedTickets || 0}</p>
              </div>

              <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Wait Time</span>
                <p className="text-4xl font-black text-cyan-400 mt-2">~{todayKPIs?.averageWaitMinutes || 0} min</p>
              </div>
            </div>

            {/* Recharts 7-Day History Chart */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl mb-8 backdrop-blur-md">
              <h3 className="text-lg font-extrabold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <span>7-Day Customer Volume & Service History</span>
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090d16', borderColor: '#334155', borderRadius: '16px' }}
                      itemStyle={{ color: '#cbd5e1' }}
                    />
                    <Bar dataKey="total" name="Total Tickets" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="served" name="Served" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        ) : (
          /* Management Tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Services List & Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-6">Manage Services</h3>
              
              <form onSubmit={handleAddService} className="flex gap-3 mb-6">
                <input
                  type="text"
                  required
                  placeholder="Service Name"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white flex-1 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  required
                  placeholder="Avg Mins"
                  value={newServiceTime}
                  onChange={(e) => setNewServiceTime(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white w-24 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="space-y-3">
                {services.map((s) => (
                  <div key={s._id} className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{s.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Average duration: {s.averageServiceTime} mins</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold border border-emerald-500/20">Active</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Counters List & Form */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl backdrop-blur-md">
              <h3 className="text-lg font-bold text-white mb-6">Manage Counters</h3>
              
              <form onSubmit={handleAddCounter} className="flex gap-3 mb-6">
                <input
                  type="text"
                  required
                  placeholder="Counter Name"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white flex-1 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="number"
                  required
                  placeholder="Number"
                  value={newCounterNum}
                  onChange={(e) => setNewCounterNum(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white w-20 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow-md"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="space-y-3">
                {counters.map((c) => (
                  <div key={c._id} className="bg-slate-950/80 border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">Counter #{c.counterNumber}: {c.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Status: {c.status}</p>
                    </div>
                    <span className="text-xs bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full font-bold border border-indigo-500/20">Counter #{c.counterNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
