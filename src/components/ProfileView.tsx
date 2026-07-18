/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  ShieldCheck, 
  FileText, 
  Heart, 
  Plus, 
  AlertTriangle,
  Receipt,
  FileBadge,
  Clock,
  Printer,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalReport, Donation } from '../types';
import { ProfileSettingsView } from './ProfileSettingsView';

export const ProfileView: React.FC = () => {
  const { currentUser, reports, donations, logs, submitReport, threads } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'reports' | 'donations' | 'discussions' | 'settings'>('reports');
  
  // Interactive 80G modal state
  const [selectedReceipt, setSelectedReceipt] = useState<Donation | null>(null);

  // New report form modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [repTitle, setRepTitle] = useState('');
  const [repDesc, setRepDesc] = useState('');
  const [repCategory, setRepCategory] = useState<'injured_animal' | 'animal_abuse' | 'stray_rescue' | 'wildlife_sighting' | 'environmental_hazard'>('injured_animal');
  const [repAnimal, setRepAnimal] = useState<'dog' | 'cat' | 'cow' | 'monkey' | 'bird' | 'other'>('dog');
  const [repSeverity, setRepSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [repLoc, setRepLoc] = useState('');
  const [repImage, setRepImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4 space-y-4">
        <AlertTriangle className="w-12 h-12 text-brand-amber mx-auto" />
        <h2 className="font-display font-extrabold text-xl text-gray-900 dark:text-white">Profile Restricted</h2>
        <p className="text-xs text-gray-500">You must be securely authenticated to access this dashboard.</p>
      </div>
    );
  }

  // Filter local data belonging to this user
  const myReports = reports.filter(r => r.reporter_id === currentUser.id);
  const myDonations = donations.filter(d => d.donor_id === currentUser.id);
  const myLogs = logs.filter(l => l.user_id === currentUser.id);
  const myDiscussions = (threads || []).filter(t => t.author_id === currentUser.id);

  const totalDonationValue = myDonations.reduce((acc, d) => acc + d.amount, 0);

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repTitle || !repDesc || !repLoc) return;
    setSubmitting(true);
    const images = repImage ? [repImage] : [];
    const res = await submitReport(repTitle, repDesc, repCategory, repAnimal, repSeverity, repLoc, images);
    if (res) {
      setReportModalOpen(false);
      // Reset
      setRepTitle('');
      setRepDesc('');
      setRepLoc('');
      setRepImage('');
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left" id="profile-dashboard-container">
      
      {/* Notion-style Cover & Profile Overview */}
      <div className="glass-panel rounded-3xl overflow-hidden border shadow-lg relative" id="profile-banner-card">
        {/* Cover backdrop */}
        <div className="h-32 bg-gradient-to-r from-brand-teal/20 via-brand-emerald/10 to-brand-blue/25 dark:from-slate-900 dark:to-teal-950/40 relative" />
        
        <div className="px-6 pb-8 md:px-10 flex flex-col md:flex-row items-start md:items-end gap-6 -mt-10 relative">
          <img 
            src={currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
            alt={currentUser.name} 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-950 shadow-md bg-white"
            referrerPolicy="no-referrer"
          />
          <div className="flex-grow space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white leading-tight">{currentUser.name}</h2>
              <span className="inline-flex items-center gap-1 bg-brand-emerald/15 text-brand-teal dark:text-brand-mint text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                {currentUser.role} Active
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-300 leading-relaxed max-w-2xl">{currentUser.bio || "Registered guardian protecting Puri's wildlife habitats."}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 pt-2 text-xs text-gray-400 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                {currentUser.location || 'Puri, Odisha'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-brand-blue" />
                {currentUser.email}
              </span>
              {currentUser.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-brand-amber" />
                  {currentUser.phone}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-red-600/10 hover:scale-101 transition-all flex-shrink-0"
            id="emergency-alert-trigger"
          >
            <Plus className="w-4 h-4" />
            File Rescue Alert
          </button>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex border-b border-gray-200/50 dark:border-slate-800/50" id="profile-navigation-tabs">
        {[
          { id: 'reports', label: `My Reports (${myReports.length})` },
          { id: 'donations', label: `My Donations (₹${totalDonationValue.toLocaleString()})` },
          { id: 'discussions', label: `My Discussions (${myDiscussions.length})` },
          { id: 'settings', label: 'Settings' }
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`px-5 py-3 text-xs md:text-sm font-bold border-b-2 transition-all ${
              activeSubTab === sub.id 
                ? 'border-brand-emerald text-brand-emerald' 
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <div id="profile-subtab-view">
        {/* TAB 1: MY EMERGENCY REPORTS */}
        {activeSubTab === 'reports' && (
          <div className="space-y-6" id="my-reports-ledger">
            {myReports.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl border-dashed">
                <AlertTriangle className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300 mt-3">No reports registered</h4>
                <p className="text-xs text-gray-400 mt-1">If you witness an injured street animal, please submit a rescue alert immediately.</p>
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-brand-emerald text-white text-xs font-semibold rounded-xl"
                >
                  Create Rescue Alert
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myReports.map(report => (
                  <div key={report.id} className="glass-card rounded-2xl border p-5 flex flex-col justify-between hover:shadow-lg transition-all text-left">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 rounded-full ${
                          report.severity === 'critical' 
                             ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' 
                             : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {report.severity} severity
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">ID: {report.id}</span>
                      </div>

                      <div className="flex gap-4">
                        {report.images && report.images[0] && (
                          <img 
                            src={report.images[0]} 
                            alt={report.title} 
                            className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">{report.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-300 line-clamp-2 leading-relaxed">{report.description}</p>
                        </div>
                      </div>

                      {/* Status timeline */}
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-[11px] font-mono font-bold">
                          <span className="text-brand-emerald">Status: {report.status.toUpperCase()}</span>
                          <span className="text-gray-400">Updated today</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${['submitted', 'dispatched', 'in_treatment', 'resolved'].includes(report.status) ? 'bg-brand-emerald' : 'bg-gray-200 dark:bg-slate-800'}`} />
                          <div className={`h-full rounded-full ${['dispatched', 'in_treatment', 'resolved'].includes(report.status) ? 'bg-brand-emerald' : 'bg-gray-200 dark:bg-slate-800'}`} />
                          <div className={`h-full rounded-full ${['in_treatment', 'resolved'].includes(report.status) ? 'bg-brand-emerald' : 'bg-gray-200 dark:bg-slate-800'}`} />
                          <div className={`h-full rounded-full ${report.status === 'resolved' ? 'bg-brand-emerald' : 'bg-gray-200 dark:bg-slate-800'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-emerald" />
                        <span className="truncate max-w-[180px]">{report.location}</span>
                      </span>
                      <span className="font-mono text-[10px]">{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY DONATION RECEIPTS */}
        {activeSubTab === 'donations' && (
          <div className="space-y-6" id="my-donations-ledger">
            {myDonations.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl border-dashed">
                <Receipt className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300 mt-3">No contributions recorded</h4>
                <p className="text-xs text-gray-400 mt-1">Support stray dog feeding, cow medical care, or beach cleanup campaigns today.</p>
              </div>
            ) : (
              <div className="glass-panel rounded-2xl border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs md:text-sm">
                    <thead>
                      <tr className="bg-gray-50/50 dark:bg-slate-900/50 border-b border-gray-200/50 dark:border-slate-800/50 text-gray-400 font-mono tracking-wider uppercase">
                        <th className="p-4">Initiative Project</th>
                        <th className="p-4">Transaction Reference</th>
                        <th className="p-4">Contribution Type</th>
                        <th className="p-4 text-right">Amount</th>
                        <th className="p-4 text-center">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800/55">
                      {myDonations.map(don => (
                        <tr key={don.id} className="hover:bg-gray-55/10 dark:hover:bg-slate-850/10">
                          <td className="p-4 font-semibold text-gray-900 dark:text-white">{don.campaign_title}</td>
                          <td className="p-4 font-mono text-[11px] text-gray-500 dark:text-slate-400">{don.transaction_id}</td>
                          <td className="p-4 font-mono text-[11px] text-brand-emerald">COMMUNITY SUPPORT</td>
                          <td className="p-4 text-right font-bold text-gray-900 dark:text-white">₹{don.amount.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedReceipt(don)}
                              className="inline-flex items-center gap-1 text-[11px] bg-brand-emerald/10 border border-brand-emerald/20 text-brand-teal dark:text-brand-mint font-bold px-3 py-1.5 rounded-lg hover:bg-brand-emerald/20"
                            >
                              <FileBadge className="w-3.5 h-3.5" />
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MY DISCUSSIONS */}
        {activeSubTab === 'discussions' && (
          <div className="space-y-6" id="my-discussions-ledger">
            {myDiscussions.length === 0 ? (
              <div className="text-center py-16 border rounded-2xl border-dashed">
                <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="font-semibold text-sm text-gray-700 dark:text-slate-300 mt-3">No discussions started</h4>
                <p className="text-xs text-gray-400 mt-1">Join the community forum and connect with other volunteers in Puri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myDiscussions.map(thread => (
                  <div key={thread.id} className="glass-card rounded-2xl border p-5 hover:shadow-lg transition-all text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase bg-brand-emerald/10 text-brand-emerald px-2.5 py-1 rounded-full font-bold">
                        {thread.category_name}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(thread.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">{thread.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-slate-300 line-clamp-2 leading-relaxed">{thread.content}</p>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-2 border-t border-gray-100/40 dark:border-slate-800/40">
                      <span>{thread.upvotes} support upvotes</span>
                      <span>•</span>
                      <span>{thread.views_count} views</span>
                      {thread.solved && (
                        <>
                          <span>•</span>
                          <span className="text-brand-emerald font-semibold">Resolved</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeSubTab === 'settings' && (
          <div className="glass-panel rounded-2xl border p-6" id="profile-settings-embed">
            <ProfileSettingsView />
          </div>
        )}
      </div>

      {/* MODAL 1: INTERACTIVE CONTRIBUTION RECEIPT OVERLAY */}
      <AnimatePresence>
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
            >
              {/* Certificate Frame */}
              <div className="p-8 space-y-6" id="printable-certificate-body">
                <div className="flex items-start justify-between border-b pb-4 border-gray-100 dark:border-slate-900">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono tracking-wider font-extrabold text-brand-emerald">COMMUNITY CONTRIBUTION RECEIPT</p>
                    <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">Puri Stray Dog, Cow &amp; Nature Welfare</h3>
                    <p className="text-[10px] text-gray-400 font-mono">Independent Community-Driven Initiative | Swargadwar Coastal HQ</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 flex items-center justify-center text-brand-emerald">
                    <FileBadge className="w-6 h-6" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 space-y-3.5 text-xs">
                  <p className="leading-relaxed">
                    This certifies that the sum of **₹{selectedReceipt.amount.toLocaleString()}** was received from **{selectedReceipt.donor_name}** ({selectedReceipt.donor_email}) as a community contribution on **{new Date(selectedReceipt.created_at).toLocaleDateString()}**.
                  </p>
                  <p className="font-semibold text-brand-teal dark:text-brand-mint">
                    Funds allocated: {selectedReceipt.campaign_title}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 border rounded-xl bg-white dark:bg-slate-950">
                    <p className="text-gray-400 text-[10px]">TRANSACTION REFERENCE</p>
                    <p className="font-bold mt-1 text-gray-800 dark:text-slate-100">{selectedReceipt.transaction_id}</p>
                  </div>
                  <div className="p-3 border rounded-xl bg-white dark:bg-slate-950">
                    <p className="text-gray-400 text-[10px]">INITIATIVE TYPE</p>
                    <p className="font-bold mt-1 text-brand-emerald">COMMUNITY SUPPORT FUND</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-4 border-t border-gray-100 dark:border-slate-900">
                  <div className="space-y-1">
                    <p className="font-bold text-gray-800 dark:text-slate-200">Satyajit Ray</p>
                    <p className="text-gray-400 text-[10px]">Community Coordinator</p>
                  </div>
                  {/* Fake Signature graphic */}
                  <div className="font-serif italic text-sm text-brand-teal select-none border-b border-dashed">
                    Satyajit Ray
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 px-8 py-4 flex items-center justify-between">
                <p className="text-[10px] text-gray-400 font-mono">This is an independent community receipt.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-750 text-gray-700 dark:text-slate-200 px-4 py-2 rounded-xl transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="text-xs font-semibold bg-brand-emerald text-white px-4 py-2 rounded-xl"
                  >
                    Close Certificate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: NEW INCIDENT REPORTING SYSTEM */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-3xl max-w-xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden text-left"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                <div className="space-y-0.5">
                  <h3 className="font-display font-extrabold text-md text-gray-900 dark:text-white">File Emergency Rescue Alert</h3>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Local Veterinary Dispatch Center</p>
                </div>
                <button 
                  onClick={() => setReportModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                >
                  Close
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Alert Title / Summary</label>
                  <input 
                    type="text" 
                    value={repTitle}
                    onChange={(e) => setRepTitle(e.target.value)}
                    placeholder="e.g. Injured street cow near Grand Temple"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Incident Category</label>
                    <select 
                      value={repCategory}
                      onChange={(e) => setRepCategory(e.target.value as any)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    >
                      <option value="injured_animal">Injured Stray Animal</option>
                      <option value="animal_abuse">Animal Abuse Alert</option>
                      <option value="stray_rescue">Stray Pet Relocation</option>
                      <option value="wildlife_sighting">Wildlife Sighting</option>
                      <option value="environmental_hazard">Estuary Beach Hazard</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Animal Species</label>
                    <select 
                      value={repAnimal}
                      onChange={(e) => setRepAnimal(e.target.value as any)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    >
                      <option value="dog">Stray Dog</option>
                      <option value="cow">Street Cow / Cattle</option>
                      <option value="cat">Cat</option>
                      <option value="monkey">Monkey</option>
                      <option value="bird">Seagull / Bird</option>
                      <option value="other">Other Fauna</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Severity Urgency</label>
                    <select 
                      value={repSeverity}
                      onChange={(e) => setRepSeverity(e.target.value as any)}
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    >
                      <option value="low">Low Priority (Welfare inspection)</option>
                      <option value="medium">Medium Priority (Requires treatment)</option>
                      <option value="high">High Priority (Open wounds / bleeding)</option>
                      <option value="critical">Critical Priority (Immobile / dying)</option>
                    </select>
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Attachment Image URL</label>
                    <input 
                      type="text" 
                      value={repImage}
                      onChange={(e) => setRepImage(e.target.value)}
                      placeholder="e.g. https://images.unsplash.com/..."
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Exact Incident Location</label>
                  <input 
                    type="text" 
                    value={repLoc}
                    onChange={(e) => setRepLoc(e.target.value)}
                    placeholder="e.g. Swargadwar Road, near Municipal Primary School"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Detailed Description of Injury / Need</label>
                  <textarea 
                    value={repDesc}
                    onChange={(e) => setRepDesc(e.target.value)}
                    placeholder="Provide details about the animal's behavior, specific injuries, wounds, and accessibility."
                    rows={3}
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/10 transition-all flex items-center justify-center gap-1"
                >
                  {submitting ? 'Despatching rescue vehicles...' : 'Broadcast Rescue Emergency'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
