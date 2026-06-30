'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Landmark, Search, Users, Calendar, FileText, Map, ArrowRight, 
  BookOpen, Award, Compass, ShieldCheck 
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/leaders?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/leaders');
    }
  };

  const stats = [
    { title: 'Leaders Maintained', count: '100+', desc: 'Governors, Commissioners & Ministers', icon: Users },
    { title: 'Historical Milestones', count: '300+', desc: 'Key political & development events', icon: Calendar },
    { title: 'Archived Documents', count: '1,000+', desc: 'Official gazettes, policies & reports', icon: FileText },
    { title: 'Local Gov Areas', count: '17', desc: 'Full coverage of Abia communities', icon: Map }
  ];

  const quickAccess = [
    { title: 'Leadership Registry', desc: 'Biographies, achievements, and political networks of past and present leaders.', link: '/leaders', color: 'border-emerald-500/20' },
    { title: 'Historical Timeline', desc: 'Chronological explorer mapping the trajectory of Abia State since its creation in 1991.', link: '/timeline', color: 'border-amber-500/20' },
    { title: 'Interactive Map', desc: 'Geo-spatial database tracing leaders birthplaces, governmental works, and event coordinates.', link: '/map', color: 'border-teal-500/20' },
    { title: 'Archive & Repository', desc: 'Public and researcher workspace containing searchable files, papers, and gazettes.', link: '/documents', color: 'border-yellow-500/20' }
  ];

  const milestones = [
    { year: '1991', title: 'State Creation Under Military Decree', desc: 'Abia State was carved out of old Imo State under the administration of General Ibrahim Babangida. Umuahia was declared the state capital, and Group Captain Frank Ajobena took office as the first Military Administrator.' },
    { year: '1999', title: 'Transition to Democratic Governance', desc: 'Following years of military rule, Dr. Orji Uzor Kalu was elected Executive Governor, launching the Fourth Republic administration and initiating early infrastructure restoration projects in Aba and Umuahia.' },
    { year: '2023', title: 'Power Shift and Multi-Party Realignment', desc: 'Dr. Alex Otti emerged victorious as governor under the Labour Party ticket, marking a significant transition in state politics and triggering a modern era of digital governance and civil service reforms.' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-app)]">
      {/* Navigation header */}
      <header className="glass-effect sticky top-0 z-50 border-b border-[var(--border-glass)] w-full py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Landmark className="w-8 h-8 text-gold" />
          <div>
            <h1 className="font-cinzel text-sm md:text-lg font-bold tracking-tight text-[var(--text-main)]">ABIA STATE GOVERNMENT</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gold">Historical Knowledge Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium hover:text-gold transition-colors text-[var(--text-main)]">
            Explore Registry
          </Link>
          <Link href="/auth" className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 transition-colors shadow">
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-28 px-6 md:px-12 text-center max-w-5xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-effect text-xs text-gold border border-emerald-900/10 mb-6 font-medium animate-pulse">
          <Award className="w-4 h-4" /> Official Abia State Leadership & Political Archive
        </div>
        
        <h1 className="font-cinzel text-3xl md:text-6xl font-bold tracking-tight leading-tight text-[var(--text-main)] mb-6">
          Documenting Leadership Trajectories & <span className="text-gold">Historical Developments</span>
        </h1>
        
        <p className="text-base md:text-lg text-[var(--text-muted)] max-w-2xl mb-8 leading-relaxed">
          Preserving the history of God&apos;s Own State. Tracing governance trajectories, military administrators, executive governors, legislative events, and local achievements from 1991 to the present.
        </p>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-2xl glass-card p-2 rounded-2xl flex items-center gap-2 mb-12">
          <div className="flex-1 flex items-center gap-3 px-3">
            <Search className="w-5 h-5 text-[var(--text-muted)]" />
            <input 
              type="text" 
              placeholder="Search leaders (e.g. Alex Otti), political parties, events, or LGAs..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-main)] placeholder-gray-400"
            />
          </div>
          <button 
            type="submit" 
            className="px-6 py-3 rounded-xl font-bold text-white bg-emerald-950 hover:bg-emerald-900 transition-all text-xs tracking-wider uppercase flex items-center gap-2 border border-emerald-800"
          >
            <span>Search</span>
            <ArrowRight className="w-4 h-4 text-gold" />
          </button>
        </form>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-left">
          {quickAccess.map((card, idx) => (
            <Link 
              key={idx} 
              href={card.link}
              className={`glass-card p-6 border-l-4 ${card.color} hover:translate-y-[-4px] hover:shadow-xl transition-all cursor-pointer`}
            >
              <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-2">{card.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="bg-emerald-950 text-white w-full py-16 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.06),transparent)]"></div>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {stats.map((stat, idx) => (
            <div key={idx} className="text-center md:text-left flex flex-col items-center md:items-start">
              <div className="p-3 bg-emerald-900/60 rounded-xl mb-4 text-gold border border-emerald-800">
                <stat.icon className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gold tracking-tight mb-1">{stat.count}</h2>
              <h4 className="text-sm font-semibold mb-1">{stat.title}</h4>
              <p className="text-xs text-emerald-250/70">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline preview widget */}
      <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="font-cinzel text-2xl md:text-4xl font-bold text-[var(--text-main)] mb-3">Chronological Abia History</h2>
          <p className="text-sm text-[var(--text-muted)] max-w-lg mx-auto">Explore three defining milestones that shaped the administration and state divisions of Abia State.</p>
        </div>

        <div className="relative border-l border-emerald-900/20 dark:border-emerald-600/30 pl-6 md:pl-8 space-y-12">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <div className="absolute top-1.5 -left-[31px] md:-left-[39px] w-4 h-4 rounded-full bg-gold border-2 border-emerald-950 flex items-center justify-center transition-transform duration-300 group-hover:scale-125"></div>
              
              <span className="text-xs font-mono font-bold text-gold bg-emerald-950/10 px-2 py-0.5 rounded border border-amber-500/10 uppercase tracking-widest">{m.year}</span>
              <h3 className="font-cinzel text-lg font-bold text-[var(--text-main)] mt-2 mb-2">{m.title}</h3>
              <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed max-w-3xl">{m.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/timeline" className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-900 dark:text-emerald-400 hover:text-gold transition-colors">
            <span>Explore All 300+ Milestones</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="bg-emerald-950/5 py-20 px-6 md:px-12 w-full border-t border-[var(--border-glass)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-2xl md:text-4xl font-bold text-[var(--text-main)] mb-3">System Objectives</h2>
            <p className="text-sm text-[var(--text-muted)]">Built to provide historians and administrators with tools to track, map, and document state assets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8">
              <BookOpen className="w-8 h-8 text-gold mb-6" />
              <h3 className="font-cinzel text-base font-bold mb-3 text-[var(--text-main)]">Preservation</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">Digital safeguards to preserve oral histories, old gazettes, government decrees, and high-resolution leadership profiles.</p>
            </div>
            <div className="glass-card p-8">
              <Compass className="w-8 h-8 text-gold mb-6" />
              <h3 className="font-cinzel text-base font-bold mb-3 text-[var(--text-main)]">Spatial Mapping</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">Plot geographical developments, road network extensions, clinic openings, and origins of commissioners to understand regional growth.</p>
            </div>
            <div className="glass-card p-8">
              <ShieldCheck className="w-8 h-8 text-gold mb-6" />
              <h3 className="font-cinzel text-base font-bold mb-3 text-[var(--text-main)]">Research Trust</h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">Verified audit trails, approval reviews, and role permissions ensuring historical documentation remains accurate, vetted, and immune to tampering.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-250 py-12 px-6 md:px-12 border-t border-emerald-900 border-opacity-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Landmark className="w-6 h-6 text-gold" />
            <p className="text-xs font-cinzel tracking-wider text-white">ABIA STATE DIGITAL ARCHIVES &copy; 2026</p>
          </div>
          <div className="flex gap-6 text-xs text-emerald-350">
            <Link href="/auth" className="hover:text-gold transition-colors">Archival Login</Link>
            <Link href="/dashboard" className="hover:text-gold transition-colors">Explore Dashboard</Link>
            <span className="text-emerald-500">Government Registry System</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
