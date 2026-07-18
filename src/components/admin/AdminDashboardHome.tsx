/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  AlertTriangle, 
  MessageSquare, 
  DollarSign, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Cpu, 
  HardDrive, 
  Activity, 
  Database,
  ArrowRight,
  ShieldCheck,
  Send,
  PlusCircle,
  FileSpreadsheet,
  Layers,
  Flag
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VolunteerApplication, AdminAuditLog } from './adminTypes';

interface AdminDashboardHomeProps {
  onNavigateTab: (tabId: string) => void;
  volunteers: VolunteerApplication[];
  auditLogs: AdminAuditLog[];
  actingRole: string;
}

export const AdminDashboardHome: React.FC<AdminDashboardHomeProps> = ({ 
  onNavigateTab, 
  volunteers, 
  auditLogs,
  actingRole 
}) => {
  const { reports, donations, campaigns, threads, flags } = useApp();

  // Calculate dynamic stats
  const totalDonationsAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  const openReportsCount = reports.filter(r => r.status === 'submitted' || r.status === 'dispatched').length;
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const pendingFlagsCount = flags.filter(f => f.status === 'pending').length;
  const totalUsersCount = 142; // simulated based on registrations

  // Setup simulated system health data
  const [healthData] = useState({
    cpuUsage: 24,
    memoryUsage: 45,
    dbConnections: 12,
    apiLatency: 14,
    escrowSignatures: 'Validated (100% Secure)',
    lastBackup: '6 mins ago'
  });

  // Category Reports breakdown for custom SVG chart
  const reportsByCategory = {
    injured_animal: reports.filter(r => r.category === 'injured_animal').length,
    stray_rescue: reports.filter(r => r.category === 'stray_rescue').length,
    abuse_alert: reports.filter(r => r.category === 'abuse_alert').length,
    wildlife_sighting: reports.filter(r => r.category === 'wildlife_sighting').length,
    beach_cleanup: reports.filter(r => r.category === 'beach_cleanup').length,
  };

  const categoriesList = [
    { label: 'Injured Animal', count: reportsByCategory.injured_animal, color: 'bg-red-500' },
    { label: 'Stray Rescue', count: reportsByCategory.stray_rescue, color: 'bg-amber-500' },
    { label: 'Abuse Alert', count: reportsByCategory.abuse_alert, color: 'bg-rose-500' },
    { label: 'Wildlife', count: reportsByCategory.wildlife_sighting, color: 'bg-blue-500' },
    { label: 'Beach Cleanup', count: reportsByCategory.beach_cleanup, color: 'bg-emerald-500' },
  ];

  const maxCount = Math.max(...categoriesList.map(c => c.count), 1);

  // Weekly donations (last 7 days simulated)
  const last7DaysDonations = [
    { day: 'Mon', amount: 8000 },
    { day: 'Tue', amount: 12500 },
    { day: 'Wed', amount: 9400 },
    { day: 'Thu', amount: 15000 },
    { day: 'Fri', amount: 18500 },
    { day: 'Sat', amount: 25000 },
    { day: 'Sun', amount: totalDonationsAmount % 30000 || 16000 }
  ];

  const maxDonation = Math.max(...last7DaysDonations.map(d => d.amount), 1);

  return (
    <div className="space-y-6" id="admin-home-panel">
      {/* Overview Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Total Funding */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-5 shadow-sm relative overflow-hidden"
          id="stat-card-funds"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-emerald/10 dark:bg-brand-emerald/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-widest">Welfare Funding</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              ₹{(totalDonationsAmount).toLocaleString('en-IN')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-brand-emerald" />
              <span className="text-brand-emerald font-semibold">+14.2%</span> from last week
            </p>
          </div>
        </motion.div>

        {/* Card: Active Alerts */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-5 shadow-sm relative overflow-hidden"
          id="stat-card-alerts"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-widest">Active Alerts</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              {openReportsCount}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-amber-600 dark:text-amber-400">Dispatch Pending</span> &bull; 1 critical
            </p>
          </div>
        </motion.div>

        {/* Card: Pending Flags */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-5 shadow-sm relative overflow-hidden"
          id="stat-card-flags"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-widest">Moderation Queue</span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              {pendingFlagsCount}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-rose-600 dark:text-rose-400">{flags.length} total flags</span> logged this month
            </p>
          </div>
        </motion.div>

        {/* Card: Volunteers */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md p-5 shadow-sm relative overflow-hidden"
          id="stat-card-volunteers"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/10 dark:bg-brand-blue/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-500 dark:text-slate-400 uppercase tracking-widest">Active Volunteers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold font-display tracking-tight text-gray-900 dark:text-white">
              {volunteers.filter(v => v.status === 'approved').length}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{volunteers.filter(v => v.status === 'pending').length} pending</span> approvals waiting
            </p>
          </div>
        </motion.div>
      </div>

      {/* Grid: Charts & Bento Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel: Reports by Category Custom Chart */}
        <div className="lg:col-span-1 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-5 flex flex-col justify-between" id="chart-reports-category">
          <div>
            <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-brand-emerald" />
              Alert Breakdown
            </h3>
            <p className="text-xs text-gray-400 mt-1">Classification of animal & ecological incidents reported</p>
          </div>

          <div className="my-6 space-y-4">
            {categoriesList.map(cat => {
              const pct = Math.round((cat.count / maxCount) * 100) || 5;
              return (
                <div key={cat.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-700 dark:text-slate-300">{cat.label}</span>
                    <span className="font-mono text-gray-500 dark:text-slate-400 font-semibold">{cat.count} alerts</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${cat.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => onNavigateTab('reports')}
            className="w-full py-2 bg-gray-100 dark:bg-slate-800 hover:bg-brand-emerald/10 dark:hover:bg-brand-emerald/10 hover:text-brand-emerald text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
          >
            Manage Reports <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Panel: Weekly Donations Line Trend Custom SVG Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-5 flex flex-col justify-between" id="chart-donations-trend">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-emerald" />
                  Funding Operations
                </h3>
                <p className="text-xs text-gray-400 mt-1">Simulated weekly aggregate donation inflows (INR)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                  Secure Escrow Active
                </span>
              </div>
            </div>
          </div>

          {/* Interactive custom SVG line path & circles for perfect compatibility and high-performance visual fidelity */}
          <div className="relative h-44 my-4 flex items-end">
            <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col justify-between pointer-events-none">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full border-b border-gray-200/20 dark:border-slate-800/20" />
              ))}
            </div>

            <div className="w-full h-full flex justify-between items-end relative px-4 z-10">
              {last7DaysDonations.map((d, index) => {
                const heightPct = (d.amount / maxDonation) * 80; // keep max at 80% to fit labels
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow pointer-events-none z-20 whitespace-nowrap">
                      ₹{d.amount.toLocaleString('en-IN')}
                    </div>

                    {/* Styled Column */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.6, delay: index * 0.05 }}
                      className="w-8 bg-gradient-to-t from-brand-emerald/40 to-brand-teal/80 dark:from-brand-emerald/20 dark:to-brand-teal/50 rounded-t-lg group-hover:from-brand-emerald/60 group-hover:to-brand-teal hover:shadow-lg hover:shadow-brand-emerald/20 transition-all cursor-pointer"
                    />

                    {/* Day label */}
                    <span className="text-[10px] font-mono text-gray-400 dark:text-slate-500 mt-2">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            onClick={() => onNavigateTab('donations')}
            className="w-full py-2 bg-gray-100 dark:bg-slate-800 hover:bg-brand-emerald/10 dark:hover:bg-brand-emerald/10 hover:text-brand-emerald text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1"
          >
            Manage Ledger Logs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 3: Technical Health Monitor & System Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Monitor */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-5 space-y-4" id="system-health">
          <div>
            <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-blue" />
              Technical Health
            </h3>
            <p className="text-xs text-gray-400">Platform telemetry logs and Cloud Run container statistics</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                <span>CPU Load</span>
              </div>
              <span className="font-mono font-bold text-gray-800 dark:text-slate-100">{healthData.cpuUsage}%</span>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500">
                <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                <span>RAM Usage</span>
              </div>
              <span className="font-mono font-bold text-gray-800 dark:text-slate-100">{healthData.memoryUsage}%</span>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>DB Conns</span>
              </div>
              <span className="font-mono font-bold text-gray-800 dark:text-slate-100">{healthData.dbConnections} active</span>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/20 border border-gray-100 dark:border-slate-800 p-2.5 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-gray-500">
                <Activity className="w-3.5 h-3.5 text-brand-emerald" />
                <span>API Latency</span>
              </div>
              <span className="font-mono font-bold text-emerald-500">{healthData.apiLatency}ms</span>
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-3 flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>Secured Escrow Ledger:</span>
            <span className="text-emerald-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {healthData.escrowSignatures}
            </span>
          </div>
        </div>

        {/* Quick Operations Actions Panel */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-5 space-y-4" id="quick-ops">
          <div>
            <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-teal" />
              NGO Dispatch Desk
            </h3>
            <p className="text-xs text-gray-400">Quick-tap emergency actions & alerts broadcasts</p>
          </div>

          <div className="space-y-2.5">
            <button 
              onClick={() => onNavigateTab('broadcasts')}
              className="w-full p-2.5 bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-brand-teal hover:to-brand-emerald text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-brand-emerald/10"
            >
              <Send className="w-3.5 h-3.5" />
              Broadcast Emergency Announcement
            </button>

            <button 
              onClick={() => onNavigateTab('reports')}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-brand-blue" />
              Initialize Mock Campaign / Roster
            </button>

            <button 
              onClick={() => onNavigateTab('logs')}
              className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-200/60 dark:border-slate-700/60 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-500" />
              Audit Trial Logs
            </button>
          </div>
        </div>

        {/* Recent Platform Activity Audit-timeline */}
        <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-5 flex flex-col justify-between" id="recent-activity-timeline">
          <div>
            <h3 className="font-display font-semibold text-base text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-500" />
              Recent Operations Logs
            </h3>
            <p className="text-xs text-gray-400 mt-1">Timeline of system and administrator events</p>
          </div>

          <div className="my-4 space-y-3 flex-grow overflow-y-auto max-h-44 pr-1">
            {auditLogs.slice(0, 4).map(log => (
              <div key={log.id} className="flex gap-2.5 items-start text-[11px]">
                <div className="w-2 h-2 rounded-full bg-brand-emerald mt-1 flex-shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-gray-800 dark:text-slate-200 font-semibold">
                    {log.action} &bull; <span className="font-normal text-gray-500">{log.affectedRecord}</span>
                  </p>
                  <p className="text-gray-400 flex items-center gap-1">
                    <span>by {log.user}</span> &bull; <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => onNavigateTab('logs')}
            className="w-full py-1.5 border border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-slate-400 hover:text-brand-emerald dark:hover:text-brand-emerald rounded-xl transition-all"
          >
            View Complete Ledger Audit Trail
          </button>
        </div>
      </div>
    </div>
  );
};
