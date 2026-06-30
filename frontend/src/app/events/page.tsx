'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { 
  Search, Calendar, ChevronLeft, ChevronRight, 
  MapPin, Plus, LoaderCircle, AlertCircle
} from 'lucide-react';

const CATEGORIES = ['Political', 'Infrastructure', 'Cultural', 'Economic', 'Social'];

interface Event {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  latitude: number;
  longitude: number;
}

export default function EventsExplorer() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Add Event Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Political',
    date: '',
    location: '',
    latitude: '5.5267',
    longitude: '7.4898',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        search,
        category,
        startDate,
        endDate,
        page: page.toString(),
        limit: '9'
      });

      const res = await axios.get(`${API_URL}/events?${queryParams.toString()}`);
      if (res.data) {
        setEvents(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      console.warn('API error fetching historical events. Serving mock registry.', err);
      generateMocks();
    } finally {
      setLoading(false);
    }
  };

  const generateMocks = () => {
    const baseMocks: Event[] = [
      { id: 'mock-ev-1', title: 'Geometric Power Aba Commissioning', category: 'Infrastructure', date: '2024-02-26', location: 'Osisioma Ngwa Industrial layout', description: 'After two decades of regulatory hold-ups and structural delays, the Geometric Power Aba Integrated Power Project was officially commissioned. The 188MW power plant is engineered to deliver uninterrupted electricity supply to industrial clusters across Aba and its suburbs, driving a significant economic surge.', latitude: 5.1066, longitude: 7.3697 },
      { id: 'mock-ev-2', title: 'Abia State Creation declaration', category: 'Political', date: '1991-08-28', location: 'State capital office, Umuahia', description: 'Abia State was formally carved out of the old Imo State. The military administration of General Ibrahim Babangida announced the division. Group Captain Frank Ajobena was appointed as the pioneer Military Governor to construct State operations.', latitude: 5.5267, longitude: 7.4898 },
      { id: 'mock-ev-3', title: 'Launch of Enyimba Economic City Master Blueprint', category: 'Economic', date: '2018-09-12', location: 'Ugwunagbo LGA boundary', description: 'A structured blueprint for creating a special economic zone spanning three LGAs was signed under governor Okezie Ikpeazu. The blueprint coordinates factories, dry docks, and housing layouts to facilitate foreign trade loops.', latitude: 5.0911, longitude: 7.3211 }
    ];

    let filtered = baseMocks;
    if (search) {
      filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.description.toLowerCase().includes(search.toLowerCase()));
    }
    if (category) {
      filtered = filtered.filter(e => e.category === category);
    }
    if (startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(endDate));
    }

    setEvents(filtered);
    setTotal(filtered.length);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchEvents();
  }, [search, category, startDate, endDate, page]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await axios.post(`${API_URL}/events`, formData);
      setShowModal(false);
      fetchEvents();
    } catch (err: any) {
      if (!err.response) {
        // Mock add success visual reaction
        const mockNew: Event = {
          id: `mock-ev-${Date.now()}`,
          title: formData.title,
          category: formData.category,
          date: formData.date,
          location: formData.location,
          description: formData.description,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        };
        setEvents([mockNew, ...events]);
        setShowModal(false);
        return;
      }
      setError(err.response?.data?.message || 'Error occurred creating historical event.');
    }
  };

  const getCatBadge = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'POLITICAL': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/20 dark:text-purple-400 border-purple-500/10';
      case 'INFRASTRUCTURE': return 'bg-blue-150 text-blue-800 dark:bg-blue-950/20 dark:text-blue-400 border-blue-500/10';
      case 'CULTURAL': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400 border-amber-500/10';
      case 'ECONOMIC': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-500/10';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-500/10';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Upper Header strip */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Historical Developments</h1>
            <p className="text-xs text-[var(--text-muted)]">State milestones, cultural histories, road commissions, and political shifts.</p>
          </div>
          {['SUPER_ADMIN', 'ADMINISTRATOR', 'HISTORIAN', 'RESEARCHER'].includes(user?.role || '') && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Catalog New Event</span>
            </button>
          )}
        </div>

        {/* Filter Layout */}
        <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, locations..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
          >
            <option value="" className="text-black bg-white">All Event Types</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="text-black bg-white">{c}</option>
            ))}
          </select>

          {/* Date Boundaries */}
          <div>
            <input
              type="date"
              placeholder="Start bounds"
              value={startDate}
              onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
              className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
            />
          </div>
          <div>
            <input
              type="date"
              placeholder="End bounds"
              value={endDate}
              onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
              className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
            />
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-gold">
            <LoaderCircle className="w-12 h-12 animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Calendar className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="font-cinzel text-base font-bold text-[var(--text-main)]">No Milestones Recorded</h3>
            <p className="text-xs text-[var(--text-muted)]">Refine your Date boundaries or Keywords query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="glass-card overflow-hidden flex flex-col justify-between">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-block ${getCatBadge(ev.category)}`}>
                      {ev.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(ev.date).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] leading-snug line-clamp-1">{ev.title}</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2 line-clamp-3">{ev.description}</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] font-medium border-t border-[var(--border-glass)] pt-3">
                    <MapPin className="w-4 h-4 text-gold flex-shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-emerald-950/5 dark:bg-emerald-950/20 border-t border-[var(--border-glass)] text-center flex justify-between items-center text-xs">
                  <span className="text-[10px] text-gray-400 font-mono">Geo: {ev.latitude.toFixed(2)}N, {ev.longitude.toFixed(2)}E</span>
                  <Link 
                    href={`/events/${ev.id}`}
                    className="inline-flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-455 hover:text-gold transition-colors"
                  >
                    <span>Read Details</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pager controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white/20 dark:bg-emerald-950/10 border border-[var(--border-glass)] px-4 py-3 rounded-xl">
            <span className="text-xs text-[var(--text-muted)]">Showing page {page} of {totalPages} (Total: {total} elements)</span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4.5 h-4.5 inline" />
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Modal form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-app)] glass-card max-w-xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
              <h3 className="font-cinzel text-lg font-bold text-[var(--text-main)] mb-1 border-b border-[var(--border-glass)] pb-2">Catalog Historic Development</h3>
              
              {error && (
                <div className="p-3 bg-red-100/90 text-red-800 text-xs rounded-xl flex items-center gap-1.5 my-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateEvent} className="mt-4 space-y-4 text-xs text-[var(--text-main)]">
                <div>
                  <label className="block font-semibold mb-1">Milestone Event Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    placeholder="e.g. Opening of State General Hospital"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Development Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs text-black"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Date of Occurrence</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.date} 
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Location Details</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.location} 
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    placeholder="e.g. Osisioma Ngwa LGA boundary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Latitude coordinate (GPS)</label>
                    <input 
                      type="number" 
                      step="any"
                      required 
                      value={formData.latitude} 
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                      placeholder="e.g. 5.52"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Longitude coordinate (GPS)</label>
                    <input 
                      type="number" 
                      step="any"
                      required 
                      value={formData.longitude} 
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                      placeholder="e.g. 7.48"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Historical Narrative Description</label>
                  <textarea 
                    rows={4} 
                    required 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs resize-none"
                    placeholder="Provide full description facts about this milestone..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-400 bg-white/10 hover:bg-emerald-950/5 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-white rounded-lg font-bold shadow"
                  >
                    Confirm Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
