import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Clock, Users, Bell, AlertTriangle, ArrowRight, XCircle, CheckCircle, Sparkles, Navigation } from 'lucide-react';

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
    if (!window.confirm('Are you sure you want to leave the queue? Your position will be forfeited.')) return;

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

      <div className="max-w-4xl mx-auto px-4 py-10 w-full flex-1">
        
        {/* Active Ticket Banner / Card */}
        {activeTicket && activeTicket.status !== 'cancelled' && activeTicket.status !== 'served' ? (
          <div className="bg-slate-900/80 border border-indigo-500/30 rounded-3xl p-8 mb-10 shadow-2xl shadow-indigo-950/40 relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800/80 pb-6 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">YOUR DIGITAL TOKEN</span>
                <h1 className="text-6xl font-black text-white tracking-tight mt-1 bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  {activeTicket.tokenLabel}
                </h1>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">QUEUE STATUS</span>
                <div className="mt-1">
                  {activeTicket.status === 'waiting' && (
                    <span className="bg-amber-500/10 text-amber-300 text-xs font-extrabold px-4 py-2 rounded-full border border-amber-500/30 inline-flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      Waiting in Line
                    </span>
                  )}
                  {activeTicket.status === 'called' && (
                    <span className="bg-indigo-500/20 text-indigo-200 text-xs font-black px-4 py-2 rounded-full border border-indigo-500/50 animate-bounce inline-flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-400" />
                      CALLED TO COUNTER!
                    </span>
                  )}
                  {activeTicket.status === 'serving' && (
                    <span className="bg-emerald-500/10 text-emerald-400 text-xs font-extrabold px-4 py-2 rounded-full border border-emerald-500/30 inline-flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Currently Being Served
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Step Pipeline Tracker */}
            <div className="mb-8 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                <span className="text-indigo-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> 1. Ticket Joined</span>
                <span className={activeTicket.status === 'waiting' ? 'text-amber-400 font-bold' : 'text-slate-500'}>2. Waiting</span>
                <span className={activeTicket.status === 'called' ? 'text-indigo-400 font-bold' : 'text-slate-500'}>3. Called</span>
                <span className={activeTicket.status === 'serving' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>4. Served</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-500"
                  style={{
                    width: activeTicket.status === 'waiting' ? '35%' : activeTicket.status === 'called' ? '75%' : activeTicket.status === 'serving' ? '100%' : '15%',
                  }}
                ></div>
              </div>
            </div>

            {/* Live Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl text-center">
                <Users className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400 font-medium">People Ahead</span>
                <p className="text-3xl font-black text-white mt-1">{peopleAhead}</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl text-center">
                <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400 font-medium">Estimated Wait</span>
                <p className="text-3xl font-black text-white mt-1">~{etaMinutes} min</p>
              </div>

              <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl text-center">
                <Navigation className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <span className="text-xs text-slate-400 font-medium">Assigned Counter</span>
                <p className="text-3xl font-black text-white mt-1">
                  {activeTicket.counterId?.counterNumber ? `Counter ${activeTicket.counterId.counterNumber}` : 'Assigning...'}
                </p>
              </div>
            </div>

            {/* Turn Call Spotlight Banner */}
            {activeTicket.status === 'called' && (
              <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white rounded-2xl p-5 mb-6 flex items-center justify-between shadow-xl shadow-indigo-600/30">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Bell className="w-6 h-6 text-white animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base">It's your turn now!</h3>
                    <p className="text-xs text-indigo-100">Please walk to {activeTicket.counterId?.name || 'Counter Desk'}.</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleCancelTicket}
              disabled={actionLoading}
              className="w-full bg-slate-950 hover:bg-rose-950/30 text-rose-400 hover:text-rose-300 font-semibold py-3.5 rounded-xl border border-slate-800 hover:border-rose-800/60 transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <XCircle className="w-4 h-4" />
              <span>Leave Queue & Cancel Ticket</span>
            </button>
          </div>
        ) : null}

        {/* Join Queue Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">Available Service Queues</h2>
          <span className="text-xs text-slate-400">Select a queue below to take a ticket</span>
        </div>
        
        {queues.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-10 text-center text-slate-400">
            <p>No active queues currently open.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {queues.map((q) => (
              <div key={q._id} className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white text-lg">{q.name}</h3>
                    <span className="text-xs bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full font-mono border border-indigo-800">
                      {q.prefix}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{q.serviceId?.description || 'Service queue'}</p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Average duration: ~{q.serviceId?.averageServiceTime || 10} mins
                  </p>
                </div>

                <button
                  onClick={() => handleJoinQueue(q._id)}
                  disabled={actionLoading || (activeTicket && activeTicket.status !== 'cancelled' && activeTicket.status !== 'served')}
                  className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all shadow-md text-xs flex items-center justify-center gap-2"
                >
                  <span>{activeTicket ? 'Already In Queue' : 'Take Ticket'}</span>
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
