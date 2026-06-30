'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import axios from 'axios';
import Link from 'next/link';
import { 
  ArrowLeft, Landmark, Award, Calendar, MapPin, 
  ChevronRight, ArrowRightLeft, BookOpen, AlertCircle, User
} from 'lucide-react';

interface Predecessor {
  id: string;
  fullName: string;
  position: string;
}

interface Successor {
  id: string;
  fullName: string;
  position: string;
  lga: string;
}

interface EventRelation {
  event: {
    id: string;
    title: string;
    category: string;
    date: string;
    location: string;
  };
}

interface LeaderDetails {
  id: string;
  fullName: string;
  position: string;
  officeHeld: string;
  politicalParty: string;
  startDate: string;
  endDate?: string;
  biography: string;
  achievements: string;
  policies: string;
  lga: string;
  status: string;
  photograph?: string;
  predecessor?: Predecessor;
  successors?: Successor[];
  events?: EventRelation[];
}

export default function LeaderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  
  // Next.js 15 dynamic params extraction
  const resolvedParams = React.use(params);
  const leaderId = resolvedParams.id;

  const [leader, setLeader] = useState<LeaderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchLeaderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/leaders/${leaderId}`);
        if (res.data) {
          setLeader(res.data);
        }
      } catch (err: any) {
        console.warn('API error fetching leader portfolio. Serving mock data.', err);
        generateMockDetails(leaderId);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderDetails();
  }, [leaderId, API_URL]);

  const generateMockDetails = (id: string) => {
    // Generate detailed mocks matching specific ids or random
    const mockLeaders: Record<string, LeaderDetails> = {
      'mock-ott': {
        id: 'mock-ott',
        fullName: 'Dr. Alex Otti',
        position: 'Executive Governor',
        officeHeld: 'Executive Governor of Abia State',
        politicalParty: 'LP',
        startDate: '2023-05-29',
        lga: 'Isiala Ngwa South',
        status: 'Active',
        photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexOtti',
        biography: 'Dr. Alex Otti is an economist, banker, and Nigerian politician serving as the current Executive Governor of Abia State since May 29, 2023. Prior to politics, he was the Managing Director of Diamond Bank PLC and served in senior management capacities at First Bank. Driven by objectives of fiscal discipline, infrastructure restoration, agricultural expansion, and civil security.',
        achievements: 'Commissioned major Aba trade road reconstruction projects (Port Harcourt Road, Cemetery Road). Successfully cleared outstanding state pension backlogs and implemented civil service digitalization frameworks. Established state security task forces.',
        policies: 'Treasury Single Account (TSA) Implementation, State Roads Rehabilitation Mandate, Civil Service Digital Verification, and Grassroots Health Insurance Programs.',
        predecessor: { id: 'mock-ikp', fullName: 'Dr. Okezie Ikpeazu', position: 'Executive Governor' },
        successors: [],
        events: [
          { event: { id: 'e-1', title: 'Geometric Power Aba Commissioning', category: 'Infrastructure', date: '2024-02-26', location: 'Osisioma Ngwa Industrial layout' } }
        ]
      },
      'mock-ikp': {
        id: 'mock-ikp',
        fullName: 'Dr. Okezie Ikpeazu',
        position: 'Executive Governor',
        officeHeld: 'Executive Governor of Abia State',
        politicalParty: 'PDP',
        startDate: '2015-05-29',
        endDate: '2023-05-29',
        lga: 'Obi Ngwa',
        status: 'Past',
        photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=OkezieIkpeazu',
        biography: 'Dr. Okezie Victor Ikpeazu is a biochemist, academic, and politician who served as governor of Abia State from 2015 to 2023. Prior to his governorship, he was a lecturer at several universities and served in environmental management boards. Highlights of his administration include the promotion of local Aba garment/leather goods manufacturing and local SME development.',
        achievements: 'Established the Aba Footwear Academy and launched the Enyimba Economic City project. Built several vital state link bridges and roads in Aba North and Umuahia. Expanded primary healthcare coverage.',
        policies: 'Made-in-Aba Global Campaign, State SME Clinic Initiative, Enyimba Economic City Master Blueprint, and Agricultural Rice Cluster Projects.',
        predecessor: { id: 'mock-tao', fullName: 'Chief Theodore A. Orji', position: 'Executive Governor' },
        successors: [{ id: 'mock-ott', fullName: 'Dr. Alex Otti', position: 'Executive Governor', lga: 'Isiala Ngwa South' }],
        events: [
          { event: { id: 'e-2', title: 'Lauch of Enyimba Economic City Blueprint', category: 'Economic', date: '2018-09-12', location: 'Ugwunagbo LGA boundary' } }
        ]
      }
    };

    const details = mockLeaders[id] || {
      id: id,
      fullName: 'Hon. Chief Representative',
      position: 'Commissioner',
      officeHeld: 'State House Commissioner',
      politicalParty: 'APGA',
      startDate: '2010-06-03',
      endDate: '2014-05-29',
      lga: 'Ohafia',
      status: 'Past',
      photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=mockRepresentative',
      biography: 'A prominent legislative figure and researcher who representing local governmental agencies in state committees. Contributed to legislative bills establishing ecological review bodies, local scholarship funding, and municipal works panels.',
      achievements: 'Ohafia community hospital renovation, school standard review panels, and rural agricultural distribution frameworks.',
      policies: 'Rural Primary Care Standard Plan, Local Empowerment Grant program.',
      predecessor: undefined,
      successors: [],
      events: []
    };

    setLeader(details);
  };

  const getPartyBadge = (party: string) => {
    switch (party.toUpperCase()) {
      case 'PDP': return 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400 border border-green-500/25';
      case 'APC': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 border border-blue-500/25';
      case 'APGA': return 'bg-yellow-105 text-yellow-800 dark:bg-yellow-950/35 dark:text-yellow-405 border border-yellow-500/25';
      case 'LP': return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 border border-red-500/25';
      default: return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-450 border border-emerald-500/25';
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

  if (error || !leader) {
    return (
      <AppLayout>
        <div className="text-center py-16 glass-card">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">Error Accessing Portfolio</h2>
          <p className="text-xs text-[var(--text-muted)] mb-6">The requested political trajectory details are unavailable.</p>
          <Link href="/leaders" className="px-4 py-2 bg-emerald-950 text-white rounded-lg text-xs font-bold">
            Back to Registry
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
          <Link href="/leaders" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-gold transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Registry Directory
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative">
          <div className="absolute top-4 right-4">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${leader.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 border-emerald-600/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 border-gray-600/20'}`}>
              {leader.status} In Office
            </span>
          </div>

          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold overflow-hidden bg-emerald-950/15 flex-shrink-0 flex items-center justify-center shadow-lg">
            {leader.photograph ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={leader.photograph} alt={leader.fullName} className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-gold" />
            )}
          </div>

          <div className="text-center md:text-left space-y-3.5 flex-1">
            <div>
              <h1 className="font-cinzel text-2xl md:text-4xl font-extrabold text-[var(--text-main)]">{leader.fullName}</h1>
              <p className="text-xs md:text-sm text-[var(--text-muted)] font-medium mt-1">{leader.officeHeld}</p>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${getPartyBadge(leader.politicalParty)}`}>
                {leader.politicalParty} Party
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                <MapPin className="w-4 h-4 text-gold" />
                <span>{leader.lga} LGA origin</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-medium">
                <Calendar className="w-4 h-4 text-gold" />
                <span>Tenure: {new Date(leader.startDate).toLocaleDateString([], { year: 'numeric', month: 'short' })} - {leader.endDate ? new Date(leader.endDate).toLocaleDateString([], { year: 'numeric', month: 'short' }) : 'Present'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Biography & Achievements Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Biography Column (2 cols) */}
          <div className="glass-card p-6 md:p-8 md:col-span-2 space-y-6">
            <div className="space-y-3">
              <h3 className="font-cinzel font-bold text-base text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-glass)] pb-2.5">
                <BookOpen className="w-5 h-5 text-gold" />
                <span>Executive Biography & Historical Context</span>
              </h3>
              <p className="text-xs md:text-sm text-[var(--text-main)] leading-relaxed whitespace-pre-line">
                {leader.biography}
              </p>
            </div>

            {leader.achievements && (
              <div className="space-y-3 pt-4 border-t border-[var(--border-glass)]">
                <h3 className="font-cinzel font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                  <Award className="w-5 h-5 text-gold" />
                  <span>Key Administrative Achievements</span>
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-emerald-950/5 dark:bg-emerald-950/20 p-4 rounded-xl border border-[var(--border-glass)]">
                  {leader.achievements}
                </p>
              </div>
            )}

            {leader.policies && (
              <div className="space-y-3 pt-4 border-t border-[var(--border-glass)]">
                <h3 className="font-cinzel font-bold text-base text-[var(--text-main)] flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-gold" />
                  <span>Introduced State Policies / Decisions</span>
                </h3>
                <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed whitespace-pre-line bg-amber-500/5 p-4 rounded-xl border border-[var(--border-glass)]">
                  {leader.policies}
                </p>
              </div>
            )}
          </div>

          {/* Right sidebar: Succession visual tree, relations events */}
          <div className="space-y-6">
            {/* Succession Visual Tree (Relationships Graph) */}
            <div className="glass-card p-6">
              <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4 flex items-center gap-2 border-b border-[var(--border-glass)] pb-2.5">
                <ArrowRightLeft className="w-4 h-4 text-gold" />
                <span>Tenure Succession Path</span>
              </h3>

              <div className="space-y-4">
                {/* Predecessor */}
                {leader.predecessor ? (
                  <div className="border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/15 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-gold text-left">Predecessor</p>
                      <h4 className="text-xs font-bold text-[var(--text-main)] truncate max-w-[150px]">{leader.predecessor.fullName}</h4>
                    </div>
                    <Link 
                      href={`/leaders/${leader.predecessor.id}`}
                      className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-white transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ) : (
                  <div className="p-3 bg-white/10 dark:bg-white/5 rounded-xl border border-[var(--border-glass)] text-center text-[10px] text-gray-500">
                    No predecessor indexed
                  </div>
                )}

                {/* Current Leader Badge */}
                <div className="text-center py-2 text-gold">
                  <div className="h-4 w-0.5 bg-gold mx-auto my-1 bg-opacity-40"></div>
                  <span className="text-[10px] tracking-wider uppercase font-bold border border-gold px-2 py-0.8 rounded-lg bg-emerald-950 text-white font-cinzel">
                    {leader.fullName}
                  </span>
                  <div className="h-4 w-0.5 bg-gold mx-auto my-1 bg-opacity-40"></div>
                </div>

                {/* Successor(s) */}
                {leader.successors && leader.successors.length > 0 ? (
                  leader.successors.map((succ) => (
                    <div key={succ.id} className="border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/15 p-3 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase font-bold tracking-widest text-gold text-left">Successor</p>
                        <h4 className="text-xs font-bold text-[var(--text-main)] truncate max-w-[150px]">{succ.fullName}</h4>
                      </div>
                      <Link 
                        href={`/leaders/${succ.id}`}
                        className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-white transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white/10 dark:bg-white/5 rounded-xl border border-[var(--border-glass)] text-center text-[10px] text-gray-500">
                    No successors indexed (Active/Unspecified)
                  </div>
                )}
              </div>
            </div>

            {/* Linked historical events */}
            <div className="glass-card p-6">
              <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4 flex items-center gap-2 border-b border-[var(--border-glass)] pb-2.5">
                <Calendar className="w-4 h-4 text-gold" />
                <span>Connected Events</span>
              </h3>

              {leader.events && leader.events.length > 0 ? (
                <div className="space-y-3.5">
                  {leader.events.map((rel, idx) => (
                    <div key={idx} className="text-xs border-b border-[var(--border-glass)] pb-2.5 last:border-0 last:pb-0">
                      <span className="font-mono text-[9px] text-gold font-bold px-1.5 py-0.5 rounded bg-emerald-950/10 border border-amber-500/10 inline-block uppercase mb-1">
                        {new Date(rel.event.date).getFullYear()} {rel.event.category}
                      </span>
                      <h4 className="font-semibold text-[var(--text-main)] leading-snug line-clamp-1">{rel.event.title}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{rel.event.location}</p>
                      <Link 
                        href={`/events/${rel.event.id}`}
                        className="text-[10px] text-emerald-900 dark:text-emerald-450 font-bold hover:text-gold transition-colors inline-block mt-1"
                      >
                        Explore Event details &rarr;
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  No historical event files associated.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
