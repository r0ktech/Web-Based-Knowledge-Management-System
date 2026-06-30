'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users, FileText, Calendar, ShieldAlert, Database,
  CheckCircle, Clock, Trash2, Edit,
  BarChart3, Search
} from 'lucide-react';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMINISTRATOR', 'HISTORIAN', 'EDITOR'];

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const MOCK_USERS: UserRecord[] = [
  { id: 'u1', name: 'Super Admin', email: 'superadmin@abia.gov.ng', role: 'SUPER_ADMIN', createdAt: '2026-01-01' },
  { id: 'u2', name: 'Alhaji Victor Kalu', email: 'admin@abia.gov.ng', role: 'ADMINISTRATOR', createdAt: '2026-01-02' },
  { id: 'u3', name: 'Dr. Chinwe Mba', email: 'historian@abia.gov.ng', role: 'HISTORIAN', createdAt: '2026-01-03' },
  { id: 'u4', name: 'Prof. Obinna Nwosu', email: 'researcher@abia.gov.ng', role: 'RESEARCHER', createdAt: '2026-01-04' },
  { id: 'u5', name: 'Amara Kanu', email: 'editor@abia.gov.ng', role: 'EDITOR', createdAt: '2026-01-05' },
  { id: 'u6', name: 'Chidi Okereke', email: 'contributor@abia.gov.ng', role: 'CONTRIBUTOR', createdAt: '2026-01-06' },
  { id: 'u7', name: 'Ada Anyanwu', email: 'guest@abia.gov.ng', role: 'GUEST', createdAt: '2026-01-07' },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-400 border-rose-500/20',
  ADMINISTRATOR: 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-400 border-purple-500/20',
  HISTORIAN: 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border-blue-500/20',
  RESEARCHER: 'bg-teal-100 dark:bg-teal-950/30 text-teal-800 dark:text-teal-400 border-teal-500/20',
  EDITOR: 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border-amber-500/20',
  CONTRIBUTOR: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border-emerald-500/20',
  GUEST: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border-gray-500/20',
};

const QUICK_LINKS = [
  { label: 'Add New Leader', desc: 'Register a political biography', href: '/leaders', icon: Users },
  { label: 'Catalog Event', desc: 'Add historical development', href: '/events', icon: Calendar },
  { label: 'Upload Document', desc: 'Submit archive record', href: '/documents', icon: FileText },
  { label: 'View Audit Trail', desc: 'Monitor system activity', href: '/admin/audit', icon: ShieldAlert },
  { label: 'Analytics Report', desc: 'Export CSV data report', href: '/analytics', icon: BarChart3 },
  { label: 'Interactive Map', desc: 'Browse geography atlas', href: '/map', icon: Database },
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRecord[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');
  const [successMsg, setSuccessMsg] = useState('');

  // Guard: Redirect if not admin
  useEffect(() => {
    if (user && !ADMIN_ROLES.includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = (id: string) => {
    if (confirm('Delete this user account? This action cannot be undone.')) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setSuccessMsg('User removed from local registry.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return (
      <AppLayout>
        <div className="text-center py-20 glass-card">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-4" />
          <h2 className="font-cinzel text-xl font-bold text-[var(--text-main)]">Restricted Access</h2>
          <p className="text-xs text-[var(--text-muted)] mt-2">You do not have permission to access the Admin Console.</p>
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
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Admin Console</h1>
            <p className="text-xs text-[var(--text-muted)]">System configuration, user management, and operations control center. Role: <span className="text-gold font-bold">{user.role}</span></p>
          </div>
          <Link href="/admin/audit" className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-glass)] bg-white/20 hover:bg-emerald-950/5 flex items-center gap-1.5 transition-colors text-[var(--text-main)]">
            <ShieldAlert className="w-4 h-4 text-gold" /> View Audit Trail
          </Link>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 text-xs rounded-xl flex items-center gap-2 border border-emerald-500/20">
            <CheckCircle className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-[var(--border-glass)] pb-1">
          {[['overview', 'System Overview'], ['users', 'User Management']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'overview' | 'users')}
              className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition-all ${activeTab === tab ? 'bg-emerald-950 text-white border-b-2 border-gold' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions Grid */}
            <div>
              <h2 className="font-cinzel text-base font-bold text-[var(--text-main)] mb-4">Quick Administrative Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {QUICK_LINKS.map((link, idx) => (
                  <Link
                    key={idx}
                    href={link.href}
                    className="glass-card p-5 hover:border-gold/30 flex items-start gap-4 group transition-all"
                  >
                    <div className="p-3 bg-emerald-950/10 text-gold rounded-xl border border-[var(--border-glass)] transition-transform group-hover:scale-110">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-[var(--text-main)]">{link.label}</h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Status Indicators */}
            <div className="glass-card p-6">
              <h2 className="font-cinzel text-base font-bold text-[var(--text-main)] mb-4">System Health</h2>
              <div className="space-y-3">
                {[
                  { label: 'Database Connectivity', status: 'Operational', ok: true },
                  { label: 'Document Server', status: 'Operational', ok: true },
                  { label: 'Authentication Services', status: 'Operational', ok: true },
                  { label: 'Analytics Pipeline', status: 'Operational', ok: true },
                  { label: 'Backup Jobs (Scheduled)', status: 'Scheduled – Next: 02:00', ok: true },
                  { label: 'Pending Document Reviews', status: `42 documents awaiting approval`, ok: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[var(--border-glass)] last:border-0 text-xs">
                    <span className="text-[var(--text-main)] font-medium">{item.label}</span>
                    <span className={`flex items-center gap-1.5 font-semibold ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {item.ok ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search users by name, email, or role..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]" />
              </div>
              <span className="text-xs text-[var(--text-muted)]">{filteredUsers.length} users</span>
            </div>

            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-emerald-950/5 dark:bg-emerald-950/20">
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Joined</th>
                      <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-glass)]">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-emerald-950/5 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-950/20 flex items-center justify-center border border-[var(--border-glass)] overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${u.name}`} alt="" className="w-full h-full" />
                            </div>
                            <span className="font-semibold text-[var(--text-main)]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-[var(--text-muted)]">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.GUEST}`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-[var(--text-muted)]">
                          {new Date(u.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-950/10 transition-colors border border-[var(--border-glass)]">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {user.role === 'SUPER_ADMIN' && u.role !== 'SUPER_ADMIN' && (
                              <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-950/10 transition-colors border border-[var(--border-glass)]">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
