/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, Copy, Check, ShieldAlert, Sparkles, Server, Info, Search } from 'lucide-react';
import { POSTGRESQL_SCHEMA } from '../data/dbSchema';

export const DeveloperDocsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRESQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schemaLines = POSTGRESQL_SCHEMA.split('\n');
  const filteredSchema = searchQuery
    ? schemaLines
        .filter(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
        .join('\n')
    : POSTGRESQL_SCHEMA;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left" id="dev-docs-root">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/50 dark:border-slate-800/50 pb-6" id="docs-header">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-brand-emerald/10 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full text-xs font-mono font-semibold">
            <Server className="w-3.5 h-3.5" />
            <span>POSTGRESQL / SUPABASE READY</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white">Enterprise Database Architecture</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">Complete, copy-pasteable schema with Row-Level Security, performance indices, and user authentication triggers.</p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-emerald text-white text-xs font-bold shadow-lg shadow-brand-emerald/15 hover:bg-brand-teal transition-all flex-shrink-0"
          id="copy-schema-btn"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 animate-scale" />
              SQL Migration Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy PostgreSQL Migration
            </>
          )}
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="architecture-highlights">
        <div className="glass-card p-5 rounded-2xl border flex items-start gap-3">
          <ShieldAlert className="w-10 h-10 text-brand-emerald bg-brand-emerald/10 p-2.5 rounded-xl flex-shrink-0" />
          <div className="space-y-1 text-left">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Row Level Security (RLS)</h4>
            <p className="text-xs text-gray-400 dark:text-slate-400">Restricts read/write access. Users can only modify their own reports, donation logs, or profiles. Rescue officers can update alerts.</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex items-start gap-3">
          <Database className="w-10 h-10 text-brand-blue bg-brand-blue/10 p-2.5 rounded-xl flex-shrink-0" />
          <div className="space-y-1 text-left">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Performant Indexes</h4>
            <p className="text-xs text-gray-400 dark:text-slate-400">B-Tree and Trigram query index structures applied to categories, user keys, coordinates, and unread notification queries.</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border flex items-start gap-3">
          <Sparkles className="w-10 h-10 text-brand-amber bg-brand-amber/10 p-2.5 rounded-xl flex-shrink-0" />
          <div className="space-y-1 text-left">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white">Automated Triggers</h4>
            <p className="text-xs text-gray-400 dark:text-slate-400">Includes plpgsql callbacks to sync user profile metadata on signup and keep 'updated_at' audit records fully synced.</p>
          </div>
        </div>
      </div>

      {/* Live Search SQL */}
      <div className="space-y-4" id="sql-terminal-section">
        <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-2xl p-3">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input 
            type="text" 
            placeholder="Search tables, indices, triggers or policies... (e.g. profiles, RLS, audit)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs md:text-sm outline-none dark:text-white"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold hover:underline text-gray-400 hover:text-gray-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Code Block Terminal */}
        <div className="rounded-2xl overflow-hidden border border-gray-200/60 dark:border-slate-800/60 shadow-xl bg-slate-950">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-950 flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-1 text-slate-300 font-semibold text-[11px]">puri_migration_schema_v1.sql</span>
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-brand-mint font-bold uppercase">PostgreSQL DDL</span>
          </div>
          
          <div className="p-4 overflow-x-auto max-h-[500px] text-left">
            <pre className="text-[11px] md:text-xs font-mono text-slate-200 leading-relaxed tab-size-4">
              <code>{filteredSchema}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Database Tables Mapping */}
      <div className="space-y-4" id="tables-breakdown">
        <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white">Entity-Relationship Map (ERM)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'profiles', desc: 'Saves user contact data and role status.' },
            { name: 'reports', desc: 'Registers active animal emergencies, locations, severity rating, and dispatches.' },
            { name: 'report_images', desc: 'Maintains zero-to-many attachment URLs per submitted emergency.' },
            { name: 'donations', desc: 'Connects users with secure transparent receipts and contribution logs.' },
            { name: 'forum_threads', desc: 'Manages categories, pin highlights, locked parameters, and upvotes.' },
            { name: 'forum_posts', desc: 'Contains text nodes for forum comments, answers, and solutions.' },
            { name: 'notifications', desc: 'Tracks on-screen messaging prompts (unread counters, bell badges).' },
            { name: 'activity_logs', desc: 'Detailed audit files monitoring platform security, changes, and logs.' }
          ].map((table, i) => (
            <div key={i} className="glass-panel p-4 rounded-xl border text-left space-y-1">
              <p className="font-mono text-xs font-bold text-brand-teal dark:text-brand-mint">tbl.{table.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-300 leading-relaxed">{table.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
