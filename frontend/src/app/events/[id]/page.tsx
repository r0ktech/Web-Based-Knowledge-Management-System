'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import axios from 'axios';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Globe, AlertCircle } from 'lucide-react';

interface LeaderRelation {
  leader: {
    id: string;
    fullName: string;
    position: string;
    politicalParty: string;
  };
}

interface EventDetails {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  description: string;
  latitude: number;
  longitude: number;
  image?: string;
  leaders?: LeaderRelation[];
  createdBy?: { name: string; email: string };
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const eventId = resolvedParams.id;

  const [eventData, setEventData] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/events/${eventId}`);
        if (res.data) {
          setEventData(res.data);
        }
      } catch (err: any) {
        console.warn('API error fetching event details. Loading local mocks.', err);
        generateMockEvent(eventId);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId, API_URL]);

  const generateMockEvent = (id: string) => {
    const mocks: Record<string, EventDetails> = {
      'mock-ev-1': {
        id: 'mock-ev-1',
        title: 'Geometric Power Aba Commissioning',
        category: 'Infrastructure',
        date: '2024-02-26',
        location: 'Osisioma Ngwa Industrial layout',
        description: 'The commissioning of the Geometric Power Aba Integrated Power Project marked a historic energy milestone in Abia State. Engineered to supply continuous 188MW electricity to industrial clusters in Aba and its surroundings, this project represents the first independent private electrical network in Nigeria. It addresses a major industrial energy barrier and promises to boost local shoe, garment, and metal fabrication sectors.',
        latitude: 5.1066,
        longitude: 7.3697,
        image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=500&q=80',
        leaders: [
          { leader: { id: 'mock-ott', fullName: 'Dr. Alex Otti', position: 'Executive Governor', politicalParty: 'LP' } }
        ]
      },
      'mock-ev-2': {
        id: 'mock-ev-2',
        title: 'Abia State Creation declaration',
        category: 'Political',
        date: '1991-08-28',
        location: 'State capital office, Umuahia',
        description: 'Following decades of community requests, Abia State was carved out of the old Imo State under the military decree directed by Gen. Ibrahim Babangida. The state takes its name from the acronym of the four highly populated regions: Aba, Bende, Isuikwuato, and Afikpo (Afikpo was later reassigned to Ebonyi State). Umuahia was declared the capital of the territory, introducing an administrative center for local government councils.',
        latitude: 5.5267,
        longitude: 7.4898,
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        leaders: []
      }
    };

    const details = mocks[id] || {
      id: id,
      title: 'Historical Abia Developmental Commission',
      category: 'Social',
      date: '2010-06-03',
      location: 'Arochukwu Caves boundary',
      description: 'A key development marker including regional clinic foundations, school standard expansions, or traditional assembly setups mapping the growth of communal support parameters in Abia rural LGAs.',
      latitude: 5.3789,
      longitude: 7.9135,
      leaders: []
    };

    setEventData(details);
  };

  const getCatColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'POLITICAL': return 'bg-purple-100 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400 border border-purple-500/20';
      case 'INFRASTRUCTURE': return 'bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-500/20';
      case 'CULTURAL': return 'bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 border border-amber-500/20';
      case 'ECONOMIC': return 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20';
      default: return 'bg-gray-150 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-500/10';
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center py-32 text-gold">
          <div className="w-10 h-10 border-4 border-t-gold border-emerald-950 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !eventData) {
    return (
      <AppLayout>
        <div className="text-center py-16 glass-card">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Error Accessing Milestone</h2>
          <p className="text-xs text-[var(--text-muted)] mb-6">The requested development trajectory details are unavailable.</p>
          <Link href="/events" className="px-4 py-2 bg-emerald-950 text-white rounded-lg text-xs font-bold">
            Back to Developments
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Back Link */}
        <div>
          <Link href="/events" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-gold transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Developments Registry
          </Link>
        </div>

        {/* Event Header Banner */}
        <div className="glass-card overflow-hidden">
          {eventData.image && (
            <div className="w-full h-48 md:h-64 relative bg-slate-900 overflow-hidden bg-opacity-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-app)] to-transparent"></div>
            </div>
          )}

          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${getCatColor(eventData.category)}`}>
                {eventData.category} Development
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
                <Calendar className="w-4.5 h-4.5 text-gold" />
                <span>Date: {new Date(eventData.date).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </span>
            </div>

            <h1 className="font-cinzel text-xl md:text-3xl font-extrabold text-[var(--text-main)] leading-tight">{eventData.title}</h1>

            <div className="flex flex-wrap gap-4 pt-2 border-t border-[var(--border-glass)] text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Location: {eventData.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-gold" />
                <span>Coordinates: {eventData.latitude.toFixed(4)}°N, {eventData.longitude.toFixed(4)}°E</span>
              </span>
            </div>
          </div>
        </div>

        {/* Narrative Description & Linked Leaders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 md:p-8 md:col-span-2 space-y-4">
            <h3 className="font-cinzel font-bold text-base text-[var(--text-main)] border-b border-[var(--border-glass)] pb-2.5">
              Historical Narrative & Significance
            </h3>
            <p className="text-xs md:text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-line">
              {eventData.description}
            </p>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-glass)] pb-2.5">
              <Users className="w-4 h-4 text-gold" />
              <span>Associated Leaders</span>
            </h3>

            {eventData.leaders && eventData.leaders.length > 0 ? (
              <div className="space-y-3">
                {eventData.leaders.map((rel, idx) => (
                  <div key={idx} className="p-3 border border-[var(--border-glass)] rounded-xl bg-white/20 dark:bg-emerald-950/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-main)]">{rel.leader.fullName}</h4>
                      <p className="text-[10px] text-[var(--text-muted)]">{rel.leader.position} ({rel.leader.politicalParty})</p>
                    </div>
                    <Link 
                      href={`/leaders/${rel.leader.id}`}
                      className="p-1 px-2.5 rounded bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 text-[10px] font-semibold transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--text-muted)] leading-relaxed text-center py-4">No specific leaders associated with this catalog milestone.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
