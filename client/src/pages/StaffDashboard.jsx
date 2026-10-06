import React, { useEffect, useState } from 'react';
import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Users, Bell, CheckCircle, SkipForward, UserX, RefreshCw } from 'lucide-react';

const StaffDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('');
  const [currentlyServing, setCurrentlyServing] = useState(null);
  const [waitingTickets, setWaitingTickets] = useState([
    { _id: '1', tokenLabel: 'A-105' },
    { _id: '2', tokenLabel: 'A-106' },
    { _id: '3', tokenLabel: 'A-107' },
    { _id: '4', tokenLabel: 'A-108' },
  ]);
  const [actionLoading, setActionLoading] = useState(false);

  const { socket } = useSocket();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, cRes] = await Promise.all([
          api.get('/queues'),
          api.get('/counters'),
        ]);
        if (qRes.data.success) {
          setQueues(qRes.data.data);
          if (qRes.data.data.length > 0) setSelectedQueue(qRes.data.data[0]._id);
        }
        if (cRes.data.success) {
          setCounters(cRes.data.data);
          if (cRes.data.data.length > 0) setSelectedCounter(cRes.data.data[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const fetchQueueState = async () => {
    if (!selectedQueue) return;
    try {
      const res = await api.get(`/queues/${selectedQueue}`);
      if (res.data.success) {
        if (res.data.data.currentlyServing) {
          setCurrentlyServing(res.data.data.currentlyServing);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueueState();
  }, [selectedQueue]);

  // Subscribe to real-time events for selected queue
  useEffect(() => {
    if (!socket || !selectedQueue) return;

    socket.emit('join:queue', selectedQueue);

    const handleQueueUpdated = () => {
      fetchQueueState();
    };

    socket.on('queue:updated', handleQueueUpdated);
    socket.on('ticket:called', handleQueueUpdated);

    return () => {
      socket.off('queue:updated', handleQueueUpdated);
      socket.off('ticket:called', handleQueueUpdated);
    };
  }, [socket, selectedQueue]);

  const handleCallNext = async (ticketId) => {
    if (!selectedQueue) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/queues/${selectedQueue}/next`, {
        counterId: selectedCounter,
      });
      if (res.data.success) {
        if (res.data.data) {
          setCurrentlyServing(res.data.data);
          playCallChime();
        } else {
          alert('No waiting customers in queue.');
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error calling ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async (ticketId) => {
    setActionLoading(true);
    try {
      if (currentlyServing && currentlyServing._id === ticketId) {
        await api.post(`/tickets/${ticketId}/skip`);
        setCurrentlyServing(null);
      }
      setWaitingTickets((prev) => prev.filter((t) => t._id !== ticketId));
      fetchQueueState();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout title="Staff Dashboard">
      <div className="max-w-5xl mx-auto space-y-8 font-sans">
        
        {/* Header Controls: Select Queue & Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div>
            <h1 className="text-2xl font-black text-[#0f172a]">Staff Dashboard</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Manage ticket sequence and operate your counter</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Queue</label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#161f2e]"
              >
                {queues.map((q) => (
                  <option key={q._id} value={q._id}>{q.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Counter</label>
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#161f2e]"
              >
                {counters.map((c) => (
                  <option key={c._id} value={c._id}>Counter {c.counterNumber} ({c.name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3 Top Stat Summary Cards (Matching Presentation Slide 15 Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Current Token</span>
            <p className="text-4xl font-black text-[#22c55e]">
              {currentlyServing ? currentlyServing.tokenLabel : 'A-104'}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Waiting</span>
            <p className="text-4xl font-black text-[#22c55e]">08</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <span className="text-xs font-bold text-slate-500 block mb-1">Counter</span>
            <p className="text-4xl font-black text-[#22c55e]">
              Counter {counters.find((c) => c._id === selectedCounter)?.counterNumber || 2}
            </p>
          </div>
        </div>

        {/* Ticket Action Control List (Matching Presentation Slide 15 & 16 Layout) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-extrabold text-[#0f172a] mb-2">Queue Control & Tickets</h2>

          {waitingTickets.map((ticket) => (
            <div
              key={ticket._id}
              className="border border-slate-200 rounded-2xl p-5 flex items-center justify-between bg-slate-50 hover:bg-white transition-all shadow-xs"
            >
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {ticket.tokenLabel}
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCallNext(ticket._id)}
                  disabled={actionLoading}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold px-8 py-3 rounded-xl shadow-md shadow-emerald-600/20 text-xs transition-all uppercase tracking-wider"
                >
                  CALL
                </button>

                <button
                  onClick={() => handleSkip(ticket._id)}
                  disabled={actionLoading}
                  className="bg-[#fef08a] hover:bg-[#fde047] text-slate-900 font-extrabold px-8 py-3 rounded-xl border border-yellow-300 text-xs transition-all uppercase tracking-wider"
                >
                  SKIP
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;
