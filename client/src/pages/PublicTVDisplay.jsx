import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { playCallChime } from '../utils/audioAlert';
import { Layers, Monitor, Volume2 } from 'lucide-react';
import api from '../services/api';

const PublicTVDisplay = () => {
  const [servingList, setServingList] = useState([]);
  const [lastCalled, setLastCalled] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchInitialTVData = async () => {
      try {
        const res = await api.get('/queues');
        if (res.data.success && res.data.data.length > 0) {
          const list = [];
          for (const q of res.data.data) {
            const detail = await api.get(`/queues/${q._id}`);
            if (detail.data.success && detail.data.data.currentlyServing) {
              list.push(detail.data.data.currentlyServing);
            }
          }
          setServingList(list);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialTVData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('public:display_update', (data) => {
      setLastCalled(data);
      playCallChime();
    });

    return () => {
      socket.off('public:display_update');
    };
  }, [socket]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans p-8 select-none">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <Layers className="w-10 h-10 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">QueueLess Public Display</h1>
            <p className="text-xs text-slate-400">Live Counter Status & Call Announcements</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800 px-4 py-2 rounded-full text-xs font-bold text-indigo-300">
          <Volume2 className="w-4 h-4 animate-pulse text-indigo-400" />
          <span>AUDIO ANNOUNCEMENTS ACTIVE</span>
        </div>
      </div>

      {/* Main Grid: NOW SERVING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        
        {/* Currently Serving Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-indigo-400" />
            <span>NOW SERVING AT COUNTERS</span>
          </h2>

          <div className="space-y-4 flex-1">
            {servingList.length === 0 ? (
              <div className="py-20 text-center text-slate-600 text-lg">
                No active counters currently serving
              </div>
            ) : (
              servingList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase text-slate-400">Token</span>
                    <h3 className="text-5xl font-black text-indigo-400 mt-1 tracking-tight">{item.tokenLabel}</h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold uppercase text-slate-400">Counter</span>
                    <p className="text-3xl font-extrabold text-white mt-1">
                      Counter {item.counterId?.counterNumber || 1}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Latest Call Alert Panel */}
        <div className="bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">LATEST CALL ANNOUNCEMENT</span>
            {lastCalled ? (
              <div className="mt-8 text-center animate-pulse">
                <span className="text-slate-400 text-sm font-semibold uppercase">Token Called</span>
                <h2 className="text-7xl font-black text-white mt-2 mb-4 tracking-tight">{lastCalled.tokenLabel}</h2>
                <div className="inline-block bg-indigo-600 text-white text-xl font-extrabold px-6 py-3 rounded-2xl shadow-lg">
                  Proceed to Counter {lastCalled.counterNumber}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-500">
                Waiting for next counter call...
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 pt-4 text-center text-xs text-slate-500">
            Please watch the board and listen for your token call chime
          </div>
        </div>

      </div>

    </div>
  );
};

export default PublicTVDisplay;
