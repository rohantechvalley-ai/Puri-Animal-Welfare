/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  ArrowUp, 
  CheckCircle2, 
  User, 
  Pin, 
  Sparkles, 
  Search, 
  Plus, 
  ChevronRight,
  MapPin,
  Calendar,
  Heart,
  Bookmark,
  Bell,
  Flag,
  Shield,
  Crown,
  Award,
  Trash2,
  Edit2,
  Eye,
  ArrowLeft,
  Reply,
  Lock,
  Tag,
  Leaf,
  Compass,
  ExternalLink,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ForumThread, ForumCategory, ForumPost, ForumBadge } from '../types';

export const ForumView: React.FC = () => {
  const { 
    currentUser,
    categories,
    threads,
    posts,
    badges,
    userBadges,
    reputations,
    reports,
    createThread,
    deleteThread,
    addReply,
    deleteReply,
    editReply,
    toggleLikeThread,
    toggleBookmarkThread,
    toggleFollowThread,
    toggleLikePost,
    flagContent,
    moderateThread,
    moderatePost,
    showToast
  } = useApp();

  // Navigation / View states
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unreplied'>('latest');

  // Modal / Form states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTagsInput, setNewTagsInput] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [selectedReportId, setSelectedReportId] = useState<string>('');

  // Comment reply state
  const [replyContent, setReplyContent] = useState('');
  const [quotingPostId, setQuotingPostId] = useState<string | null>(null);

  // Moderation state
  const [flagModal, setFlagModal] = useState<{ type: 'thread' | 'post'; id: string; userId: string; userName: string } | null>(null);
  const [flagReason, setFlagReason] = useState<'spam' | 'harassment' | 'animal_abuse' | 'false_info' | 'offensive' | 'other'>('spam');
  const [flagDetails, setFlagDetails] = useState('');

  // Editing post state
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostContent, setEditingPostContent] = useState('');

  // Suggested nature images
  const suggestedImages = [
    { label: 'Ambulance Care', url: 'https://images.unsplash.com/photo-1581888227599-779811939961?auto=format&fit=crop&q=80&w=800' },
    { label: 'Swargadwar Cow', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600' },
    { label: 'Beach Cleanup', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800' },
    { label: 'Coastal Dunes', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800' },
    { label: 'Street Feeding', url: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800' }
  ];

  // Map category icon slug to Lucide icons
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldAlert': return <Shield className="w-4 h-4 text-rose-500" />;
      case 'Trees': return <Leaf className="w-4 h-4 text-emerald-500" />;
      case 'Megaphone': return <Crown className="w-4 h-4 text-amber-500" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  // Find badge details
  const getUserBadgesList = (userId: string): ForumBadge[] => {
    const userBadgeIds = userBadges.filter(ub => ub.user_id === userId).map(ub => ub.badge_id);
    return badges.filter(b => userBadgeIds.includes(b.id));
  };

  const getUserReputation = (userId: string) => {
    const rep = reputations.find(r => r.user_id === userId);
    return rep || { points: 0, level: 1 };
  };

  // Filtered and Sorted Threads
  const currentCategory = categories.find(c => c.slug === selectedCategorySlug);
  const activeThreads = threads.filter(t => {
    const matchesCategory = selectedCategorySlug === 'all' || t.category_id === currentCategory?.id;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => {
    // Pinned always on top
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    if (sortBy === 'popular') {
      return (b.upvotes + b.replies_count) - (a.upvotes + a.replies_count);
    }
    if (sortBy === 'unreplied') {
      return a.replies_count - b.replies_count;
    }
    // Default: latest
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const selectedThread = threads.find(t => t.id === selectedThreadId);
  const threadPosts = posts.filter(p => p.thread_id === selectedThreadId);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCategory || !newContent.trim()) {
      showToast('Please fill out all required fields.', 'error');
      return;
    }

    const tags = newTagsInput.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const images = newImageUrl ? [newImageUrl] : [];
    const threadId = await createThread(
      newTitle,
      newContent,
      newCategory,
      tags,
      images,
      selectedReportId || undefined
    );

    if (threadId) {
      setNewTitle('');
      setNewContent('');
      setNewTagsInput('');
      setNewImageUrl('');
      setSelectedReportId('');
      setIsCreateModalOpen(false);
      setSelectedThreadId(threadId); // View newly created thread
    }
  };

  const handleAddReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !replyContent.trim()) return;

    const success = await addReply(
      selectedThreadId,
      replyContent,
      undefined,
      quotingPostId || undefined
    );

    if (success) {
      setReplyContent('');
      setQuotingPostId(null);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagModal) return;

    const success = await flagContent(
      flagModal.type,
      flagModal.id,
      flagModal.userId,
      flagModal.userName,
      flagReason,
      flagDetails
    );

    if (success) {
      setFlagReason('spam');
      setFlagDetails('');
      setFlagModal(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-6" id="forum-main-layout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP HERO BOARD */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-500/10" id="forum-hero-board">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              Puri Civic Action & Coexistence Forum
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-none text-slate-100">
              Community Action Board
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-light">
              Collaborate directly on beach cleaning initiatives, report stray monkeys/cows feeding hubs near Swargadwar, consult veterinarians, and build the ultimate welfare alliance in Puri.
            </p>
            
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="block text-xl font-bold font-mono tracking-tight text-emerald-400">{threads.length}</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Total Discussions</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="block text-xl font-bold font-mono tracking-tight text-emerald-400">{posts.length}</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Community Replies</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                <span className="block text-xl font-bold font-mono tracking-tight text-emerald-400">{reputations.length || 3}</span>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold">Active Guardians</span>
              </div>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN MASTER-DETAIL GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="forum-content-grid">
          
          {/* LEFT CHANNELS / MEMBERS SIDEBAR (4 Cols) */}
          <div className="lg:col-span-3 space-y-6" id="forum-sidebar">
            
            {/* Quick Actions Card */}
            {currentUser && (
              <div className="glass-panel p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                    alt={currentUser.name} 
                    className="w-11 h-11 rounded-full border-2 border-emerald-500/20 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{currentUser.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                      <Award className="w-3.5 h-3.5" />
                      <span>Level {getUserReputation(currentUser.id).level}</span>
                      <span className="text-gray-300">•</span>
                      <span>{getUserReputation(currentUser.id).points} XP</span>
                    </div>
                  </div>
                </div>

                {/* Earned Badges Row */}
                {getUserBadgesList(currentUser.id).length > 0 && (
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold block mb-2 font-mono">Your Badges</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getUserBadgesList(currentUser.id).map(badge => (
                        <span 
                          key={badge.id}
                          className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-semibold border border-transparent ${badge.color}`}
                          title={badge.description}
                        >
                          <Award className="w-3 h-3" />
                          {badge.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Start New Thread
                </button>
              </div>
            )}

            {/* Discussion Channels Card */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-gray-400 tracking-wider font-mono">Discussion Channels</h3>
              
              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    setSelectedCategorySlug('all');
                    setSelectedThreadId(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                    selectedCategorySlug === 'all'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    All Channels
                  </span>
                  <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                    {threads.length}
                  </span>
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategorySlug(cat.slug);
                      setSelectedThreadId(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      selectedCategorySlug === cat.slug
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {getCategoryIcon(cat.icon)}
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {threads.filter(t => t.category_id === cat.id).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Guardians Board */}
            <div className="glass-panel p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm space-y-4">
              <h3 className="font-display font-bold text-xs uppercase text-gray-400 tracking-wider font-mono">Top Guardians</h3>
              
              <div className="space-y-3.5">
                {reputations.length === 0 ? (
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-mono py-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Be the first active member!
                  </div>
                ) : (
                  reputations
                    .sort((a, b) => b.points - a.points)
                    .slice(0, 5)
                    .map((rep, idx) => (
                      <div key={rep.user_id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-xs font-mono font-bold w-4 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-gray-400'}`}>
                            #{idx + 1}
                          </span>
                          <img 
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(rep.user_id)}`} 
                            alt="avatar" 
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-gray-700 dark:text-slate-200 truncate">
                            {rep.user_id === currentUser?.id ? 'You' : `User_${(rep.user_id || '').slice(-4)}`}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {rep.points} XP
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

          </div>

          {/* MAIN ACTIONS & THREAD FLOW (9 Cols) */}
          <div className="lg:col-span-9 space-y-6" id="forum-main-flow">
            
            {/* THREAD DETAILS VIEW (IF OPEN) */}
            <AnimatePresence mode="wait">
              {selectedThreadId && selectedThread ? (
                <motion.div
                  key="thread-detail"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6 text-left"
                >
                  {/* Back button */}
                  <button
                    onClick={() => setSelectedThreadId(null)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-emerald-600 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Discussions Ledger
                  </button>

                  {/* Main Thread Card */}
                  <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-md space-y-6">
                    
                    {/* Author & Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={selectedThread.author_avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                          alt={selectedThread.author_name} 
                          className="w-12 h-12 rounded-full border border-emerald-500/15 object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-900 dark:text-white">{selectedThread.author_name}</span>
                            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/25 px-1.5 py-0.5 rounded-md">
                              Lvl {getUserReputation(selectedThread.author_id).level}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block pt-0.5">
                            Published {new Date(selectedThread.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Utility Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleFollowThread(selectedThread.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            selectedThread.following_users?.includes(currentUser?.id || '')
                              ? 'bg-emerald-50 border-emerald-500/20 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-500 dark:border-slate-800 dark:hover:bg-slate-800/60'
                          }`}
                          title="Get notified of updates"
                        >
                          <Bell className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBookmarkThread(selectedThread.id)}
                          className={`p-2 rounded-xl border transition-all ${
                            selectedThread.bookmarked_by?.includes(currentUser?.id || '')
                              ? 'bg-amber-50 border-amber-500/20 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-500 dark:border-slate-800 dark:hover:bg-slate-800/60'
                          }`}
                          title="Bookmark thread"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Category Label and Title */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-extrabold uppercase text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/10">
                          {selectedThread.category_name}
                        </span>
                        {selectedThread.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400 px-2 py-0.5 rounded-md border border-amber-500/10">
                            <Pin className="w-3 h-3 fill-amber-500" />
                            PINNED
                          </span>
                        )}
                        {selectedThread.solved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/10">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            SOLVED
                          </span>
                        )}
                        {selectedThread.featured && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/25 dark:text-rose-400 px-2 py-0.5 rounded-md border border-rose-500/10">
                            <Sparkles className="w-3 h-3 text-rose-500" />
                            FEATURED
                          </span>
                        )}
                      </div>

                      <h2 className="font-display font-black text-xl sm:text-2xl text-gray-900 dark:text-white leading-tight">
                        {selectedThread.title}
                      </h2>
                    </div>

                    {/* Thread Main Content Body */}
                    <p className="text-gray-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line font-light">
                      {selectedThread.content}
                    </p>

                    {/* Thread Attached Images */}
                    {selectedThread.images && selectedThread.images.length > 0 && (
                      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800">
                        <img 
                          src={selectedThread.images[0]} 
                          alt="attached" 
                          className="w-full max-h-[420px] object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Link back to reports if generated automatically */}
                    {selectedThread.report_id && (
                      <div className="flex items-center justify-between p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/10 border border-teal-500/10 text-xs text-teal-800 dark:text-teal-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          This discussion is linked to an active rescue incident alert.
                        </span>
                        <span className="font-mono font-bold bg-teal-500/10 px-2 py-1 rounded-md text-[10px]">
                          REF: {selectedThread.report_id}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedThread.tags && selectedThread.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {selectedThread.tags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
                            <Tag className="w-3 h-3 text-slate-400" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom controls of thread */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-slate-800/80">
                      
                      {/* Voting and replies counters */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleLikeThread(selectedThread.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            selectedThread.liked_by?.includes(currentUser?.id || '')
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-200 hover:bg-gray-50 text-gray-500 dark:border-slate-800 dark:hover:bg-slate-800'
                          }`}
                        >
                          <ArrowUp className="w-4 h-4" />
                          <span>{selectedThread.upvotes} Upvotes</span>
                        </button>
                        
                        <span className="text-xs text-gray-400 font-mono">
                          {selectedThread.views_count} views
                        </span>
                      </div>

                      {/* Flag or moderation */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setFlagModal({
                            type: 'thread',
                            id: selectedThread.id,
                            userId: selectedThread.author_id,
                            userName: selectedThread.author_name
                          })}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 font-bold transition-all"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          Report
                        </button>

                        {/* Moderator / Admin actions */}
                        {currentUser && (currentUser.role === 'admin' || currentUser.role === 'rescuer') && (
                          <div className="flex items-center gap-1.5 pl-3 border-l border-gray-200 dark:border-slate-800">
                            <button
                              onClick={() => moderateThread(selectedThread.id, 'pin')}
                              className={`p-1.5 rounded-lg text-xs font-bold ${selectedThread.pinned ? 'text-amber-500 bg-amber-500/10' : 'text-gray-400 hover:bg-gray-50'}`}
                              title="Toggle Pin"
                            >
                              <Pin className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moderateThread(selectedThread.id, 'lock')}
                              className={`p-1.5 rounded-lg text-xs font-bold ${selectedThread.locked ? 'text-purple-500 bg-purple-500/10' : 'text-gray-400 hover:bg-gray-50'}`}
                              title="Toggle Lock"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => moderateThread(selectedThread.id, 'feature')}
                              className={`p-1.5 rounded-lg text-xs font-bold ${selectedThread.featured ? 'text-rose-500 bg-rose-500/10' : 'text-gray-400 hover:bg-gray-50'}`}
                              title="Toggle Featured"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this thread?')) {
                                  deleteThread(selectedThread.id);
                                  setSelectedThreadId(null);
                                }
                              }}
                              className="p-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-rose-500 hover:bg-rose-500/10"
                              title="Delete Thread"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>

                  {/* REPLIES TIMELINE SECTON */}
                  <div className="space-y-4 text-left">
                    <h3 className="font-display font-extrabold text-sm text-gray-500 uppercase tracking-widest font-mono">
                      Replies ({threadPosts.length})
                    </h3>

                    <div className="space-y-4">
                      {threadPosts.length === 0 ? (
                        <div className="text-center py-10 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-6">
                          <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500 font-medium">No replies posted yet.</p>
                          <p className="text-xs text-gray-400 mt-1">Be the first to provide helpful veterinaries advice, patrol signups, or coordinates!</p>
                        </div>
                      ) : (
                        threadPosts.map(post => {
                          const quoteTarget = posts.find(p => p.id === post.quoted_post_id);
                          return (
                            <div 
                              key={post.id} 
                              className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm space-y-4 transition-all ${
                                post.is_hidden ? 'opacity-40 bg-slate-50 border-gray-200' : 'border-gray-200/50 dark:border-slate-800/50'
                              }`}
                            >
                              {/* Post Author */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2.5">
                                  <img 
                                    src={post.author_avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                                    alt={post.author_name} 
                                    className="w-8 h-8 rounded-full border border-emerald-500/10 object-cover"
                                  />
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-gray-900 dark:text-white">{post.author_name}</span>
                                      <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1 py-0.2 rounded">
                                        Lvl {getUserReputation(post.author_id).level}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-gray-400">
                                      {new Date(post.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setQuotingPostId(post.id)}
                                    className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-400 hover:text-emerald-600 transition-all"
                                    title="Quote reply"
                                  >
                                    <Reply className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Quoted Block rendering */}
                              {quoteTarget && (
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border-l-2 border-emerald-500 text-xs space-y-1">
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                    <User className="w-3.5 h-3.5 text-gray-400" />
                                    {quoteTarget.author_name} said:
                                  </div>
                                  <p className="text-gray-600 dark:text-slate-400 line-clamp-2 italic font-light">{quoteTarget.content}</p>
                                </div>
                              )}

                              {/* Editable area or main content */}
                              {editingPostId === post.id ? (
                                <div className="space-y-2">
                                  <textarea
                                    value={editingPostContent}
                                    onChange={(e) => setEditingPostContent(e.target.value)}
                                    rows={3}
                                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button 
                                      onClick={() => setEditingPostId(null)}
                                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={async () => {
                                        const ok = await editReply(post.id, editingPostContent);
                                        if (ok) setEditingPostId(null);
                                      }}
                                      className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                                    >
                                      Save Edits
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-slate-300 whitespace-pre-line font-light">
                                  {post.is_hidden ? '[Content hidden by moderator review]' : post.content}
                                </p>
                              )}

                              {/* Attached Images */}
                              {post.images && post.images.length > 0 && (
                                <div className="rounded-xl overflow-hidden max-w-[200px] border border-gray-100">
                                  <img src={post.images[0]} alt="attached reply" className="w-full object-cover" />
                                </div>
                              )}

                              {/* Post Actions: Like, Flag, Moderation */}
                              <div className="flex items-center justify-between pt-2 border-t border-gray-100/50 dark:border-slate-800/50">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleLikePost(post.id)}
                                    className={`flex items-center gap-1 text-[10px] font-bold ${
                                      post.liked_by.includes(currentUser?.id || '')
                                        ? 'text-rose-500'
                                        : 'text-gray-400 hover:text-rose-500'
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${post.liked_by.includes(currentUser?.id || '') ? 'fill-rose-500' : ''}`} />
                                    <span>{post.liked_by.length} likes</span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setFlagModal({
                                      type: 'post',
                                      id: post.id,
                                      userId: post.author_id,
                                      userName: post.author_name
                                    })}
                                    className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-500 font-bold"
                                  >
                                    <Flag className="w-3 h-3" />
                                    Flag
                                  </button>

                                  {/* Author / Mod editing controls */}
                                  {currentUser && (currentUser.id === post.author_id || currentUser.role === 'admin') && (
                                    <button
                                      onClick={() => {
                                        setEditingPostId(post.id);
                                        setEditingPostContent(post.content);
                                      }}
                                      className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-emerald-500 font-bold ml-1.5"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      Edit
                                    </button>
                                  )}

                                  {currentUser && (currentUser.role === 'admin' || currentUser.role === 'rescuer') && (
                                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200 dark:border-slate-800">
                                      <button
                                        onClick={() => moderatePost(post.id, 'hide')}
                                        className={`p-1 rounded ${post.is_hidden ? 'text-amber-500 bg-amber-500/10' : 'text-gray-400'}`}
                                        title="Toggle Hide"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm('Delete this reply?')) {
                                            moderatePost(post.id, 'delete');
                                          }
                                        }}
                                        className="p-1 rounded text-gray-400 hover:text-rose-500 hover:bg-rose-500/10"
                                        title="Delete reply"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* ADD NEW REPLY BOX */}
                  {currentUser ? (
                    <div className="glass-panel p-5 rounded-2xl border border-gray-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-sm space-y-4 text-left">
                      
                      {/* Quoted Post Banner */}
                      {quotingPostId && (
                        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/10 text-xs">
                          <span className="flex items-center gap-1.5 font-medium text-emerald-800 dark:text-emerald-400">
                            <Reply className="w-3.5 h-3.5 text-emerald-500" />
                            Quoting a reply from a community guardian.
                          </span>
                          <button 
                            onClick={() => setQuotingPostId(null)}
                            className="text-gray-400 hover:text-gray-600 font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <form onSubmit={handleAddReplySubmit} className="space-y-3">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={selectedThread.locked ? "This discussion is locked." : "Provide veterinaries advice, coordinate dispatches or join hands..."}
                          rows={4}
                          disabled={selectedThread.locked}
                          className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs sm:text-sm outline-none focus:border-emerald-500 dark:text-white font-light"
                          required
                        />

                        <button
                          type="submit"
                          disabled={selectedThread.locked}
                          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition-all ml-auto cursor-pointer"
                        >
                          <Reply className="w-4 h-4" />
                          Publish Reply
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-500/10 text-xs text-amber-800 dark:text-amber-400 text-center">
                      Please log in or register to publish your reply in the Welfare Action Board.
                    </div>
                  )}

                </motion.div>
              ) : (
                
                /* DISCUSSIONS LISTING LEDGER */
                <motion.div
                  key="threads-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Filters Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 dark:bg-slate-900/40 p-3 rounded-2xl border border-gray-200/50 dark:border-slate-800/50" id="forum-controls">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 flex-grow max-w-md">
                      <Search className="w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search threads, guidelines or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent text-xs outline-none w-full dark:text-white font-light"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold outline-none text-xs text-gray-700 dark:text-slate-300"
                      >
                        <option value="latest">Latest Activities</option>
                        <option value="popular">Most Upvoted & Popular</option>
                        <option value="unreplied">Help Required (No Replies)</option>
                      </select>
                    </div>
                  </div>

                  {/* ACTIVE LEDGER ITERATOR */}
                  <div className="space-y-4" id="threads-ledger">
                    {activeThreads.length === 0 ? (
                      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-800/50 rounded-3xl p-8 space-y-4">
                        <AlertTriangle className="w-12 h-12 text-amber-500/70 mx-auto" />
                        <h4 className="font-display font-black text-md text-gray-900 dark:text-white">No discussions found</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                          No reports or threads matching your search query are currently active in this channel. Start a new one above to invite veterinarians and rescuers!
                        </p>
                      </div>
                    ) : (
                      activeThreads.map(thread => (
                        <div 
                          key={thread.id}
                          onClick={() => setSelectedThreadId(thread.id)}
                          className="glass-panel p-5 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 hover:border-emerald-500/35 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer text-left"
                        >
                          
                          {/* Core Details Area */}
                          <div className="flex-grow space-y-2 min-w-0">
                            
                            {/* Badges/Category */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[9px] font-mono font-extrabold uppercase text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/10">
                                {thread.category_name}
                              </span>
                              {thread.pinned && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 px-1.5 py-0.2 rounded-md">
                                  <Pin className="w-2.5 h-2.5 fill-amber-500" />
                                  PINNED
                                </span>
                              )}
                              {thread.solved && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-1.5 py-0.2 rounded-md">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                  SOLVED
                                </span>
                              )}
                              {thread.featured && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 px-1.5 py-0.2 rounded-md">
                                  <Sparkles className="w-2.5 h-2.5 text-rose-500" />
                                  FEATURED
                                </span>
                              )}
                              <span className="text-[9px] font-mono text-gray-400">
                                {new Date(thread.created_at).toLocaleDateString()}
                              </span>
                            </div>

                            {/* Thread Title */}
                            <h3 className="font-display font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug hover:text-emerald-600 transition-all truncate pr-4">
                              {thread.title}
                            </h3>

                            {/* Author & Tags */}
                            <div className="flex flex-wrap items-center gap-3 pt-1">
                              <div className="flex items-center gap-1.5">
                                <img 
                                  src={thread.author_avatar || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                                  alt={thread.author_name} 
                                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/10"
                                />
                                <span className="text-xs text-gray-500 font-medium">{thread.author_name}</span>
                              </div>

                              {thread.tags && thread.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {thread.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] font-mono text-gray-400 bg-gray-50 dark:bg-slate-800/80 px-1.5 py-0.2 rounded border border-gray-100 dark:border-slate-800">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                          </div>

                          {/* Stats Metrics (Upvotes, replies) */}
                          <div className="flex items-center gap-3 sm:flex-shrink-0 self-end sm:self-auto border-t sm:border-t-0 border-gray-100 dark:border-slate-800 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-start">
                            
                            {/* Counter of replies */}
                            <div className="flex items-center gap-1 text-gray-400 font-medium text-xs">
                              <MessageSquare className="w-4 h-4" />
                              <span>{thread.replies_count} replies</span>
                            </div>

                            {/* Simple Upvote badge button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLikeThread(thread.id);
                              }}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                                thread.liked_by?.includes(currentUser?.id || '')
                                  ? 'bg-emerald-500 border-emerald-500 text-white'
                                  : 'bg-slate-50 border-transparent hover:bg-emerald-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300'
                              }`}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                              <span>{thread.upvotes}</span>
                            </button>

                          </div>

                        </div>
                      ))
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>

      {/* DIALOG 1: CREATE NEW THREAD FORM DIALOG */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-black text-sm text-gray-900 dark:text-white uppercase tracking-wider">Start Community Thread</h3>
                  <p className="text-[10px] text-gray-400 font-mono">Puri Welfare Board • Live Action</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Title of Discussion</label>
                  <input 
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Setting up feeding hub for stray cows near Grand Temple"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Channel Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-bold"
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Link Active Rescue Incident</label>
                    <select
                      value={selectedReportId}
                      onChange={(e) => setSelectedReportId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-bold"
                    >
                      <option value="">-- Optional Link --</option>
                      {reports.map(r => (
                        <option key={r.id} value={r.id}>Incident: {r.title.slice(0, 30)}...</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Tags (comma separated)</label>
                  <input 
                    type="text"
                    value={newTagsInput}
                    onChange={(e) => setNewTagsInput(e.target.value)}
                    placeholder="e.g. CowRescue, BeachCleanup, Swargadwar"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Discussion content details</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide specific details, location coordinates, dates of volunteer mobilization, feeding guidelines etc..."
                    rows={4}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-light"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400 block">Attach Image (URL or suggest placeholder)</label>
                  <input 
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Provide a custom image URL (Unsplash, etc.)"
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {suggestedImages.map(img => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setNewImageUrl(img.url)}
                        className={`text-[9px] font-mono font-bold px-2 py-1 rounded-lg border transition-all ${
                          newImageUrl === img.url 
                            ? 'bg-emerald-500 text-white border-emerald-500' 
                            : 'bg-slate-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg transition-all"
                >
                  Publish on Action Board
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 2: CONTENT FLAGGING / REPORTING MODAL */}
      <AnimatePresence>
        {flagModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
            >
              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
                <h3 className="font-display font-black text-xs text-gray-900 dark:text-white uppercase tracking-wider">Report Community Content</h3>
                <button 
                  onClick={() => setFlagModal(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleFlagSubmit} className="p-5 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Violation Reason</label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-bold"
                    required
                  >
                    <option value="spam">Spam / Advertisements</option>
                    <option value="harassment">Harassment / Insults</option>
                    <option value="animal_abuse">Animal Cruelty or Abuse depictions</option>
                    <option value="false_info">Inaccurate or false guidelines</option>
                    <option value="offensive">Offensive or adult material</option>
                    <option value="other">Other violation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Additional Details</label>
                  <textarea
                    value={flagDetails}
                    onChange={(e) => setFlagDetails(e.target.value)}
                    placeholder="Help moderators investigate by providing context or coordinates..."
                    rows={3}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-light"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg transition-all"
                >
                  File Complaint
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
