'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import axios from 'axios';
import Link from 'next/link';
import { 
  Clock, Search, Calendar, MapPin, 
  ZoomIn, ArrowUpRight, LoaderCircle
} from 'lucide-react';

const CATEGORIES = ['Political', 'Infrastructure', 'Cultural', 'Economic', 'Social'];

const ERAS = [
  { value: 'all', label: 'All Eras (1991 - Present)' },
  { value: 'early', label: 'Foundation Era (1991 - 1999)' },
  { value: 'demo', label: 'Democratic Consolidation (1999 - 2015)' },
  { value: 'modern', label: 'Modern Reforms (2015 - Present)' }
];

interface TimelineEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
}

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Zooming
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeEra, setActiveEra] = useState('all');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        // Fetch smaller payload specifically optimized for timeline mapping
        const res = await axios.get(`${API_URL}/events/timeline`);
        if (res.data) {
          setEvents(res.data);
        }
      } catch (err: any) {
        console.warn('API timeline endpoint offline. Serving mock timelines.', err);
        generateMocks();
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, [API_URL]);

  const generateMocks = () => {
    setEvents([
      { id: 'mock-ev-2', title: 'Abia State Creation declaration', category: 'Political', date: '1991-08-28', location: 'Umuahia State capital office', description: 'Abia State was formally carved out of the old Imo State. Gen. Ibrahim Babangida announced the division.' },
      { id: 'mock-ev-blue', title: 'Pioneer State Assembly Election', category: 'Political', date: '1992-01-02', location: 'Umuahia assembly room', description: 'Early parliamentary elections were completed, electing native assembly members to draft state laws.' },
      { id: 'mock-ev-3', title: 'Launch of Enyimba Economic City Master Blueprint', category: 'Economic', date: '2018-09-12', location: 'Ugwunagbo boundary', description: 'A structured blueprint for creating a special economic zone spanning three LGAs was signed under governor Okezie Ikpeazu.' },
      { id: 'mock-ev-1', title: 'Geometric Power Aba Commissioning', category: 'Infrastructure', date: '2024-02-26', location: 'Osisioma Ngwa Industrial layout', description: 'After two decades of regulatory hold-ups and structural delays, the Geometric Power Aba Integrated Power Project was officially commissioned.' }
    ]);
  };

  // Filter dynamic list based on controls
  const filteredEvents = events.filter(e => {
    // Search
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                          e.description.toLowerCase().includes(search.toLowerCase());
    
    // Category
    const matchesCategory = activeCategory ? e.category === activeCategory : true;
    
    // Era Zoom
    const eventYear = new Date(e.date).getFullYear();
    let matchesEra = true;
    if (activeEra === 'early') {
      matchesEra = eventYear >= 1991 && eventYear < 1999;
    } else if (activeEra === 'demo') {
      matchesEra = eventYear >= 1999 && eventYear < 2015;
    } else if (activeEra === 'modern') {
      matchesEra = eventYear >= 2015;
    }

    return matchesSearch && matchesCategory && matchesEra;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'POLITICAL': return 'bg-purple-900 border-purple-500';
      case 'INFRASTRUCTURE': return 'bg-blue-900 border-blue-500';
      case 'CULTURAL': return 'bg-amber-900 border-amber-500';
      case 'ECONOMIC': return 'bg-emerald-900 border-emerald-500';
      default: return 'bg-slate-800 border-slate-500';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Banner with header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Chronology Explorer</h1>
            <p className="text-xs text-[var(--text-muted)]">Interactive chronological mapping of Abia developments since 1991.</p>
          </div>
        </div>

        {/* Filters and zoom console */}
        <div className="glass-card p-4 space-y-4">
          {/* Era Zoom Selector & Search row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search historic milestones..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]"
              />
            </div>
            
            {/* Era zoom */}
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-gold" />
              <select
                value={activeEra}
                onChange={(e) => setActiveEra(e.target.value)}
                className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
              >
                {ERAS.map(era => (
                  <option key={era.value} value={era.value} className="text-black bg-white">{era.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Quick Tags */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border-glass)] text-xs items-center">
            <span className="text-[var(--text-muted)] font-medium">Filter categories:</span>
            <button
              onClick={() => setActiveCategory('')}
              className={`px-3 py-1 rounded-full border transition-all ${!activeCategory ? 'bg-emerald-950 text-white border-emerald-800' : 'bg-white/40 dark:bg-emerald-950/20 text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-glass)]'}`}
            >
              All Categories
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`px-3 py-1 rounded-full border transition-all ${activeCategory === c ? 'bg-emerald-950 text-white border-emerald-800' : 'bg-white/40 dark:bg-emerald-950/20 text-[var(--text-muted)] hover:text-[var(--text-main)] border-[var(--border-glass)]'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Visualization rendering */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-gold">
            <LoaderCircle className="w-12 h-12 animate-spin" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Clock className="w-10 h-10 text-gold mx-auto mb-3" />
            <h3 className="font-cinzel text-sm font-bold text-[var(--text-main)]">No timeline entries match filters</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">Adjust your era boundaries or category selections.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-emerald-900/30 dark:border-emerald-600/30 pl-6 md:pl-8 ml-4 space-y-12 py-4">
            {filteredEvents.map((ev) => {
              const eventDateObj = new Date(ev.date);
              const year = eventDateObj.getFullYear();
              const fullDateStr = eventDateObj.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
              
              return (
                <div key={ev.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className={`absolute top-2 -left-[31px] md:-left-[41px] w-5 h-5 rounded-full border-4 border-[var(--bg-app)] flex items-center justify-center transition-transform duration-300 group-hover:scale-125 z-10 ${getCategoryColor(ev.category)}`} />

                  {/* Date badge */}
                  <div className="flex flex-wrap gap-2 items-center mb-2">
                    <span className="text-[10px] font-mono font-extrabold text-gold bg-emerald-950 dark:bg-emerald-900 border border-amber-500/10 px-2 py-0.5 rounded tracking-wide uppercase">
                      {year}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {fullDateStr}
                    </span>
                  </div>

                  {/* Card content */}
                  <div className="glass-card p-6 max-w-4xl hover:border-gold/30 transitions">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[8px] uppercase tracking-wider font-bold mb-1 text-gold">{ev.category} milestone</span>
                        <h3 className="font-cinzel text-base font-bold text-[var(--text-main)] leading-snug">{ev.title}</h3>
                      </div>
                      <Link 
                        href={`/events/${ev.id}`}
                        className="p-1 px-2.5 rounded bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 text-[10px] font-bold inline-flex items-center gap-1 outline-none"
                      >
                        <span>Registry File</span>
                        <ArrowUpRight className="w-3 h-3 text-gold" />
                      </Link>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mt-2.5 leading-relaxed">{ev.description}</p>

                    <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-medium pt-3.5 border-t border-[var(--border-glass)] mt-3">
                      <MapPin className="w-3.5 h-3.5 text-gold" />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
