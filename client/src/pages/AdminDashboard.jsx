import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
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
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const AdminDashboard = () => {
  const [todayKPIs, setTodayKPIs] = useState(null);
  const [weeklyData, setWeeklyData] = useState([
    { date: '09:00', total: 12, served: 10 },
    { date: '10:00', total: 24, served: 20 },
    { date: '11:00', total: 45, served: 38 },
    { date: '12:00', total: 52, served: 42 },
    { date: '13:00', total: 48, served: 40 },
    { date: '14:00', total: 35, served: 30 },
    { date: '15:00', total: 20, served: 18 },
  ]);
  const [services, setServices] = useState([
    { _id: '1', name: 'General Consultation', averageServiceTime: 12 },
    { _id: '2', name: 'Document Verification', averageServiceTime: 8 },
    { _id: '3', name: 'Billing', averageServiceTime: 6 },
  ]);
  const [counters, setCounters] = useState([
    { _id: '1', counterNumber: 1, name: 'Counter 1', status: 'Online' },
    { _id: '2', counterNumber: 2, name: 'Counter 2', status: 'Serving A-104' },
    { _id: '3', counterNumber: 3, name: 'Counter 3', status: 'Paused' },
  ]);

  const fetchAnalytics = async () => {
    try {
      const [todayRes, servicesRes, countersRes] = await Promise.all([
        api.get('/analytics/today'),
        api.get('/services'),
        api.get('/counters'),
      ]);

      if (todayRes.data.success) setTodayKPIs(todayRes.data.data);
      if (servicesRes.data.success && servicesRes.data.data.length > 0) setServices(servicesRes.data.data);
      if (countersRes.data.success && countersRes.data.data.length > 0) setCounters(countersRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto space-y-10 font-sans">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Admin Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Operational KPIs, Queue Service Metrics, and Counter Status</p>
        </div>

        {/* 4 Stat Cards Row (Matching Presentation Slide 17 Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Customers</span>
            <p className="text-4xl font-black text-[#22c55e]">1,284</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Waiting</span>
            <p className="text-4xl font-black text-[#22c55e]">42</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Served</span>
            <p className="text-4xl font-black text-[#22c55e]">318</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">No-show</span>
            <p className="text-4xl font-black text-[#22c55e]">4.2%</p>
          </div>
        </div>

        {/* Queue Activity Today Bar Chart (Matching Presentation Slide 17 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
          <h2 className="text-lg font-extrabold text-[#0f172a] mb-6">Queue Activity Today</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="total" name="Tickets" fill="#22c55e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Manage Services Section (Matching Presentation Slide 18 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-[#0f172a] mb-4">Manage Services</h2>
          
          <div className="space-y-4">
            {services.map((s) => (
              <div key={s._id} className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{s.name}</h3>
                  <p className="text-2xl font-black text-[#22c55e] mt-1">{s.averageServiceTime} min</p>
                </div>

                <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs px-6 py-2.5 rounded-xl border border-slate-200 transition-colors">
                  EDIT
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Counters & Staff Status Section (Matching Presentation Slide 19 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-[#0f172a] mb-4">Counters & Staff</h2>
          
          <div className="space-y-4">
            {counters.map((c) => (
              <div key={c._id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50">
                <span className="font-bold text-xs text-slate-500 block mb-1">
                  Counter {c.counterNumber}
                </span>
                <p className="text-2xl font-black text-[#22c55e]">
                  {c.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section (Matching Presentation Slide 20 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-extrabold text-[#0f172a] mb-2">Queue Analytics</h2>
          <span className="text-xs font-bold text-slate-600 block mb-4">Average Wait Time</span>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} dot={{ r: 5, fill: '#22c55e' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-xs font-bold text-slate-500 text-center pt-4 border-t border-slate-100">
            Peak hour: 11:00–13:00  •  Avg. service: 7.8 min
          </p>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
