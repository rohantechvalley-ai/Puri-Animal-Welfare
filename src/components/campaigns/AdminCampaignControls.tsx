/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  FilePlus, 
  TrendingUp, 
  Edit, 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  Eye, 
  HeartHandshake,
  DollarSign,
  Calendar,
  Layers,
  Settings
} from 'lucide-react';
import { Campaign, CampaignCategory, CampaignStatus, CampaignUpdate } from '../../types';
import { useApp } from '../../context/AppContext';

export const AdminCampaignControls: React.FC = () => {
  const { 
    campaigns, 
    createCampaign, 
    updateCampaign, 
    deleteCampaign, 
    addCampaignUpdate,
    currentUser 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'create' | 'update' | 'manage'>('create');

  // Campaign Create State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLongDesc, setNewLongDesc] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newCategory, setNewCategory] = useState<CampaignCategory>('dog_feeding');
  const [newCover, setNewCover] = useState('');
  const [newGallery, setNewGallery] = useState('');
  const [newOrganizer, setNewOrganizer] = useState(currentUser?.name || 'Puri Nature Coordinator');
  const [newOrgBio, setNewOrgBio] = useState('Local nature warden safeguarding coastal ecosystems and beach safety zones in Puri.');
  const [newIsUrgent, setNewIsUrgent] = useState(false);
  const [newIsVerified, setNewIsVerified] = useState(true);

  // Campaign Update Ledger State
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaigns[0]?.id || '');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateDetails, setUpdateDetails] = useState('');
  const [updateSpent, setUpdateSpent] = useState('');
  const [updateBeforeImg, setUpdateBeforeImg] = useState('');
  const [updateAfterImg, setUpdateAfterImg] = useState('');

  const handleCreateCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newGoal) return;

    const parsedGoal = parseFloat(newGoal);
    if (isNaN(parsedGoal) || parsedGoal <= 0) return;

    // Convert comma-separated urls to array
    const galleryArr = newGallery 
      ? newGallery.split(',').map(u => u.trim()).filter(Boolean)
      : [];

    const defaultCover = newCover || 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600';

    await createCampaign({
      title: newTitle,
      description: newDesc,
      long_description: newLongDesc,
      goal_amount: parsedGoal,
      image: defaultCover,
      images: galleryArr.length > 0 ? galleryArr : [defaultCover],
      category: newCategory,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      organizer: newOrganizer,
      organizer_avatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      organizer_bio: newOrgBio,
      is_featured: false,
      is_urgent: newIsUrgent,
      is_verified: newIsVerified
    });

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewLongDesc('');
    setNewGoal('');
    setNewCover('');
    setNewGallery('');
    setActiveTab('manage');
  };

  const handlePostUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId || !updateTitle || !updateDetails || !updateSpent) return;

    const parsedSpent = parseFloat(updateSpent);
    if (isNaN(parsedSpent) || parsedSpent <= 0) return;

    const targetCamp = campaigns.find(c => c.id === selectedCampaignId);
    if (!targetCamp) return;

    // Call Context action
    await addCampaignUpdate(selectedCampaignId, {
      campaign_id: selectedCampaignId,
      title: updateTitle,
      description: updateDetails, // description is mapped to details in types
      amount_spent: parsedSpent,  // matches types definition
      date: new Date().toISOString(),
      before_image: updateBeforeImg || undefined,
      after_image: updateAfterImg || undefined
    });

    // Reset Form
    setUpdateTitle('');
    setUpdateDetails('');
    setUpdateSpent('');
    setUpdateBeforeImg('');
    setUpdateAfterImg('');
    
    // Redirect to updates tab on campaign page would happen naturally
  };

  const handleToggleStatus = async (camp: Campaign, nextStatus: CampaignStatus) => {
    await updateCampaign(camp.id, { status: nextStatus });
  };

  const handleDelete = async (campId: string) => {
    if (window.confirm('Are you absolutely sure you want to delete this campaign? This action is permanent.')) {
      await deleteCampaign(campId);
    }
  };

  const categoriesList: { value: CampaignCategory; label: string }[] = [
    { value: 'dog_feeding', label: 'Dog Feeding' },
    { value: 'dog_medical', label: 'Dog Medical Care' },
    { value: 'cow_rescue', label: 'Cow Rescue' },
    { value: 'cow_feeding', label: 'Cow Feeding' },
    { value: 'beach_cleanup', label: 'Beach Cleanup' },
    { value: 'tree_plantation', label: 'Tree Plantation' },
    { value: 'environmental_awareness', label: 'Environmental Awareness' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800/80 rounded-3xl p-6 space-y-6 text-left" id="admin-campaign-controls-panel">
      
      {/* Tab select header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <h3 className="font-display font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-teal" /> Campaign Management Center
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Publish campaigns, post weekly ledger expenditure logs, or manage active campaigns.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl self-start sm:self-center border">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-900 shadow text-gray-950 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Create
          </button>
          <button
            onClick={() => setActiveTab('update')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'update'
                ? 'bg-white dark:bg-slate-900 shadow text-gray-950 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Post Ledger
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'manage'
                ? 'bg-white dark:bg-slate-900 shadow text-gray-950 dark:text-white'
                : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Manage ({campaigns.length})
          </button>
        </div>
      </div>

      {/* TABS INTERFACES */}
      {activeTab === 'create' && (
        <form onSubmit={handleCreateCampaignSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Campaign Title</label>
              <input 
                type="text" 
                placeholder="e.g. Puri Beach Olive Ridley Protection"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Category</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as CampaignCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-teal dark:text-white font-bold"
              >
                {categoriesList.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Short Summary</label>
            <input 
              type="text" 
              placeholder="A brief 1-2 sentence description summarizing the core objective."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Long Narrative story (Splits with paragraphs)</label>
            <textarea 
              rows={4}
              placeholder="Describe the full story, the target ecosystem, what raw equipment is needed, and why this project is critical to Puri's wild assets..."
              value={newLongDesc}
              onChange={e => setNewLongDesc(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Financial Goal amount (INR)</label>
              <input 
                type="number" 
                placeholder="e.g. 150000"
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Cover Image URL</label>
              <input 
                type="text" 
                placeholder="e.g. https://images.unsplash.com/..."
                value={newCover}
                onChange={e => setNewCover(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input 
                type="checkbox" 
                checked={newIsUrgent} 
                onChange={e => setNewIsUrgent(e.target.checked)} 
                className="w-4 h-4 accent-rose-600"
              />
              <span className="font-bold text-rose-600 uppercase font-mono text-[10px]">Mark as HIGH-PRIORITY URGENT</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input 
                type="checkbox" 
                checked={newIsVerified} 
                onChange={e => setNewIsVerified(e.target.checked)} 
                className="w-4 h-4 accent-brand-teal"
              />
              <span className="font-bold text-indigo-600 uppercase font-mono text-[10px]">Direct 80G Tax-exempt audit verified</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-teal hover:bg-brand-emerald text-white text-xs font-bold py-3 rounded-xl transition-all"
          >
            Publish New Welfare Campaign
          </button>
        </form>
      )}

      {activeTab === 'update' && (
        <form onSubmit={handlePostUpdateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Select Target Campaign</label>
              <select
                value={selectedCampaignId}
                onChange={e => setSelectedCampaignId(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-teal dark:text-white font-bold"
              >
                {campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Amount Expended (INR)</label>
              <input 
                type="number" 
                placeholder="e.g. 15000"
                value={updateSpent}
                onChange={e => setUpdateSpent(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Update Title</label>
            <input 
              type="text" 
              placeholder="e.g. Dispatched Surgical Kits to Veterinary Ambulance"
              value={updateTitle}
              onChange={e => setUpdateTitle(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Expenditure / Ground-Work Details</label>
            <textarea 
              rows={3}
              placeholder="Itemize the bills, specify which rescue shelter was updated, and provide direct feedback for contributors..."
              value={updateDetails}
              onChange={e => setUpdateDetails(e.target.value)}
              required
              className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Before-Work Photo URL (Optional)</label>
              <input 
                type="text" 
                placeholder="Image showing previous condition"
                value={updateBeforeImg}
                onChange={e => setUpdateBeforeImg(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">After-Work Photo URL (Optional)</label>
              <input 
                type="text" 
                placeholder="Image showing repaired condition"
                value={updateAfterImg}
                onChange={e => setUpdateAfterImg(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-2 px-3.5 text-xs outline-none focus:border-brand-teal dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-emerald hover:bg-brand-teal text-white text-xs font-bold py-3 rounded-xl transition-all"
          >
            Publish Weekly Transparency Update
          </button>
        </form>
      )}

      {activeTab === 'manage' && (
        <div className="space-y-3.5">
          {campaigns.map(camp => (
            <div 
              key={camp.id}
              className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <img src={camp.image} alt={camp.title} className="w-12 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                <div className="text-left space-y-0.5 max-w-[280px]">
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">{camp.title}</h4>
                  <p className="text-[10px] font-mono text-gray-400 uppercase">
                    GOAL: ₹{camp.goal_amount.toLocaleString()} | RAISED: ₹{camp.raised_amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Operations row */}
              <div className="flex items-center gap-2">
                
                {/* Status indicator button */}
                {camp.status === 'active' && (
                  <button
                    onClick={() => handleToggleStatus(camp, 'paused')}
                    className="bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg border border-amber-200/50 hover:bg-amber-200"
                  >
                    Pause Campaign
                  </button>
                )}
                
                {camp.status === 'paused' && (
                  <button
                    onClick={() => handleToggleStatus(camp, 'active')}
                    className="bg-brand-emerald/10 text-brand-teal dark:bg-brand-teal/20 dark:text-brand-mint text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg border border-brand-teal/20 hover:bg-brand-teal/35"
                  >
                    Activate Campaign
                  </button>
                )}

                {camp.status !== 'completed' && (
                  <button
                    onClick={() => handleToggleStatus(camp, 'completed')}
                    className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300 text-[10px] font-bold font-mono px-2.5 py-1.5 rounded-lg border border-indigo-150 hover:bg-indigo-100"
                  >
                    Set Completed
                  </button>
                )}

                <button
                  onClick={() => handleDelete(camp.id)}
                  className="p-1.5 text-rose-500 hover:text-white hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all"
                  title="Delete Campaign"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
