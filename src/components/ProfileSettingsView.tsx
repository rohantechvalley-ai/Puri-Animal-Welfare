/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  User, 
  Bell, 
  Moon, 
  Sun, 
  Lock, 
  Trash2, 
  Eye, 
  EyeOff, 
  ShieldAlert,
  Save,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileSettingsView: React.FC = () => {
  const { currentUser, updateProfile, deleteAccount, showToast } = useApp();
  
  // States coupled to profile update
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [notifPref, setNotifPref] = useState(currentUser?.notifications_enabled ?? true);
  
  // Password reset simulation
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  
  // UI Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  if (!currentUser) return null;

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSavingProfile(true);
    const success = await updateProfile({
      name,
      phone,
      bio,
      location,
      notifications_enabled: notifPref
    });
    setSavingProfile(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmNewPassword) return;

    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setSavingPass(true);
    setTimeout(() => {
      showToast('Account security password updated securely.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSavingPass(false);
    }, 800);
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you absolutely sure you want to deactivate and delete your Puri Welfare profile permanently? This operation is irreversible.')) {
      return;
    }
    setDeactivating(true);
    await deleteAccount();
    setDeactivating(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 text-left" id="settings-root-panel">
      
      {/* Title */}
      <div className="flex items-center gap-3 border-b border-gray-200/50 dark:border-slate-800/50 pb-5" id="settings-header">
        <div className="p-2 bg-brand-emerald/10 text-brand-emerald rounded-xl">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Account Settings</h2>
          <p className="text-xs text-gray-500">Configure profile, toggle notification nodes, update security credentials, and manage theme options.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8" id="settings-bento-grid">
        
        {/* Navigation Shortcuts */}
        <div className="space-y-3" id="settings-navigation-shortcuts">
          {[
            { label: 'Public Profile Information', desc: 'Manage your name, bio, and contact data' },
            { label: 'App Theme Options', desc: 'Configure dark mode preferences' },
            { label: 'Notification Settings', desc: 'Toggle emergency email or phone dispatches' },
            { label: 'Account Credentials', desc: 'Configure secure password rules' },
            { label: 'Danger Zone', desc: 'Deactivate or wipe credentials permanently' }
          ].map((sc, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-slate-900/55 hover:bg-gray-100/40 border border-gray-100 dark:border-slate-800 transition-all cursor-pointer">
              <h4 className="font-semibold text-xs text-gray-900 dark:text-white">{sc.label}</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">{sc.desc}</p>
            </div>
          ))}
        </div>

        {/* Configurations Form */}
        <div className="md:col-span-2 space-y-8" id="settings-forms-ledger">
          
          {/* SECTION 1: PUBLIC PROFILE */}
          <form onSubmit={handleProfileSave} className="glass-panel p-6 rounded-2xl border space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-emerald" />
              Public Sanctuary Profile
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Full Public Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                  required
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Mobile Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Puri Neighborhood Area</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
              />
            </div>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Public Biography / Mission Focus</label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
              />
            </div>

            {/* Notification settings toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-55/10 dark:bg-slate-900/50 border border-gray-100/50 dark:border-slate-800/50">
              <div className="space-y-0.5 text-left">
                <h4 className="font-semibold text-xs text-gray-800 dark:text-slate-100">Toggle Dispatch Alerts</h4>
                <p className="text-[10px] text-gray-400">Receive immediate SMS/push coordinates during nearby animal crises.</p>
              </div>
              <input 
                type="checkbox" 
                checked={notifPref}
                onChange={(e) => setNotifPref(e.target.checked)}
                className="w-4.5 h-4.5 accent-brand-emerald cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 bg-brand-emerald text-white rounded-xl text-xs font-bold shadow-lg hover:bg-brand-teal transition-all flex items-center gap-1.5 ml-auto"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving updates...' : 'Save Profile Changes'}
            </button>
          </form>

          {/* SECTION 2: PASSWORD CHANGE */}
          <form onSubmit={handlePasswordSave} className="glass-panel p-6 rounded-2xl border space-y-4">
            <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white border-b pb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-brand-blue" />
              Change Platform Password
            </h3>

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Old Password</label>
              <div className="relative">
                <input 
                  type={showOldPass ? 'text' : 'password'} 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-3 pr-10 text-xs focus:border-brand-emerald outline-none dark:text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-2.5 text-gray-400"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">New Password</label>
                <div className="relative">
                  <input 
                    type={showNewPass ? 'text' : 'password'} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-3 pr-10 text-xs focus:border-brand-emerald outline-none dark:text-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Confirm New Password</label>
                <input 
                  type="password" 
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPass}
              className="px-5 py-2.5 bg-brand-blue text-white rounded-xl text-xs font-bold shadow-lg hover:bg-blue-600 transition-all flex items-center gap-1.5 ml-auto"
            >
              <Lock className="w-4 h-4" />
              {savingPass ? 'Modifying keys...' : 'Update Password'}
            </button>
          </form>

          {/* SECTION 3: DANGER ZONE */}
          <div className="glass-panel p-6 rounded-2xl border border-red-200/50 dark:border-red-950/40 bg-red-50/5 dark:bg-red-950/5 space-y-4">
            <h3 className="font-display font-bold text-sm text-red-600 dark:text-red-400 border-b pb-2 flex items-center gap-2 border-red-200/30">
              <Trash2 className="w-4 h-4 text-red-500" />
              Danger Zone (Irreversible Actions)
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-100/10 dark:bg-red-950/20 border border-red-200/25">
              <div className="space-y-1 text-left">
                <h4 className="font-bold text-xs text-red-700 dark:text-red-400">Deactivate Profile Permanently</h4>
                <p className="text-[10px] text-gray-400 leading-normal max-w-md">Deletes reported entries history, active campaign lists, and wipes identity logs from all security databases permanently.</p>
              </div>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-600/10 transition-all whitespace-nowrap"
              >
                {deactivating ? 'Wiping Profile...' : 'Deactivate Account'}
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
