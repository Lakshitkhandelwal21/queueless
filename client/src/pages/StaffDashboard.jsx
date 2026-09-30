import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Users, Bell, CheckCircle, SkipForward, UserX, RefreshCw, Layers, Sparkles, Navigation } from 'lucide-react';

const StaffDashboard = () => {
  const [queues, setQueues] = useState([]);
  const [counters, setCounters] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [selectedCounter, setSelectedCounter] = useState('');
  const [currentlyServing, setCurrentlyServing] = useState(null);
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

      <div className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        
        {/* Header Desk Selection */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-slate-900/80 border border-slate-800/80 p-6 rounded-3xl mb-8 backdrop-blur-md shadow-xl">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> COUNTER OPERATOR DESK
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Queue Control Desk</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Active Queue</label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {queues.map((q) => (
                  <option key={q._id} value={q._id}>{q.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Assigned Counter</label>
              <select
                value={selectedCounter}
                onChange={(e) => setSelectedCounter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
              >
                {counters.map((c) => (
                  <option key={c._id} value={c._id}>Counter {c.counterNumber} ({c.name})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Currently Serving Spotlight + Control Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Currently Serving Display */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">CURRENTLY SERVING TOKEN</span>
              {currentlyServing ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-8 mb-8">
                    <div>
                      <h2 className="text-7xl font-black text-white tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
                        {currentlyServing.tokenLabel}
                      </h2>
                      <p className="text-sm text-slate-300 mt-3 font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <span>Customer: {currentlyServing.customerId?.name || 'Walk-in'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-extrabold px-4 py-1.5 rounded-full inline-block uppercase tracking-wider">
                        {currentlyServing.status}
                      </span>
                      <p className="text-xs text-slate-400 mt-2 font-medium">
                        Counter {currentlyServing.counterId?.counterNumber || 1}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-slate-500 border-2 border-dashed border-slate-800/80 rounded-3xl my-6">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p className="text-sm font-medium">No active ticket at counter. Click "CALL NEXT" to begin.</p>
                </div>
              )}
            </div>

            {/* Tactical Control Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
              <button
                onClick={handleCallNext}
                disabled={actionLoading}
                className="col-span-2 sm:col-span-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 text-base tracking-wide"
              >
                <Bell className="w-5 h-5 text-white" />
                <span>CALL NEXT CUSTOMER</span>
              </button>

              <button
                onClick={handleServe}
                disabled={!currentlyServing || actionLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                <span>MARK SERVED</span>
              </button>

              <button
                onClick={handleRecall}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-200 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <RefreshCw className="w-4 h-4 text-indigo-400" />
                <span>RECALL</span>
              </button>

              <button
                onClick={handleSkip}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-amber-300 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <SkipForward className="w-4 h-4" />
                <span>SKIP</span>
              </button>

              <button
                onClick={handleNoShow}
                disabled={!currentlyServing || actionLoading}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-rose-400 font-bold py-3 rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <UserX className="w-4 h-4" />
                <span>NO-SHOW</span>
              </button>
            </div>
          </div>

          {/* Side Info Panel */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md">
            <div>
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-indigo-400" />
                <span>Desk Guidelines</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Clicking CALL NEXT updates customer mobile screens and lobby TV displays in under 100ms.
              </p>
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
              <p className="font-bold text-indigo-400 mb-1">Live Sync Active</p>
              <p className="text-slate-400">Queue actions trigger database-safe atomic state updates.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default StaffDashboard;
