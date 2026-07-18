/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  TrendingUp, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Star,
  Zap,
  CalendarDays
} from 'lucide-react';
import { LeaderboardEntry } from '../../types';

interface LeaderboardWallProps {
  entries: LeaderboardEntry[];
}

export const LeaderboardWall: React.FC<LeaderboardWallProps> = ({ entries }) => {
  const [period, setPeriod] = useState<'all' | 'monthly' | 'annual'>('all');
  const [activeType, setActiveType] = useState<'supporter' | 'volunteer'>('supporter');

  const filtered = entries
    .filter(entry => entry.type === activeType)
    // sort descending by total_donated
    .sort((a, b) => b.total_donated - a.total_donated);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-display font-black text-sm border border-amber-300 dark:border-amber-700 shadow-md">
            👑
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 flex items-center justify-center font-display font-black text-sm border border-slate-300 dark:border-slate-700 shadow-md">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 flex items-center justify-center font-display font-black text-sm border border-orange-200 dark:border-orange-800 shadow-md">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-900 text-gray-500 flex items-center justify-center font-mono font-bold text-xs border">
            {rank}
          </div>
        );
    }
  };

  const getSupporterBadgeStyles = (badge?: string) => {
    switch (badge) {
      case 'Coastal Guardian':
        return 'bg-teal-55 bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      case 'Holy Cow Sponsor':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Eco Warrior':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-transparent';
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-gray-150 dark:border-slate-800/80 p-6 md:p-8 space-y-6 text-left" id="leaderboard-wall-panel">
      
      {/* Header and Period switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500 animate-bounce" />
            <h3 className="font-display font-extrabold text-xl text-gray-900 dark:text-white">Wall of Honor</h3>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Celebrating the generous contributors and dedicated volunteers protecting Puri\'s delicate animal and environmental habitats.
          </p>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex bg-gray-100 dark:bg-slate-800/50 p-1 rounded-xl self-start sm:self-center">
          <button
            onClick={() => setActiveType('supporter')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeType === 'supporter'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            Top Patrons
          </button>
          <button
            onClick={() => setActiveType('volunteer')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeType === 'volunteer'
                ? 'bg-white dark:bg-slate-900 shadow-sm text-gray-900 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            Top Volunteers
          </button>
        </div>
      </div>

      {/* Podium for top 3 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Rank 2 (Left) */}
          {filtered[1] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-all md:order-1"
            >
              <div className="absolute top-3 left-3">{getRankBadge(2)}</div>
              <img 
                src={filtered[1].avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(filtered[1].name)}`}
                alt={filtered[1].name}
                className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-800 dark:text-slate-100">{filtered[1].name}</h4>
                {filtered[1].badge && (
                  <span className={`inline-block text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getSupporterBadgeStyles(filtered[1].badge)}`}>
                    {filtered[1].badge}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 font-mono">
                <p className="text-[10px] text-gray-400">TOTAL CONTRIBUTED</p>
                <p className="text-md font-extrabold text-brand-teal dark:text-brand-mint">₹{filtered[1].total_donated.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{filtered[1].donations_count} gifts sponsored</p>
              </div>
            </motion.div>
          )}

          {/* Rank 1 (Center) */}
          {filtered[0] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-950 rounded-3xl border-2 border-amber-300 dark:border-amber-600/60 p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-md hover:shadow-xl transition-all md:order-2 md:-translate-y-2"
            >
              <div className="absolute top-4 left-4">{getRankBadge(1)}</div>
              <div className="relative">
                <img 
                  src={filtered[0].avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(filtered[0].name)}`}
                  alt={filtered[0].name}
                  className="w-20 h-20 rounded-full border-4 border-amber-100 dark:border-amber-900/40 object-cover shadow-inner"
                  referrerPolicy="no-referrer"
                />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-black text-base text-gray-900 dark:text-white">{filtered[0].name}</h4>
                {filtered[0].badge && (
                  <span className={`inline-block text-[9px] font-mono font-bold px-3 py-1 rounded-full border ${getSupporterBadgeStyles(filtered[0].badge)}`}>
                    {filtered[0].badge}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 font-mono">
                <p className="text-[10px] text-gray-400">TOTAL CONTRIBUTED</p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400">₹{filtered[0].total_donated.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{filtered[0].donations_count} gifts sponsored</p>
              </div>
            </motion.div>
          )}

          {/* Rank 3 (Right) */}
          {filtered[2] && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden shadow-sm hover:shadow-md transition-all md:order-3"
            >
              <div className="absolute top-3 left-3">{getRankBadge(3)}</div>
              <img 
                src={filtered[2].avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(filtered[2].name)}`}
                alt={filtered[2].name}
                className="w-16 h-16 rounded-full border-2 border-orange-100 dark:border-slate-700 object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-800 dark:text-slate-100">{filtered[2].name}</h4>
                {filtered[2].badge && (
                  <span className={`inline-block text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${getSupporterBadgeStyles(filtered[2].badge)}`}>
                    {filtered[2].badge}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 font-mono">
                <p className="text-[10px] text-gray-400">TOTAL CONTRIBUTED</p>
                <p className="text-md font-extrabold text-brand-teal dark:text-brand-mint">₹{filtered[2].total_donated.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400">{filtered[2].donations_count} gifts sponsored</p>
              </div>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="text-center py-10 bg-white dark:bg-slate-950 border rounded-2xl text-gray-400 font-mono text-xs uppercase tracking-wider">
          No entries recorded for this category yet.
        </div>
      )}

      {/* Remaining list items */}
      {filtered.length > 3 && (
        <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-900/65 rounded-2xl divide-y divide-gray-100 dark:divide-slate-900">
          {filtered.slice(3).map((entry, index) => {
            const actualRank = index + 4;
            return (
              <div 
                key={entry.id || entry.name}
                className="p-4 flex items-center justify-between gap-4 flex-wrap hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 flex justify-center text-xs font-mono font-bold text-gray-400">
                    #{actualRank}
                  </div>
                  <img 
                    src={entry.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(entry.name)}`}
                    alt={entry.name}
                    className="w-10 h-10 rounded-full object-cover border"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left space-y-0.5">
                    <h5 className="font-bold text-xs text-gray-800 dark:text-slate-100">{entry.name}</h5>
                    {entry.badge && (
                      <span className={`inline-block text-[8px] font-mono font-bold px-2 py-0.2 rounded-full border ${getSupporterBadgeStyles(entry.badge)}`}>
                        {entry.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8 font-mono text-right">
                  <div className="text-[10px] text-gray-400 hidden sm:block">
                    <p>SPONSORED</p>
                    <p className="font-bold text-gray-600 dark:text-slate-300">{entry.donations_count} times</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[9px] text-gray-400">TOTAL SUPPORT</p>
                    <p className="text-xs font-extrabold text-gray-900 dark:text-white">₹{entry.total_donated.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
