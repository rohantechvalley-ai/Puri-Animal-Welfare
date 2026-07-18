/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle, 
  Users, 
  CheckCircle2
} from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignCardProps {
  campaign: Campaign;
  onSelect: (campaign: Campaign) => void;
  onDonateClick: (campaign: Campaign) => void;
}

export const CampaignCard: React.FC<CampaignCardProps> = ({ 
  campaign, 
  onSelect, 
  onDonateClick 
}) => {
  const percent = Math.min(100, Math.floor((campaign.raised_amount / campaign.goal_amount) * 100));
  const isUrgent = campaign.is_urgent;
  const isCompleted = campaign.status === 'completed';

  // Human friendly category names
  const getCategoryLabel = (cat: string) => {
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between h-full shadow-md hover:shadow-xl hover:border-brand-teal/20 transition-all duration-300 group relative"
      id={`campaign-card-${campaign.id}`}
    >
      {/* Top Badges overlay on Image */}
      <div className="relative h-56 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img 
          src={campaign.image} 
          alt={campaign.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Category Badge */}
        <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
          {getCategoryLabel(campaign.category)}
        </span>

        {/* Visual Badges (Urgent / Completed / Verified) */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 items-end">
          {isUrgent && !isCompleted && (
            <span className="bg-rose-500 text-white text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1 animate-pulse">
              <AlertCircle className="w-3 h-3" /> Urgent
            </span>
          )}
          {isCompleted && (
            <span className="bg-brand-emerald text-white text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Fully Funded
            </span>
          )}
          {campaign.is_verified && (
            <span className="bg-indigo-600 text-white text-[9px] font-mono font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          )}
        </div>

        {/* Backdrop shade at bottom of image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-6 flex-grow flex flex-col justify-between space-y-4 text-left">
        <div className="space-y-2">
          {/* Title and Short Description */}
          <button 
            onClick={() => onSelect(campaign)}
            className="block text-left w-full hover:text-brand-teal transition-colors group/title"
          >
            <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover/title:underline">
              {campaign.title}
            </h3>
          </button>
          <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed line-clamp-3">
            {campaign.description}
          </p>
        </div>

        {/* Progress & Meta Info */}
        <div className="space-y-4 pt-2">
          {/* Progress gauge */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-bold">
              <span className="text-brand-teal dark:text-brand-mint flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {percent}% Sponsored
              </span>
              <span className="text-gray-400">Goal: ₹{campaign.goal_amount.toLocaleString()}</span>
            </div>
            
            <div className="h-2.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full transition-all duration-500" 
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="flex items-center justify-between text-xs text-gray-400 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{campaign.donors_count || 0} supporters</span>
            </div>
            <div>
              <span>₹{campaign.raised_amount.toLocaleString()} raised</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="px-6 pb-6 pt-2 flex gap-3 border-t border-gray-50 dark:border-slate-800/50 mt-auto">
        <button
          onClick={() => onSelect(campaign)}
          className="flex-1 text-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold text-xs py-3 rounded-xl transition-all"
        >
          View Details
        </button>
        {!isCompleted ? (
          <button
            onClick={() => onDonateClick(campaign)}
            className="flex-1 flex items-center justify-center gap-1 bg-brand-emerald hover:bg-brand-teal text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-brand-emerald/10 hover:scale-[1.01] transition-all"
          >
            <Heart className="w-4 h-4 fill-white/10" />
            Sponsor
          </button>
        ) : (
          <div className="flex-grow flex items-center justify-center text-xs font-bold text-brand-emerald border border-brand-emerald/30 bg-brand-emerald/5 rounded-xl py-3 cursor-default">
            Campaign Completed
          </div>
        )}
      </div>
    </motion.div>
  );
};
