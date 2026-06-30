'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  Users, Calendar, FileText, ShieldAlert, Plus, 
  MapPin, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

interface Totals {
  leaders: number;
  events: number;
  documents: number;
  users: number;
  pendingDocs: number;
  approvedDocs: number;
}

interface ChartItem {
  name: string;
  value: number;
}

interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user?: { name: string };
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const [totals, setTotals] = useState<Totals>({
    leaders: 100,
    events: 300,
    documents: 1000,
    users: 100,
    pendingDocs: 42,
    approvedDocs: 958
  });
  
  const [partyData, setPartyData] = useState<ChartItem[]>([
    { name: 'PDP', value: 34 },
    { name: 'LP', value: 12 },
    { name: 'APC', value: 20 },
    { name: 'APGA', value: 18 },
    { name: 'Military', value: 16 }
  ]);

  const [categoryData, setCategoryData] = useState<ChartItem[]>([
    { name: 'Political', value: 120 },
    { name: 'Infrastructure', value: 85 },
    { name: 'Cultural', value: 45 },
    { name: 'Economic', value: 30 },
    { name: 'Social', value: 20 }
  ]);

  const [uploadTrend] = useState<{ year: string; uploads: number }[]>([
    { year: '2021', uploads: 120 },
    { year: '2022', uploads: 230 },
    { year: '2023', uploads: 450 },
    { year: '2024', uploads: 680 },
    { year: '2025', uploads: 890 },
    { year: '2026', uploads: 1000 }
  ]);

  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', action: 'LEADER_CREATE', details: 'Added biography details for Dr. Alex Otti', timestamp: new Date().toISOString(), user: { name: 'Alhaji Victor Kalu' } },
    { id: '2', action: 'DOCUMENT_UPLOAD', details: 'Uploaded Abia Gazette Bill 2024 V2', timestamp: new Date(Date.now() - 3600000).toISOString(), user: { name: 'Chidi Okereke' } },
    { id: '3', action: 'EVENT_CREATE', details: 'Created event "Aba Power Project Launch"', timestamp: new Date(Date.now() - 86400000).toISOString(), user: { name: 'Dr. Chinwe Mba' } },
    { id: '4', action: 'DOCUMENT_APPROVE', details: 'Approved document "Enyimba Economic Zones Blueprint"', timestamp: new Date(Date.now() - 172800000).toISOString(), user: { name: 'Super Admin' } }
  ]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/analytics/summary`);
      if (res.data) {
        setTotals(res.data.totals);
        if (res.data.partyDistribution?.length) setPartyData(res.data.partyDistribution);
        if (res.data.categoryDistribution?.length) setCategoryData(res.data.categoryDistribution);
        if (res.data.recentActivities?.length) {
          setActivities(res.data.recentActivities);
        }
      }
    } catch (error) {
      console.warn('API error parsing summaries. Serving placeholder dashboard visual guides.', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [API_URL]);

  const COLORS = ['#0b3d20', '#b58920', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const statsCards = [
    { title: 'Leaders Indexed', count: totals.leaders, icon: Users, sub: 'Governors & legislators', color: 'border-l-teal-600' },
    { title: 'Historical Events', count: totals.events, icon: Calendar, sub: 'Milestones since 1991', color: 'border-l-yellow-600' },
    { title: 'Archived Papers', count: totals.documents, icon: FileText, sub: `Approved: ${totals.approvedDocs}`, color: 'border-l-emerald-600' },
    { title: 'Pending Approval', count: totals.pendingDocs, icon: ShieldAlert, sub: 'Review required', color: 'border-l-rose-500' }
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Banner with header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-6">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">National Archives Dashboard</h1>
            <p className="text-xs text-[var(--text-muted)]">Abia State historical documentation center. Registered account role: <span className="font-bold text-gold uppercase">{user?.role || 'Guest'}</span></p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={fetchStats}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/20 dark:bg-emerald-950/20 text-[var(--text-main)] border border-[var(--border-glass)] hover:bg-emerald-950/5 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4.5 h-4.5" />
              <span>Refresh Metrics</span>
            </button>
            {['SUPER_ADMIN', 'ADMINISTRATOR', 'HISTORIAN'].includes(user?.role || '') && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 transition-colors shadow flex items-center gap-1.5"
              >
                <Plus className="w-4.5 h-4.5" />
                <span>Add Record</span>
              </Link>
            )}
          </div>
        </div>

        {/* Totals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {statsCards.map((card, idx) => (
            <div key={idx} className={`glass-card p-6 border-l-4 ${card.color} flex items-center justify-between`}>
              <div>
                <span className="text-xs text-[var(--text-muted)] font-medium">{card.title}</span>
                <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--text-main)] mt-1 mb-0.5">{card.count}</h2>
                <p className="text-[10px] text-[var(--text-muted)]">{card.sub}</p>
              </div>
              <div className="p-3 bg-emerald-950/10 dark:bg-amber-500/5 text-gold rounded-xl border border-[var(--border-glass)]">
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Party Bar Chart */}
          <div className="glass-card p-6 md:col-span-2">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Leadership Distribution by Political Party</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={partyData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#0b3d20" radius={[4, 4, 0, 0]}>
                    {partyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Categories Pie Chart */}
          <div className="glass-card p-6">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Event Categories Breakdown</h3>
            <div className="h-64 w-full flex flex-col justify-between">
              <div className="flex-1 w-full h-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[10px] mt-2">
                {categoryData.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                    <span className="truncate">{c.name}: {c.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Panel row: logs & timeline trend */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Document Upload Trend (2 cols) */}
          <div className="glass-card p-6 md:col-span-2">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Archive Database Upload velocity</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={uploadTrend}>
                  <defs>
                    <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0b3d20" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0b3d20" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="uploads" stroke="#b58920" strokeWidth={2.5} fillOpacity={1} fill="url(#colorUploads)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Audit Activities */}
          <div className="glass-card p-6 flex flex-col">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Recent Audit Stream</h3>
            <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[250px] pr-2">
              {activities.map((act) => (
                <div key={act.id} className="text-xs border-b border-[var(--border-glass)] pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-950/10 text-emerald-990 border border-emerald-990/10 font-bold">
                      {act.action}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-main)] leading-relaxed mb-0.5">{act.details}</p>
                  {act.user && <span className="text-[9px] text-[var(--text-muted)] font-medium">Actor: {act.user.name}</span>}
                </div>
              ))}
            </div>
            {['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user?.role || '') && (
              <div className="mt-4 pt-3 border-t border-[var(--border-glass)] text-center">
                <Link href="/admin/audit" className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-450 hover:text-gold transition-colors flex items-center justify-center gap-1">
                  <span>Open Full Audit Room</span>
                  <Plus className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Access panel widgets */}
        <div className="glass-card p-6">
          <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Quick Governance Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/leaders" className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 text-center hover:translate-y-[-2px] transition-all flex flex-col items-center">
              <Users className="w-5 h-5 text-gold mb-2" />
              <span className="text-xs font-semibold">Leadership Registry</span>
            </Link>
            <Link href="/timeline" className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 text-center hover:translate-y-[-2px] transition-all flex flex-col items-center">
              <Calendar className="w-5 h-5 text-gold mb-2" />
              <span className="text-xs font-semibold">Chronological History</span>
            </Link>
            <Link href="/map" className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 text-center hover:translate-y-[-2px] transition-all flex flex-col items-center">
              <MapPin className="w-5 h-5 text-gold mb-2" />
              <span className="text-xs font-semibold">Interactive Map</span>
            </Link>
            <Link href="/documents" className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 text-center hover:translate-y-[-2px] transition-all flex flex-col items-center">
              <FileText className="w-5 h-5 text-gold mb-2" />
              <span className="text-xs font-semibold">Central Archives</span>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
