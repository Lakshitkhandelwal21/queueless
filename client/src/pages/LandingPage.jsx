import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import { ArrowRight, Clock, Search, Star, Heart, CheckCircle2, ChevronDown, ChevronUp, Sparkles, MapPin, X } from 'lucide-react';

const LandingPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Preference Filter states
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLoad, setSelectedLoad] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // FAQ Search & Accordion
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // Modal Details
  const [selectedQueueDetail, setSelectedQueueDetail] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, qRes] = await Promise.all([
          api.get('/organizations'),
          api.get('/queues'),
        ]);
        if (orgRes.data.success) setOrganizations(orgRes.data.data);
        if (qRes.data.success) setQueues(qRes.data.data);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const faqs = [
    {
      id: 1,
      category: 'General',
      question: 'What is QueueLess Virtual Queuing and how does it work?',
      answer:
        'QueueLess allows customers to discover service centers, select a queue remotely, and receive a digital token. You can track your live queue position and estimated wait time on your mobile phone without standing in line.',
    },
    {
      id: 2,
      category: 'Preferences',
      question: 'How does QueueLess calculate position and estimated wait time?',
      answer:
        'Wait time is calculated deterministically based on active waiting tickets ahead multiplied by the historical average service duration of that specific queue.',
    },
    {
      id: 3,
      category: 'Tickets',
      question: 'Do I need special permits or accounts to join a queue?',
      answer:
        'You can register a free account in seconds or use an on-site kiosk terminal to request a physical or digital ticket.',
    },
    {
      id: 4,
      category: 'Notifications',
      question: 'Will I get notified when my turn approaches?',
      answer:
        'Yes! The platform plays audio chime alerts and pushes real-time WebSocket updates when your ticket is 2-3 spots away or called to a counter.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.answer.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-[#22c55e] selection:text-white">
      <Navbar />

      {/* Hero Section (Matching Presentation Slide 10 Layout) */}
      <section className="relative min-h-[520px] flex items-center justify-center bg-[#161f2e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e293b] via-[#161f2e] to-[#0f172a] px-4 py-16 border-b border-slate-700">
        
        {/* Subtle Decorative Archway Overlay Backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        {/* Hero Card Matching Image Layout */}
        <div className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center border border-slate-100">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#161f2e] tracking-tight mb-3">
            QueueLess Virtual Queuing
          </h1>
          <p className="text-sm sm:text-base text-slate-500 italic font-serif mb-8">
            *Select your choice. Find the place. Start a tour.*
          </p>

          <button
            onClick={() => {
              const el = document.getElementById('preference-form');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-emerald-600/30 text-base inline-flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>Let's Goo!</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Preference Form Section (Matching Presentation Filter Layout) */}
      <section id="preference-form" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#161f2e] tracking-tight">
              Find Your Ideal Queue Service
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Select your preferences below and click Search Location to get instant matching service queues.
            </p>
          </div>

          {/* Filter Container Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {/* Preferred Region / Category */}
            <div>
              <label className="block text-xs font-bold text-[#161f2e] mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Preferred Service Category</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {['All', 'Healthcare', 'Banking', 'Civic Services', 'ID Renewal'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-[#161f2e] text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Service Load */}
            <div>
              <label className="block text-xs font-bold text-[#161f2e] mb-2">
                $ Estimated Wait Load Range
              </label>
              <div className="flex flex-wrap gap-2">
                {['All Load Ranges', 'Low (< 10 min)', 'Mid (10-30 min)', 'High (> 30 min)'].map((load) => (
                  <button
                    key={load}
                    onClick={() => setSelectedLoad(load)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      selectedLoad === load
                        ? 'bg-[#161f2e] text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {load}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Climate / Queue Priority */}
            <div>
              <label className="block text-xs font-bold text-[#161f2e] mb-2">
                ⚡ Priority & Queue Features
              </label>
              <div className="flex flex-wrap gap-2">
                {['All Features', 'Priority Access', 'Standard Queue', 'Express Service'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      selectedStatus === st
                        ? 'bg-[#161f2e] text-white shadow-sm'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Full-width Search Action Button */}
            <button
              onClick={() => {
                const el = document.getElementById('popular-queues');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md shadow-emerald-600/20 text-sm flex items-center justify-center gap-2 mt-4"
            >
              <Search className="w-4 h-4" />
              <span>Search Location & Available Queues</span>
            </button>

          </div>

        </div>
      </section>

      {/* Recommended Queues Cards Grid (Matching Slide 13 Layout) */}
      <section id="popular-queues" className="py-16 px-4 max-w-7xl mx-auto w-full">
        
        <div className="text-center mb-10">
          <span className="text-xs font-extrabold text-[#22c55e] uppercase tracking-wider flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Recommended Destinations for You
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161f2e] tracking-tight mt-1">
            Recommended Service Queues
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
            Based on your selected preferences (Category: <span className="font-bold text-slate-800">{selectedCategory}</span>)
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#22c55e]"></div>
          </div>
        ) : queues.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm max-w-xl mx-auto">
            <p className="font-semibold text-sm">No active queues found in system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queues.map((q) => (
              <div
                key={q._id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
              >
                {/* Header Badge Strip */}
                <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Prefix: {q.prefix}
                  </span>
                  <span className="bg-[#22c55e] text-slate-950 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                    99% Match
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-extrabold text-[#161f2e] group-hover:text-emerald-600 transition-colors">
                      {q.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {q.organizationId?.name || 'Central Office'}
                    </p>

                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {q.serviceId?.description || 'Standard digitized queue service with live token tracking.'}
                    </p>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-md">
                        Avg ~{q.serviceId?.averageServiceTime || 10} mins
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> 4.9
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Wait</span>
                      <p className="text-sm font-extrabold text-[#161f2e]">~10 min</p>
                    </div>

                    <button
                      onClick={() => setSelectedQueueDetail(q)}
                      className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      View Details
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Queue Detail Modal View */}
      {selectedQueueDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 font-sans">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-200">
            <button
              onClick={() => setSelectedQueueDetail(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-extrabold text-[#161f2e] mb-1">
              {selectedQueueDetail.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {selectedQueueDetail.organizationId?.name}
            </p>

            <div className="flex gap-2 mb-6">
              <span className="bg-[#161f2e] text-white text-xs font-bold px-3 py-1 rounded-md">
                Rating: ★ 4.9 (1420 reviews)
              </span>
              <span className="bg-[#22c55e] text-white text-xs font-bold px-3 py-1 rounded-md">
                Est: ~{selectedQueueDetail.serviceId?.averageServiceTime || 10} mins
              </span>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Overview</h4>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              {selectedQueueDetail.serviceId?.description || 'Standard virtual queue service with atomic token sequence generation and live Socket.IO position tracking.'}
            </p>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-6 text-xs border border-slate-200">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Best Time to Join</span>
                <span className="text-slate-500">Morning 09:00 - 11:00</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 block mb-1">Features</span>
                <span className="text-slate-500">Audio Chimes & TV Board</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedQueueDetail(null);
                setIsAuthModalOpen(true);
              }}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-sm"
            >
              Sign In to Join Queue
            </button>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions (FAQs) Section (Matching Slide 15 Layout) */}
      <section id="faqs" className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#22c55e] uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4" /> Frequently Asked Questions (FAQs)
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#161f2e] tracking-tight">
              Got Questions? We Have Answers.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
              Find answers to common questions about virtual queuing, token calculations, and permits.
            </p>
          </div>

          {/* Search FAQ Field */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
            <input
              type="text"
              value={faqSearch}
              onChange={(e) => setFaqSearch(e.target.value)}
              placeholder="Search FAQs (e.g., best time to travel, permits, budget, packing)..."
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#161f2e] shadow-sm font-medium"
            />
          </div>

          {/* Accordions */}
          <div className="space-y-4">
            {filteredFaqs.map((faq) => {
              const isOpen = openFaq === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                    className="w-full text-left px-6 py-4 flex items-center justify-between font-extrabold text-xs sm:text-sm text-[#161f2e] hover:text-emerald-600 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md">
                        {faq.category}
                      </span>
                      <span>{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-slate-600 border-t border-slate-100 leading-relaxed font-normal">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Footer (Matching Slide Footer Layout) */}
      <footer className="bg-[#161f2e] text-slate-300 py-12 px-4 border-t border-slate-700 text-center text-xs font-sans">
        <div className="max-w-7xl mx-auto space-y-4">
          <h3 className="text-lg font-black text-white tracking-tight">
            QueueLess Virtual Queuing
          </h3>
          <p className="text-xs text-slate-400 italic">
            *Enter your choice. Find the place. Start a tour.*
          </p>

          <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-slate-300 py-2">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <a href="#preference-form" className="hover:text-white transition-colors">Preference Form</a>
            <a href="#popular-queues" className="hover:text-white transition-colors">Popular Places</a>
            <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
          </div>

          <p className="text-[11px] text-slate-500 pt-4 border-t border-slate-700/60 max-w-xl mx-auto">
            © 2026 QueueLess Virtual Queuing. Built for digitized queue management and seamless customer experiences.
          </p>
        </div>
      </footer>

      {/* Auth Modal for Sign In / Register */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab="login"
      />

    </div>
  );
};

export default LandingPage;
