import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Layers, ArrowRight, CheckCircle2, Ticket } from 'lucide-react';

const KioskPage = () => {
  const [queues, setQueues] = useState([]);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        const res = await api.get('/queues');
        if (res.data.success) {
          setQueues(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueues();
  }, []);

  const handleKioskJoin = async (queueId) => {
    try {
      // In kiosk mode, register/use walk-in customer identity
      const orgRes = await api.get(`/queues/${queueId}`);
      if (orgRes.data.success) {
        // Mock kiosk join or prompt ticket
        alert('Welcome! Your ticket token has been printed. Please take your printed slip.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-8 font-sans select-none">
      
      {/* Kiosk Header */}
      <div className="text-center py-6">
        <div className="inline-flex items-center gap-2 text-indigo-400 font-extrabold text-3xl tracking-tight mb-2">
          <Layers className="w-8 h-8 text-indigo-500" />
          <span>QueueLess Self-Service Kiosk</span>
        </div>
        <p className="text-slate-400 text-base">Select a service below to receive your physical queue token</p>
      </div>

      {/* Large Touch Grid */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        {queues.map((q) => (
          <button
            key={q._id}
            onClick={() => handleKioskJoin(q._id)}
            className="bg-slate-900 hover:bg-indigo-950/60 border-2 border-slate-800 hover:border-indigo-500 rounded-3xl p-8 text-left transition-all active:scale-95 shadow-xl flex flex-col justify-between group h-64"
          >
            <div>
              <span className="text-xs font-mono font-bold bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded-full uppercase">
                Prefix {q.prefix}
              </span>
              <h2 className="text-3xl font-extrabold text-white mt-4 group-hover:text-indigo-300 transition-colors">
                {q.name}
              </h2>
              <p className="text-sm text-slate-400 mt-2">{q.serviceId?.description || 'Tap to request queue ticket'}</p>
            </div>

            <div className="flex items-center justify-between text-indigo-400 font-bold text-lg mt-4">
              <span>TAP TO TAKE TICKET</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      {/* Kiosk Footer */}
      <div className="text-center py-4 text-xs text-slate-500 border-t border-slate-900">
        Touch anywhere on the screen to begin • Powered by QueueLess Virtual Queue Platform
      </div>

    </div>
  );
};

export default KioskPage;
