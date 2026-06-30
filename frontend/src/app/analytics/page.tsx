'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import axios from 'axios';
import {
  BarChart3, TrendingUp, Users, FileText, Calendar, Download,
  RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid,
  PolarAngleAxis, Radar
} from 'recharts';

const COLORS = ['#0b3d20', '#b58920', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const MOCK_DATA = {
  totals: { leaders: 100, events: 300, documents: 1000, users: 100, pendingDocs: 42, approvedDocs: 958 },
  partyDistribution: [
    { name: 'PDP', value: 34 }, { name: 'LP', value: 12 }, { name: 'APC', value: 20 },
    { name: 'APGA', value: 18 }, { name: 'Military', value: 16 }
  ],
  categoryDistribution: [
    { name: 'Political', value: 120 }, { name: 'Infrastructure', value: 85 },
    { name: 'Cultural', value: 45 }, { name: 'Economic', value: 30 }, { name: 'Social', value: 20 }
  ],
  docCategoryDistribution: [
    { name: 'Gazette', value: 210 }, { name: 'Policy Paper', value: 280 },
    { name: 'Research Paper', value: 185 }, { name: 'Treaty', value: 95 },
    { name: 'Oral History', value: 105 }, { name: 'Newspaper', value: 125 }
  ],
  recentActivities: []
};

const LGA_DISTRIBUTION = [
  { lga: 'Aba North', leaders: 8 }, { lga: 'Umuahia North', leaders: 12 },
  { lga: 'Obi Ngwa', leaders: 9 }, { lga: 'Bende', leaders: 7 },
  { lga: 'Arochukwu', leaders: 6 }, { lga: 'Ohafia', leaders: 5 },
  { lga: 'Ikwuano', leaders: 4 }, { lga: 'Aba South', leaders: 11 }
];

const GOVERNANCE_RADAR = [
  { subject: 'Infrastructure', A: 78 }, { subject: 'Healthcare', A: 55 },
  { subject: 'Education', A: 68 }, { subject: 'Economy', A: 62 },
  { subject: 'Security', A: 48 }, { subject: 'Agriculture', A: 71 }
];

export default function AnalyticsPage() {
  const [data, setData] = useState(MOCK_DATA);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/analytics/summary`);
      setData({ ...MOCK_DATA, ...res.data });
    } catch {
      setData(MOCK_DATA);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className={`glass-card p-5 border-l-4 ${color} flex justify-between items-center`}>
      <div>
        <p className="text-xs text-[var(--text-muted)] font-medium">{title}</p>
        <h2 className="text-2xl font-extrabold text-[var(--text-main)] my-0.5">{value}</h2>
        <p className="text-[10px] text-[var(--text-muted)]">{sub}</p>
      </div>
      <div className="p-3 bg-emerald-950/10 dark:bg-amber-500/5 text-gold rounded-xl border border-[var(--border-glass)]">
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Analytics & Reports</h1>
            <p className="text-xs text-[var(--text-muted)]">Data-driven insights into leadership patterns, historical developments, and archive utilization.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchData} className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--border-glass)] bg-white/20 hover:bg-emerald-950/5 flex items-center gap-1.5 transition-colors text-[var(--text-main)]">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <a href={`${API_URL}/analytics/export-csv`} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 shadow flex items-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> Export Report CSV
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard title="Leaders" value={data.totals.leaders} sub="Indexed profiles" icon={Users} color="border-l-emerald-600" />
          <StatCard title="Events" value={data.totals.events} sub="Historical records" icon={Calendar} color="border-l-blue-600" />
          <StatCard title="Documents" value={data.totals.documents} sub="Total archives" icon={FileText} color="border-l-amber-500" />
          <StatCard title="Approved" value={data.totals.approvedDocs} sub="Verified files" icon={BarChart3} color="border-l-teal-500" />
          <StatCard title="Pending" value={data.totals.pendingDocs} sub="Awaiting review" icon={TrendingUp} color="border-l-orange-500" />
          <StatCard title="Users" value={data.totals.users} sub="Registered accounts" icon={Users} color="border-l-purple-500" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Party Bar Chart */}
          <div className="glass-card p-6">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Leadership by Political Party</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.partyDistribution} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.partyDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Event Categories Pie */}
          <div className="glass-card p-6">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Event Categories Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.categoryDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                    {data.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LGA Distribution Bar */}
          <div className="glass-card p-6">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Leaders by LGA Origin</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LGA_DISTRIBUTION} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" stroke="#888" fontSize={10} tickLine={false} />
                  <YAxis type="category" dataKey="lga" stroke="#888" fontSize={10} tickLine={false} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="leaders" fill="#b58920" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Governance Radar */}
          <div className="glass-card p-6">
            <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">State Development Sector Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={GOVERNANCE_RADAR}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" stroke="#888" fontSize={11} />
                  <Radar name="Performance" dataKey="A" stroke="#b58920" fill="#b58920" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Document Category Distribution */}
        <div className="glass-card p-6">
          <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] mb-4">Archive Document Categories</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.docCategoryDistribution} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0b3d20" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#0b3d20" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-glass)', borderRadius: '8px', fontSize: '11px' }} />
                <Area type="monotone" dataKey="value" stroke="#b58920" strokeWidth={2.5} fill="url(#colorDocs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
