/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  Flag, 
  Check, 
  Trash2, 
  MessageSquare, 
  Clock, 
  User, 
  UserX, 
  ShieldAlert, 
  Compass, 
  ExternalLink,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForumFlag } from '../../types';

interface ModerationQueueProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  actingRole: string;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({ onAddAuditLog, actingRole }) => {
  const { reports, flags, posts, threads, updateReportStatus, moderateThread, moderatePost, showToast } = useApp();
  
  // Tab state: "alerts" vs "forum_flags"
  const [modTab, setModTab] = useState<'alerts' | 'forum_flags'>('alerts');

  // Filtered lists
  const urgentAlerts = reports.filter(r => r.severity === 'critical' || r.severity === 'high');

  // Forum flags linked with post/thread author and content
  const forumFlagsList = flags.map(flag => {
    let contextContent = '';
    let authorName = flag.reported_user_name;
    
    if (flag.content_type === 'thread') {
      const thread = threads.find(t => t.id === flag.content_id);
      contextContent = thread ? thread.title + ' - ' + (thread.content || '').slice(0, 100) : 'Thread content unavailable';
      authorName = thread ? thread.author_name : flag.reported_user_name;
    } else {
      const post = posts.find(p => p.id === flag.content_id);
      contextContent = post ? (post.content || '').slice(0, 100) : 'Post content unavailable';
      authorName = post ? post.author_name : flag.reported_user_name;
    }

    return {
      ...flag,
      contextContent,
      authorName
    };
  });

  // Action handlers
  const handleApproveAlert = (id: string) => {
    updateReportStatus(id, 'dispatched', 'Approved and dispatched via quick moderation triage');
    onAddAuditLog('Quick Dispatch', `Incident #${id}`, 'submitted', 'dispatched');
    showToast('Alert dispatched to mobile veterinary rangers.', 'success');
  };

  const handleEscalateAlert = (id: string) => {
    onAddAuditLog('Escalate Incident Alert', `Incident #${id} escalated to super_admin`);
    showToast('Incident escalated to Puri Disaster & Environment Commissioner.', 'info');
  };

  const handleDismissFlag = (id: string) => {
    // Simulated state update or trigger toast
    onAddAuditLog('Dismiss Forum Flag', `Flag #${id} dismissed`);
    showToast('Flag dismissed. Content marked as compliant.', 'success');
  };

  const handleHideContent = (contentType: 'thread' | 'post', id: string) => {
    if (contentType === 'thread') {
      moderateThread(id, 'delete');
    } else {
      moderatePost(id, 'hide');
    }
    onAddAuditLog('Hide Content', `Forum ${contentType} #${id} deleted/hidden`);
    showToast(`${contentType.toUpperCase()} successfully hidden from the public feed.`, 'success');
  };

  const handleWarnUser = (username: string) => {
    onAddAuditLog('Warn Forum Poster', `User "${username}" flagged for warning`);
    showToast(`Official policy warning dispatched to ${username}.`, 'info');
  };

  return (
    <div className="space-y-4" id="moderation-queue-panel">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setModTab('alerts')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            modTab === 'alerts' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
          Urgent Rescue Alerts ({urgentAlerts.length})
        </button>

        <button
          onClick={() => setModTab('forum_flags')}
          className={`px-4 py-2.5 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            modTab === 'forum_flags' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900'
          }`}
        >
          <Flag className="w-4 h-4 text-red-500" />
          Flagged Forum Posts ({flags.length})
        </button>
      </div>

      <div className="space-y-4">
        {modTab === 'alerts' ? (
          /* Urgent Alerts Sub-Queue */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentAlerts.length === 0 ? (
              <div className="col-span-2 text-center text-xs text-gray-400 dark:text-slate-400 py-12 border border-dashed rounded-2xl border-gray-200 dark:border-slate-800">
                No high-priority or critical emergency alerts in queue. Everything is stable!
              </div>
            ) : (
              urgentAlerts.map(alert => (
                <div 
                  key={alert.id}
                  className="rounded-2xl border border-red-500/10 dark:border-red-500/5 bg-red-500/[0.02] dark:bg-red-950/[0.05] p-4 flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest font-mono text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400 uppercase">
                        {alert.severity} Incident
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">ALERT #{alert.id}</span>
                    </div>

                    <h4 className="font-display font-bold text-sm text-gray-900 dark:text-white">{alert.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed truncate-3-lines">"{alert.description}"</p>
                    
                    <div className="text-[10px] space-y-0.5 text-gray-400 font-mono">
                      <p>Location: {alert.location}</p>
                      <p>Reporter: {alert.reporter_name} &bull; {new Date(alert.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2 border-t border-red-500/5">
                    {alert.status === 'submitted' && (
                      <button
                        onClick={() => handleApproveAlert(alert.id)}
                        className="flex-grow py-1.5 bg-brand-emerald text-white rounded-lg text-xs font-semibold hover:bg-brand-teal transition-all flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Quick Dispatch
                      </button>
                    )}
                    <button
                      onClick={() => handleEscalateAlert(alert.id)}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Escalate
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Forum Flags Sub-Queue */
          <div className="space-y-3">
            {forumFlagsList.length === 0 ? (
              <div className="text-center text-xs text-gray-400 dark:text-slate-400 py-12 border border-dashed rounded-2xl border-gray-200 dark:border-slate-800">
                Forum flag queue is completely clear. Community discussions are pristine!
              </div>
            ) : (
              forumFlagsList.map(flag => (
                <div 
                  key={flag.id}
                  className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 flex flex-col md:flex-row justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono text-rose-600 bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 uppercase">
                        Reason: {flag.reason.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">Flagged Content ({flag.content_type})</span>
                    </div>

                    <div className="text-xs bg-gray-50/70 dark:bg-slate-800/20 border p-2.5 rounded-xl space-y-1 text-gray-600 dark:text-slate-300">
                      <p className="font-semibold text-[11px] text-gray-400 font-mono">FLAGGED PREVIEW (AUTHOR: {flag.authorName}):</p>
                      <p className="italic">"{flag.contextContent}"</p>
                    </div>

                    <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                      <span>Flagged by: {flag.reporter_name}</span> &bull; <span>Details: {flag.details || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-1.5 min-w-[120px]">
                    <button
                      onClick={() => handleDismissFlag(flag.id)}
                      className="w-full py-1.5 bg-brand-emerald text-white rounded-lg text-xs font-semibold hover:bg-brand-teal transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Dismiss / Safe
                    </button>
                    <button
                      onClick={() => handleWarnUser(flag.authorName)}
                      className="w-full py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      Warn Poster
                    </button>
                    <button
                      onClick={() => handleHideContent(flag.content_type, flag.content_id)}
                      className="w-full py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-200 dark:border-rose-900/40 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hide Content
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
