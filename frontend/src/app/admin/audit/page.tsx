'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../../components/AppLayout';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Search, ChevronLeft, ChevronRight, User, Clock, AlertCircle, LoaderCircle } from 'lucide-react';

interface AuditEntry {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  user?: { name: string; email: string; role: string };
}

const MOCK_LOGS: AuditEntry[] = [
  { id: 'al1', action: 'SYSTEM_INITIALIZATION', details: 'Initialized Abia State KMS database and populated starting seed records.', timestamp: new Date(Date.now() - 7200000).toISOString(), ipAddress: '192.168.1.1', user: { name: 'Super Admin', email: 'superadmin@abia.gov.ng', role: 'SUPER_ADMIN' } },
  { id: 'al2', action: 'USER_LOGIN', details: 'User logged in successfully from administrative console.', timestamp: new Date(Date.now() - 3600000).toISOString(), ipAddress: '192.168.1.15', user: { name: 'Alhaji Victor Kalu', email: 'admin@abia.gov.ng', role: 'ADMINISTRATOR' } },
  { id: 'al3', action: 'LEADER_CREATE', details: 'Added historical biography details for Dr. Alex Otti – Executive Governor starting May 2023.', timestamp: new Date(Date.now() - 1800000).toISOString(), ipAddress: '192.168.1.20', user: { name: 'Dr. Chinwe Mba', email: 'historian@abia.gov.ng', role: 'HISTORIAN' } },
  { id: 'al4', action: 'DOCUMENT_UPLOAD', details: 'Uploaded Abia State Gazette Vol. 12 — Regional Land Demarcations (PDF, 2MB).', timestamp: new Date(Date.now() - 900000).toISOString(), ipAddress: '192.168.1.22', user: { name: 'Prof. Obinna Nwosu', email: 'researcher@abia.gov.ng', role: 'RESEARCHER' } },
  { id: 'al5', action: 'DOCUMENT_APPROVE', details: 'Approved document "Enyimba Economic City Master Blueprint" for public archive access.', timestamp: new Date(Date.now() - 600000).toISOString(), ipAddress: '192.168.1.15', user: { name: 'Amara Kanu', email: 'editor@abia.gov.ng', role: 'EDITOR' } },
  { id: 'al6', action: 'EVENT_CREATE', details: 'Cataloged historical event: Geometric Power Aba Commissioning (Feb 2024, Infrastructure).', timestamp: new Date(Date.now() - 300000).toISOString(), ipAddress: '192.168.1.20', user: { name: 'Dr. Chinwe Mba', email: 'historian@abia.gov.ng', role: 'HISTORIAN' } },
  { id: 'al7', action: 'USER_REGISTER', details: 'New contributor account registered: Ada Anyanwu (guest@abia.gov.ng).', timestamp: new Date(Date.now() - 120000).toISOString(), ipAddress: '192.168.1.100', user: { name: 'Super Admin', email: 'superadmin@abia.gov.ng', role: 'SUPER_ADMIN' } },
  { id: 'al8', action: 'LEADER_UPDATE', details: 'Updated biography details and policy listing for Dr. Okezie Ikpeazu profile (2015–2023).', timestamp: new Date(Date.now() - 60000).toISOString(), ipAddress: '192.168.1.20', user: { name: 'Amara Kanu', email: 'editor@abia.gov.ng', role: 'EDITOR' } },
];

const ACTION_COLORS: Record<string, string> = {
  USER_LOGIN: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-500/20',
  USER_REGISTER: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/20 border-teal-500/20',
  LEADER_CREATE: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20',
  LEADER_UPDATE: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-500/20',
  LEADER_DELETE: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-500/20',
  EVENT_CREATE: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/20 border-purple-500/20',
  DOCUMENT_UPLOAD: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 border-orange-500/20',
  DOCUMENT_APPROVE: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/20',
  DOCUMENT_REJECTED: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-500/20',
  SYSTEM_INITIALIZATION: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-500/20',
};

export default function AuditTrailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditEntry[]>(MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user && !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ search, page: page.toString(), limit: '12' });
        const res = await axios.get(`${API_URL}/audit?${params}`);
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch {
        const filtered = MOCK_LOGS.filter(l =>
          search ? l.action.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()) : true
        );
        setLogs(filtered);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [search, page, API_URL]);

  const getRelativeTime = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!user || !['SUPER_ADMIN', 'ADMINISTRATOR'].includes(user.role)) {
    return (
      <AppLayout>
        <div className="text-center py-20 glass-card">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="font-cinzel text-xl font-bold text-[var(--text-main)]">Restricted Access</h2>
          <p className="text-xs text-[var(--text-muted)] mt-2">Only Administrators can access the Audit Trail.</p>
          <Link href="/dashboard" className="mt-6 inline-block px-4 py-2 bg-emerald-950 text-white text-xs rounded-lg font-bold border border-emerald-800">
            Return to Dashboard
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">System Audit Trail</h1>
            <p className="text-xs text-[var(--text-muted)]">Complete activity log of all database and user operations with IP tracking and actor attribution.</p>
          </div>
          <Link href="/admin" className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-glass)] bg-white/20 hover:bg-emerald-950/5 flex items-center gap-1.5 transition-colors text-[var(--text-main)]">
            ← Admin Console
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by action, details, or user..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]" />
        </div>

        {/* Log Stream */}
        {loading ? (
          <div className="flex justify-center py-20 text-gold"><LoaderCircle className="w-10 h-10 animate-spin" /></div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div key={log.id} className="glass-card p-4 flex flex-col md:flex-row md:items-start gap-4">
                {/* Action Badge */}
                <div className="flex-shrink-0">
                  <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded border inline-block ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600 border-gray-500/20'}`}>
                    {log.action.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text-main)] leading-relaxed">{log.details}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-[var(--text-muted)]">
                    {log.user && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {log.user.name} ({log.user.role})
                      </span>
                    )}
                    {log.ipAddress && (
                      <span className="font-mono">IP: {log.ipAddress}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {getRelativeTime(log.timestamp)}
                    </span>
                    <span className="font-mono text-[9px] text-gray-400">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {logs.length === 0 && (
              <div className="text-center py-12 glass-card">
                <AlertCircle className="w-10 h-10 text-gold mx-auto mb-3" />
                <p className="text-xs text-[var(--text-muted)]">No audit logs match your search query.</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center glass-effect px-4 py-3 rounded-xl">
            <span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40"><ChevronLeft className="w-4 h-4 inline" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40"><ChevronRight className="w-4 h-4 inline" /></button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
