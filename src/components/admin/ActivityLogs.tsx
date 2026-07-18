/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Download, 
  Globe, 
  Clock, 
  User, 
  Cpu, 
  Briefcase,
  ChevronRight
} from 'lucide-react';
import { AdminAuditLog } from './adminTypes';

interface ActivityLogsProps {
  logs: AdminAuditLog[];
  onClearLogs: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  actingRole: string;
}

export const ActivityLogs: React.FC<ActivityLogsProps> = ({ 
  logs, 
  onClearLogs, 
  showToast,
  actingRole 
}) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                          log.user.toLowerCase().includes(search.toLowerCase()) || 
                          log.affectedRecord.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-rose-500 bg-rose-500/10 border-rose-500/10';
      case 'admin': return 'text-orange-500 bg-orange-500/10 border-orange-500/10';
      default: return 'text-purple-500 bg-purple-500/10 border-purple-500/10';
    }
  };

  const handleExportLogs = () => {
    showToast('Exporting complete audit trail ledger to CSV format...', 'success');
  };

  return (
    <div className="space-y-4" id="activity-logs-panel">
      {/* Search and export utilities */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search logs by action, user, or record ID reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto text-xs">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
          >
            <option value="all">All Actions</option>
            <option value="Status Change">Status Change</option>
            <option value="Create Campaign">Create Campaign</option>
            <option value="Forum Flag Resolved">Forum Flag Resolved</option>
            <option value="User Role Update">User Role Update</option>
            <option value="Mute Spammer">Mute Spammer</option>
            <option value="Refund Donation">Refund Donation</option>
          </select>

          <button
            onClick={handleExportLogs}
            className="p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center gap-1 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Ledger
          </button>

          <button
            onClick={() => {
              onClearLogs();
              showToast('Audit trail ledger cleared.', 'info');
            }}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/15 rounded-xl transition-all font-semibold flex items-center gap-1 shrink-0"
            title="Purge logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Purge Trail
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-mono uppercase tracking-wider">
                <th className="p-4">Action Event</th>
                <th className="p-4">Audited User</th>
                <th className="p-4">Affected Record</th>
                <th className="p-4">Audit Values</th>
                <th className="p-4">IP &amp; Browser</th>
                <th className="p-4 text-right">Timestamp UTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850 font-mono text-[11px]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 dark:text-slate-400">
                    No matching events registered inside the audit trail ledger.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/5 transition-colors text-gray-600 dark:text-slate-300">
                    <td className="p-4 font-bold text-gray-950 dark:text-white">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-gray-400" />
                        <div>
                          <p className="font-semibold">{log.user}</p>
                          <span className={`inline-block px-1 rounded text-[8px] border font-bold uppercase ${getRoleColor(log.role)}`}>
                            {log.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-gray-800 dark:text-slate-200">
                      {log.affectedRecord}
                    </td>
                    <td className="p-4 leading-relaxed">
                      {log.previousValue && (
                        <p><span className="text-gray-400 font-bold">PREV:</span> <span className="text-rose-500">{log.previousValue}</span></p>
                      )}
                      {log.newValue && (
                        <p><span className="text-gray-400 font-bold">NEXT:</span> <span className="text-emerald-500">{log.newValue}</span></p>
                      )}
                      {!log.previousValue && !log.newValue && (
                        <span className="text-gray-400">Logged</span>
                      )}
                    </td>
                    <td className="p-4 text-[10px] space-y-0.5 text-gray-400">
                      <p className="flex items-center gap-1"><Globe className="w-3 h-3" /> {log.ipAddress}</p>
                      <p className="flex items-center gap-1"><Cpu className="w-3 h-3" /> {(log.browser || '').slice(0, 18)}...</p>
                    </td>
                    <td className="p-4 text-right text-[10px] text-gray-400">
                      <p className="flex items-center justify-end gap-1 font-semibold"><Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleDateString()}</p>
                      <p className="opacity-75 mt-0.5">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
