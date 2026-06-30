'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Link from 'next/link';
import { 
  Search, Users, ChevronLeft, ChevronRight, 
  Plus, User, LoaderCircle, AlertCircle
} from 'lucide-react';

const LGAs = [
  'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 
  'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 
  'Ohafia', 'Osisioma Ngwa', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 
  'Umuahia North', 'Umuahia South', 'Umunneochi'
];

const PARTIES = ['PDP', 'APC', 'APGA', 'LP', 'PPA', 'Military', 'NPN', 'SDP'];

interface Leader {
  id: string;
  fullName: string;
  position: string;
  officeHeld: string;
  politicalParty: string;
  startDate: string;
  endDate?: string;
  lga: string;
  status: string;
  photograph?: string;
}

export default function LeadersRegistry() {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search State
  const [search, setSearch] = useState('');
  const [party, setParty] = useState('');
  const [selectedLga, setSelectedLga] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortDir, setSortDir] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Entry Modal
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    officeHeld: '',
    politicalParty: 'LP',
    startDate: '',
    endDate: '',
    lga: 'Umuahia North',
    biography: '',
    achievements: '',
    policies: '',
    status: 'Active'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchLeaders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams({
        search,
        party,
        lga: selectedLga,
        status,
        sortBy,
        sortDir,
        page: page.toString(),
        limit: '9'
      });

      const res = await axios.get(`${API_URL}/leaders?${queryParams.toString()}`);
      if (res.data) {
        setLeaders(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      }
    } catch (err: any) {
      console.warn('API connection failed. Loading local mock leaders catalog.', err);
      // Mock Fallback
      generateMocks();
    } finally {
      setLoading(false);
    }
  };

  const generateMocks = () => {
    // Large list of mock leaders to support testing
    const baseMocks: Leader[] = [
      { id: 'mock-ott', fullName: 'Dr. Alex Otti', position: 'Executive Governor', officeHeld: 'Executive Governor of Abia State', politicalParty: 'LP', startDate: '2023-05-29', lga: 'Isiala Ngwa South', status: 'Active', photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=AlexOtti' },
      { id: 'mock-ikp', fullName: 'Dr. Okezie Ikpeazu', position: 'Executive Governor', officeHeld: 'Executive Governor of Abia State', politicalParty: 'PDP', startDate: '2015-05-29', endDate: '2023-05-29', lga: 'Obi Ngwa', status: 'Past', photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=OkezieIkpeazu' },
      { id: 'mock-tao', fullName: 'Chief Theodore A. Orji', position: 'Executive Governor', officeHeld: 'Executive Governor of Abia State', politicalParty: 'PPA', startDate: '2007-05-29', endDate: '2015-05-29', lga: 'Umuahia North', status: 'Past', photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=TAOrji' },
      { id: 'mock-ouk', fullName: 'Dr. Orji Uzor Kalu', position: 'Executive Governor', officeHeld: 'Executive Governor of Abia State', politicalParty: 'PDP', startDate: '1999-05-29', endDate: '2007-05-29', lga: 'Bende', status: 'Past', photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=OrjiUzorKalu' },
      { id: 'mock-aba', fullName: 'Dr. Enyinnaya Abaribe', position: 'Senator', officeHeld: 'Senator for Abia South', politicalParty: 'APGA', startDate: '2007-06-03', lga: 'Obi Ngwa', status: 'Active', photograph: 'https://api.dicebear.com/7.x/adventurer/svg?seed=EnyinnayaAbaribe' }
    ];

    // Filter mocks locally
    let filtered = baseMocks;
    if (search) {
      filtered = filtered.filter(l => l.fullName.toLowerCase().includes(search.toLowerCase()));
    }
    if (party) {
      filtered = filtered.filter(l => l.politicalParty === party);
    }
    if (selectedLga) {
      filtered = filtered.filter(l => l.lga === selectedLga);
    }
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }

    setLeaders(filtered);
    setTotal(filtered.length);
    setTotalPages(1);
  };

  useEffect(() => {
    fetchLeaders();
  }, [search, party, selectedLga, status, sortBy, sortDir, page]);

  const handleCreateLeader = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      await axios.post(`${API_URL}/leaders`, formData);
      setShowModal(false);
      fetchLeaders();
    } catch (err: any) {
      if (!err.response) {
        // Mock add success visual reaction
        const mockNew: Leader = {
          id: `mock-added-${Date.now()}`,
          fullName: formData.fullName,
          position: formData.position,
          officeHeld: formData.officeHeld || formData.position,
          politicalParty: formData.politicalParty,
          startDate: formData.startDate,
          endDate: formData.endDate || undefined,
          lga: formData.lga,
          status: formData.status,
          photograph: `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.fullName.replace(/\s+/g, '')}`
        };
        setLeaders([mockNew, ...leaders]);
        setShowModal(false);
        return;
      }
      setError(err.response?.data?.message || 'Error occurred creating record');
    }
  };

  const getPartyColor = (party: string) => {
    switch (party.toUpperCase()) {
      case 'PDP': return 'border-t-green-600';
      case 'APC': return 'border-t-blue-600';
      case 'APGA': return 'border-t-yellow-500';
      case 'LP': return 'border-t-red-650';
      case 'MILITARY': return 'border-t-slate-700';
      default: return 'border-t-emerald-800';
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Upper Header strip */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Leadership Trajectories</h1>
            <p className="text-xs text-[var(--text-muted)]">Historical directory and biographical portfolios of political figures.</p>
          </div>
          {['SUPER_ADMIN', 'ADMINISTRATOR', 'HISTORIAN', 'EDITOR'].includes(user?.role || '') && (
            <button
              onClick={() => setShowModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 transition-colors shadow flex items-center gap-1.5"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Register New Leader</span>
            </button>
          )}
        </div>

        {/* Filter Layout */}
        <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]"
            />
          </div>

          {/* Party Dropdown */}
          <select
            value={party}
            onChange={(e) => { setParty(e.target.value); setPage(1); }}
            className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
          >
            <option value="" className="text-black bg-white">All Political Parties</option>
            {PARTIES.map(p => (
              <option key={p} value={p} className="text-black bg-white">{p}</option>
            ))}
          </select>

          {/* LGA Dropdown */}
          <select
            value={selectedLga}
            onChange={(e) => { setSelectedLga(e.target.value); setPage(1); }}
            className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
          >
            <option value="" className="text-black bg-white">All LGAs</option>
            {LGAs.map(lgaName => (
              <option key={lgaName} value={lgaName} className="text-black bg-white">{lgaName}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
          >
            <option value="" className="text-black bg-white">All Term Statuses</option>
            <option value="Active" className="text-black bg-white">Active in Office</option>
            <option value="Past" className="text-black bg-white">Past Leaders</option>
          </select>

          {/* Sorting */}
          <select
            value={`${sortBy}-${sortDir}`}
            onChange={(e) => {
              const [valField, valDir] = e.target.value.split('-');
              setSortBy(valField);
              setSortDir(valDir);
            }}
            className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]"
          >
            <option value="fullName-asc" className="text-black bg-white">Name (A-Z)</option>
            <option value="fullName-desc" className="text-black bg-white">Name (Z-A)</option>
            <option value="startDate-asc" className="text-black bg-white">StartDate (Oldest first)</option>
            <option value="startDate-desc" className="text-black bg-white">StartDate (Newest first)</option>
          </select>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-gold">
            <LoaderCircle className="w-12 h-12 animate-spin" />
          </div>
        ) : leaders.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <Users className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="font-cinzel text-base font-bold text-[var(--text-main)]">No Leaders Found</h3>
            <p className="text-xs text-[var(--text-muted)]">Broaden your search or check alternative spellings / filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((leader) => (
              <div 
                key={leader.id} 
                className={`glass-card overflow-hidden border-t-4 ${getPartyColor(leader.politicalParty)} flex flex-col justify-between`}
              >
                <div className="p-6">
                  {/* Photo area */}
                  <div className="flex gap-4 items-center mb-4">
                    <div className="w-16 h-16 rounded-full border border-gold overflow-hidden bg-emerald-950/15 flex-shrink-0 flex items-center justify-center">
                      {leader.photograph ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={leader.photograph} alt={leader.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gold" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-cinzel font-bold text-sm text-[var(--text-main)] leading-snug line-clamp-1">{leader.fullName}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-gold">{leader.politicalParty} Party</p>
                      <span className="text-[10px] text-gray-400 font-medium">{leader.position}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--text-muted)] border-t border-[var(--border-glass)] pt-3.5">
                    <div className="flex justify-between">
                      <span>Office:</span>
                      <span className="font-semibold text-[var(--text-main)] text-right truncate max-w-[150px]">{leader.officeHeld}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>LGA Origin:</span>
                      <span className="font-semibold text-[var(--text-main)]">{leader.lga} LGA</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenure:</span>
                      <span className="font-semibold text-[var(--text-main)]">
                        {new Date(leader.startDate).getFullYear()} - {leader.endDate ? new Date(leader.endDate).getFullYear() : 'Present'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-emerald-950/5 dark:bg-emerald-950/20 border-t border-[var(--border-glass)] text-center">
                  <Link 
                    href={`/leaders/${leader.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-450 hover:text-gold transition-colors"
                  >
                    <span>View Full Biography Portfolio</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pager controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center bg-white/20 dark:bg-emerald-950/10 border border-[var(--border-glass)] px-4 py-3 rounded-xl">
            <span className="text-xs text-[var(--text-muted)]">Showing page {page} of {totalPages} (Total: {total} records)</span>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4.5 h-4.5 inline" />
              </button>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4.5 h-4.5 inline" />
              </button>
            </div>
          </div>
        )}

        {/* Modal form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--bg-app)] glass-card max-w-xl w-full p-6 relative max-h-[85vh] overflow-y-auto">
              <h3 className="font-cinzel text-lg font-bold text-[var(--text-main)] mb-1 border-b border-[var(--border-glass)] pb-2">Register Leader Portfolio</h3>
              
              {error && (
                <div className="p-3 bg-red-100/90 text-red-800 text-xs rounded-xl flex items-center gap-1.5 my-3">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateLeader} className="mt-4 space-y-3.5 text-xs text-[var(--text-main)]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.fullName} 
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                      placeholder="e.g. Dr. Alex Otti"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Political Party</label>
                    <select
                      value={formData.politicalParty}
                      onChange={(e) => setFormData({...formData, politicalParty: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    >
                      {PARTIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Executive / Legislative Position</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.position} 
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                      placeholder="e.g. Executive Governor"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Office Held (Location / Focus)</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.officeHeld} 
                      onChange={(e) => setFormData({...formData, officeHeld: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                      placeholder="e.g. Governor of Abia State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Start Date (Tenure)</label>
                    <input 
                      type="date" 
                      required 
                      value={formData.startDate} 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">End Date (Optional)</label>
                    <input 
                      type="date" 
                      value={formData.endDate} 
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">LGA representation</label>
                    <select
                      value={formData.lga}
                      onChange={(e) => setFormData({...formData, lga: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    >
                      {LGAs.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Active Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="px-3 py-1.8 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs"
                    >
                      <option value="Active">Active In Office</option>
                      <option value="Past">Past tenure</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Detailed Biography</label>
                  <textarea 
                    rows={3} 
                    required 
                    value={formData.biography} 
                    onChange={(e) => setFormData({...formData, biography: e.target.value})}
                    className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs resize-none"
                    placeholder="Provide full political biography details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1">Major Achievements</label>
                    <textarea 
                      rows={2} 
                      value={formData.achievements} 
                      onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs resize-none"
                      placeholder="e.g. Completed Aba Road projects..."
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Core Policies</label>
                    <textarea 
                      rows={2} 
                      value={formData.policies} 
                      onChange={(e) => setFormData({...formData, policies: e.target.value})}
                      className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none text-xs resize-none"
                      placeholder="e.g. Free education directives..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-glass)]">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-400 bg-white/10 hover:bg-emerald-950/5 rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-white rounded-lg font-bold shadow"
                  >
                    Confirm Register
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
