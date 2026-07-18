/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Folder, 
  Search, 
  Trash2, 
  Copy, 
  Download, 
  Minimize2, 
  FileCheck, 
  Image as ImageIcon, 
  FileText, 
  Volume2, 
  SlidersHorizontal,
  Layers,
  Database,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio';
  url: string;
  sizeMb: number;
  dimensions?: string;
  created_at: string;
  usageContext: string;
}

interface MediaManagerProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  actingRole: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({ 
  onAddAuditLog, 
  showToast,
  actingRole 
}) => {
  // Mock asset library seed
  const [mediaList, setMediaList] = useState<MediaFile[]>([
    {
      id: 'media-1',
      name: 'olive_ridley_nest_swargadwar.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1591025215502-27f27a6c9d90?auto=format&fit=crop&q=80&w=600',
      sizeMb: 4.2,
      dimensions: '4032 x 3024',
      created_at: '2026-07-02T10:30:00Z',
      usageContext: 'Report ID rep-1 cover'
    },
    {
      id: 'media-2',
      name: 'seagull_entanglement_cleared.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=600',
      sizeMb: 2.8,
      dimensions: '3840 x 2160',
      created_at: '2026-07-15T15:22:00Z',
      usageContext: 'Report ID rep-2 gallery'
    },
    {
      id: 'media-3',
      name: 'stray_puppy_litter_rehab.jpg',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600',
      sizeMb: 3.5,
      dimensions: '3200 x 2400',
      created_at: '2026-07-16T11:05:00Z',
      usageContext: 'Report ID rep-3 cover'
    },
    {
      id: 'media-4',
      name: 'donation_contribution_receipt.pdf',
      type: 'document',
      url: '#',
      sizeMb: 1.2,
      created_at: '2026-02-10T09:00:00Z',
      usageContext: 'Donor receipt automation template'
    },
    {
      id: 'media-5',
      name: 'coastal_forest_ranger_siren.mp3',
      type: 'audio',
      url: '#',
      sizeMb: 0.9,
      created_at: '2026-05-18T14:40:00Z',
      usageContext: 'Disaster warning sound alert'
    }
  ]);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'document' | 'audio'>('all');

  const filteredMedia = mediaList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.usageContext.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Storage telemetry calculation
  const totalUsedMb = mediaList.reduce((sum, m) => sum + m.sizeMb, 0);
  const totalUsedGb = totalUsedMb / 1024;

  // Actions
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showToast('Secure CDN asset URL copied to clipboard.', 'success');
  };

  const handlePurge = (id: string, name: string) => {
    setMediaList(mediaList.filter(m => m.id !== id));
    onAddAuditLog('Purge Media Asset', name);
    showToast(`Asset "${name}" purged permanently from community CDN server.`, 'info');
  };

  // Image Compression Simulation (reducing sizing dynamically)
  const handleCompress = (id: string) => {
    setMediaList(mediaList.map(m => {
      if (m.id === id) {
        const compressedSize = parseFloat((m.sizeMb * 0.15).toFixed(2));
        onAddAuditLog('Compress Media Asset', m.name, `${m.sizeMb}MB`, `${compressedSize}MB`);
        return {
          ...m,
          sizeMb: compressedSize,
          dimensions: m.dimensions ? '1920 x 1440 (Resized)' : undefined
        };
      }
      return m;
    }));
    showToast(`Image compressed using smart WebP heuristics. Storage optimized!`, 'success');
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5 text-emerald-500" />;
      case 'document': return <FileText className="w-5 h-5 text-indigo-500" />;
      case 'audio': return <Volume2 className="w-5 h-5 text-purple-500" />;
      default: return <Folder className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6" id="media-manager-panel">
      {/* Storage quota analytics banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-xs">
          <Database className="w-8 h-8 text-brand-emerald shrink-0 animate-pulse" />
          <div className="flex-grow space-y-1.5 w-full">
            <div className="flex justify-between items-center font-mono text-[10px] text-gray-400">
              <span className="uppercase">CONSOLIDATED CDN CAPACITY USED</span>
              <span className="font-bold text-gray-800 dark:text-slate-200">{(totalUsedMb).toFixed(1)} MB / 20.0 GB Limit (0.06%)</span>
            </div>
            <div className="w-full bg-gray-150 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-brand-emerald h-full transition-all" 
                style={{ width: `${(totalUsedGb / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl text-xs flex flex-col justify-center">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">ASSETS COUNT</span>
          <h4 className="text-xl font-bold font-display text-gray-950 dark:text-white mt-1">{mediaList.length} total objects</h4>
          <span className="text-[10px] text-brand-blue font-semibold mt-1 flex items-center gap-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            0 files in temp quarantine
          </span>
        </div>
      </div>

      {/* Filters and search box */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 flex flex-col md:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search CDN files by name or usage context..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex gap-1.5">
          {(['all', 'image', 'document', 'audio'] as const).map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-xl font-semibold uppercase text-[10px] transition-all ${
                typeFilter === type 
                  ? 'bg-brand-emerald text-white font-bold' 
                  : 'bg-gray-150/70 dark:bg-slate-800 text-gray-500 hover:text-gray-950'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of media objects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMedia.length === 0 ? (
          <div className="col-span-3 text-center text-xs text-gray-400 py-12">
            No media objects matching selection criteria.
          </div>
        ) : (
          filteredMedia.map(file => (
            <div 
              key={file.id} 
              className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 space-y-3 relative shadow-sm flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              {file.type === 'image' ? (
                <img 
                  src={file.url} 
                  alt={file.name} 
                  className="w-full h-32 rounded-xl object-cover border border-gray-100 dark:border-slate-850"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 dark:bg-slate-800/40 border border-gray-200/20 rounded-xl flex items-center justify-center">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* Media Info */}
              <div className="space-y-1.5">
                <div className="flex items-start justify-between">
                  <h5 className="font-semibold text-gray-950 dark:text-white truncate max-w-[180px]" title={file.name}>
                    {file.name}
                  </h5>
                  <span className="font-mono text-[9px] font-bold text-brand-emerald bg-brand-emerald/10 px-1.5 py-0.5 rounded shrink-0">
                    {file.sizeMb} MB
                  </span>
                </div>

                <div className="font-mono text-[10px] text-gray-400 space-y-0.5">
                  {file.dimensions && <p>Dimensions: {file.dimensions}</p>}
                  <p className="truncate">Usage: {file.usageContext}</p>
                  <p>Uploaded: {new Date(file.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Media Operations footer */}
              <div className="flex gap-1.5 pt-2 border-t border-gray-100 dark:border-slate-850">
                <button
                  onClick={() => handleCopyLink(file.url)}
                  className="flex-1 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 rounded-lg text-[10px] font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-1"
                  title="Copy CDN secure reference link"
                >
                  <Copy className="w-3 h-3" />
                  CDN Link
                </button>

                {file.type === 'image' && file.sizeMb > 0.8 && (
                  <button
                    onClick={() => handleCompress(file.id)}
                    className="py-1.5 px-2 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    title="Run lossless WebP conversion & reduce size"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                    Compress
                  </button>
                )}

                <button
                  onClick={() => handlePurge(file.id, file.name)}
                  className="p-1.5 bg-rose-50/10 hover:bg-rose-50/20 text-rose-600 border border-rose-200/10 rounded-lg transition-all"
                  title="Purge asset"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
