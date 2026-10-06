import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import { playCallChime } from '../utils/audioAlert';
import { Users, Clock, Bell, CheckCircle, XCircle, ArrowRight, Activity, AlertCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [ticketHistory, setTicketHistory] = useState([
    { tokenLabel: 'A-102', status: 'served' },
    { tokenLabel: 'A-098', status: 'served' },
    { tokenLabel: 'B-041', status: 'cancelled' },
  ]);
  const [actionLoading, setActionLoading] = useState(false);

  const { socket } = useSocket();
  const { user } = useAuth();

  const fetchQueues = async () => {
    try {
      const res = await api.get('/queues');
      if (res.data.success) {
        setQueues(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Listen for real-time ticket updates via Socket.IO
  useEffect(() => {
    if (!socket || !activeTicket) return;

    socket.emit('join:queue', activeTicket.queueId);
    socket.emit('join:ticket', activeTicket._id);

    const handleTicketCalled = (data) => {
      if (data.ticket && data.ticket._id === activeTicket._id) {
        setActiveTicket(data.ticket);
        playCallChime();
      }
    };

    const handleQueueUpdated = () => {
      if (activeTicket) {
        refreshTicketData(activeTicket._id);
      }
    };

    socket.on('ticket:called', handleTicketCalled);
    socket.on('queue:updated', handleQueueUpdated);

    return () => {
      socket.off('ticket:called', handleTicketCalled);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [socket, activeTicket]);

  const refreshTicketData = async (ticketId) => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      if (res.data.success) {
        setPeopleAhead(res.data.data.peopleAhead);
        setEtaMinutes(res.data.data.estimatedWaitTimeMinutes);
        setActiveTicket(res.data.data.entry);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinQueue = async (queueId) => {
    setActionLoading(true);
    try {
      const res = await api.post(`/queues/${queueId}/join`);
      if (res.data.success) {
        setActiveTicket(res.data.data);
        await refreshTicketData(res.data.data._id);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join queue');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeTicket) return;
    if (!window.confirm('Are you sure you want to cancel your queue ticket?')) return;

    setActionLoading(true);
    try {
      await api.post(`/tickets/${activeTicket._id}/cancel`);
      setTicketHistory((prev) => [{ tokenLabel: activeTicket.tokenLabel, status: 'cancelled' }, ...prev]);
      setActiveTicket(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel ticket');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout title="Customer Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Top Greeting Header (Matching Slide 9 Layout) */}
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">
            Good morning, {user?.name?.split(' ')[0] || 'Customer'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Track your digital ticket, live queue position, and turn alerts.
          </p>
        </div>

        {/* 3 Top Summary Stat Cards (Matching Presentation Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Currently Waiting</span>
            <p className="text-4xl font-black text-[#22c55e]">08</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Serving Now</span>
            <p className="text-4xl font-black text-[#22c55e]">03</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Avg. Wait</span>
            <p className="text-4xl font-black text-[#22c55e]">12 min</p>
          </div>
        </div>

        {/* Active Service Banner (Matching Slide Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <span className="text-xs font-bold text-slate-400 block mb-1 uppercase tracking-wider">Service</span>
          <h2 className="text-2xl font-extrabold text-[#22c55e]">
            {activeTicket?.queueId?.name || 'General Consultation'}
          </h2>
        </div>

        {/* My Live Ticket Card (Matching Presentation Slide 12 Layout) */}
        {activeTicket && activeTicket.status !== 'cancelled' && activeTicket.status !== 'served' ? (
          <div className="bg-[#ecfdf5] border-2 border-[#a7f3d0] rounded-2xl p-8 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">TOKEN</span>
                <h2 className="text-6xl font-black text-[#22c55e] tracking-tight mt-1">
                  {activeTicket.tokenLabel}
                </h2>
                <p className="text-sm font-bold text-slate-700 mt-4 flex items-center gap-3">
                  <span>Position: {peopleAhead + 1}</span>
                  <span>•</span>
                  <span>Estimated wait: {etaMinutes} min</span>
                </p>
              </div>

              <div className="flex flex-col gap-3 w-full sm:w-auto">
                {activeTicket.status === 'called' && (
                  <div className="bg-[#22c55e] text-white text-xs font-extrabold px-4 py-3 rounded-xl shadow-md text-center animate-bounce">
                    Proceed to Counter {activeTicket.counterId?.counterNumber || 1}!
                  </div>
                )}
                <button
                  onClick={handleCancelTicket}
                  disabled={actionLoading}
                  className="bg-white hover:bg-rose-50 text-rose-600 font-bold px-6 py-3 rounded-xl border border-rose-200 text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Ticket</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Join Queue Section (Matching Presentation Slide 11 Layout) */
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
            <h3 className="text-lg font-bold text-[#0f172a] mb-4">Join a Queue</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {queues.map((q) => (
                <div key={q._id} className="border border-slate-200 rounded-xl p-5 flex flex-col justify-between bg-slate-50">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base">{q.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">People waiting: 8</p>
                  </div>
                  <button
                    onClick={() => handleJoinQueue(q._id)}
                    disabled={actionLoading}
                    className="mt-4 w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                  >
                    <span>JOIN QUEUE</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications & Recent History List (Matching Presentation Slide 14 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
          <h3 className="text-base font-extrabold text-[#0f172a] mb-4">Recent Queue History</h3>

          {ticketHistory.map((item, idx) => (
            <div key={idx} className="border border-slate-100 rounded-xl p-4 flex items-center justify-between bg-slate-50">
              <span className="font-extrabold text-sm text-slate-900">{item.tokenLabel}</span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-md ${
                  item.status === 'served'
                    ? 'text-[#22c55e] bg-emerald-50 border border-emerald-200'
                    : 'text-rose-600 bg-rose-50 border border-rose-200'
                }`}
              >
                {item.status === 'served' ? 'Served' : 'Cancelled'}
              </span>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
