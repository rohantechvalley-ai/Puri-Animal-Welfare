/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Send, 
  Clock, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  Users, 
  DollarSign, 
  Compass, 
  Shield, 
  Plus,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import { AdminBroadcast } from './adminTypes';

interface NotificationManagementProps {
  broadcasts: AdminBroadcast[];
  onUpdateBroadcasts: (bc: AdminBroadcast[]) => void;
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  actingRole: string;
}

export const NotificationManagement: React.FC<NotificationManagementProps> = ({
  broadcasts,
  onUpdateBroadcasts,
  onAddAuditLog,
  showToast,
  actingRole
}) => {
  // Tabs: "compose" vs "archives"
  const [activeTab, setActiveTab] = useState<'compose' | 'archives'>('compose');

  // Form states
  const [bcTitle, setBcTitle] = useState('');
  const [bcTarget, setBcTarget] = useState<'all' | 'volunteers' | 'moderators' | 'donors' | 'specific'>('all');
  const [bcMessage, setBcMessage] = useState('');
  const [bcScheduleType, setBcScheduleType] = useState<'immediate' | 'future'>('immediate');
  const [bcScheduleDate, setBcScheduleDate] = useState('');

  // Submit Handler
  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle || !bcMessage) return;

    const isFuture = bcScheduleType === 'future';
    const newBroadcast: AdminBroadcast = {
      id: `bc-${Date.now()}`,
      title: bcTitle,
      message: bcMessage,
      target: bcTarget,
      status: isFuture ? 'scheduled' : 'sent',
      created_at: new Date().toISOString(),
      scheduled_for: isFuture ? new Date(bcScheduleDate).toISOString() : undefined,
      sent_at: isFuture ? undefined : new Date().toISOString(),
      author: 'Satyajit Ray (Welfare Admin)'
    };

    onUpdateBroadcasts([newBroadcast, ...broadcasts]);
    onAddAuditLog(
      isFuture ? 'Schedule Broadcast Announcement' : 'Send Broadcast Announcement',
      `Title: ${bcTitle}`,
      'draft',
      isFuture ? 'scheduled' : 'sent'
    );

    showToast(
      isFuture 
        ? `Broadcast announcement scheduled for ${new Date(bcScheduleDate).toLocaleDateString()}` 
        : `Immediate broadcast dispatched to all ${bcTarget} profiles.`, 
      'success'
    );

    // reset fields
    setBcTitle('');
    setBcMessage('');
    setBcScheduleType('immediate');
    setBcScheduleDate('');
    setActiveTab('archives');
  };

  const handleDeleteBroadcast = (id: string) => {
    onUpdateBroadcasts(broadcasts.filter(b => b.id !== id));
    onAddAuditLog('Purge Broadcast Template', `Broadcast #${id}`);
    showToast('Broadcast deleted.', 'info');
  };

  const getTargetIcon = (target: string) => {
    switch (target) {
      case 'all': return <Users className="w-3.5 h-3.5 text-blue-500" />;
      case 'volunteers': return <Compass className="w-3.5 h-3.5 text-emerald-500" />;
      case 'donors': return <DollarSign className="w-3.5 h-3.5 text-teal-500" />;
      case 'moderators': return <Shield className="w-3.5 h-3.5 text-purple-500" />;
      default: return <Bell className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4" id="notification-management-panel">
      {/* Sub tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('compose')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            activeTab === 'compose' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          Compose Broadcast
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            activeTab === 'archives' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5 animate-bounce" />
          Dispatch Ledger ({broadcasts.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'compose' ? (
          /* Form to send announcements */
          <form onSubmit={handleCreateBroadcast} className="border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl space-y-4 text-xs">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400">Target Notification Dispatch</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Announcement Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Cyclone High Tide Notice"
                  value={bcTitle}
                  onChange={e => setBcTitle(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Target Recipient Tier</label>
                <select
                  value={bcTarget}
                  onChange={e => setBcTarget(e.target.value as any)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                >
                  <option value="all">Broad Cast to All Registered Accounts</option>
                  <option value="volunteers">Active Volunteers Only</option>
                  <option value="donors">Verified Financial Supporters</option>
                  <option value="moderators">System Content Moderators</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block uppercase">Message Content</label>
              <textarea 
                placeholder="Write the full announcement detailing instructions or safety updates..."
                value={bcMessage}
                onChange={e => setBcMessage(e.target.value)}
                rows={4}
                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none leading-relaxed"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end border-t border-gray-100 dark:border-slate-850 pt-4">
              <div>
                <label className="text-[10px] font-mono text-gray-400 block uppercase mb-1">Dispatch Timeline</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBcScheduleType('immediate')}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      bcScheduleType === 'immediate' 
                        ? 'bg-brand-emerald text-white border-brand-emerald font-bold' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-500'
                    }`}
                  >
                    Immediate
                  </button>
                  <button
                    type="button"
                    onClick={() => setBcScheduleType('future')}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                      bcScheduleType === 'future' 
                        ? 'bg-brand-emerald text-white border-brand-emerald font-bold' 
                        : 'bg-white dark:bg-slate-800 border-gray-200 text-gray-500'
                    }`}
                  >
                    Scheduled
                  </button>
                </div>
              </div>

              {bcScheduleType === 'future' && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-gray-400 block uppercase">Target Date/Time</label>
                  <input 
                    type="datetime-local"
                    value={bcScheduleDate}
                    onChange={e => setBcScheduleDate(e.target.value)}
                    className="w-full p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                    required
                  />
                </div>
              )}

              <div className="md:col-start-3">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-brand-emerald/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  {bcScheduleType === 'future' ? 'Schedule Announcement' : 'Dispatch Announcement'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Archive of sent notifications */
          <div className="space-y-3">
            {broadcasts.length === 0 ? (
              <p className="text-center text-xs text-gray-400 dark:text-slate-400 py-12">No sent announcements logged in archives.</p>
            ) : (
              broadcasts.map(bc => (
                <div key={bc.id} className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-4 space-y-2 relative shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5">
                      {getTargetIcon(bc.target)}
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 uppercase">
                        Target: {bc.target}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                        bc.status === 'sent' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {bc.status}
                      </span>
                    </div>

                    <button 
                      onClick={() => handleDeleteBroadcast(bc.id)}
                      className="p-1 text-gray-400 hover:text-rose-500 rounded-lg transition-colors"
                      title="Purge template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="font-display font-bold text-xs text-gray-900 dark:text-white mt-1">{bc.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed font-medium">"{bc.message}"</p>

                  <div className="pt-2 border-t border-gray-100 dark:border-slate-850 flex justify-between text-[9px] text-gray-400 font-mono">
                    <span>Dispatched by {bc.author}</span>
                    <span>
                      {bc.status === 'sent' 
                        ? `Sent: ${new Date(bc.sent_at!).toLocaleDateString()} ${new Date(bc.sent_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : `Scheduled for: ${new Date(bc.scheduled_for!).toLocaleDateString()} ${new Date(bc.scheduled_for!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                      }
                    </span>
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
