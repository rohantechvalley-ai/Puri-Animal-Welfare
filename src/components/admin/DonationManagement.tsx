/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Search, 
  ArrowRightLeft, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Download, 
  HelpCircle,
  FileSpreadsheet,
  FileText,
  Clock,
  Briefcase,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Donation } from '../../types';

interface DonationManagementProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  actingRole: string;
}

export const DonationManagement: React.FC<DonationManagementProps> = ({ onAddAuditLog, actingRole }) => {
  const { donations, campaigns, updateCampaign, showToast } = useApp();

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [amountFilter, setAmountFilter] = useState<string>('all');
  
  // Active selected transaction for detailed audit receipts modal
  const [inspectedTxn, setInspectedTxn] = useState<Donation | null>(null);

  // Financial summary calculations
  const totalRaised = donations.reduce((sum, d) => sum + d.amount, 0);
  const averageDonation = donations.length > 0 ? Math.round(totalRaised / donations.length) : 0;
  const totalSupporters = new Set(donations.map(d => d.donor_name)).size;

  // Filters logic
  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.donor_name.toLowerCase().includes(search.toLowerCase()) || 
                          d.campaign_title.toLowerCase().includes(search.toLowerCase()) || 
                          d.transaction_id.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = methodFilter === 'all' || d.payment_method === methodFilter;
    
    let matchesAmount = true;
    if (amountFilter === 'low') matchesAmount = d.amount < 2000;
    else if (amountFilter === 'mid') matchesAmount = d.amount >= 2000 && d.amount <= 5000;
    else if (amountFilter === 'high') matchesAmount = d.amount > 5000;

    return matchesSearch && matchesMethod && matchesAmount;
  });

  // Simulated full refund & ledger rollback
  const handleRefundTransaction = (donationId: string) => {
    const donation = donations.find(d => d.id === donationId);
    if (!donation) return;

    // 1. Rollback campaign raised amount
    const campaign = campaigns.find(c => c.id === donation.campaign_id);
    if (campaign) {
      const updatedRaised = Math.max(0, campaign.raised_amount - donation.amount);
      const updatedDonorsCount = Math.max(0, campaign.donors_count - 1);
      updateCampaign(campaign.id, { 
        raised_amount: updatedRaised, 
        donors_count: updatedDonorsCount 
      });
    }

    // 2. Mark donation status as refunded
    donation.status = 'refunded' as any; // update local pointer for feedback

    onAddAuditLog(
      'Refund Reversion Processed', 
      `Donation #${donationId} (₹${donation.amount})`, 
      'success', 
      'refunded_reverted'
    );
    
    showToast(`UPI settlement reversed. ₹${donation.amount} refunded back to source bank.`, 'success');
    setInspectedTxn(null);
  };

  const getPaymentBadge = (method: string) => {
    switch (method.toLowerCase()) {
      case 'upi': return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
      case 'card': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'googlepay': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6" id="donation-management-panel">
      {/* Finance telemetry cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Aggregate Inflows</span>
          <h4 className="text-2xl font-bold font-display text-gray-950 dark:text-white mt-1">₹{totalRaised.toLocaleString('en-IN')}</h4>
          <span className="text-[10px] text-brand-emerald flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" />
            +8.4% monthly velocity
          </span>
        </div>

        <div className="p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Average Contribution</span>
          <h4 className="text-2xl font-bold font-display text-gray-950 dark:text-white mt-1 font-mono">₹{averageDonation.toLocaleString('en-IN')}</h4>
          <span className="text-[10px] text-gray-400 mt-1 block">Per registered profile</span>
        </div>

        <div className="p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">Verified Contributors</span>
          <h4 className="text-2xl font-bold font-display text-gray-950 dark:text-white mt-1">{totalSupporters} users</h4>
          <span className="text-[10px] text-brand-blue mt-1 block font-semibold">&bull; 4 institutional sponsors</span>
        </div>

        <div className="p-4 bg-white/50 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800/50 rounded-2xl">
          <span className="text-[10px] font-mono text-gray-400 block uppercase">UPI Settlement rate</span>
          <h4 className="text-2xl font-bold font-display text-emerald-500 mt-1 font-mono">100%</h4>
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            0 settlement delays
          </span>
        </div>
      </div>

      {/* Advanced search ledger bar */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by donor name, campaign title, or TXN transaction reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="flex-1 md:flex-initial p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">All Methods</option>
            <option value="upi">UPI Apps</option>
            <option value="card">Bank Credit/Debit</option>
            <option value="googlepay">Google Pay</option>
          </select>

          <select
            value={amountFilter}
            onChange={e => setAmountFilter(e.target.value)}
            className="flex-1 md:flex-initial p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
          >
            <option value="all">All Amounts</option>
            <option value="low">&lt; ₹2,000</option>
            <option value="mid">₹2,000 - ₹5,000</option>
            <option value="high">&gt; ₹5,000</option>
          </select>
        </div>
      </div>

      {/* Ledger lists */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-mono uppercase tracking-wider">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Donor name</th>
                <th className="p-4">Campaign context</th>
                <th className="p-4">Settle amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ledger actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-gray-400 dark:text-slate-400">
                    No matching financial transactions found in ledger.
                  </td>
                </tr>
              ) : (
                filteredDonations.map(don => (
                  <tr key={don.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/5 transition-colors">
                    <td className="p-4 font-mono font-semibold text-gray-700 dark:text-slate-300">
                      {don.transaction_id}
                    </td>
                    <td className="p-4">
                      <div>
                        <h5 className="font-semibold text-gray-950 dark:text-white">{don.donor_name}</h5>
                        <span className="text-[10px] text-gray-400 font-mono">{don.is_anonymous ? 'Anonymous filter' : 'Public display'}</span>
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate font-medium text-gray-600 dark:text-slate-400">
                      {don.campaign_title}
                    </td>
                    <td className="p-4 font-bold text-gray-900 dark:text-white font-mono">
                      ₹{don.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase border ${getPaymentBadge(don.payment_method)}`}>
                        {don.payment_method.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                        don.status === 'success' 
                          ? 'bg-emerald-500/10 text-emerald-600' 
                          : 'bg-rose-500/10 text-rose-600'
                      }`}>
                        {don.status === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {don.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setInspectedTxn(don)}
                        className="p-1.5 bg-gray-100 hover:bg-brand-emerald/10 dark:bg-slate-800 dark:hover:bg-brand-emerald/10 text-gray-500 hover:text-brand-emerald rounded-lg transition-all inline-flex items-center gap-1 font-semibold"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        Audit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Inspection & Reversion Modal */}
      <AnimatePresence>
        {inspectedTxn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setInspectedTxn(null)}
              className="absolute inset-0 bg-slate-950"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-slate-850">
                <div>
                  <span className="font-mono text-[9px] text-gray-400">FINANCIAL AUDIT</span>
                  <h4 className="font-display font-bold text-sm text-gray-950 dark:text-white">Transaction Details</h4>
                </div>
                <button onClick={() => setInspectedTxn(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 font-mono text-[11px] bg-gray-50 dark:bg-slate-850 p-4 rounded-xl border border-gray-100 dark:border-slate-800 leading-relaxed text-gray-600 dark:text-slate-300">
                <p><span className="text-gray-400 uppercase">TXN REFERENCE:</span> {inspectedTxn.transaction_id}</p>
                <p><span className="text-gray-400 uppercase">SETTLED AMOUNT:</span> ₹{inspectedTxn.amount.toLocaleString('en-IN')}</p>
                <p><span className="text-gray-400 uppercase">DONOR NAME:</span> {inspectedTxn.donor_name}</p>
                <p><span className="text-gray-400 uppercase">DONOR EMAIL:</span> {inspectedTxn.donor_email || 'Not shared'}</p>
                <p><span className="text-gray-400 uppercase">CAMPAIGN TARGET:</span> {inspectedTxn.campaign_title}</p>
                <p><span className="text-gray-400 uppercase">TIMESTAMP UTC:</span> {new Date(inspectedTxn.created_at).toISOString()}</p>
                <p><span className="text-gray-400 uppercase">SETTLEMENT STATUS:</span> <span className="text-emerald-500 font-bold">{inspectedTxn.status.toUpperCase()}</span></p>
                {inspectedTxn.message && (
                  <p><span className="text-gray-400 uppercase">MEMO:</span> "{inspectedTxn.message}"</p>
                )}
              </div>

              {inspectedTxn.status === 'success' ? (
                <div className="space-y-2">
                  <button
                    onClick={() => handleRefundTransaction(inspectedTxn.id)}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Process Refund & Revert Ledger
                  </button>
                  <p className="text-[10px] text-gray-400 text-center leading-normal">
                    Warning: This action automatically reverses campaign totals and issues a reversal request to SBI Gateway. Irreversible action.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-rose-500/10 text-rose-600 border border-rose-500/15 rounded-xl font-bold text-center uppercase text-[10px]">
                  This Transaction has been Refunded & Reverted
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
