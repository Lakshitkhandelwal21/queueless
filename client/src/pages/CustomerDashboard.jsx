import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Clock, Users, Bell, AlertTriangle, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [etaMinutes, setEtaMinutes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { socket } = useSocket();

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

  const fetchActiveTicketStatus = async () => {
    try {
      // Find active tickets for customer
      const res = await api.get('/queues');
      if (res.data.success && res.data.data.length > 0) {
        const queueList = res.data.data;
        for (const q of queueList) {
          const detailRes = await api.get(`/queues/${q._id}`);
          if (detailRes.data.success && detailRes.data.data.currentlyServing) {
            // Check if customer has active ticket
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
    setLoading(false);
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
      setActiveTicket(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel ticket');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* Active Ticket Banner / Card */}
        {activeTicket && activeTicket.status !== 'cancelled' && activeTicket.status !== 'served' ? (
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-8 mb-10 shadow-2xl shadow-indigo-950/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Ticket Token</span>
                <h1 className="text-5xl font-black text-indigo-400 tracking-tight mt-1">{activeTicket.tokenLabel}</h1>
              </div>

              <div className="text-center sm:text-right">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</span>
                <div className="mt-1">
                  {activeTicket.status === 'waiting' && (
                    <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Waiting in Queue
                    </span>
                  )}
                  {activeTicket.status === 'called' && (
                    <span className="bg-indigo-500/20 text-indigo-300 text-xs font-extrabold px-3 py-1.5 rounded-full border border-indigo-500/40 animate-bounce inline-flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5" /> Called to Counter!
                    </span>
                  )}
                  {activeTicket.status === 'serving' && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" /> Being Served
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                <Users className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <span className="text-xs text-slate-400 font-medium">People Ahead</span>
                <p className="text-2xl font-bold text-white mt-1">{peopleAhead}</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <span className="text-xs text-slate-400 font-medium">Estimated Wait</span>
                <p className="text-2xl font-bold text-white mt-1">~{etaMinutes} min</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl text-center">
                <Bell className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="text-xs text-slate-400 font-medium">Counter</span>
                <p className="text-2xl font-bold text-white mt-1">
                  {activeTicket.counterId?.counterNumber ? `Counter ${activeTicket.counterId.counterNumber}` : 'Assigning...'}
                </p>
              </div>
            </div>

            {/* Turn Call Alert Banner */}
            {activeTicket.status === 'called' && (
              <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 shrink-0" />
                  <div>
                    <h3 className="font-bold text-sm">It's your turn!</h3>
                    <p className="text-xs text-indigo-100">Please proceed to {activeTicket.counterId?.name || 'the counter'}.</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCancelTicket}
              disabled={actionLoading}
              className="w-full bg-slate-950 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 font-semibold py-3 rounded-xl border border-slate-800 hover:border-rose-800 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <XCircle className="w-4 h-4" />
              <span>Leave Queue / Cancel Ticket</span>
            </button>
          </div>
        ) : null}

        {/* Join Queue Options */}
        <h2 className="text-xl font-bold text-white mb-4">Available Service Queues</h2>
        
        {queues.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
            <p>No active queues currently available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queues.map((q) => (
              <div key={q._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-lg">{q.name}</h3>
                    <span className="text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md font-mono border border-indigo-800">
                      Prefix {q.prefix}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{q.serviceId?.description || 'Service queue'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Avg service time: ~{q.serviceId?.averageServiceTime || 10} mins
                  </p>
                </div>

                <button
                  onClick={() => handleJoinQueue(q._id)}
                  disabled={actionLoading || (activeTicket && activeTicket.status !== 'cancelled' && activeTicket.status !== 'served')}
                  className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md text-sm flex items-center justify-center gap-2"
                >
                  <span>{activeTicket ? 'Already in Queue' : 'Take Ticket'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default CustomerDashboard;
