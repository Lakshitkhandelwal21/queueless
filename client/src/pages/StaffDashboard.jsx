import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Users, Bell, CheckCircle, SkipForward, UserX, RefreshCw, Layers } from 'lucide-react';

const StaffDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('');
  const [currentlyServing, setCurrentlyServing] = useState(null);
  const [waitingTickets, setWaitingTickets] = useState([]);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchQueueState = async () => {
    if (!selectedQueue) return;
    try {
      const res = await api.get(`/queues/${selectedQueue}`);
      if (res.data.success) {
        setCurrentlyServing(res.data.data.currentlyServing);
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

  const handleCallNext = async () => {
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
      alert(err.response?.data?.message || 'Error calling next ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleServe = async () => {
    if (!currentlyServing) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/tickets/${currentlyServing._id}/serve`);
      if (res.data.success) {
        setCurrentlyServing(null);
        fetchQueueState();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error serving ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!currentlyServing) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/tickets/${currentlyServing._id}/recall`, {
        counterId: selectedCounter,
      });
      if (res.data.success) {
        playCallChime();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recalling ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentlyServing) return;
    setActionLoading(true);
    try {
      await api.post(`/tickets/${currentlyServing._id}/skip`);
      setCurrentlyServing(null);
      fetchQueueState();
    } catch (err) {
      alert(err.response?.data?.message || 'Error skipping ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleNoShow = async () => {
    if (!currentlyServing) return;
    setActionLoading(true);
    try {
      await api.post(`/tickets/${currentlyServing._id}/no-show`);
      setCurrentlyServing(null);
      fetchQueueState();
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking no-show');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8 w-full flex-1">
        
        {/* Header Controls: Select Queue & Counter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Layers className="w-6 h-6 text-indigo-400" />
              <span>Staff Queue Control Desk</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Manage ticket sequence and call customers to your assigned counter</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Queue</label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {queues.map((q) => (
                  <option key={q._id} value={q._id}>{q.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Counter</label>
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {counters.map((c) => (
                  <option key={c._id} value={c._id}>Counter {c.counterNumber} ({c.name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Currently Serving Card + Control Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Currently Serving Display */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-xl">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Currently Serving</span>
              {currentlyServing ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <h2 className="text-6xl font-black text-indigo-400 tracking-tight">{currentlyServing.tokenLabel}</h2>
                      <p className="text-sm text-slate-300 mt-2 font-medium">Customer: {currentlyServing.customerId?.name || 'Walk-in'}</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold px-3 py-1.5 rounded-full inline-block uppercase">
                        {currentlyServing.status}
                      </span>
                      <p className="text-xs text-slate-500 mt-2">Counter {currentlyServing.counterId?.counterNumber || 1}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl my-4">
                  <Users className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">No ticket currently serving. Click "CALL NEXT" to begin.</p>
                </div>
              )}
            </div>

            {/* Action Buttons Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <button
                onClick={handleCallNext}
                disabled={actionLoading}
                className="col-span-2 sm:col-span-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-base"
              >
                <Bell className="w-5 h-5" />
                <span>CALL NEXT</span>
              </button>

              <button
                onClick={handleServe}
                disabled={!currentlyServing || actionLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <CheckCircle className="w-4 h-4" />
                <span>MARK SERVED</span>
              </button>

              <button
                onClick={handleRecall}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>RECALL</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <SkipForward className="w-4 h-4 text-amber-400" />
                <span>SKIP</span>
              </button>

              <button
                onClick={handleNoShow}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-rose-400 font-semibold py-2.5 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <UserX className="w-4 h-4" />
                <span>NO-SHOW</span>
              </button>
            </div>
          </div>

          {/* Side Info Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Queue Controls</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Calling next customer automatically emits Socket.IO updates to customer phones and public TV displays.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400">
              <p className="font-semibold text-white mb-1">Tip:</p>
              <p>Keep your counter status set to 'open' to accept automatic next assignments.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
