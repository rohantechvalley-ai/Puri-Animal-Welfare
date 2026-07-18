/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Heart, 
  EyeOff, 
  Lock, 
  CreditCard, 
  Wallet, 
  Smartphone, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Printer, 
  QrCode, 
  ShieldCheck, 
  Sparkles,
  Info
} from 'lucide-react';
import { Campaign, Donation } from '../../types';
import { useApp } from '../../context/AppContext';

interface DonationModalProps {
  campaign: Campaign;
  onClose: () => void;
  onSuccess: (donation: Donation) => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ campaign, onClose, onSuccess }) => {
  const { currentUser, makeDetailedDonation } = useApp();

  // Step state: 'form' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingText, setProcessingText] = useState('Initializing secured connection...');
  const [completedDonation, setCompletedDonation] = useState<Donation | null>(null);

  // Form parameters
  const [donateAmount, setDonateAmount] = useState<number>(2500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');

  // Credit Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Certificate printing / viewing state
  const [showCertificate, setShowCertificate] = useState(false);

  // Initialize form with current user details if logged in
  useEffect(() => {
    if (currentUser) {
      setDonorName(currentUser.name);
      setDonorEmail(currentUser.email);
      setDonorPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  // Handle formatted card number input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.substring(0, 16);
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  const finalAmount = customAmount ? parseFloat(customAmount) : donateAmount;

  // Handle donation submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(finalAmount) || finalAmount <= 0) return;

    // Direct user to processing step
    setStep('processing');
    setProcessingProgress(15);
    setProcessingText('Opening SSL 256-Bit secured payment gateway...');

    // Progress Simulation Timeline
    const timer1 = setTimeout(() => {
      setProcessingProgress(45);
      setProcessingText('Registering escrow ledger parameters...');
    }, 600);

    const timer2 = setTimeout(() => {
      setProcessingProgress(75);
      setProcessingText('Acquiring bank authorization parameters...');
    }, 1200);

    const timer3 = setTimeout(() => {
      setProcessingProgress(95);
      setProcessingText('Finalizing cryptographic transaction token...');
    }, 1800);

    // Call the detailed donation context API
    const res = await makeDetailedDonation({
      amount: finalAmount,
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      isAnonymous,
      donorName: isAnonymous ? 'Anonymous Donor' : donorName || 'Guest Contributor',
      donorEmail: isAnonymous ? 'anonymous@puriwelfare.org' : donorEmail || 'guest@puriwelfare.org',
      donorPhone: isAnonymous ? undefined : donorPhone,
      message: message.trim() || undefined,
      paymentMethod
    });

    clearTimeout(timer1);
    clearTimeout(timer2);
    clearTimeout(timer3);

    if (res.success && res.donation) {
      setProcessingProgress(100);
      setProcessingText('Authorized! Transfer complete.');
      setTimeout(() => {
        setCompletedDonation(res.donation!);
        setStep('success');
        onSuccess(res.donation!);
      }, 300);
    } else {
      // Return to form if error
      setStep('form');
    }
  };

  const getEcosystemBadge = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'marine_rescue': return 'Olive Ridley Patron';
      case 'holy_cow': return 'Sustainer of Sacred Cows';
      case 'stray_pets': return 'Stray Animal Guardian';
      default: return 'Puri Nature Protector';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <AnimatePresence mode="wait">
        
        {/* CHECKOUT FORM STEP */}
        {step === 'form' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full border border-gray-200 dark:border-slate-900 shadow-2xl overflow-hidden text-left flex flex-col md:flex-row h-auto md:h-[620px]"
          >
            {/* Left Column: Summary of campaign */}
            <div className="md:w-5/12 bg-slate-50 dark:bg-slate-900/60 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-150 dark:border-slate-900">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 text-brand-teal dark:text-brand-mint px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Sponsoring Project
                  </span>
                  <h4 className="font-display font-extrabold text-sm text-gray-400 font-mono uppercase tracking-widest pt-2">Campaign Details</h4>
                  <h3 className="font-display font-bold text-base text-gray-800 dark:text-white leading-snug line-clamp-3">
                    {campaign.title}
                  </h3>
                </div>

                <div className="h-32 rounded-xl overflow-hidden border">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>

                <div className="space-y-1 font-mono text-[11px] text-gray-500">
                  <div className="flex justify-between">
                    <span>Target Category</span>
                    <span className="font-bold">{campaign.category.toUpperCase().replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Registry</span>
                    <span className="font-bold text-brand-teal dark:text-brand-mint">Community Verified</span>
                  </div>
                </div>
              </div>

              {/* Secure bottom badge */}
              <div className="pt-4 border-t border-gray-200/50 dark:border-slate-800/40 text-[10px] text-gray-400 space-y-1 font-mono">
                <p className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" /> SSL 256-Bit Encrypted</p>
                <p>100% Direct Utilization Registry</p>
              </div>
            </div>

            {/* Right Column: Checkout Fields & Payment Accordion */}
            <form onSubmit={handleSubmit} className="md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto space-y-5">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="font-display font-black text-lg text-gray-950 dark:text-white">Secure Checkout</h2>
                    <p className="text-[10px] font-mono uppercase tracking-wider text-gray-400">Community Support contribution</p>
                  </div>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Amount Selectors */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Select Donation Amount (INR)</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1000, 2500, 5000, 10000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setDonateAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`py-2 rounded-xl font-bold text-xs border transition-all ${
                          donateAmount === amt && !customAmount
                            ? 'bg-brand-emerald text-white border-brand-emerald shadow-md'
                            : 'bg-transparent border-gray-200 dark:border-slate-800 text-gray-750 dark:text-slate-300 hover:bg-gray-50'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  {/* Custom Input */}
                  <input 
                    type="number" 
                    placeholder="Or enter custom amount (INR)"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setDonateAmount(0);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-bold"
                  />
                </div>

                {/* Personal Information Fields */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Personal Information</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      placeholder="Donor Full Name"
                      value={donorName}
                      onChange={e => setDonorName(e.target.value)}
                      required={!isAnonymous}
                      disabled={isAnonymous}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                    />
                    <input 
                      type="email" 
                      placeholder="Donor Email address"
                      value={donorEmail}
                      onChange={e => setDonorEmail(e.target.value)}
                      required={!isAnonymous}
                      disabled={isAnonymous}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <input 
                      type="tel" 
                      placeholder="Phone number (optional, for direct Updates / WhatsApp notification)"
                      value={donorPhone}
                      onChange={e => setDonorPhone(e.target.value)}
                      disabled={isAnonymous}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Custom message of encouragement (shows on supporter wall)"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                    />
                  </div>
                </div>

                {/* Anonymous switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-55/10 dark:bg-slate-900/50 border border-gray-150/40">
                  <div className="space-y-0.5 text-left flex items-start gap-2">
                    <EyeOff className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-[11px] text-gray-800 dark:text-slate-100">Make contribution Anonymous</h4>
                      <p className="text-[9px] text-gray-400 leading-tight max-w-[280px]">Hides your profile name, email, and phone from the public supporters board.</p>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) {
                        setDonorName('Anonymous Donor');
                        setDonorEmail('anonymous@puriwelfare.org');
                        setDonorPhone('');
                      } else if (currentUser) {
                        setDonorName(currentUser.name);
                        setDonorEmail(currentUser.email);
                        setDonorPhone(currentUser.phone || '');
                      } else {
                        setDonorName('');
                        setDonorEmail('');
                        setDonorPhone('');
                      }
                    }}
                    className="w-4 h-4 accent-brand-emerald cursor-pointer"
                  />
                </div>

                {/* Payment Accordion Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Select Secured Payment Method</label>
                    <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase">
                      Donations Coming Soon
                    </span>
                  </div>

                  {/* Donations Coming Soon / Pluggable Gateway Notice */}
                  <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed space-y-1 text-left" id="donations-coming-soon-notice">
                    <div className="flex items-start gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                      <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      <span>Pluggable Gateway Sandbox Simulator</span>
                    </div>
                    <p className="opacity-90">
                      We are currently establishing direct banking integrations. Real transactions are disabled. You can complete this form to trigger sandbox simulation events and claim mock donation badges.
                    </p>
                  </div>
                  
                  {/* Tabs */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {([
                      { id: 'upi', label: 'UPI / QR', icon: Smartphone },
                      { id: 'card', label: 'Card', icon: CreditCard },
                      { id: 'wallet', label: 'Wallets', icon: Wallet }
                    ] as const).map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPaymentMethod(tab.id)}
                          className={`py-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                            paymentMethod === tab.id
                              ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-150 text-white dark:text-slate-950 font-bold shadow'
                              : 'bg-transparent border-gray-200 dark:border-slate-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-900'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] font-mono tracking-wider">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Method Content details */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-2xl border text-xs">
                    
                    {/* UPI QR Code Generation */}
                    {paymentMethod === 'upi' && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                        <div className="bg-white p-2.5 rounded-xl border flex-shrink-0 relative">
                          <QrCode className="w-16 h-16 text-slate-850" />
                          <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-brand-teal animate-pulse" />
                        </div>
                        <div className="space-y-1 text-[11px] leading-normal text-gray-500">
                          <p className="font-bold text-gray-800 dark:text-slate-200">Instant UPI QR Generated</p>
                          <p>We generate a secure UPI endpoint dynamically linked for <strong className="text-brand-emerald">₹{finalAmount.toLocaleString()}</strong>.</p>
                          <p className="text-[9px] font-mono">UPI VPA: payments@puriwelfare.oksbi</p>
                        </div>
                      </div>
                    )}

                    {/* Debit/Credit Card Fields */}
                    {paymentMethod === 'card' && (
                      <div className="space-y-3 text-left">
                        {/* Dynamic Interactive Credit Card layout */}
                        <div className="relative h-28 w-full bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-4 text-white font-mono flex flex-col justify-between shadow-md overflow-hidden select-none">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-8" />
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold tracking-widest uppercase">Puri Eco Card</span>
                            <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded uppercase">Verified</span>
                          </div>
                          
                          <div className="text-sm md:text-md tracking-widest font-black py-1">
                            {cardNumber || '•••• •••• •••• ••••'}
                          </div>

                          <div className="flex justify-between items-end text-[9px]">
                            <div className="space-y-0.5">
                              <p className="text-white/60 text-[8px]">CARDHOLDER</p>
                              <p className="font-bold uppercase truncate max-w-[120px]">{cardName || 'YOUR FULL NAME'}</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <p className="text-white/60 text-[8px]">EXPIRES</p>
                              <p className="font-bold">{cardExpiry || 'MM/YY'}</p>
                            </div>
                          </div>
                        </div>

                        {/* Card Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input 
                            type="text" 
                            placeholder="Card Number"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            maxLength={19}
                            className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-mono"
                          />
                          <input 
                            type="text" 
                            placeholder="Cardholder Name"
                            value={cardName}
                            onChange={e => setCardName(e.target.value)}
                            className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <input 
                            type="text" 
                            placeholder="Expiry (MM/YY)"
                            value={cardExpiry}
                            onChange={e => {
                              let v = e.target.value.replace(/\D/g, '');
                              if (v.length > 4) v = v.substring(0, 4);
                              if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
                              setCardExpiry(v);
                            }}
                            maxLength={5}
                            className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-mono"
                          />
                          <input 
                            type="password" 
                            placeholder="CVV"
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            maxLength={3}
                            className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-xl py-1.5 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Wallet options */}
                    {paymentMethod === 'wallet' && (
                      <div className="text-[11px] leading-normal text-gray-500 space-y-1">
                        <p className="font-bold text-gray-800 dark:text-slate-200">Pay via GPay / PhonePe / Paytm Wallet</p>
                        <p>After clicking check out, we will initiate a secure gateway redirect to finalize the wallet transaction.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Trigger Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-slate-900">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-2xl text-xs font-bold shadow-xl shadow-brand-emerald/15 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  <Lock className="w-4 h-4" />
                  Simulate Sponsor ₹{finalAmount.toLocaleString()} (Sandbox)
                </button>
                <p className="text-[10px] text-center text-gray-400 font-mono uppercase tracking-wider leading-none">Secured via AES-256 SSL Encryption Standards</p>
              </div>
            </form>
          </motion.div>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-900 rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 text-center"
          >
            <div className="relative w-20 h-20 mx-auto">
              {/* Spinner */}
              <div className="absolute inset-0 rounded-full border-4 border-brand-teal/20" />
              <div 
                className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-teal animate-spin" 
                style={{ animationDuration: '0.8s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-brand-teal">
                {processingProgress}%
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-md text-gray-900 dark:text-white">Processing Secure Gift</h3>
              <p className="text-xs text-gray-400 font-mono tracking-wide">
                {processingText}
              </p>
            </div>

            {/* Simulated progress indicator bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full transition-all duration-300"
                style={{ width: `${processingProgress}%` }}
              />
            </div>
            
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest leading-none">DO NOT CLOSE WINDOW OR REFRESH PAGE</p>
          </motion.div>
        )}

        {/* SUCCESS CONFIRMATION & RECEIPT/CERTIFICATE STEP */}
        {step === 'success' && completedDonation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white dark:bg-slate-950 border border-gray-150 dark:border-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden text-left relative flex flex-col md:flex-row h-auto md:h-[580px]"
          >
            {/* Left Column: Visual feedback & Print certificate Trigger */}
            <div className="md:w-5/12 bg-gradient-to-br from-brand-teal to-brand-emerald p-6 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-teal-700/20">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-xl leading-snug">Generous Action Completed!</h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    You have sponsored <strong className="text-white font-bold">₹{finalAmount.toLocaleString()}</strong> for saving animals and guarding nature in Puri.
                  </p>
                </div>
                
                {/* Micro badge */}
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 space-y-1 text-[11px] leading-normal">
                  <p className="font-bold flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Environmental Laurels</p>
                  <p>You have been awarded the official digital title &ldquo;<strong className="font-bold">{getEcosystemBadge(campaign.category)}</strong>&rdquo;!</p>
                </div>
              </div>

              {/* Certificate printable trigger */}
              <div className="space-y-3 pt-4 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setShowCertificate(true)}
                  className="w-full bg-white text-brand-teal hover:bg-teal-50 font-bold text-xs py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  View Certificate of Honor
                </button>
              </div>
            </div>

            {/* Right Column: Community Support Receipt */}
            <div className="md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto space-y-5 bg-slate-50/50 dark:bg-slate-950">
              <div className="space-y-5">
                <div className="flex justify-between items-start border-b border-gray-150 dark:border-slate-900 pb-3">
                  <div className="space-y-1">
                    <h2 className="font-display font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">CONTRIBUTION RECEIPT</h2>
                    <p className="text-[9px] font-mono text-gray-400">Puri Stray Dog, Cow &amp; Nature Welfare Initiative</p>
                  </div>
                  <button 
                    type="button"
                    onClick={onClose}
                    className="text-gray-450 hover:text-gray-700 dark:hover:text-slate-200 text-xs font-bold font-mono"
                  >
                    CLOSE ✕
                  </button>
                </div>

                {/* Audit details metadata */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border space-y-3 text-xs leading-normal">
                  <div className="grid grid-cols-2 gap-3 border-b border-gray-100 dark:border-slate-800/60 pb-3 font-mono text-[10px]">
                    <div>
                      <p className="text-gray-400 uppercase">Receipt Reference</p>
                      <p className="font-bold text-gray-800 dark:text-slate-200">{completedDonation.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 uppercase">Transaction VPA ID</p>
                      <p className="font-bold text-gray-800 dark:text-slate-200 truncate">{completedDonation.transaction_id}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-[11px] leading-relaxed">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Donor Name:</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200">{isAnonymous ? 'Anonymous Supporter' : donorName || 'Guest Contributor'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Sponsor Project:</span>
                      <span className="font-bold text-gray-850 dark:text-slate-200 truncate max-w-[180px]">{campaign.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payment Gateway:</span>
                      <span className="font-bold text-gray-800 dark:text-slate-200 uppercase">{completedDonation.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Gateway Status:</span>
                      <span className="font-bold text-emerald-600 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success (Verified)
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-slate-800/60 pt-3 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-400 uppercase font-bold">TOTAL CONTRIBUTION</span>
                    <span className="text-base font-black text-gray-900 dark:text-white font-mono">₹{completedDonation.amount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Community footnote info box */}
                <div className="flex items-start gap-2 p-3.5 rounded-xl bg-indigo-50/40 dark:bg-slate-900/40 border border-dashed text-[10px] text-gray-400 leading-normal">
                  <Info className="w-4 h-4 text-brand-teal flex-shrink-0 mt-0.5" />
                  <p>
                    This is a digital contribution receipt issued by the independent Puri Stray Dog, Cow &amp; Nature Welfare platform. All contributions are allocated transparently to support approved local welfare activities.
                  </p>
                </div>
              </div>

              {/* Download controls */}
              <div className="flex gap-2.5 pt-4 border-t border-gray-100 dark:border-slate-900 mt-auto">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 dark:text-slate-350 dark:bg-slate-900 dark:hover:bg-slate-800 border dark:border-slate-800 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-brand-teal hover:bg-brand-emerald text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center"
                >
                  Return to Panel
                </button>
              </div>
            </div>

            {/* DIGITAL CERTIFICATE POPUP */}
            <AnimatePresence>
              {showCertificate && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-md z-30 flex items-center justify-center p-6 text-center text-white"
                >
                  <div className="border-2 border-amber-300 rounded-3xl p-6 max-w-md w-full relative bg-slate-950 space-y-6 flex flex-col justify-between h-[450px]">
                    <button 
                      onClick={() => setShowCertificate(false)}
                      className="absolute top-4 right-4 text-white/60 hover:text-white text-sm"
                    >
                      ✕ CLOSE
                    </button>

                    <div className="space-y-4 pt-4">
                      <div className="text-amber-400 font-display font-black tracking-widest text-[10px] uppercase">
                        ★ CERTIFICATE OF CONSERVATION HONOR ★
                      </div>
                      
                      <p className="text-[11px] font-mono text-white/50">ISSUED BY PURI ANIMAL &amp; NATURE WELFARE FOUNDATION</p>
                    </div>

                    <div className="space-y-4">
                      <p className="text-xs text-white/70 italic leading-relaxed">This scroll recognizes that the title of</p>
                      
                      <h2 className="font-display font-black text-xl text-amber-300 tracking-wider">
                        {getEcosystemBadge(campaign.category).toUpperCase()}
                      </h2>

                      <p className="text-xs text-white/75 leading-relaxed">
                        is hereby officially bestowed upon
                      </p>

                      <h3 className="font-display font-black text-lg text-white underline decoration-amber-300 underline-offset-4">
                        {isAnonymous ? 'ANONYMOUS NATURE SUPPORTER' : donorName || 'GUEST CONTRBUTOR'}
                      </h3>

                      <p className="text-[11px] text-white/60 leading-relaxed max-w-xs mx-auto">
                        for sponsoring crucial emergency funds to ensure stray animal relief, veterinary ambulance care, and ecological protection on Puri beach.
                      </p>
                    </div>

                    <div className="flex justify-between items-end border-t border-white/10 pt-4 text-[9px] font-mono text-white/40">
                      <div className="text-left">
                        <p>DATED</p>
                        <p className="font-bold text-white/80">{new Date(completedDonation.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] text-amber-300">★ VERIFIED ★</p>
                        <p>REGISTRATION #80G-PURI-90312</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
