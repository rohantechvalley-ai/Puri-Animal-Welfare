/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Pin, 
  Lock, 
  Unlock, 
  Trash2, 
  Star, 
  AlertTriangle, 
  UserX, 
  UserPlus, 
  Check, 
  CornerDownRight, 
  Clock, 
  Search,
  Flag,
  RotateCcw,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ForumThread, ForumPost } from '../../types';

interface ForumModerationProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  actingRole: string;
}

export const ForumModeration: React.FC<ForumModerationProps> = ({ onAddAuditLog, actingRole }) => {
  const { 
    threads, 
    posts, 
    moderateThread, 
    moderatePost, 
    deleteThread, 
    deleteReply,
    showToast 
  } = useApp();

  // Active view: "threads" vs "posts" vs "users"
  const [forumView, setForumView] = useState<'threads' | 'posts' | 'user_bans'>('threads');
  
  // Search query
  const [query, setQuery] = useState('');

  // Local banned / muted simulation
  const [moderatedUsers, setModeratedUsers] = useState<Record<string, { status: 'warned' | 'muted' | 'banned', duration?: string, reason: string }>>({
    'CryptoSpamPuri': { status: 'muted', duration: '72 Hours', reason: 'Posting cryptocurrency links in Swargadwar Beach discussion.' },
    'TrollBot101': { status: 'banned', reason: 'Harassment of local animal rescue volunteers.' }
  });

  const [banTargetUser, setBanTargetUser] = useState('');
  const [banReason, setBanReason] = useState('');
  const [banStatus, setBanStatus] = useState<'warned' | 'muted' | 'banned'>('warned');

  // Filters
  const filteredThreads = threads.filter(t => 
    t.title.toLowerCase().includes(query.toLowerCase()) || 
    t.author_name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.content.toLowerCase().includes(query.toLowerCase()) || 
    p.author_name.toLowerCase().includes(query.toLowerCase())
  );

  // Moderation Actions
  const handlePin = (id: string, currentlyPinned: boolean) => {
    moderateThread(id, 'pin');
    onAddAuditLog('Moderate Forum Thread', `Thread #${id}`, currentlyPinned ? 'pinned' : 'normal', currentlyPinned ? 'normal' : 'pinned');
    showToast(currentlyPinned ? 'Thread unpinned successfully.' : 'Thread pinned to category announcement board.', 'success');
  };

  const handleLock = (id: string, currentlyLocked: boolean) => {
    moderateThread(id, 'lock');
    onAddAuditLog('Moderate Forum Thread', `Thread #${id}`, currentlyLocked ? 'locked' : 'normal', currentlyLocked ? 'normal' : 'locked');
    showToast(currentlyLocked ? 'Thread unlocked for comments.' : 'Thread locked. Comments disabled.', 'success');
  };

  const handleFeature = (id: string, currentlyFeatured: boolean) => {
    moderateThread(id, 'feature');
    onAddAuditLog('Moderate Forum Thread', `Thread #${id}`, currentlyFeatured ? 'featured' : 'normal', currentlyFeatured ? 'normal' : 'featured');
    showToast(currentlyFeatured ? 'Thread removed from features.' : 'Thread featured as trending story.', 'success');
  };

  const handleDeleteThread = (id: string) => {
    deleteThread(id);
    onAddAuditLog('Delete Forum Thread', `Thread #${id}`);
    showToast('Thread and all replies permanently removed.', 'success');
  };

  const handleDeletePost = (id: string) => {
    deleteReply(id);
    onAddAuditLog('Delete Forum Reply', `Post #${id}`);
    showToast('Reply permanently deleted.', 'success');
  };

  const handleMuteBanUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!banTargetUser || !banReason) return;
    setModeratedUsers({
      ...moderatedUsers,
      [banTargetUser]: {
        status: banStatus,
        duration: banStatus === 'muted' ? '7 Days' : undefined,
        reason: banReason
      }
    });
    onAddAuditLog('Moderate User Status', `User "${banTargetUser}"`, 'active', banStatus);
    showToast(`User ${banTargetUser} status updated to ${banStatus.toUpperCase()}`, 'success');
    setBanTargetUser('');
    setBanReason('');
  };

  const handleRemoveModeration = (username: string) => {
    const updated = { ...moderatedUsers };
    delete updated[username];
    setModeratedUsers(updated);
    onAddAuditLog('Pardon User Status', `User "${username}" pardoned`);
    showToast(`User ${username} reinstated to full community rights.`, 'success');
  };

  return (
    <div className="space-y-4" id="forum-moderation-panel">
      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-800/50 p-4 rounded-2xl">
        <div className="flex gap-1">
          <button
            onClick={() => { setForumView('threads'); setQuery(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              forumView === 'threads' ? 'bg-brand-emerald text-white font-bold' : 'bg-gray-150/70 dark:bg-slate-800 text-gray-500'
            }`}
          >
            Threads ({threads.length})
          </button>
          <button
            onClick={() => { setForumView('posts'); setQuery(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              forumView === 'posts' ? 'bg-brand-emerald text-white font-bold' : 'bg-gray-150/70 dark:bg-slate-800 text-gray-500'
            }`}
          >
            Replies ({posts.length})
          </button>
          <button
            onClick={() => { setForumView('user_bans'); setQuery(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              forumView === 'user_bans' ? 'bg-brand-emerald text-white font-bold' : 'bg-gray-150/70 dark:bg-slate-800 text-gray-500'
            }`}
          >
            Bans &amp; Mutes ({Object.keys(moderatedUsers).length})
          </button>
        </div>

        {forumView !== 'user_bans' && (
          <div className="relative md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Filter threads or content..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Render Subviews */}
      <div className="space-y-4">
        {forumView === 'threads' && (
          <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-mono uppercase tracking-wider">
                    <th className="p-4">Forum Thread title</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">Status Attributes</th>
                    <th className="p-4 text-right">Moderator actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
                  {filteredThreads.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <h4 className="font-semibold text-gray-950 dark:text-white flex items-center gap-1.5">
                            {t.title}
                            {t.pinned && <Pin className="w-3 h-3 text-brand-emerald rotate-45 fill-brand-emerald" />}
                            {t.locked && <Lock className="w-3 h-3 text-amber-500" />}
                          </h4>
                          <span className="text-[10px] text-gray-400 font-mono">Category: {t.category_name} &bull; {t.replies_count} replies</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{t.author_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {t.pinned && <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono text-[9px] uppercase font-bold">Pinned</span>}
                          {t.locked && <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-mono text-[9px] uppercase font-bold">Locked</span>}
                          {t.featured && <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 font-mono text-[9px] uppercase font-bold">Featured</span>}
                          {!t.pinned && !t.locked && !t.featured && <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 font-mono text-[9px] uppercase">Standard</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handlePin(t.id, !!t.pinned)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              t.pinned ? 'bg-brand-emerald/15 border-brand-emerald/30 text-brand-emerald' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-gray-950'
                            }`}
                            title="Toggle Pin"
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleLock(t.id, !!t.locked)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              t.locked ? 'bg-amber-500/15 border-amber-500/30 text-amber-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-gray-950'
                            }`}
                            title="Toggle Lock"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleFeature(t.id, !!t.featured)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              t.featured ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-600' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:text-gray-950'
                            }`}
                            title="Toggle Feature"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteThread(t.id)}
                            className="p-1.5 bg-rose-500/10 border border-rose-200 dark:border-rose-900/40 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all"
                            title="Purge Thread"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {forumView === 'posts' && (
          <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-4 space-y-4">
            {filteredPosts.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-xs">No matching posts/replies inside the community logs.</p>
            ) : (
              filteredPosts.map(post => {
                const parentThread = threads.find(t => t.id === post.thread_id);
                return (
                  <div key={post.id} className="p-3 border border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-900/20 rounded-xl flex items-start gap-3 justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] font-mono text-gray-400">
                        <MessageSquare className="w-3 h-3 text-brand-emerald" />
                        <span>Reply in thread: "{parentThread?.title || 'Unknown Thread'}"</span>
                      </div>
                      <p className="text-gray-800 dark:text-slate-200 text-xs italic">"{post.content}"</p>
                      <div className="text-[10px] font-mono text-gray-400 flex items-center gap-2">
                        <span>Author: {post.author_name}</span> &bull; <span>Likes: {post.liked_by?.length || 0}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-200 dark:border-rose-900/40 rounded-lg transition-all"
                      title="Delete Post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        {forumView === 'user_bans' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add moderation banner form */}
            <form onSubmit={handleMuteBanUserSubmit} className="md:col-span-1 border border-gray-200/60 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400">Moderation Penalties</h4>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Username</label>
                <input 
                  type="text" 
                  placeholder="e.g. SpammerBot"
                  value={banTargetUser}
                  onChange={e => setBanTargetUser(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Penalty Action</label>
                <select
                  value={banStatus}
                  onChange={e => setBanStatus(e.target.value as any)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none font-bold text-rose-600"
                >
                  <option value="warned">Issue Warning</option>
                  <option value="muted">Mute (72 Hrs)</option>
                  <option value="banned">Ban Permanent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Violation Reason</label>
                <textarea 
                  placeholder="Detail the community guidelines violation..."
                  value={banReason}
                  onChange={e => setBanReason(e.target.value)}
                  rows={3}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/10 flex items-center justify-center gap-1"
              >
                <UserX className="w-3.5 h-3.5" />
                Apply Community Penalty
              </button>
            </form>

            {/* Moderated users table list */}
            <div className="md:col-span-2 border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 rounded-2xl">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 mb-4">Penalized Registry</h4>

              <div className="space-y-3">
                {Object.keys(moderatedUsers).length === 0 ? (
                  <p className="text-center text-gray-400 py-6 text-xs">Community registry is currently 100% compliant and healthy.</p>
                ) : (
                  Object.entries(moderatedUsers).map(([username, def]: [string, any]) => (
                    <div key={username} className="p-3 border border-red-500/10 bg-rose-500/[0.01] rounded-xl flex items-start gap-3 justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-slate-100 text-xs">{username}</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold font-mono uppercase bg-rose-500/15 text-rose-600 border border-rose-500/10">
                            {def.status.toUpperCase()} {def.duration ? `(${def.duration})` : ''}
                          </span>
                        </div>
                        <p className="text-gray-500 dark:text-slate-400 text-xs font-mono">Reason: {def.reason}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveModeration(username)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-200 dark:border-emerald-900/40 rounded-lg transition-all flex items-center gap-1 font-semibold text-[10px]"
                        title="Remove Penalty"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Pardon
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
