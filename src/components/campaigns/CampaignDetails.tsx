/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Heart, 
  ShieldCheck, 
  Calendar, 
  User, 
  Share2, 
  Copy, 
  Check, 
  ThumbsUp, 
  MessageSquare, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  HeartHandshake
} from 'lucide-react';
import { Campaign, CampaignUpdate, Donation } from '../../types';
import { useApp } from '../../context/AppContext';

interface CampaignDetailsProps {
  campaign: Campaign;
  updates: CampaignUpdate[];
  donations: Donation[];
  onBack: () => void;
  onDonateClick: () => void;
  onLikeUpdate: (updateId: string) => void;
  onAddComment: (updateId: string, text: string) => void;
}

export const CampaignDetails: React.FC<CampaignDetailsProps> = ({
  campaign,
  updates,
  donations,
  onBack,
  onDonateClick,
  onLikeUpdate,
  onAddComment
}) => {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'story' | 'ledger' | 'donors' | 'faq'>('story');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState<string>(campaign.image);
  
  // Accordion state for FAQs
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null);

  // Social Share states
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comment input state for each update
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});

  const percent = Math.min(100, Math.floor((campaign.raised_amount / campaign.goal_amount) * 100));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareSocial = (platform: string) => {
    const text = encodeURIComponent(`Help support "${campaign.title}" in Puri!`);
    const url = encodeURIComponent(window.location.href);
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}%20${url}`, '_blank');
    }
  };

  const submitComment = (updateId: string) => {
    const text = commentInputs[updateId];
    if (!text || !text.trim()) return;
    onAddComment(updateId, text.trim());
    setCommentInputs(prev => ({ ...prev, [updateId]: '' }));
  };

  // Filter updates belonging to this campaign
  const campaignUpdatesList = updates.filter(up => up.campaign_id === campaign.id);

  // Filter donations belonging to this campaign
  const campaignDonationsList = donations.filter(don => don.campaign_id === campaign.id && don.status === 'success');

  // Hardcoded default FAQs in case the model doesn't supply any
  const faqs = campaign.faqs && campaign.faqs.length > 0 ? campaign.faqs : [
    {
      question: "How are the funds utilized in this campaign?",
      answer: "100% of donations are pooled directly into raw supplies, wages for field-responders, and fuel for operations. We update our ledger feed on this page on a weekly basis with bills, before-after photos, and direct quotes."
    },
    {
      question: "Will I get a contribution receipt?",
      answer: "Yes. This platform is an independent community initiative. Upon supporting any campaign, a visual contribution receipt is generated instantly, which you can view or print from your profile page."
    },
    {
      question: "Can I volunteer directly with this campaign?",
      answer: "Absolutely! Head to our Community Forum or contact the organizer below to apply for beach patrol or mobile ambulance veterinary support."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left" id={`campaign-details-${campaign.id}`}>
      
      {/* Back button & Action buttons */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white font-mono font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO CAMPAIGNS
        </button>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowShareTooltip(!showShareTooltip)}
            className="flex items-center gap-1.5 border border-gray-250 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>

          <AnimatePresence>
            {showShareTooltip && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 top-11 bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl shadow-xl w-48 z-10 space-y-2 text-xs"
              >
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left flex items-center justify-between py-1.5 px-2 hover:bg-slate-55 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-medium"
                >
                  <span>Copy Link</span>
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                </button>
                <button
                  onClick={() => handleShareSocial('whatsapp')}
                  className="w-full text-left py-1.5 px-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg font-medium text-emerald-600"
                >
                  Share on WhatsApp
                </button>
                <button
                  onClick={() => handleShareSocial('twitter')}
                  className="w-full text-left py-1.5 px-2 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg font-medium text-indigo-600"
                >
                  Share on X (Twitter)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left 2 Columns: Visuals & Narrative */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Showcase Image & Gallery Grid */}
          <div className="space-y-4">
            <div className="h-96 w-full rounded-3xl overflow-hidden border bg-slate-100 dark:bg-slate-900">
              <img 
                src={selectedGalleryImg} 
                alt={campaign.title} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Gallery Thumbnails */}
            {campaign.gallery && campaign.gallery.length > 0 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedGalleryImg(campaign.image)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedGalleryImg === campaign.image ? 'border-brand-teal scale-102 shadow-md' : 'border-transparent'
                  }`}
                >
                  <img src={campaign.image} alt="Cover" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
                {campaign.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGalleryImg(img)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedGalleryImg === img ? 'border-brand-teal scale-102 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full uppercase tracking-wider">
                {campaign.category.toUpperCase().replace('_', ' ')}
              </span>
              {campaign.is_verified && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-100/50">
                  <ShieldCheck className="w-3.5 h-3.5" /> Community Verified
                </span>
              )}
            </div>
            <h1 className="font-display font-extrabold text-2xl md:text-3xl text-gray-900 dark:text-white leading-tight">
              {campaign.title}
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-150 dark:border-slate-800/80 gap-6">
            {(['story', 'ledger', 'donors', 'faq'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs md:text-sm font-bold uppercase tracking-wider font-mono transition-all border-b-2 -mb-0.5 ${
                  activeTab === tab
                    ? 'border-brand-teal text-gray-900 dark:text-white font-extrabold'
                    : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-slate-200'
                }`}
              >
                {tab === 'ledger' ? `Fund Ledger (${campaignUpdatesList.length})` : tab}
              </button>
            ))}
          </div>

          {/* Tab Contents */}
          <div className="pt-2">
            
            {/* Story / Long description */}
            {activeTab === 'story' && (
              <div className="space-y-6">
                <div className="prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed text-gray-650 text-gray-600 dark:text-slate-350 space-y-4">
                  {campaign.long_description ? (
                    campaign.long_description.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <p>{campaign.description}</p>
                  )}
                </div>

                {/* Organizer Info Box */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/40 border rounded-2xl space-y-4">
                  <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Campaign Organizer</h4>
                  <div className="flex items-start gap-4">
                    <img 
                      src={campaign.organizer_avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150"} 
                      alt={campaign.organizer_name} 
                      className="w-12 h-12 rounded-full object-cover border"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h5 className="font-bold text-sm text-gray-800 dark:text-slate-100">{campaign.organizer_name || "Puri Wildlife Guard"}</h5>
                      <p className="text-xs text-gray-500 dark:text-slate-400 leading-normal">
                        {campaign.organizer_bio || "Dedicated coordinator focusing on coastal protection and community education campaigns near Puri Beach."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fund Ledger / Transparency updates */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-lg text-gray-900 dark:text-white">Active Fund Utilization Ledger</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    We maintain absolute financial accountability. Weekly updates document bills, pictures of work on the ground, and direct outcome tallies.
                  </p>
                </div>

                {campaignUpdatesList.length > 0 ? (
                  <div className="relative border-l border-gray-200 dark:border-slate-800 ml-4 pl-6 space-y-8 pt-4">
                    {campaignUpdatesList.map((update) => (
                      <div key={update.id} className="relative group/update">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-brand-emerald border-4 border-white dark:border-slate-950 group-hover/update:scale-110 transition-all shadow-sm" />
                        
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800/80 p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
                            <span className="font-bold text-gray-800 dark:text-slate-350">{update.title}</span>
                            <div className="flex items-center gap-1 font-mono text-[10px]">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(update.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-650 dark:text-slate-350 leading-relaxed">
                            {update.details}
                          </p>

                          {/* Financial Spent Badge */}
                          {update.money_spent && (
                            <div className="inline-flex items-center gap-1.5 bg-brand-teal/5 text-brand-teal dark:text-brand-mint text-xs font-mono font-bold px-3.5 py-1.5 rounded-xl border border-brand-teal/20">
                              <span>Fund Expended: ₹{update.money_spent.toLocaleString()}</span>
                            </div>
                          )}

                          {/* Image inside update */}
                          {update.image && (
                            <div className="rounded-xl overflow-hidden h-48 border">
                              <img src={update.image} alt="Ground update" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                          )}

                          {/* Like and comment stats */}
                          <div className="flex items-center gap-4 pt-1 border-t border-gray-50 dark:border-slate-800/50 text-xs">
                            <button
                              onClick={() => onLikeUpdate(update.id)}
                              className={`flex items-center gap-1.5 font-semibold transition-colors ${
                                currentUser && update.likes.includes(currentUser.id)
                                  ? 'text-brand-teal'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-slate-350'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4" />
                              <span>{update.likes.length} Likes</span>
                            </button>
                            <span className="text-gray-400 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span>{update.comments.length} Comments</span>
                            </span>
                          </div>

                          {/* Comment thread inside update */}
                          <div className="space-y-3 pt-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl">
                            {update.comments.map(c => (
                              <div key={c.id} className="flex gap-2.5 text-xs text-left">
                                <img src={c.author_avatar} alt={c.author_name} className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
                                <div className="space-y-0.5">
                                  <div className="flex gap-1.5 items-center">
                                    <span className="font-bold text-gray-800 dark:text-slate-300">{c.author_name}</span>
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {new Date(c.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                    </span>
                                  </div>
                                  <p className="text-gray-600 dark:text-slate-350 leading-relaxed">{c.content}</p>
                                </div>
                              </div>
                            ))}

                            {/* Add comment input */}
                            {currentUser ? (
                              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                                <input
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={commentInputs[update.id] || ''}
                                  onChange={e => setCommentInputs(prev => ({ ...prev, [update.id]: e.target.value }))}
                                  onKeyDown={e => { if (e.key === 'Enter') submitComment(update.id); }}
                                  className="flex-1 bg-white dark:bg-slate-950 border dark:border-slate-850 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-brand-teal text-gray-800 dark:text-white"
                                />
                                <button
                                  onClick={() => submitComment(update.id)}
                                  className="bg-brand-teal hover:bg-brand-emerald text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all"
                                >
                                  Post
                                </button>
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 text-center font-mono">Log in to reply to updates.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-2xl text-gray-400 font-mono text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-900/20">
                    No transparency ledger updates published yet. Check back soon!
                  </div>
                )}
              </div>
            )}

            {/* Supporter feed */}
            {activeTab === 'donors' && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-lg text-gray-900 dark:text-white">Recent Campaign Supporters</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Grateful acknowledge to the direct guardians of our coastal sanctuary and local street vets.
                  </p>
                </div>

                {campaignDonationsList.length > 0 ? (
                  <div className="space-y-3.5">
                    {campaignDonationsList.map((don) => (
                      <div 
                        key={don.id}
                        className="p-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl flex items-start gap-4 hover:shadow-md transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-brand-emerald/10 text-brand-teal dark:text-brand-mint flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {don.is_anonymous ? '👤' : (don.donor_name ? don.donor_name.substring(0, 2).toUpperCase() : 'CO')}
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                            <span className="font-bold text-gray-800 dark:text-slate-200">
                              {don.is_anonymous ? 'Anonymous Supporter' : don.donor_name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono uppercase">
                              {new Date(don.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>

                          {don.message && (
                            <p className="text-xs text-gray-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 rounded-xl border border-dashed leading-relaxed">
                              &ldquo;{don.message}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                            <span>Sponsor Gift: <strong className="text-brand-emerald">₹{don.amount.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Payment: {don.payment_method?.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border rounded-2xl text-gray-400 font-mono text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-900/20">
                    Be the very first sponsor for this active project!
                  </div>
                )}
              </div>
            )}

            {/* FAQs Accordion */}
            {activeTab === 'faq' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-lg text-gray-900 dark:text-white">Frequently Asked Questions</h4>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Answers to common inquiries regarding our local conservation initiatives and audit measures.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {faqs.map((faq, idx) => {
                    const isOpen = openFaqIdx === idx;
                    return (
                      <div 
                        key={idx}
                        className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                          className="w-full p-5 flex items-center justify-between text-left font-bold text-sm text-gray-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors"
                        >
                          <span>{faq.question}</span>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                        
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-gray-50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/40"
                            >
                              <p className="p-5 text-xs text-gray-600 dark:text-slate-350 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Target Tracking widget / Donate trigger box */}
        <div className="space-y-6">
          
          {/* Tracking box */}
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 shadow-md relative">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">FUNDRAISING GOAL</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-display text-gray-950 dark:text-white">₹{campaign.raised_amount.toLocaleString()}</span>
                <span className="text-xs text-gray-400 font-mono">/ ₹{campaign.goal_amount.toLocaleString()}</span>
              </div>
              
              {/* Progress gauge */}
              <div className="space-y-1.5 pt-2">
                <div className="h-3 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono font-semibold text-gray-400">
                  <span>{percent}% COMPLETE</span>
                  <span>{campaignDonationsList.length} CONTRIBUTIONS</span>
                </div>
              </div>
            </div>

            {/* Quick specifications */}
            <div className="border-t border-b border-gray-100 dark:border-slate-800/60 py-4 space-y-3.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Target Ecosystem</span>
                <span className="font-bold text-gray-850 dark:text-slate-200">{campaign.category.toUpperCase().replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Audit Status</span>
                <span className="font-bold text-brand-teal dark:text-brand-mint flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Community Verified
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 uppercase">Pledging Mode</span>
                <span className="font-bold text-gray-850 dark:text-slate-200 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Direct Support
                </span>
              </div>
            </div>

            {campaign.status !== 'completed' ? (
              <button
                onClick={onDonateClick}
                className="w-full bg-brand-emerald hover:bg-brand-teal text-white font-bold text-sm py-4 rounded-2xl shadow-xl shadow-brand-emerald/10 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-white/15 animate-pulse" />
                Sponsor This Project
              </button>
            ) : (
              <div className="w-full text-center py-4 rounded-2xl border border-brand-emerald bg-brand-emerald/5 font-extrabold text-brand-emerald text-sm">
                Target Fully Achieved! 🎉
              </div>
            )}
          </div>

          {/* Secure Trust widget */}
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850 rounded-2xl p-5 text-left space-y-3">
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-brand-teal" />
              <h5 className="font-bold text-xs text-gray-800 dark:text-slate-200">Our Sacred Guarantee</h5>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 leading-normal">
              Every rupee donated goes directly to field operations. All financial books are audited annually, and reports are published transparently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
