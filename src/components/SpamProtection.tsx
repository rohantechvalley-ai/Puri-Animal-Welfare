/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle2, RotateCw } from 'lucide-react';
import { configService } from '../services/ConfigService';
import { captchaService } from '../services/CaptchaService';

interface SpamProtectionProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

export const SpamProtection: React.FC<SpamProtectionProps> = ({ onVerify, className = '' }) => {
  const config = configService.getConfig();
  const isActive = configService.isCaptchaActive();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'resolved' | 'error'>('idle');
  const [isSandbox, setIsSandbox] = useState(true);
  const [sandboxSuccess, setSandboxSuccess] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) {
      // CAPTCHA is completely disabled/bypassed
      setIsSandbox(true);
      setStatus('resolved');
      const bypassToken = `BYPASS_TOKEN-${Date.now()}`;
      setToken(bypassToken);
      onVerify(bypassToken);
      return;
    }

    const hasKeys = !!(config.turnstileSiteKey || config.recaptchaSiteKey);
    setIsSandbox(!hasKeys);

    if (!hasKeys) {
      // In sandbox mode, auto-resolve with a simulated success token after 300ms
      setStatus('verifying');
      const timer = setTimeout(() => {
        if (sandboxSuccess) {
          const mockToken = `SIMULATED_SUCCESS_TOKEN-${Date.now()}`;
          setToken(mockToken);
          setStatus('resolved');
          onVerify(mockToken);
        } else {
          setToken(null);
          setStatus('error');
          onVerify(null);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      // Real environment widget simulation
      setStatus('verifying');
      const mockRealToken = `REAL_PROVIDER_TOKEN-${Date.now()}`;
      setToken(mockRealToken);
      setStatus('resolved');
      onVerify(mockRealToken);
    }
  }, [sandboxSuccess, isActive]);

  const handleToggleSandbox = () => {
    if (!isActive) return;
    const nextSuccess = !sandboxSuccess;
    setSandboxSuccess(nextSuccess);
    setStatus('verifying');
    if (!nextSuccess) {
      onVerify(null);
    }
  };

  return (
    <div className={`p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/20 border-gray-200/50 dark:border-slate-800/50 text-left ${className}`} id="spam-protection-widget">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === 'resolved' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {status === 'verifying' && <RotateCw className="w-5 h-5 text-brand-teal animate-spin shrink-0" />}
          {status === 'error' && <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />}
          {status === 'idle' && <ShieldCheck className="w-5 h-5 text-gray-400 shrink-0" />}
          
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-gray-800 dark:text-slate-200">
              {!isActive ? 'Spam Protection: Bypassed' : isSandbox ? 'Sandbox Spam Shield' : 'Spam Protection Active'}
            </h4>
            <p className="text-[10px] text-gray-500 dark:text-slate-400">
              {!isActive 
                ? 'Optional protection (no keys or flags active)' 
                : isSandbox 
                ? 'Running in bypass development mode' 
                : `Verified by ${config.turnstileSiteKey && config.enableTurnstile ? 'Cloudflare Turnstile' : 'Google reCAPTCHA'}`
              }
            </p>
          </div>
        </div>

        {isActive && isSandbox && (
          <button
            type="button"
            onClick={handleToggleSandbox}
            className={`px-2.5 py-1 rounded-md text-[9px] font-bold font-mono border transition-all ${
              sandboxSuccess 
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'
            }`}
            title="Toggle simulated verification outcome"
          >
            {sandboxSuccess ? 'SIMULATING: PASS' : 'SIMULATING: FAIL'}
          </button>
        )}
      </div>

      {status === 'error' && (
        <p className="mt-2 text-[10px] text-rose-600 font-semibold flex items-center gap-1">
          ⚠️ CAPTCHA verification failed. Please refresh or check security parameters.
        </p>
      )}

      {status === 'resolved' && token && (
        <div className="mt-2.5 pt-2 border-t border-dashed border-gray-200 dark:border-slate-800 flex items-center justify-between text-[8px] font-mono text-gray-400">
          <span>Token: {token.substring(0, 24)}...</span>
          <span className="bg-brand-emerald/10 text-brand-teal dark:text-brand-mint font-bold px-1 rounded uppercase">
            {!isActive ? 'Disabled' : 'Passed'}
          </span>
        </div>
      )}
    </div>
  );
};
