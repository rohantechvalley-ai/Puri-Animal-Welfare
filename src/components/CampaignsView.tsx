/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Search, 
  Award, 
  Settings, 
  Compass, 
  Grid,
  TrendingUp,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Campaign, CampaignCategory } from '../types';

// Modular Subcomponents Imports
import { CampaignCard } from './campaigns/CampaignCard';
import { CampaignDetails } from './campaigns/CampaignDetails';
import { DonationModal } from './campaigns/DonationModal';
import { LeaderboardWall } from './campaigns/LeaderboardWall';
import { AdminCampaignControls } from './campaigns/AdminCampaignControls';

export const CampaignsView: React.FC = () => {
  const { 
    campaigns, 
    campaignUpdates, 
    donations, 
    leaderboard, 
    likeCampaignUpdate, 
    commentCampaignUpdate,
    currentUser 
  } = useApp();

  // Core view switching tabs
  // 'explore' | 'leaderboard' | 'admin'
  const [currentSubTab, setCurrentSubTab] = useState<'explore' | 'leaderboard' | 'admin'>('explore');

  // Interactive selection states
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaignForDonation, setCampaignForDonation] = useState<Campaign | null>(null);

  // Filter / Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Available categories for UI filtering
  const categoryFilters = [
    { id: 'all', label: 'All Campaigns' },
    { id: 'animal_rescue', label: 'Animal Rescue' },
    { value: 'animal_medical_care', id: 'animal_medical_care', label: 'Medical Care' },
    { id: 'stray_dog_feeding', label: 'Stray Feeding' },
    { id: 'cow_shelter', label: 'Cow Shelters' },
    { id: 'beach_cleanup', label: 'Coastal / Cleanups' }
  ];

  // Filtering logic
  const filteredCampaigns = campaigns.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          camp.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || camp.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left" id="campaigns-view-root">
      
      {/* Title Header with Category Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-150 dark:border-slate-800/80 pb-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full uppercase tracking-wider">
            Sponsorship &amp; Crowdfunding Core
          </span>
          <h2 className="font-display font-black text-3xl text-gray-900 dark:text-white tracking-tight">
            Nature &amp; Veterinary Support Center
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Sponsor active street ambulances, daily stray dog kitchens, and coastal sand dune restoration.
          </p>
        </div>

        {/* Core Sub Navigation Tabs */}
        <div className="flex bg-slate-50 dark:bg-slate-900 border rounded-2xl p-1 shadow-inner self-start md:self-center">
          <button
            onClick={() => {
              setCurrentSubTab('explore');
              setSelectedCampaign(null);
            }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentSubTab === 'explore'
                ? 'bg-white dark:bg-slate-950 shadow-md text-gray-950 dark:text-white font-extrabold'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <Compass className="w-4 h-4" /> Explore Drives
          </button>
          <button
            onClick={() => {
              setCurrentSubTab('leaderboard');
              setSelectedCampaign(null);
            }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentSubTab === 'leaderboard'
                ? 'bg-white dark:bg-slate-950 shadow-md text-gray-950 dark:text-white font-extrabold'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <Award className="w-4 h-4" /> Wall of Honor
          </button>
          <button
            onClick={() => {
              setCurrentSubTab('admin');
              setSelectedCampaign(null);
            }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              currentSubTab === 'admin'
                ? 'bg-white dark:bg-slate-950 shadow-md text-gray-950 dark:text-white font-extrabold'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <Settings className="w-4 h-4" /> Operator Desk
          </button>
        </div>
      </div>

      {/* RENDER SELECTED CAMPAIGN DETAILS VIEW */}
      {selectedCampaign ? (
        <CampaignDetails
          campaign={selectedCampaign}
          updates={campaignUpdates}
          donations={donations}
          onBack={() => setSelectedCampaign(null)}
          onDonateClick={() => setCampaignForDonation(selectedCampaign)}
          onLikeUpdate={(updateId) => likeCampaignUpdate(selectedCampaign.id, updateId)}
          onAddComment={(updateId, text) => commentCampaignUpdate(selectedCampaign.id, updateId, text)}
        />
      ) : (
        <div className="space-y-8">
          
          {/* EXPLORE DRIVES TAB VIEW */}
          {currentSubTab === 'explore' && (
            <div className="space-y-8">
              
              {/* Category selector & Search bar */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl border border-gray-150 dark:border-slate-800/60">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search active campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-brand-teal dark:text-white font-medium"
                  />
                </div>

                {/* Categories filtering carousel */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 lg:pb-0 items-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400 mr-1 hidden sm:block flex-shrink-0" />
                  {categoryFilters.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveCategory(filter.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 border ${
                        activeCategory === filter.id
                          ? 'bg-brand-teal text-white border-brand-teal shadow-sm'
                          : 'bg-white dark:bg-slate-950 border-gray-200 dark:border-slate-850 text-gray-650 dark:text-slate-350 hover:bg-gray-50'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Community Initiative Disclaimer */}
              <div className="flex items-start sm:items-center gap-3 p-4 bg-teal-50/40 dark:bg-teal-950/10 border border-brand-teal/10 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs text-gray-600 dark:text-slate-350 leading-relaxed font-mono">
                  This platform is an independent community initiative. Please review campaign details before contributing. Funds are managed transparently to support approved welfare activities.
                </p>
              </div>

              {/* Grid of campaigns */}
              {filteredCampaigns.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="active-campaigns-grid">
                  {filteredCampaigns.map((camp) => (
                    <CampaignCard
                      key={camp.id}
                      campaign={camp}
                      onSelect={(c) => setSelectedCampaign(c)}
                      onDonateClick={(c) => setCampaignForDonation(c)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/20 border rounded-3xl text-gray-400 font-mono text-xs uppercase tracking-wider">
                  No active conservation campaigns match your search filters.
                </div>
              )}

            </div>
          )}

          {/* LEADERBOARD TAB VIEW */}
          {currentSubTab === 'leaderboard' && (
            <LeaderboardWall entries={leaderboard} />
          )}

          {/* ADMIN MANAGEMENT DESK TAB VIEW */}
          {currentSubTab === 'admin' && (
            <div className="space-y-6">
              {/* Alert banner for non-admin testing */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50/40 dark:bg-slate-900/40 border border-dashed border-indigo-250 rounded-2xl text-xs text-gray-500 leading-relaxed">
                <Info className="w-5 h-5 text-brand-teal flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-800 dark:text-slate-200">Demonstration Operator Access Mode</p>
                  <p className="pt-0.5">
                    For review purposes, this desk is fully unlocked so you can test publishing new conservation campaigns, paused statuses, and weekly expenditure transparency ledger updates without restrictions.
                  </p>
                </div>
              </div>

              <AdminCampaignControls />
            </div>
          )}

        </div>
      )}

      {/* DONATION DIALOG MODAL VIEW */}
      <AnimatePresence>
        {campaignForDonation && (
          <DonationModal
            campaign={campaignForDonation}
            onClose={() => setCampaignForDonation(null)}
            onSuccess={() => {
              setCampaignForDonation(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};
