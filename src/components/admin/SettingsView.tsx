/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Save, 
  HelpCircle, 
  ShieldAlert, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  CreditCard, 
  Globe,
  Database
} from 'lucide-react';
import { AdminSettings } from './adminTypes';

interface SettingsViewProps {
  settings: AdminSettings;
  onUpdateSettings: (s: AdminSettings) => void;
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  actingRole: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onAddAuditLog,
  showToast,
  actingRole
}) => {
  // Local form state
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [maintenanceMode, setMaintenanceMode] = useState(settings.maintenanceMode);
  const [upiAddress, setUpiAddress] = useState(settings.upiAddress);
  const [smtpServer, setSmtpServer] = useState(settings.smtpServer);
  const [smtpPort, setSmtpPort] = useState(settings.smtpPort);
  const [storageQuotaGb, setStorageQuotaGb] = useState(settings.storageQuotaGb);
  const [paymentGatewayEnabled, setPaymentGatewayEnabled] = useState(settings.paymentGatewayEnabled);

  // Submit
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: AdminSettings = {
      ...settings,
      platformName,
      contactEmail,
      supportPhone,
      maintenanceMode,
      upiAddress,
      smtpServer,
      smtpPort,
      storageQuotaGb,
      paymentGatewayEnabled
    };

    onUpdateSettings(updated);
    onAddAuditLog('Update System Configurations', 'Global Settings Settings File');
    showToast('Platform configurations updated and synced successfully.', 'success');
  };

  return (
    <form onSubmit={handleSaveSettings} className="space-y-6" id="settings-management-panel">
      {/* 2 Column Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Left Column: General Branding & Details */}
        <div className="border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl space-y-4 shadow-sm">
          <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-brand-emerald" />
            General Branding &amp; Board SEO
          </h4>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-400 block uppercase">Platform Display Name</label>
            <input 
              type="text" 
              value={platformName}
              onChange={e => setPlatformName(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block uppercase">Support Contact Email</label>
              <input 
                type="email" 
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block uppercase">Support Dispatch Phone</label>
              <input 
                type="text" 
                value={supportPhone}
                onChange={e => setSupportPhone(e.target.value)}
                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Maintenance Mode Overlay trigger */}
          <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                Emergency Maintenance Mode
              </span>
              <input 
                type="checkbox"
                checked={maintenanceMode}
                onChange={e => setMaintenanceMode(e.target.checked)}
                className="rounded text-brand-emerald focus:ring-brand-emerald w-4 h-4"
              />
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Enabling maintenance mode overrides client screens with a "Service Undergoing Upgrades" template. Only Admins can bypass.
            </p>
          </div>
        </div>

        {/* Right Column: Gateways, Mail & Server telemetries */}
        <div className="space-y-6">
          {/* Payment Gateway Configurations */}
          <div className="border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-blue" />
              UPI &amp; Card Secure Gateway
            </h4>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-100 rounded-xl">
              <div>
                <span className="font-semibold text-gray-800 dark:text-slate-200">Payment Processing Status</span>
                <p className="text-[10px] text-gray-400 mt-0.5">Toggle active donation gateways instantly.</p>
              </div>
              <input 
                type="checkbox"
                checked={paymentGatewayEnabled}
                onChange={e => setPaymentGatewayEnabled(e.target.checked)}
                className="rounded text-brand-emerald focus:ring-brand-emerald w-4 h-4"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block uppercase">VPA UPI Address</label>
              <input 
                type="text" 
                value={upiAddress}
                onChange={e => setUpiAddress(e.target.value)}
                placeholder="e.g. puriwelfare@sbi"
                className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none font-mono"
                required
              />
            </div>
          </div>

          {/* Email SMTP server & storage telemetries */}
          <div className="border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-5 rounded-2xl space-y-4 shadow-sm">
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-purple-500" />
              Email Alerts Server (SMTP)
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">SMTP Relaying Host</label>
                <input 
                  type="text" 
                  value={smtpServer}
                  onChange={e => setSmtpServer(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 block uppercase">Port</label>
                <input 
                  type="text" 
                  value={smtpPort}
                  onChange={e => setSmtpPort(e.target.value)}
                  className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-gray-400 block uppercase">Active Media Storage Quota (GB)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min={5}
                  max={50}
                  value={storageQuotaGb}
                  onChange={e => setStorageQuotaGb(parseInt(e.target.value))}
                  className="flex-grow accent-brand-emerald h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="font-mono font-bold text-gray-800 dark:text-slate-200 shrink-0">{storageQuotaGb} GB limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Action save footer */}
      <div className="flex justify-end pt-2 border-t border-gray-250/20">
        <button
          type="submit"
          className="px-5 py-2.5 bg-gradient-to-r from-brand-emerald to-emerald-600 hover:from-brand-teal hover:to-brand-emerald text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-md shadow-brand-emerald/10"
        >
          <Save className="w-3.5 h-3.5" />
          Save System Configurations
        </button>
      </div>
    </form>
  );
};
