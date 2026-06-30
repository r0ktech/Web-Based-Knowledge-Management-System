'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { Landmark, Lock, User as UserIcon, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const LGAs = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 
  'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 
  'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 
  'Umuahia North', 'Umuahia South', 'Umunneochi'
];

const ROLES = [
  { value: 'GUEST', label: 'Guest (Read Only)' },
  { value: 'CONTRIBUTOR', label: 'Contributor (Document Uploader)' },
  { value: 'HISTORIAN', label: 'Historian (Create leaders/events)' },
  { value: 'RESEARCHER', label: 'Researcher (Vette documents)' },
  { value: 'ADMINISTRATOR', label: 'Administrator (All controls)' }
];

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('GUEST');
  const [lga, setLga] = useState('Umuahia North');
  
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If user is already logged in, let them redirect
  React.useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password, role, lga);
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-emerald-950/20">
      {/* Background shapes */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-950/10 blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-amber-500/5 blur-3xl"></div>

      <div className="max-w-md w-full space-y-8 glass-card p-8 relative z-10">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-gold transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Homepage
          </Link>
          <div className="mx-auto h-12 w-12 rounded-xl bg-emerald-950 border border-gold flex items-center justify-center shadow">
            <Landmark className="w-6 h-6 text-gold" />
          </div>
          <h2 className="mt-4 text-center font-cinzel text-2xl font-bold text-[var(--text-main)]">
            {isLogin ? 'Sign In to Archive' : 'Open Registration Panel'}
          </h2>
          <p className="mt-1.5 text-center text-xs text-[var(--text-muted)]">
            {isLogin 
              ? 'Enter system credentials to access dashboard modules' 
              : 'Register your account to begin documenting state trajectories'}
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-red-100/80 border border-red-200 text-red-800 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 pr-3 py-2 w-full text-xs md:text-sm bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold transition-colors text-[var(--text-main)]"
                  placeholder="e.g. Dr. Ngozi Okonjo"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">Government Email / Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <span className="text-[10px] font-bold">@</span>
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9 pr-3 py-2 w-full text-xs md:text-sm bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold transition-colors text-[var(--text-main)]"
                placeholder="email@example.com"
              />
            </div>
            {isLogin && (
              <p className="text-[10px] text-left text-[var(--text-muted)] mt-1">
                Tip: test emails contains <code className="bg-black/10 px-1 font-mono">admin@abia.gov.ng</code> (Pass: Password123)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">Secret Passphrase</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-3 py-2 w-full text-xs md:text-sm bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold transition-colors text-[var(--text-main)]"
                placeholder="••••••••"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">State LGA Origin</label>
                <select
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                  className="px-3 py-2 w-full text-xs bg-white/60 dark:bg-emerald-950/30 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
                >
                  {LGAs.map(lgaName => (
                    <option key={lgaName} value={lgaName} className="text-black bg-white">{lgaName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-[var(--text-main)]">Requested Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-3 py-2 w-full text-xs bg-white/60 dark:bg-emerald-950/30 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
                >
                  {ROLES.map(rOpt => (
                    <option key={rOpt.value} value={rOpt.value} className="text-black bg-white">{rOpt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 rounded-xl font-bold bg-emerald-950 dark:bg-emerald-800 text-white hover:bg-emerald-900 transition-colors shadow border border-emerald-800 text-xs tracking-wider uppercase disabled:opacity-50"
          >
            {loading ? 'Processing Auth...' : (isLogin ? 'Validate Credentials' : 'Create Archival Profile')}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[var(--border-glass)]">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-emerald-900 dark:text-emerald-400 hover:text-gold transition-colors"
          >
            {isLogin 
              ? 'Need researcher access? Register here' 
              : 'Already have credentials? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
