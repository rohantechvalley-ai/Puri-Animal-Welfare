/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Server, 
  RefreshCw, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle, 
  AlertCircle, 
  Terminal, 
  Settings, 
  Play, 
  Check, 
  Copy,
  Info,
  Layers,
  DatabaseZap,
  Cable,
  Activity,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/SupabaseService';

interface TableStatus {
  name: string;
  key: string;
  description: string;
  localCount: number;
  cloudCount: number | null;
  status: 'unchecked' | 'ready' | 'missing' | 'checking' | 'syncing';
}

export const SupabaseSync: React.FC = () => {
  const {
    reports,
    donations,
    campaigns,
    notifications,
    logs,
    categories,
    threads,
    posts,
    flags,
    reputations,
    userBadges,
    showToast
  } = useApp();

  const [config, setConfig] = useState(supabaseService.getConfig());
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [testing, setTesting] = useState(false);
  const [checkingCounts, setCheckingCounts] = useState(false);

  // Form input states
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [serviceRoleKey, setServiceRoleKey] = useState(config.serviceRoleKey);

  // Table status tracker
  const [tables, setTables] = useState<TableStatus[]>([
    { name: 'profiles', key: 'profiles', description: 'Citizen roles, settings, avatars', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'reports', key: 'reports', description: 'Animal & nature emergency alerts', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'donations', key: 'donations', description: 'Charitable fundings & ledger', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'campaigns', key: 'campaigns', description: 'Stray animal & nature welfare projects', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'notifications', key: 'notifications', description: 'System & volunteer alert history', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'activity_logs', key: 'activity_logs', description: 'Security and admin audit logs', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'forum_threads', key: 'forum_threads', description: 'Community discussion boards', localCount: 0, cloudCount: null, status: 'unchecked' },
    { name: 'forum_posts', key: 'forum_posts', description: 'Posts & comments on threads', localCount: 0, cloudCount: null, status: 'unchecked' },
  ]);

  // Sync state data on load
  useEffect(() => {
    updateLocalCounts();
  }, [reports, donations, campaigns, notifications, logs, categories, threads, posts]);

  const updateLocalCounts = () => {
    // Get users from user directories or profile states
    const rawUsers = localStorage.getItem('puri_users') || '[]';
    let userCount = 1; // Default currently logged-in user at least
    try {
      userCount = JSON.parse(rawUsers).length || 1;
    } catch (e) {}

    setTables(prev => prev.map(t => {
      let count = 0;
      switch (t.key) {
        case 'profiles':
          count = userCount;
          break;
        case 'reports':
          count = reports.length;
          break;
        case 'donations':
          count = donations.length;
          break;
        case 'campaigns':
          count = campaigns.length;
          break;
        case 'notifications':
          count = notifications.length;
          break;
        case 'activity_logs':
          count = logs.length;
          break;
        case 'forum_threads':
          count = threads.length;
          break;
        case 'forum_posts':
          count = posts.length;
          break;
      }
      return { ...t, localCount: count };
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await supabaseService.testConnection();
      setTestResult(res);
      if (res.success) {
        showToast('Successfully verified Supabase secure bridge connection.', 'success');
        // Automatically fetch live cloud record counts
        fetchCloudCounts();
      } else {
        showToast('Supabase bridge check failed. Inspect credentials.', 'error');
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    supabaseService.initialize(url, anonKey, serviceRoleKey);
    setConfig(supabaseService.getConfig());
    showToast('Supabase credentials saved. Re-testing bridge connection...', 'info');
    setTimeout(() => {
      handleTestConnection();
    }, 500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset connection parameters back to the system default sandbox credentials?')) {
      supabaseService.resetToDefaults();
      const cfg = supabaseService.getConfig();
      setConfig(cfg);
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setServiceRoleKey(cfg.serviceRoleKey);
      setTestResult(null);
      showToast('Connection params reset to pre-configured keys.', 'info');
    }
  };

  const fetchCloudCounts = async () => {
    const client = supabaseService.getClient();
    if (!client) {
      showToast('Supabase client is not connected.', 'error');
      return;
    }

    setCheckingCounts(true);
    
    // Set tables to checking
    setTables(prev => prev.map(t => ({ ...t, status: 'checking' })));

    for (const t of tables) {
      try {
        const { count, error } = await client
          .from(t.name)
          .select('*', { count: 'exact', head: true });

        setTables(prev => prev.map(item => {
          if (item.key === t.key) {
            if (error) {
              return { 
                ...item, 
                cloudCount: null, 
                status: error.code === 'P0001' || error.message.includes('does not exist') ? 'missing' : 'unchecked' 
              };
            }
            return { 
              ...item, 
              cloudCount: count !== null ? count : 0, 
              status: 'ready' 
            };
          }
          return item;
        }));
      } catch (err) {
        setTables(prev => prev.map(item => {
          if (item.key === t.key) {
            return { ...item, status: 'unchecked' };
          }
          return item;
        }));
      }
    }
    setCheckingCounts(false);
  };

  const syncPushTable = async (tableKey: string) => {
    const target = tables.find(t => t.key === tableKey);
    if (!target) return;

    // Retrieve local array for sync
    let dataToPush: any[] = [];
    switch (target.key) {
      case 'profiles':
        // Generate a mock list of profiles or fetch from localstorage
        const rawUsers = localStorage.getItem('puri_users') || '[]';
        try {
          dataToPush = JSON.parse(rawUsers);
        } catch (e) {}
        // Fallback or add current logged in user
        const loggedInUser = localStorage.getItem('puri_user');
        if (loggedInUser) {
          try {
            const uObj = JSON.parse(loggedInUser);
            if (!dataToPush.find((p: any) => p.id === uObj.id)) {
              dataToPush.push(uObj);
            }
          } catch (e) {}
        }
        break;
      case 'reports':
        dataToPush = reports;
        break;
      case 'donations':
        dataToPush = donations;
        break;
      case 'campaigns':
        dataToPush = campaigns;
        break;
      case 'notifications':
        dataToPush = notifications;
        break;
      case 'activity_logs':
        dataToPush = logs;
        break;
      case 'forum_threads':
        dataToPush = threads;
        break;
      case 'forum_posts':
        dataToPush = posts;
        break;
    }

    if (dataToPush.length === 0) {
      showToast(`No local record payloads to push for table "${target.name}".`, 'info');
      return;
    }

    setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'syncing' } : t));

    try {
      const res = await supabaseService.pushTableData(target.name, dataToPush);
      if (res.success) {
        showToast(`Successfully pushed ${res.upserted} records to Supabase "${target.name}" table.`, 'success');
        // Refresh counts
        setTimeout(() => fetchCloudCounts(), 800);
      } else {
        showToast(`Error pushing data to "${target.name}": ${res.error}`, 'error');
        setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'ready' } : t));
      }
    } catch (err: any) {
      showToast(`Push failed: ${err.message}`, 'error');
      setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'ready' } : t));
    }
  };

  const syncPullTable = async (tableKey: string) => {
    const target = tables.find(t => t.key === tableKey);
    if (!target) return;

    setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'syncing' } : t));

    try {
      const res = await supabaseService.pullTableData(target.name);
      if (res.success && res.data) {
        // Save to appropriate localStorage to update state
        switch (target.key) {
          case 'profiles':
            localStorage.setItem('puri_users', JSON.stringify(res.data));
            break;
          case 'reports':
            localStorage.setItem('puri_reports', JSON.stringify(res.data));
            break;
          case 'donations':
            localStorage.setItem('puri_donations', JSON.stringify(res.data));
            break;
          case 'campaigns':
            localStorage.setItem('puri_campaigns', JSON.stringify(res.data));
            break;
          case 'notifications':
            localStorage.setItem('puri_notifications', JSON.stringify(res.data));
            break;
          case 'activity_logs':
            localStorage.setItem('puri_logs', JSON.stringify(res.data));
            break;
          case 'forum_threads':
            localStorage.setItem('puri_threads', JSON.stringify(res.data));
            break;
          case 'forum_posts':
            localStorage.setItem('puri_forum_posts', JSON.stringify(res.data));
            break;
        }

        showToast(`Pulled ${res.data.length} records into local offline cache for "${target.name}".`, 'success');
        
        // Reload counts
        updateLocalCounts();
        setTimeout(() => fetchCloudCounts(), 800);
      } else {
        showToast(`Pull error: ${res.error}`, 'error');
        setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'ready' } : t));
      }
    } catch (err: any) {
      showToast(`Pull failed: ${err.message}`, 'error');
      setTables(prev => prev.map(t => t.key === tableKey ? { ...t, status: 'ready' } : t));
    }
  };

  const handleSyncAllPush = async () => {
    if (window.confirm('This will upload all offline sandbox data payloads into your Supabase database. Existing matching records will be updated. Proceed?')) {
      for (const t of tables) {
        await syncPushTable(t.key);
      }
    }
  };

  const handleSyncAllPull = async () => {
    if (window.confirm('Pulling all live tables will overwrite local cached records inside your browser. Continue?')) {
      for (const t of tables) {
        await syncPullTable(t.key);
      }
    }
  };

  return (
    <div className="space-y-6" id="supabase-panel">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1 bg-brand-emerald/10 text-brand-teal px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase mb-1">
            <DatabaseZap className="w-3 h-3" />
            Supabase Native Integration
          </div>
          <h2 className="font-display font-extrabold text-2xl text-gray-950 dark:text-white">Supabase Cloud Database Control</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Manage real-time cloud sync, run checkups, configure secrets, and bridge offline states with Postgres.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={fetchCloudCounts}
            disabled={checkingCounts || !config.isConnected}
            className="p-2.5 bg-gray-50 dark:bg-slate-900 border hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${checkingCounts ? 'animate-spin' : ''}`} />
            Refresh Counts
          </button>
        </div>
      </div>

      {/* Cloud Monitor banner */}
      <div className="bg-gradient-to-r from-gray-950 to-slate-900 text-white rounded-3xl p-5 md:p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
              <Database className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black tracking-wide text-sm md:text-base">SUPABASE BRIDGE ENGINE</span>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                  testResult?.success ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${testResult?.success ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                  {testResult?.success ? 'ONLINE & READY' : 'BRIDGING REQUESTED'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate max-w-sm md:max-w-md">{config.url}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
          >
            {testing ? 'Testing Secure Port...' : 'Test Connection Port'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Connection Setup Configuration form */}
        <div className="lg:col-span-5 bg-white/50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850/50 rounded-3xl p-5 space-y-4">
          <div className="border-b pb-3 border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-display font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider">Secure credentials</h3>
              <p className="text-[10px] text-gray-400">Vite client-safe env configurations &amp; service keys.</p>
            </div>
            <button 
              onClick={handleResetDefaults}
              className="text-[10px] font-bold text-brand-teal hover:underline font-mono"
            >
              Reset to default keys
            </button>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400 flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> Supabase URL
              </label>
              <input 
                type="url" 
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                required
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 px-3 outline-none focus:border-brand-emerald dark:text-white font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400 flex items-center gap-1">
                <Cable className="w-3.5 h-3.5" /> Supabase Anon Key (Vite Client)
              </label>
              <textarea 
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJ..."
                required
                rows={3}
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 px-3 outline-none focus:border-brand-emerald dark:text-white font-mono text-[10px] leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5" /> Service Role Private Secret (Service-by-Service Bypass)
              </label>
              <textarea 
                value={serviceRoleKey}
                onChange={e => setServiceRoleKey(e.target.value)}
                placeholder="eyJ..."
                rows={3}
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 px-3 outline-none focus:border-brand-emerald dark:text-white font-mono text-[10px] leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl font-bold shadow-md shadow-brand-emerald/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Settings className="w-4 h-4 animate-spin-slow" />
              Save Connection Settings
            </button>
          </form>

          {/* Test results readout console */}
          {testResult && (
            <div className={`p-4 rounded-2xl border flex items-start gap-2.5 text-xs ${
              testResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/15 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/15 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300'
            }`}>
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{testResult.success ? 'Secure Bridge Connected' : 'Bridge Error Alert'}</p>
                <p className="text-[11px] leading-relaxed opacity-90">{testResult.message}</p>
                {testResult.latencyMs && (
                  <p className="text-[10px] font-mono text-gray-400 mt-1">Round-trip connection latency: <span className="font-bold text-emerald-500">{testResult.latencyMs}ms</span></p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Database synchronizer and live tables */}
        <div className="lg:col-span-7 bg-white/50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850/50 rounded-3xl p-5 space-y-4">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 border-gray-100 dark:border-slate-800">
            <div>
              <h3 className="font-display font-extrabold text-xs text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-emerald" /> Cloud Schema Tables
              </h3>
              <p className="text-[10px] text-gray-400">Audit matching row counts, push records, or pull backups.</p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleSyncAllPush}
                disabled={!config.isConnected}
                className="px-2.5 py-1.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Push All Tables
              </button>
              <button
                onClick={handleSyncAllPull}
                disabled={!config.isConnected}
                className="px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1 disabled:opacity-40"
              >
                <DownloadCloud className="w-3.5 h-3.5" />
                Pull All Tables
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-850 text-gray-400 font-mono uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 font-semibold">Table Identifier</th>
                  <th className="py-2.5 font-semibold">Local Count</th>
                  <th className="py-2.5 font-semibold">Cloud Count</th>
                  <th className="py-2.5 font-semibold text-right">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/50 dark:divide-slate-850/50">
                {tables.map(t => (
                  <tr key={t.key} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-gray-950 dark:text-white uppercase text-[11px] flex items-center gap-1">
                          <Terminal className="w-3 h-3 text-brand-teal" /> {t.name}
                        </span>
                        <p className="text-[10px] text-gray-400 max-w-[200px] truncate leading-none">{t.description}</p>
                      </div>
                    </td>
                    
                    {/* Local cache size */}
                    <td className="py-3">
                      <span className="font-mono font-bold bg-gray-50 dark:bg-slate-800 border px-1.5 py-0.5 rounded text-gray-700 dark:text-slate-300">
                        {t.localCount} records
                      </span>
                    </td>

                    {/* Supabase remote table size */}
                    <td className="py-3">
                      {t.status === 'checking' ? (
                        <span className="text-[10px] text-gray-400 font-mono animate-pulse">Querying...</span>
                      ) : t.status === 'syncing' ? (
                        <span className="text-[10px] text-brand-teal font-mono animate-pulse">Syncing...</span>
                      ) : t.status === 'missing' ? (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/5 border border-red-500/10 px-1.5 py-0.5 rounded">
                          TABLE MISSING
                        </span>
                      ) : t.cloudCount !== null ? (
                        <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                          t.cloudCount === t.localCount 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' 
                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/10'
                        }`}>
                          {t.cloudCount} records
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-mono">Unchecked</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right">
                      {t.status === 'missing' ? (
                        <div className="text-[10px] text-rose-500 font-mono pr-2">Run Migration SQL</div>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => syncPushTable(t.key)}
                            disabled={!config.isConnected || t.localCount === 0}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-850 rounded text-brand-teal hover:scale-105 transition-all inline-flex items-center gap-1 text-[10px] font-bold disabled:opacity-30 disabled:pointer-events-none"
                            title="Push offline updates to Supabase table"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            Push
                          </button>
                          <span className="text-gray-300 dark:text-slate-800 shrink-0 self-center">|</span>
                          <button
                            onClick={() => syncPullTable(t.key)}
                            disabled={!config.isConnected || t.cloudCount === 0}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-850 rounded text-amber-500 hover:scale-105 transition-all inline-flex items-center gap-1 text-[10px] font-bold disabled:opacity-30 disabled:pointer-events-none"
                            title="Restore local storage from cloud data backups"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                            Pull
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Migration Instructions alert info */}
          <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <Info className="w-5 h-5 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <span className="font-bold">Database Migration Alert</span>
              <p className="text-[11px] opacity-90">
                To create these tables in your Supabase project, copy the full DDL migration script from the <strong>Developer Docs</strong> section and run it inside the Supabase SQL Editor. Once complete, click <strong>Refresh Counts</strong> above.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
