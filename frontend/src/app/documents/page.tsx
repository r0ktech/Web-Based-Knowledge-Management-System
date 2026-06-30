'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  Search, FileText, ChevronLeft, ChevronRight,
  Download, CheckCircle, Clock, XCircle, Upload,
  AlertCircle, LoaderCircle, File, FileSpreadsheet, FileImage,
  BookOpen
} from 'lucide-react';

const CATEGORIES = ['Gazette', 'Policy Paper', 'Treaty', 'Newspaper Archive', 'Oral History Transcript', 'Research Paper', 'Constitution Draft'];
const FILE_TYPES = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'TXT'];

interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  status: string;
  version: number;
  createdAt: string;
  uploader?: { name: string; role: string };
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string) => {
  switch (fileType.toUpperCase()) {
    case 'PDF': return <File className="w-5 h-5 text-red-500" />;
    case 'XLSX': return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    case 'DOCX': return <BookOpen className="w-5 h-5 text-blue-500" />;
    case 'PPTX': return <FileImage className="w-5 h-5 text-orange-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-3 h-3" />Approved</span>;
    case 'PENDING_APPROVAL':
      return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-500/20"><Clock className="w-3 h-3" />Pending</span>;
    case 'REJECTED':
      return <span className="inline-flex items-center gap-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-500/20"><XCircle className="w-3 h-3" />Rejected</span>;
    default:
      return <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 border border-gray-500/20">Draft</span>;
  }
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [fileType, setFileType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', fileUrl: '', fileType: 'PDF', fileSize: '102400', category: 'Research Paper'
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ search, category, fileType, status, page: page.toString(), limit: '10' });
      const res = await axios.get(`${API_URL}/documents?${params}`);
      setDocuments(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch {
      // Mock fallback
      const mocks: Document[] = [
        { id: 'm1', title: 'Abia State Gazette Vol. 12 – Regional Land Demarcations', description: 'Official gazette covering boundary adjustments across Aba North, Ukwa East and Umuahia.', fileUrl: '/uploads/gazette_12.pdf', fileType: 'PDF', fileSize: 2048000, category: 'Gazette', status: 'APPROVED', version: 2, createdAt: '2023-04-15', uploader: { name: 'Dr. Chinwe Mba', role: 'HISTORIAN' } },
        { id: 'm2', title: 'Enyimba Economic City Master Blueprint', description: 'Strategic governmental blueprint for the Enyimba Economic City spanning three southern LGAs.', fileUrl: '/uploads/eec_master.pdf', fileType: 'PDF', fileSize: 8500000, category: 'Policy Paper', status: 'APPROVED', version: 3, createdAt: '2022-11-01', uploader: { name: 'Prof. Obinna Nwosu', role: 'RESEARCHER' } },
        { id: 'm3', title: 'Abia State Education Reform Policy 2021', description: 'Comprehensive restructuring of primary and secondary school examination boards.', fileUrl: '/uploads/edu_reform.docx', fileType: 'DOCX', fileSize: 512000, category: 'Policy Paper', status: 'APPROVED', version: 1, createdAt: '2021-09-01', uploader: { name: 'Chidi Okereke', role: 'CONTRIBUTOR' } },
        { id: 'm4', title: 'Traditional Rulers Summit Communiqué 2020', description: 'Oral history transcript from the summit of Igwe councils across all 17 LGAs.', fileUrl: '/uploads/trad_summit.pdf', fileType: 'PDF', fileSize: 390000, category: 'Oral History Transcript', status: 'PENDING_APPROVAL', version: 1, createdAt: '2024-02-10', uploader: { name: 'Amara Kanu', role: 'EDITOR' } },
        { id: 'm5', title: 'Revenue Allocation Framework 2024 – XLSX Summary', description: 'Excel spreadsheet of quarterly state revenue inflows and allocation projections.', fileUrl: '/uploads/rev_alloc.xlsx', fileType: 'XLSX', fileSize: 750000, category: 'Policy Paper', status: 'APPROVED', version: 1, createdAt: '2024-01-15', uploader: { name: 'Alhaji Victor Kalu', role: 'ADMINISTRATOR' } },
      ];
      let filtered = mocks;
      if (search) filtered = filtered.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
      if (category) filtered = filtered.filter(d => d.category === category);
      if (fileType) filtered = filtered.filter(d => d.fileType === fileType);
      if (status) filtered = filtered.filter(d => d.status === status);
      setDocuments(filtered);
      setTotal(filtered.length);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, [search, category, fileType, status, page]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_URL}/documents`, formData);
      setShowModal(false);
      fetchDocuments();
    } catch (err: any) {
      if (!err.response) {
        const mock: Document = {
          id: `mock-${Date.now()}`, title: formData.title, description: formData.description,
          fileUrl: formData.fileUrl || '/uploads/new_doc.pdf', fileType: formData.fileType,
          fileSize: parseInt(formData.fileSize), category: formData.category,
          status: 'PENDING_APPROVAL', version: 1, createdAt: new Date().toISOString(),
          uploader: { name: user?.name || 'Current User', role: user?.role || 'CONTRIBUTOR' }
        };
        setDocuments([mock, ...documents]);
        setShowModal(false);
      } else {
        setError(err.response?.data?.message || 'Upload failed');
      }
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Archive & Repository</h1>
            <p className="text-xs text-[var(--text-muted)]">Historical documents, government gazettes, research papers, and official state records.</p>
          </div>
          <div className="flex gap-3">
            <a href={`${API_URL}/analytics/export-csv`} className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[var(--border-glass)] bg-white/20 dark:bg-emerald-950/10 text-[var(--text-main)] hover:bg-emerald-950/5 flex items-center gap-1.5 transition-colors">
              <Download className="w-4 h-4" /> Export Leaders CSV
            </a>
            {user && (
              <button onClick={() => setShowModal(true)} className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-950 text-white hover:bg-emerald-900 border border-emerald-800 shadow flex items-center gap-1.5 transition-colors">
                <Upload className="w-4 h-4" /> Upload Document
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search archives..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]" />
          </div>
          <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]">
            <option value="">All Document Types</option>
            {CATEGORIES.map(c => <option key={c} value={c} className="text-black bg-white">{c}</option>)}
          </select>
          <select value={fileType} onChange={e => { setFileType(e.target.value); setPage(1); }} className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]">
            <option value="">All File Formats</option>
            {FILE_TYPES.map(f => <option key={f} value={f} className="text-black bg-white">.{f}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl text-[var(--text-main)]">
            <option value="">All Approval Statuses</option>
            <option value="APPROVED" className="text-black bg-white">Approved</option>
            <option value="PENDING_APPROVAL" className="text-black bg-white">Pending Review</option>
            <option value="REJECTED" className="text-black bg-white">Rejected</option>
            <option value="DRAFT" className="text-black bg-white">Draft</option>
          </select>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="flex justify-center py-24 text-gold"><LoaderCircle className="w-12 h-12 animate-spin" /></div>
        ) : documents.length === 0 ? (
          <div className="text-center py-16 glass-card">
            <FileText className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="font-cinzel font-bold text-[var(--text-main)]">No Documents Found</h3>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-glass)] bg-emerald-950/5 dark:bg-emerald-950/20">
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Document</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden md:table-cell">Format</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Size</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider hidden lg:table-cell">Uploaded By</th>
                    <th className="text-right px-4 py-3 font-semibold text-[var(--text-muted)] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-glass)]">
                  {documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-emerald-950/5 dark:hover:bg-emerald-950/10 transition-colors">
                      <td className="px-4 py-3.5 max-w-xs">
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.fileType)}
                          <div>
                            <p className="font-semibold text-[var(--text-main)] line-clamp-1">{doc.title}</p>
                            <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">{doc.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell text-[var(--text-muted)]">{doc.category}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="font-mono font-bold text-gold text-[10px] bg-emerald-950/10 px-1.5 py-0.5 rounded border border-emerald-900/10">.{doc.fileType}</span>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-[var(--text-muted)]">{formatFileSize(doc.fileSize)}</td>
                      <td className="px-4 py-3.5">{getStatusBadge(doc.status)}</td>
                      <td className="px-4 py-3.5 hidden lg:table-cell text-[var(--text-muted)]">{doc.uploader?.name || '—'}</td>
                      <td className="px-4 py-3.5 text-right">
                        <a href={doc.fileUrl} download className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 dark:text-emerald-400 hover:text-gold transition-colors border border-emerald-900/20 px-2 py-1 rounded-lg">
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center glass-effect px-4 py-3 rounded-xl">
            <span className="text-xs text-[var(--text-muted)]">Page {page} of {totalPages} ({total} documents)</span>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40"><ChevronLeft className="w-4 h-4 inline" /></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-1 px-2.5 rounded bg-white/45 hover:bg-emerald-950/10 text-xs border border-[var(--border-glass)] disabled:opacity-40"><ChevronRight className="w-4 h-4 inline" /></button>
            </div>
          </div>
        )}

        {/* Upload Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-card bg-[var(--bg-app)] max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
              <h3 className="font-cinzel text-lg font-bold text-[var(--text-main)] border-b border-[var(--border-glass)] pb-3 mb-4">Upload Archive Document</h3>
              {error && <div className="mb-3 p-3 bg-red-100/90 text-red-800 text-xs rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}
              <form onSubmit={handleUpload} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">Document Title</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none" placeholder="e.g. Abia State Gazette Vol. 15" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">Description</label>
                  <textarea rows={3} required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1 text-[var(--text-main)]">File Type</label>
                    <select value={formData.fileType} onChange={e => setFormData({ ...formData, fileType: e.target.value })} className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none">
                      {FILE_TYPES.map(f => <option key={f} value={f}>.{f}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-[var(--text-main)]">File Path / URL</label>
                  <input type="text" value={formData.fileUrl} onChange={e => setFormData({ ...formData, fileUrl: e.target.value })} className="px-3 py-2 w-full border border-[var(--border-glass)] bg-white/50 dark:bg-emerald-950/20 rounded-lg outline-none" placeholder="/uploads/document.pdf" />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-400 bg-white/10 rounded-lg font-bold">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-emerald-950 text-white rounded-lg font-bold shadow border border-emerald-800">Submit for Archive</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
