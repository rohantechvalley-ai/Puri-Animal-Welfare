/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Trash2, 
  RefreshCw, 
  Eye, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Inbox, 
  User, 
  Calendar,
  X,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { emailService } from '../../services/EmailService';
import { configService } from '../../services/ConfigService';

interface OutgoingEmailRecord {
  id: string;
  to: string;
  templateType: string;
  subject: string;
  body: string;
  sentAt: string;
  providerUsed: string;
  status: 'queued' | 'sent' | 'failed';
  variables: any;
}

export const OutgoingEmails: React.FC = () => {
  const [emails, setEmails] = useState<OutgoingEmailRecord[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<OutgoingEmailRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [testEmailTo, setTestEmailTo] = useState('');
  const [testTemplate, setTestTemplate] = useState<'welcome' | 'verification' | 'password_reset' | 'report_status' | 'volunteer' | 'contact_form'>('welcome');
  const [testSending, setTestSending] = useState(false);
  const [activeConfig, setActiveConfig] = useState({ provider: 'MOCK', hasResend: false });

  // Load emails and active configuration
  const loadEmails = () => {
    const raw = localStorage.getItem('puri_outgoing_emails');
    if (raw) {
      try {
        setEmails(JSON.parse(raw).reverse()); // Newest first
      } catch (err) {
        setEmails([]);
      }
    } else {
      setEmails([]);
    }

    const cfg = configService.getConfig();
    const currentProvider = cfg.emailProvider || 'MOCK';
    const resendKey = cfg.resendApiKey;

    setActiveConfig({
      provider: currentProvider,
      hasResend: !!resendKey
    });
  };

  useEffect(() => {
    loadEmails();
  }, []);

  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to purge all local simulated outgoing emails?')) {
      localStorage.removeItem('puri_outgoing_emails');
      loadEmails();
    }
  };

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailTo) return;

    setTestSending(true);
    try {
      const demoVariables = {
        name: 'Puri Citizen Test',
        code: '582931',
        resetUrl: window.location.origin + '/?reset=1',
        appUrl: window.location.origin,
        reportTitle: 'Injured Beach Puppy Rescue',
        location: 'Near Light House Beach, Puri',
        status: 'DISPATCHED',
        notes: 'Volunteer team dispatched with medical supplies.',
        activity: 'Beach Sweep & Coastal Guarding',
        date: 'Next Sunday, 06:00 AM',
        email: testEmailTo,
        subject: 'Suggestion for coastal sand conservation',
        message: 'This is a test notification payload generated via Admin Portal.'
      };

      await emailService.sendEmail(testEmailTo, testTemplate, demoVariables);
      loadEmails();
      setTestEmailTo('');
      alert('Test transactional email successfully triggered!');
    } catch (err: any) {
      alert('Error triggering test email: ' + err.message);
    } finally {
      setTestSending(false);
    }
  };

  // Filter and Search logic
  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.templateType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTemplate = filterTemplate === 'all' || email.templateType === filterTemplate;

    return matchesSearch && matchesTemplate;
  });

  return (
    <div className="space-y-6" id="outgoing-emails-panel">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-gray-950 dark:text-white">Outgoing Email Registry</h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">Inspect and test simulated transactional emails sent during sandbox workflows.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={loadEmails}
            className="p-2 bg-gray-50 dark:bg-slate-900 border hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl text-gray-600 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh Logs"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button 
            onClick={handleClearQueue}
            disabled={emails.length === 0}
            className="p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-1.5 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Purge Registry
          </button>
        </div>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-emerald/10 text-brand-teal flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-mono">ACTIVE ROUTER PROVIDER</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white uppercase font-mono">{activeConfig.provider}</p>
          </div>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/40 p-4 rounded-2xl border border-gray-150 dark:border-slate-800 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-gray-400 font-mono">RESEND INTEGRATION</p>
            <p className="text-sm font-bold text-gray-800 dark:text-white font-mono">
              {activeConfig.hasResend ? '✅ ENABLED (Ready)' : '🔌 SIMULATOR MODE'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Email Testing Form */}
        <div className="lg:col-span-4 bg-white/50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850/50 rounded-3xl p-5 space-y-4">
          <div className="border-b pb-3 border-gray-100 dark:border-slate-800">
            <h3 className="font-display font-extrabold text-sm text-gray-900 dark:text-white uppercase tracking-wider">Trigger Template Sandbox</h3>
            <p className="text-[10px] text-gray-400">Instantly test the design layout, responsive formatting, and parameters of any template flow.</p>
          </div>

          <form onSubmit={handleSendTest} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Target Email Address</label>
              <input 
                type="email" 
                value={testEmailTo}
                onChange={e => setTestEmailTo(e.target.value)}
                placeholder="e.g. tester@puri.org"
                required
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Transactional Template</label>
              <select 
                value={testTemplate}
                onChange={e => setTestTemplate(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 px-2.5 text-xs outline-none focus:border-brand-emerald dark:text-white"
              >
                <option value="welcome">Welcome Onboarding</option>
                <option value="verification">verification Verification OTP</option>
                <option value="password_reset">password_reset Reset Link</option>
                <option value="report_status">report_status Emergency Update</option>
                <option value="volunteer">volunteer Volunteer RSVP</option>
                <option value="contact_form">contact_form Citizens Form</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={testSending || !testEmailTo}
              className="w-full py-2.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-emerald/10 flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {testSending ? 'Dispatching Test...' : 'Send Simulated Mail'}
            </button>
          </form>
        </div>

        {/* Email Logs List */}
        <div className="lg:col-span-8 bg-white/50 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850/50 rounded-3xl p-5 space-y-4">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search recipient or subject..."
                className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-2 pl-9 pr-4 text-xs outline-none focus:border-brand-emerald dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <select
                value={filterTemplate}
                onChange={e => setFilterTemplate(e.target.value)}
                className="w-full sm:w-auto bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-850 rounded-xl py-1.5 px-2.5 text-xs outline-none focus:border-brand-emerald dark:text-white"
              >
                <option value="all">All Templates</option>
                <option value="welcome">Welcome</option>
                <option value="verification">Verification</option>
                <option value="password_reset">Password Reset</option>
                <option value="report_status">Report Status</option>
                <option value="volunteer">Volunteer RSVP</option>
                <option value="contact_form">Contact Form</option>
              </select>
            </div>
          </div>

          {/* Table list */}
          <div className="overflow-x-auto">
            {filteredEmails.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 dark:bg-slate-850 border rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs text-gray-400">No emails registered or queued inside local storage yet.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-850 text-gray-400 font-mono uppercase tracking-wider">
                    <th className="py-2.5 font-semibold">Recipient</th>
                    <th className="py-2.5 font-semibold">Template</th>
                    <th className="py-2.5 font-semibold">Subject</th>
                    <th className="py-2.5 font-semibold">Dispatched</th>
                    <th className="py-2.5 font-semibold">Status</th>
                    <th className="py-2.5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-slate-850/50">
                  {filteredEmails.map(mail => (
                    <tr key={mail.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 font-semibold text-gray-900 dark:text-white max-w-[150px] truncate">{mail.to}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-brand-teal/10 text-brand-teal text-[10px] font-mono font-bold uppercase">
                          {mail.templateType}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-slate-300 max-w-[180px] truncate">{mail.subject}</td>
                      <td className="py-3 font-mono text-gray-400 text-[10px]">
                        {new Date(mail.sentAt).toLocaleTimeString()}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/5 px-1.5 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3" />
                          DISPATCHED
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button 
                          onClick={() => setSelectedEmail(mail)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-brand-teal hover:scale-105 transition-all inline-flex items-center gap-1 font-semibold"
                          title="View exact HTML payload"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* HTML Payload Sandbox Modal Popup */}
      <AnimatePresence>
        {selectedEmail && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" id="mail-sandbox-modal">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-850 rounded-3xl max-w-2xl w-full flex flex-col h-[80vh] shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="p-5 border-b border-gray-100 dark:border-slate-850 flex justify-between items-center bg-gray-50/50 dark:bg-slate-950/20">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded">
                    Template: {selectedEmail.templateType}
                  </span>
                  <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white">HTML Dispatch Payload Sandbox</h3>
                </div>
                <button 
                  onClick={() => setSelectedEmail(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-850 rounded-xl text-gray-400 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Envelope meta details */}
              <div className="p-4 bg-gray-50/20 dark:bg-slate-950/10 border-b border-gray-100 dark:border-slate-850 text-xs space-y-2.5 font-mono text-gray-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase w-16 text-gray-400">Sender:</span>
                  <span className="text-gray-800 dark:text-slate-200">Puri Coastal Guardians &lt;noreply@puriwelfare.org&gt;</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase w-16 text-gray-400">To:</span>
                  <span className="text-gray-800 dark:text-slate-200 font-bold">{selectedEmail.to}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase w-16 text-gray-400">Subject:</span>
                  <span className="text-gray-800 dark:text-slate-200">{selectedEmail.subject}</span>
                </div>
              </div>

              {/* Live Rendered HTML Frame Container */}
              <div className="flex-1 bg-white p-6 overflow-y-auto border-b border-gray-100 dark:border-slate-850">
                <div 
                  className="border rounded-2xl p-4 bg-white shadow-inner max-w-xl mx-auto overflow-x-auto text-slate-800"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />
              </div>

              {/* Footer */}
              <div className="p-4 bg-gray-50 dark:bg-slate-950/20 flex justify-between items-center text-[10px] font-mono text-gray-400">
                <span>Dispatched via {selectedEmail.providerUsed} Router</span>
                <span>UUID: {selectedEmail.id}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
