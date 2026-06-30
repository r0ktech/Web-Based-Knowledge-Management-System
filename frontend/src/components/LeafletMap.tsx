'use client';

import React, { useEffect, useRef } from 'react';
import type { Map as LeafletMapType, Marker as LeafletMarkerType } from 'leaflet';

interface MapEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
}

interface LeafletMapProps {
  events: MapEvent[];
  selectedEventId?: string;
  onMarkerClick: (event: MapEvent) => void;
  getCategoryColor: (category: string) => string;
}

export default function LeafletMap({ events, selectedEventId, onMarkerClick, getCategoryColor }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMapType | null>(null);
  const markersRef = useRef<LeafletMarkerType[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      // initialize map only once
      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = L.map(mapRef.current, {
          center: [5.4, 7.5],
          zoom: 9,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20
        }).addTo(mapInstanceRef.current);
      }

      const currentMap = mapInstanceRef.current;
      if (!currentMap) return;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Add new markers
      events.forEach(ev => {
        const color = getCategoryColor(ev.category);
        const isSelected = ev.id === selectedEventId;

        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width: ${isSelected ? '22px' : '16px'};
            height: ${isSelected ? '22px' : '16px'};
            background-color: ${color};
            border: ${isSelected ? '3px solid #d4af37' : '2px solid white'};
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
            transition: all 0.2s ease;
          "></div>`,
          iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
          iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
        });

        const marker = L.marker([ev.latitude, ev.longitude], { icon })
          .addTo(currentMap)
          .bindPopup(`
            <div style="font-family: system-ui; min-width: 180px;">
              <div style="font-size: 9px; text-transform: uppercase; color: ${color}; font-weight: 700; letter-spacing: 1px;">${ev.category}</div>
              <div style="font-weight: 700; font-size: 13px; margin: 4px 0;">${ev.title}</div>
              <div style="font-size: 11px; color: #666;">${ev.location}</div>
              <div style="font-size: 10px; color: #999; margin-top: 4px;">${new Date(ev.date).getFullYear()}</div>
            </div>
          `, { maxWidth: 260 })
          .on('click', () => onMarkerClick(ev));

        markersRef.current.push(marker);
      });
    });

  }, [events, selectedEventId, getCategoryColor, onMarkerClick]);

  // Pan to selected marker
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedEventId) return;
    const ev = events.find(e => e.id === selectedEventId);
    if (ev) {
      mapInstanceRef.current.setView([ev.latitude, ev.longitude], 12, { animate: true });
    }
  }, [selectedEventId, events]);

  return (
    <div
      ref={mapRef}
      style={{ height: '520px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', zIndex: 0 }}
    />
  );
}
