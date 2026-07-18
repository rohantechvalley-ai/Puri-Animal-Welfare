/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  Smartphone, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { emailService } from '../services/EmailService';
import { SpamProtection } from './SpamProtection';

interface AuthViewProps {
  onSuccess: () => void;
  initialMode?: 'login' | 'signup' | 'otp' | 'forgot';
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess, initialMode = 'login' }) => {
  const { signUp, logIn, logInOTP } = useApp();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot' | 'reset'>(initialMode);
  
  // Captcha spam protection token
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Sign up fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Login / OTP fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Recovery
  const [recoveryEmail, setRecoveryEmail] = useState('');

  // UI States
  const [showPass, setShowPass] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!name || !email || !phone || !password || !confirmPassword) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!captchaToken) {
      setErrorMsg('Spam Protection: Please complete the verification.');
      return;
    }

    setFormLoading(true);
    try {
      // 1. Simulate Verification Email
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      await emailService.sendEmail(email, 'verification', {
        name,
        code: verificationCode
      });

      // 2. Perform register
      const res = await signUp(name, email, phone, bio, location);
      if (res) {
        // 3. Send welcome email on success
        await emailService.sendEmail(email, 'welcome', {
          name,
          appUrl: window.location.origin
        });
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    if (!captchaToken) {
      setErrorMsg('Spam Protection: Please complete the verification.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await logIn(loginEmail);
      if (res) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!otpPhone || otpPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number.');
      return;
    }

    setFormLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setOtpSent(true);
      setFormLoading(false);
    }, 800);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (otpCode !== '123456') {
      setErrorMsg('Incorrect OTP. Use the code: 123456');
      return;
    }

    setFormLoading(true);
    try {
      const res = await logInOTP(otpPhone);
      if (res) onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!recoveryEmail) {
      setErrorMsg('Please specify an email address.');
      return;
    }

    if (!captchaToken) {
      setErrorMsg('Spam Protection: Please complete the verification.');
      return;
    }

    setFormLoading(true);
    try {
      // Send secure reset password email instructions
      await emailService.sendEmail(recoveryEmail, 'password_reset', {
        name: 'Puri Friend',
        resetUrl: `${window.location.origin}/?tab=auth&mode=reset`
      });
      setMode('reset');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch recovery instructions.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setFormLoading(true);
    setTimeout(() => {
      setMode('login');
      setFormLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-tr from-teal-50/30 to-blue-50/20 dark:from-slate-950 dark:to-slate-900" id="auth-root-container">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-brand-emerald/5 rounded-full filter blur-3xl animate-float -z-10" />
      <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-brand-blue/5 rounded-full filter blur-3xl animate-drift -z-10" />

      <div className="max-w-md w-full" id="auth-card-panel">
        <AnimatePresence mode="wait">
          
          {/* LOGIN VIEW */}
          {mode === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="glass-panel p-8 rounded-3xl border shadow-2xl relative"
            >
              <div className="text-center space-y-2 mb-8">
                <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full uppercase tracking-wider">
                  Secure Access Portal
                </span>
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Welcome Back</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">Sign in to report incidents, donate, or consult in forums.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                    <input 
                      type="email" 
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. citizen.puri@gmail.com"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-semibold text-brand-emerald hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                    <input 
                      type={showPass ? 'text' : 'password'} 
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-11 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <SpamProtection onVerify={setCaptchaToken} className="my-2" />

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-emerald/15 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Connecting...' : 'Sign In Securely'}
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </form>

              <div className="relative my-6 text-center">
                <hr className="border-gray-200/60 dark:border-slate-800" />
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 px-3 text-[10px] font-mono tracking-widest text-gray-400 uppercase">OR SECURE PASS</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('otp')}
                  className="py-2.5 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-xl border border-gray-200/50 dark:border-slate-800/50 text-xs font-semibold text-gray-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4 text-brand-blue" />
                  OTP LogIn
                </button>
                <button
                  onClick={() => setMode('signup')}
                  className="py-2.5 bg-brand-emerald/5 hover:bg-brand-emerald/10 text-brand-teal dark:text-brand-mint rounded-xl border border-brand-emerald/10 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                >
                  <User className="w-4 h-4" />
                  Sign Up
                </button>
              </div>
            </motion.div>
          )}

          {/* SIGNUP VIEW */}
          {mode === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-panel p-8 rounded-3xl border shadow-2xl relative"
            >
              <div className="text-center space-y-2 mb-6">
                <span className="text-[10px] font-mono font-bold bg-brand-teal/10 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full uppercase tracking-wider">
                  Create Civic Account
                </span>
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Save Puri Animals</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">Join a network of local defenders and coastal guardians.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Dipti Ranjan"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. dipti@gmail.com"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Mobile Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Neighborhood / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Swargadwar, Puri"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Short Bio / Motivation</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="e.g. Love saving street puppies and stray cows"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Password</label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <SpamProtection onVerify={setCaptchaToken} className="my-2" />

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-2.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-xs font-semibold shadow-lg shadow-brand-emerald/15 transition-all flex items-center justify-center gap-1.5"
                >
                  {formLoading ? 'Creating Sanctuary Profile...' : 'Sign Up as Guardian'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to standard Login
                </button>
              </div>
            </motion.div>
          )}

          {/* OTP LOGIN VIEW */}
          {mode === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-panel p-8 rounded-3xl border shadow-2xl relative"
            >
              <div className="text-center space-y-2 mb-8">
                <span className="text-[10px] font-mono font-bold bg-brand-blue/10 text-brand-blue px-3 py-1 rounded-full uppercase tracking-wider">
                  Mobile Authentication
                </span>
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">OTP Verification</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">Fast, secure login without memorizing passwords.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {!otpSent ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                      <input 
                        type="tel" 
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-blue/15 transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? 'Requesting OTP...' : 'Send Secure OTP Code'}
                    <Smartphone className="w-4.5 h-4.5" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-xs text-green-600 dark:text-brand-mint text-center font-semibold bg-green-50 dark:bg-green-950/20 py-2 rounded-xl">
                    OTP SMS dispatched to {otpPhone}. Enter **123456** to proceed.
                  </p>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Verification OTP Code</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                      <input 
                        type="text" 
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none tracking-widest text-center font-bold dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="w-full py-3 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-emerald/15 transition-all flex items-center justify-center gap-2"
                  >
                    {formLoading ? 'Verifying OTP...' : 'Authenticate Profile'}
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>
                </form>
              )}

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => {
                    setMode('login');
                    setOtpSent(false);
                  }}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to standard Login
                </button>
              </div>
            </motion.div>
          )}

          {/* FORGOT PASSWORD VIEW */}
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl border shadow-2xl relative"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Recover Password</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">We will mail a recovery token to restore your credentials.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Your Registered Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                    <input 
                      type="email" 
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="e.g. citizen.puri@gmail.com"
                      className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                      required
                    />
                  </div>
                </div>

                <SpamProtection onVerify={setCaptchaToken} className="my-2" />

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-emerald/15 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Despatching Recovery Link...' : 'Send Recovery Instructions'}
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </form>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to standard Login
                </button>
              </div>
            </motion.div>
          )}

          {/* RESET PASSWORD VIEW */}
          {mode === 'reset' && (
            <motion.div
              key="reset"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-panel p-8 rounded-3xl border shadow-2xl relative"
            >
              <div className="text-center space-y-2 mb-8">
                <h2 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Define New Password</h2>
                <p className="text-xs text-gray-500 dark:text-slate-300">We validated your token. Re-enter your clean credential.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-mono tracking-wider font-semibold uppercase text-gray-400">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs md:text-sm focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald outline-none dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-emerald/15 transition-all flex items-center justify-center gap-2"
                >
                  {formLoading ? 'Re-writing Credentials...' : 'Save New Credentials'}
                  <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};
