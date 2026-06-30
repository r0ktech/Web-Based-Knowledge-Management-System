'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import axios from 'axios';
import { MapPin, Search } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import map so it only renders on client (Leaflet needs window)
const LeafletMap = dynamic(() => import('../../components/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-xl bg-emerald-950/10 border border-[var(--border-glass)] flex items-center justify-center">
      <div className="text-center">
        <MapPin className="w-10 h-10 text-gold animate-bounce mx-auto mb-3" />
        <p className="text-xs text-[var(--text-muted)]">Loading interactive map...</p>
      </div>
    </div>
  )
});

interface MapEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
}

const CATEGORIES = ['Political', 'Infrastructure', 'Cultural', 'Economic', 'Social'];

export default function MapPage() {
  const [events, setEvents] = useState<MapEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MapEvent | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const MOCK_EVENTS: MapEvent[] = [
    { id: 'mp-1', title: 'Abia State Government House', category: 'Political', date: '1991-08-28', location: 'Umuahia, Umuahia North LGA', latitude: 5.5267, longitude: 7.4898 },
    { id: 'mp-2', title: 'Geometric Power Aba Plant', category: 'Infrastructure', date: '2024-02-26', location: 'Osisioma Ngwa Industrial Layout', latitude: 5.1066, longitude: 7.3697 },
    { id: 'mp-3', title: 'Arochukwu Long Juju Slave Route', category: 'Cultural', date: '1900-01-01', location: 'Arochukwu LGA', latitude: 5.3789, longitude: 7.9135 },
    { id: 'mp-4', title: 'Enyimba Economic City Zone', category: 'Economic', date: '2018-09-12', location: 'Ugwunagbo LGA', latitude: 5.0911, longitude: 7.3211 },
    { id: 'mp-5', title: 'Aba Trade Hub - Ariaria Market', category: 'Economic', date: '1975-01-01', location: 'Aba South LGA', latitude: 5.1218, longitude: 7.3622 },
    { id: 'mp-6', title: 'Ohafia War Dance Cultural Centre', category: 'Cultural', date: '2005-06-01', location: 'Ohafia LGA', latitude: 5.6328, longitude: 7.8285 },
    { id: 'mp-7', title: 'Isuikwuato Nature Heritage Reserve', category: 'Cultural', date: '2012-03-14', location: 'Isuikwuato LGA', latitude: 5.7533, longitude: 7.4277 },
    { id: 'mp-8', title: 'Aba Port Harcourt Road Reconstruction', category: 'Infrastructure', date: '2023-07-15', location: 'Aba North LGA', latitude: 5.1156, longitude: 7.3672 },
    { id: 'mp-9', title: 'Bende Agricultural Cluster', category: 'Economic', date: '2020-04-10', location: 'Bende LGA', latitude: 5.5612, longitude: 7.6322 },
    { id: 'mp-10', title: 'Umuahia Central Hospital Extension', category: 'Social', date: '2019-08-20', location: 'Umuahia South LGA', latitude: 5.5101, longitude: 7.4780 },
  ];

  useEffect(() => {
    const fetchMapEvents = async () => {
      try {
        const res = await axios.get(`${API_URL}/events/map-locations`);
        if (res.data?.length > 0) {
          setEvents(res.data);
        } else {
          setEvents(MOCK_EVENTS);
        }
      } catch {
        setEvents(MOCK_EVENTS);
      } finally {
        setLoading(false);
      }
    };
    fetchMapEvents();
  }, [API_URL]);

  const filteredEvents = events.filter(e => {
    const matchesSearch = search ? e.title.toLowerCase().includes(search.toLowerCase()) || e.location.toLowerCase().includes(search.toLowerCase()) : true;
    const matchesCategory = category ? e.category === category : true;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Political': return '#9333ea';
      case 'Infrastructure': return '#3b82f6';
      case 'Cultural': return '#f59e0b';
      case 'Economic': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[var(--border-glass)] pb-4">
          <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Interactive Heritage Map</h1>
          <p className="text-xs text-[var(--text-muted)]">Geo-spatial atlas of historical developments, landmark commissions, political centers, and cultural zones across Abia State.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search locations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-3 py-2 text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]">
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="text-black bg-white">{c}</option>)}
          </select>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(c => (
            <div key={c} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: getCategoryColor(c) }}></span>
              <span>{c}</span>
            </div>
          ))}
        </div>

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaflet Map */}
          <div className="lg:col-span-2">
            {!loading && (
              <LeafletMap
                events={filteredEvents}
                selectedEventId={selectedEvent?.id}
                onMarkerClick={(e) => setSelectedEvent(e)}
                getCategoryColor={getCategoryColor}
              />
            )}
          </div>

          {/* Event Sidebar List */}
          <div className="glass-card p-4 overflow-y-auto max-h-[520px]">
            <h3 className="font-cinzel text-sm font-bold text-[var(--text-main)] mb-3 border-b border-[var(--border-glass)] pb-2">
              Locations ({filteredEvents.length})
            </h3>
            <div className="space-y-2">
              {filteredEvents.map(ev => (
                <button
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs ${selectedEvent?.id === ev.id ? 'border-gold bg-amber-500/5' : 'border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 hover:border-emerald-700/30'}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full mt-0.5 flex-shrink-0" style={{ backgroundColor: getCategoryColor(ev.category) }}></span>
                    <div>
                      <p className="font-semibold text-[var(--text-main)] line-clamp-1">{ev.title}</p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{ev.location}</p>
                      <p className="text-[9px] text-gold font-mono mt-0.5">{new Date(ev.date).getFullYear()} · {ev.category}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Event Details Panel */}
        {selectedEvent && (
          <div className="glass-card p-6 border-l-4 border-l-gold">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-bold text-gold">{selectedEvent.category}</span>
                <h3 className="font-cinzel text-base font-bold text-[var(--text-main)] mt-1">{selectedEvent.title}</h3>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-main)]">✕</button>
            </div>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-[var(--text-muted)]">Location</span><p className="font-semibold text-[var(--text-main)]">{selectedEvent.location}</p></div>
              <div><span className="text-[var(--text-muted)]">Date</span><p className="font-semibold text-[var(--text-main)]">{new Date(selectedEvent.date).toLocaleDateString([], { year: 'numeric', month: 'long' })}</p></div>
              <div><span className="text-[var(--text-muted)]">Latitude</span><p className="font-mono font-semibold text-gold">{selectedEvent.latitude.toFixed(4)}°N</p></div>
              <div><span className="text-[var(--text-muted)]">Longitude</span><p className="font-mono font-semibold text-gold">{selectedEvent.longitude.toFixed(4)}°E</p></div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
