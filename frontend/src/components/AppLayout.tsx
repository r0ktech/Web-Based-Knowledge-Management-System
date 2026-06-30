'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Clock, FileText, Map, Image, 
  BarChart3, Settings, ShieldAlert, LogOut, Sun, Moon, 
  Menu, X, Landmark, Search, User
} from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Leadership Registry', path: '/leaders', icon: Users, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Historical Timeline', path: '/timeline', icon: Clock, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Archive & Repository', path: '/documents', icon: FileText, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Interactive Map', path: '/map', icon: Map, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Media Gallery', path: '/gallery', icon: Image, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Analytics & Reports', path: '/analytics', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'RESEARCHER', 'HISTORIAN', 'EDITOR', 'CONTRIBUTOR', 'GUEST'] },
    { name: 'Admin Console', path: '/admin', icon: Settings, roles: ['SUPER_ADMIN', 'ADMINISTRATOR', 'EDITOR', 'HISTORIAN'] },
    { name: 'Audit Trail', path: '/admin/audit', icon: ShieldAlert, roles: ['SUPER_ADMIN', 'ADMINISTRATOR'] }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return item.roles.includes('GUEST');
    return item.roles.includes(user.role);
  });

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile Top navbar */}
      <header className="md:hidden w-full glass-effect sticky top-0 z-50 flex items-center justify-between px-4 py-3 text-[var(--text-main)]">
        <div className="flex items-center gap-2">
          <Landmark className="w-6 h-6 text-gold" />
          <span className="font-cinzel font-bold text-xs tracking-wider">ABIA STATE KMS</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-1.5 rounded-full hover:bg-[rgba(0,0,0,0.1)] transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-emerald-800" />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 px-2 rounded border border-gray-400 bg-white/20"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Layout */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-effect border-r border-[var(--border-glass)]
        transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Crest Brand Section */}
        <div className="p-6 border-b border-[var(--border-glass)] flex items-center gap-3">
          <div className="p-2 bg-emerald-950 rounded-lg flex items-center justify-center">
            <Landmark className="w-8 h-8 text-gold" />
          </div>
          <div>
            <h1 className="font-cinzel text-sm lg:text-base font-bold tracking-tight text-[var(--text-main)]">ABIA STATE</h1>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gold text-left">Digital Archive</p>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-4 my-3 glass-card bg-emerald-950/10 dark:bg-amber-500/5 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-gold overflow-hidden bg-emerald-950/20 flex items-center justify-center">
              {user.profile?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-gold" />
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold truncate text-[var(--text-main)]">{user.name}</h4>
              <span className="text-[9px] uppercase tracking-wider text-gold px-1.5 py-0.5 rounded bg-emerald-900/20 border border-emerald-905/35 inline-block font-mono">
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Links Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 dark:from-emerald-900 dark:to-emerald-820 text-white shadow-md' 
                    : 'text-[var(--text-muted)] hover:bg-emerald-950/5 dark:hover:bg-white/5 hover:text-[var(--text-main)]'}
                `}
              >
                <item.icon className={`
                  w-5 h-5 transition-transform duration-200 group-hover:scale-110
                  ${isActive ? 'text-gold' : 'text-[var(--text-muted)]'}
                `} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Extra Footer & Signout toggles */}
        <div className="p-4 border-t border-[var(--border-glass)] space-y-2">
          {/* Desktop Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="w-full hidden md:flex items-center justify-between px-4 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-emerald-950/5 dark:hover:bg-white/5 hover:text-[var(--text-main)] transition-colors"
          >
            <span className="flex items-center gap-3">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5" />}
              <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
            </span>
          </button>

          {user ? (
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-medium transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <Link 
              href="/auth" 
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold bg-amber-500 text-slate-900 hover:bg-amber-600 transition-colors shadow"
            >
              <span>Archival Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Workspace Layout */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-full">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
