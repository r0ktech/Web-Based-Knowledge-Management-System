'use client';

import React, { useState } from 'react';
import AppLayout from '../../components/AppLayout';
import { Image as ImageIcon, Play, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_ITEMS = [
  { id: 'g1', type: 'image', title: 'Abia Government House, Umuahia', category: 'Government Buildings', year: 2023, src: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80' },
  { id: 'g2', type: 'image', title: 'Aba Trade Market Hub - Ariaria', category: 'Economic Centres', year: 2022, src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
  { id: 'g3', type: 'image', title: 'Geometric Power Aba Plant', category: 'Infrastructure', year: 2024, src: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=600&q=80' },
  { id: 'g4', type: 'image', title: 'Arochukwu Long Juju Caves Shrine', category: 'Cultural Heritage', year: 2021, src: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80' },
  { id: 'g5', type: 'image', title: 'Ohafia War Dance Ceremony', category: 'Cultural Heritage', year: 2019, src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80' },
  { id: 'g6', type: 'image', title: 'Osisioma Ngwa Industrial Zone', category: 'Infrastructure', year: 2023, src: 'https://images.unsplash.com/photo-1487785307960-a6c86a50b35f?w=600&q=80' },
  { id: 'g7', type: 'image', title: 'Umuahia Central Library Expansion', category: 'Social Development', year: 2022, src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80' },
  { id: 'g8', type: 'image', title: 'Enyimba FC Stadium, Aba', category: 'Sports Landmarks', year: 2020, src: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=600&q=80' },
  { id: 'g9', type: 'image', title: 'Bende LGA Agricultural Clusters', category: 'Economic Centres', year: 2021, src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80' },
  { id: 'g10', type: 'image', title: 'Alex Otti Inauguration Ceremony', category: 'Government Buildings', year: 2023, src: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600&q=80' },
  { id: 'g11', type: 'image', title: 'Isuikwuato Valley Nature Reserve', category: 'Cultural Heritage', year: 2020, src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { id: 'g12', type: 'image', title: 'Ukwa East Palm Oil Processing Plant', category: 'Infrastructure', year: 2022, src: 'https://images.unsplash.com/photo-1581093588401-fabb7a6fab0a?w=600&q=80' },
];

const CATEGORIES = ['All', 'Government Buildings', 'Infrastructure', 'Cultural Heritage', 'Economic Centres', 'Social Development', 'Sports Landmarks'];

export default function GalleryPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = GALLERY_ITEMS.filter(item => {
    const matchSearch = search ? item.title.toLowerCase().includes(search.toLowerCase()) : true;
    const matchCat = category === 'All' ? true : item.category === category;
    return matchSearch && matchCat;
  });

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () => setLightboxIndex(i => i !== null ? Math.max(0, i - 1) : null);
  const nextImage = () => setLightboxIndex(i => i !== null ? Math.min(filtered.length - 1, i + 1) : null);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[var(--border-glass)] pb-4">
          <h1 className="font-cinzel text-xl md:text-3xl font-bold tracking-tight text-[var(--text-main)]">Media Gallery</h1>
          <p className="text-xs text-[var(--text-muted)]">Visual archive of landmarks, ceremonies, officials, cultural events, and state infrastructure progress.</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search gallery..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-2 w-full text-xs bg-white/40 dark:bg-emerald-950/20 border border-[var(--border-glass)] outline-none rounded-xl focus:border-gold text-[var(--text-main)]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${category === c ? 'bg-emerald-950 text-white border-emerald-800' : 'bg-white/30 dark:bg-emerald-950/20 text-[var(--text-muted)] border-[var(--border-glass)] hover:text-[var(--text-main)]'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="text-xs text-[var(--text-muted)]">Showing <span className="font-bold text-[var(--text-main)]">{filtered.length}</span> of {GALLERY_ITEMS.length} media items</p>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-[var(--border-glass)] shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <span className="text-[9px] uppercase tracking-wider font-bold text-gold">{item.category}</span>
                <p className="text-white text-xs font-semibold line-clamp-2 mt-0.5">{item.title}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{item.year}</p>
              </div>
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                    <Play className="w-5 h-5 text-gold fill-gold" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 glass-card">
            <ImageIcon className="w-12 h-12 text-gold mx-auto mb-3" />
            <h3 className="font-cinzel font-bold text-[var(--text-main)]">No Media Found</h3>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          <button onClick={e => { e.stopPropagation(); prevImage(); }} disabled={lightboxIndex === 0} className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={e => { e.stopPropagation(); nextImage(); }} disabled={lightboxIndex === filtered.length - 1} className="absolute right-12 md:right-16 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30">
            <ChevronRight className="w-6 h-6" />
          </button>

          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={filtered[lightboxIndex].src} alt={filtered[lightboxIndex].title} className="w-full max-h-[75vh] object-contain rounded-xl" />
            <div className="text-center mt-4">
              <span className="text-[9px] uppercase tracking-wider font-bold text-gold">{filtered[lightboxIndex].category}</span>
              <p className="text-white font-cinzel font-bold text-base mt-1">{filtered[lightboxIndex].title}</p>
              <p className="text-white/50 text-xs mt-0.5">{filtered[lightboxIndex].year}</p>
              <p className="text-white/40 text-[10px] mt-2">{lightboxIndex + 1} / {filtered.length}</p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
