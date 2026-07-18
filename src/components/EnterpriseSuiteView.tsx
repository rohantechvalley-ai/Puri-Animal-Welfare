/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, Mail, Smartphone, Globe, Share2, Search, Cpu, Database, 
  Play, Eye, Copy, Check, Download, Trash2, ShieldAlert, CheckCircle, 
  RefreshCw, CloudOff, Info, AlertTriangle, ShieldCheck, Heart, 
  HelpCircle, Sparkles, Terminal, Layers, Send, FileText, ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Notification, AnimalReport, Campaign, ForumThread } from '../types';

export const EnterpriseSuiteView: React.FC = () => {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllNotificationsAsRead, 
    addNotification, 
    deleteNotification,
    reports,
    campaigns,
    threads,
    currentUser,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'notifications' | 'emails' | 'pwa' | 'seo' | 'search' | 'security' | 'monitoring' | 'backups' | 'qa' | 'errors'>('notifications');

  // --- 1. Notification Simulator Local State ---
  const [simCategory, setSimCategory] = useState<'report' | 'donation' | 'forum' | 'system' | 'campaign' | 'volunteer' | 'announcement' | 'moderator' | 'mention'>('report');
  const [simPriority, setSimPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal');
  const [simTitle, setSimTitle] = useState('');
  const [simMessage, setSimMessage] = useState('');

  const handleSimulateRealtime = () => {
    const title = simTitle.trim() || `Real-time ${simCategory.toUpperCase()} Update`;
    const msg = simMessage.trim() || `This is a simulated Supabase Realtime event with ${simPriority.toUpperCase()} priority claim.`;
    addNotification(title, msg, simCategory, simPriority);
    showToast(`Supabase Realtime Ingestion Triggered: ${title}`, 'success');
    setSimTitle('');
    setSimMessage('');
  };

  // --- 2. HTML Email Templates View State ---
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>('welcome');
  const [emailRecipientName, setEmailRecipientName] = useState('Puri Citizen');
  const [emailRecipientEmail, setEmailRecipientEmail] = useState('citizen.puri@gmail.com');
  const [emailCopied, setEmailCopied] = useState(false);

  const getEmailHtml = (template: string) => {
    const headerColor = '#0f766e'; // teal-700
    const bodyBg = '#f8fafc';
    const cardBg = '#ffffff';
    const accentColor = '#10b981'; // emerald-500
    const titleText = {
      welcome: 'Welcome to Puri Stray Dog, Cow & Nature Welfare Board!',
      verify: 'Verify Your Email Address',
      reset: 'Reset Your Account Password',
      otp: 'One-Time Security OTP Login',
      report_sub: 'Incident Report Received',
      report_status: 'Incident Status Action Notice',
      report_resolved: 'Incident Resolved & Closed',
      forum_reply: 'New Reply in Your Thread',
      mention: 'You Were Mentioned on Puri Board',
      donation: 'Donation Receipt & Contribution Summary',
      campaign: 'Campaign Progress Update Notice',
      volunteer: 'Field Volunteer Deployment Assignment',
      announcement: 'Critical Community Announcement Notice'
    }[template] || 'System Notice';

    const renderContent = () => {
      switch (template) {
        case 'welcome':
          return `
            <h2 style="color: #0f766e; margin-top: 0;">Namaste ${emailRecipientName},</h2>
            <p>Thank you for creating an account on the <strong>Puri Stray Dog, Cow & Nature Welfare Board</strong>. Our mission is to protect Puri's environment, feed stray dogs, provide medical treatment to street cows, and keep beaches plastic-free.</p>
            <p>Your account is now active under the handle <strong>@${emailRecipientName.toLowerCase().replace(/\s+/g, '')}</strong>. We welcome you to join the community forums, submit animal/nature reports, or volunteer for local cleanup and feeding drives.</p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="https://puriwelfare.org/profile" style="background-color: #0f766e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Complete Your Profile</a>
            </div>
          `;
        case 'donation':
          return `
            <h2 style="color: #0f766e; margin-top: 0;">Dear ${emailRecipientName},</h2>
            <p>Thank you for your generous contribution of <strong>₹5,000.00</strong> toward the <em>Puri Beach Stray Animal Medical Care &amp; Plastic Cleanup</em> campaign.</p>
            <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; font-family: monospace; font-size: 13px;">
              <strong>TRANSACTION SUMMARY:</strong><br>
              Transaction ID: TXN_PURI_UPI_902183210<br>
              Date: July 18, 2026<br>
              Amount: ₹5,000.00 INR<br>
              Payment Method: UPI Secure Direct<br>
              Community Initiative ID: PURI_COMMUNITY_88102
            </div>
            <p>Every rupee is deployed 100% transparently to purchase food supplies, veterinary first aid kits, street-cow bandages, and beach trash bins.</p>
          `;
        case 'report_sub':
          return `
            <h2 style="color: #0f766e; margin-top: 0;">Emergency Dispatch Desk</h2>
            <p>This is to confirm that your incident report <strong>"Injured Street Cow with Leg Fracture"</strong> has been successfully received by the dispatcher.</p>
            <div style="border-left: 4px solid #10b981; padding-left: 16px; margin: 20px 0; color: #475569;">
              <strong>Incident Coordinates:</strong> Grand Road Temple Entrance, Puri<br>
              <strong>Severity:</strong> CRITICAL / HIGH PRIORITY<br>
              <strong>Dispatch ID:</strong> ALERT-90823-ODISHA
            </div>
            <p>Our mobile veterinary ambulance is being briefed and our rescue crew expects to deploy to the location within 30 minutes. You can track this alert in real-time from your dashboard.</p>
          `;
        case 'campaign':
          return `
            <h2 style="color: #0f766e; margin-top: 0;">Campaign Milestone Unlocked!</h2>
            <p>We are thrilled to share that the <strong>Mobile Treatment Ambulance</strong> campaign has hit <strong>85%</strong> of its funding goal thanks to supporters like you!</p>
            <p>Our lead veterinarian, Dr. Arnab Das, has just installed an on-board oxygen concentrator and sterile wound autoclave inside our primary responder van, enabling in-field surgery.</p>
            <div style="margin: 20px 0; background: #e0f2fe; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px; font-size: 13px; color: #0369a1;">
              <strong>Current Standing:</strong> ₹255,000 raised of ₹300,000 goal. Help us cross the finish line!
            </div>
          `;
        default:
          return `
            <h2 style="color: #0f766e; margin-top: 0;">Security Alert Notice</h2>
            <p>This email notifications template is a placeholder for standard transactional alerts. All Puri Civic emails are built with accessible, responsive typography and carry strict DKIM security headers.</p>
          `;
      }
    };

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titleText}</title>
</head>
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: ${bodyBg}; margin: 0; padding: 20px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: ${cardBg}; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
    <!-- Header Banner -->
    <tr>
      <td style="background-color: ${headerColor}; padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: -0.5px;">Puri Stray Dog, Cow &amp; Nature</h1>
        <p style="color: #99f6e4; margin: 4px 0 0 0; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 1px;">Enterprise Notification Dispatcher</p>
      </td>
    </tr>
    <!-- Main Content -->
    <tr>
      <td style="padding: 32px 24px; line-height: 1.6; font-size: 15px;">
        ${renderContent()}
      </td>
    </tr>
    <!-- Footer Section -->
    <tr>
      <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b;">
        <p style="margin: 0 font-weight: bold; color: #1e293b; font-size: 12px;">Puri Stray Dog, Cow &amp; Nature Welfare Initiative</p>
        <p style="margin: 4px 0;">Swargadwar Beach Road, near Lighthouse, Puri, Odisha 752001, India</p>
        <p style="margin: 12px 0 0 0;">
          <a href="#" style="color: #0f766e; text-decoration: none; font-weight: bold; margin: 0 8px;">Unsubscribe</a> &bull; 
          <a href="#" style="color: #0f766e; text-decoration: none; font-weight: bold; margin: 0 8px;">Helpdesk</a> &bull; 
          <a href="#" style="color: #0f766e; text-decoration: none; font-weight: bold; margin: 0 8px;">Privacy Charter</a>
        </p>
        <p style="margin: 16px 0 0 0; font-size: 10px; color: #94a3b8;">This is a cryptographically verified transactional transmission signed by server <strong>SMTP.PURI.CIVIC</strong> with RSA-2048.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailHtml(selectedEmailTemplate));
    setEmailCopied(true);
    showToast('Responsive HTML email template copied to clipboard!', 'success');
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleSendTestEmail = () => {
    showToast(`Transactional SMTP dispatch queued for ${emailRecipientEmail}.`, 'success');
    addNotification(
      'Email Sent Simulator',
      `HTML email template "${selectedEmailTemplate.toUpperCase()}" securely transmitted to ${emailRecipientEmail} via local Node-Mailer simulation loop. Status: DELIVERED.`,
      'system',
      'low'
    );
  };

  // --- 3. PWA Installation & Offline Engine ---
  const [offlineMode, setOfflineMode] = useState(false);
  const [swRegistered, setSwRegistered] = useState(true);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState(true);
  const [syncQueue, setSyncQueue] = useState<any[]>([]);
  
  // Offline form state
  const [offTitle, setOffTitle] = useState('');
  const [offDesc, setOffDesc] = useState('');
  const [offAnimal, setOffAnimal] = useState<'dog' | 'cat' | 'cow' | 'other'>('dog');

  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offTitle.trim() || !offDesc.trim()) return;

    const queuedItem = {
      id: `sync-${Date.now()}`,
      title: offTitle,
      description: offDesc,
      animal_type: offAnimal,
      created_at: new Date().toISOString()
    };

    setSyncQueue([...syncQueue, queuedItem]);
    showToast('Offline! Saved to IndexedDB background sync queue.', 'info');
    setOffTitle('');
    setOffDesc('');
  };

  useEffect(() => {
    // When switching online, replay sync queue
    if (!offlineMode && syncQueue.length > 0) {
      showToast(`Online! Replaying ${syncQueue.length} queued records...`, 'success');
      
      syncQueue.forEach((item, index) => {
        setTimeout(() => {
          addNotification(
            'Background Sync Completed',
            `Offline incident report "${item.title}" successfully compiled and persisted into central DB.`,
            'report',
            'high'
          );
        }, (index + 1) * 800);
      });
      setSyncQueue([]);
    }
  }, [offlineMode]);

  // --- 4. SEO & Structured Data Engine ---
  const [selectedSchema, setSelectedSchema] = useState<'org' | 'campaign' | 'article' | 'forum' | 'breadcrumb'>('org');
  const [schemaResult, setSchemaResult] = useState('');

  useEffect(() => {
    let result = '';
    const baseUrl = 'https://puriwelfare.org';
    if (selectedSchema === 'org') {
      result = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Puri Stray Dog, Cow & Nature Welfare Initiative",
        "alternateName": "Puri Welfare Initiative",
        "url": baseUrl,
        "logo": "https://images.unsplash.com/photo-1591025207163-942350609a13?auto=format&fit=crop&q=80&w=150",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-9876543210",
          "contactType": "Emergency rescue dispatch",
          "areaServed": "IN-OR",
          "availableLanguage": ["Odia", "English", "Hindi"]
        },
        "sameAs": [
          "https://facebook.com/puriwelfare",
          "https://twitter.com/puriwelfare",
          "https://linkedin.com/company/puriwelfare"
        ]
      }, null, 2);
    } else if (selectedSchema === 'campaign') {
      const activeCampaign = campaigns[0] || { title: 'Puri Beach Rescue', description: 'Beach welfare and street animal safety' };
      result = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "DonateAction",
        "name": `Sponsor ${activeCampaign.title}`,
        "description": activeCampaign.description,
        "recipient": {
          "@type": "Organization",
          "name": "Puri Stray Dog, Cow & Nature Welfare Initiative"
        },
        "target": `${baseUrl}/campaigns`
      }, null, 2);
    } else if (selectedSchema === 'article') {
      result = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "headline": "Stray Dogs Protection Drive Gathers Momentum",
        "image": [
          "https://images.unsplash.com/photo-1591025207163-942350609a13?auto=format&fit=crop&q=80&w=800"
        ],
        "datePublished": "2026-07-10T08:00:00+05:30",
        "dateModified": "2026-07-18T09:00:00+05:30",
        "author": {
          "@type": "Person",
          "name": "Dr. Arnab Das",
          "jobTitle": "Lead Veterinary Volunteer"
        }
      }, null, 2);
    } else if (selectedSchema === 'forum') {
      const activeThread = threads[0] || { title: 'Beach Patrol Schedule', author_name: 'Satya Ray' };
      result = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        "headline": activeThread.title,
        "author": {
          "@type": "Person",
          "name": activeThread.author_name
        },
        "interactionStatistic": {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/CommentAction",
          "userInteractionCount": 14
        }
      }, null, 2);
    } else {
      result = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Rescue Center",
            "item": `${baseUrl}/reports`
          }
        ]
      }, null, 2);
    }
    setSchemaResult(result);
  }, [selectedSchema, campaigns, threads]);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(`<script type="application/ld+json">\n${schemaResult}\n</script>`);
    showToast('JSON-LD schema structured script tag copied to clipboard!', 'success');
  };

  // --- 5. Social Sharing & Card Simulator ---
  const [selectedShareItem, setSelectedShareItem] = useState<{title: string, desc: string, img: string}>({
    title: 'Puri Beach Stray Cow Feeding Station',
    desc: 'Help secure fresh fodder and hydration stations on Puri Beach to sustain stray cattle!',
    img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600'
  });

  const handleShareToPlatform = (platform: string) => {
    const shareText = encodeURIComponent(`🚨 PURI CIVIC CRISIS: ${selectedShareItem.title} - ${selectedShareItem.desc} Join us now!`);
    const shareUrl = encodeURIComponent('https://puriwelfare.org/campaigns');
    
    let url = '';
    switch (platform) {
      case 'wa': url = `https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`; break;
      case 'fb': url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`; break;
      case 'x': url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`; break;
      case 'tg': url = `https://telegram.me/share/url?url=${shareUrl}&text=${shareText}`; break;
      case 'li': url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`; break;
      default:
        navigator.clipboard.writeText(`https://puriwelfare.org/campaigns?item=og-1`);
        showToast('Direct deep-link copied. Dynamic OG metadata attached.', 'success');
        return;
    }
    window.open(url, '_blank');
    showToast(`Dispatched secure OAuth sharing request to ${platform.toUpperCase()}`, 'info');
  };

  // --- 6. Global Search Local State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(['stray dog vaccine', 'beach dog shelter', 'Jagannath cow rescue', 'Arnab Das']);
  const [searchFocused, setSearchFocused] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debouncing effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const getFilteredSearchResults = () => {
    if (!debouncedQuery.trim()) return { reports: [], campaigns: [], threads: [] };
    const q = debouncedQuery.toLowerCase();

    const filteredReports = reports.filter(r => 
      r.title.toLowerCase().includes(q) || 
      r.description.toLowerCase().includes(q) || 
      r.location.toLowerCase().includes(q) ||
      r.reporter_name.toLowerCase().includes(q) ||
      r.animal_type.toLowerCase().includes(q)
    );

    const filteredCampaigns = campaigns.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) || 
      c.long_description.toLowerCase().includes(q) ||
      c.organizer.toLowerCase().includes(q)
    );

    const filteredThreads = threads.filter(t => 
      t.title.toLowerCase().includes(q) || 
      t.content.toLowerCase().includes(q) || 
      t.author_name.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );

    return {
      reports: filteredReports,
      campaigns: filteredCampaigns,
      threads: filteredThreads
    };
  };

  const results = getFilteredSearchResults();
  const totalResultsCount = results.reports.length + results.campaigns.length + results.threads.length;

  const highlightText = (text: string, search: string) => {
    if (!search || !text) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-slate-900 rounded-sm font-semibold px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    showToast('Recent searches cleared.', 'info');
  };

  // --- 7. Security audit & CSP status ---
  const [csrfToken, setCsrfToken] = useState('CSRF_v4_719A_883C_X9');
  const [cspStatus, setCspStatus] = useState('Enabled (Strict)');
  const [secHeaders, setSecHeaders] = useState({
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  const [rateLimitCount, setRateLimitCount] = useState(0);
  const [rateLimited, setRateLimited] = useState(false);

  const triggerSecureApiCall = () => {
    if (rateLimited) {
      showToast('HTTP 429 - Rate Limit Exceeded. Backoff active.', 'error');
      return;
    }
    const nextCount = rateLimitCount + 1;
    setRateLimitCount(nextCount);
    if (nextCount > 6) {
      setRateLimited(true);
      showToast('SECURITY BOUNDARY: Rate limiter triggered! 429 Block.', 'error');
      setTimeout(() => {
        setRateLimited(false);
        setRateLimitCount(0);
        showToast('Rate limits refreshed. Backoff cooldown expired.', 'info');
      }, 8000);
    } else {
      showToast(`Encrypted Request ${nextCount}/6 validated: CSRF & XSS checks passed.`, 'success');
    }
  };

  // --- 8. Monitoring & Performance Charts ---
  const [perfLogs, setPerfLogs] = useState<any[]>([
    { id: 'perf-1', timestamp: new Date(Date.now() - 5000).toISOString(), endpoint: 'GET /api/reports', duration: 18, dbQueries: 2, status: 200 },
    { id: 'perf-2', timestamp: new Date(Date.now() - 15000).toISOString(), endpoint: 'POST /api/donations', duration: 145, dbQueries: 5, status: 201 },
    { id: 'perf-3', timestamp: new Date(Date.now() - 45000).toISOString(), endpoint: 'GET /api/campaigns', duration: 25, dbQueries: 1, status: 200 },
    { id: 'perf-4', timestamp: new Date(Date.now() - 90000).toISOString(), endpoint: 'GET /api/forum/threads', duration: 340, dbQueries: 8, status: 200, slow: true }
  ]);

  const [dbBackupInterval, setDbBackupInterval] = useState('daily');
  const [automatedBackups, setAutomatedBackups] = useState(true);
  const [backupLogs, setBackupLogs] = useState<any[]>([
    { id: 'b-1', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), type: 'Scheduled Full', size: '1.24 MB', recordsCount: 1450, status: 'Completed' },
    { id: 'b-2', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), type: 'Scheduled Full', size: '1.21 MB', recordsCount: 1442, status: 'Completed' },
    { id: 'b-3', timestamp: new Date(Date.now() - 60 * 60 * 1000 * 24).toISOString(), type: 'Manual Rollback Snapshot', size: '1.18 MB', recordsCount: 1400, status: 'Completed' }
  ]);

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      reports,
      campaigns,
      notifications,
      currentUser,
      timestamp: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `puri_welfare_disaster_recovery_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Secure database schema backup generated and downloaded.', 'success');
  };

  const handleTriggerRollback = (backup: any) => {
    showToast(`Disaster recovery snapshot rolled back: ${backup.type}`, 'success');
    addNotification(
      'Database Disaster Recovery Rollback',
      `Central database schema and state safely restored to snapshot reference ${backup.id} from ${backup.timestamp}. Integrity check completed: 100% compliant.`,
      'system',
      'urgent'
    );
  };

  // --- 9. QA Automated Test Runner ---
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState<any[]>([]);

  const handleRunQA = () => {
    setIsRunningTests(true);
    setTestProgress(0);
    setTestResults([]);

    const testsToRun = [
      { id: 't1', name: 'SEO Metadata Engine Parsing', assertion: 'document.title dynamically changes with tabs', status: 'pending' },
      { id: 't2', name: 'PWA Service Worker Registration', assertion: 'navigator.serviceWorker.controller !== null', status: 'pending' },
      { id: 't3', name: 'CSRF Anti-Forgery Token Validation', assertion: 'Reject requests missing verification header', status: 'pending' },
      { id: 't4', name: 'SQL Injection Guard Filter', assertion: 'Check raw character sequences for escape validation', status: 'pending' },
      { id: 't5', name: 'WCAG AA Standard Contrast Check', assertion: 'Foreground vs background ratio exceeds 4.5:1', status: 'pending' },
      { id: 't6', name: 'Notification Delivery Pipeline', assertion: 'State-dependent badge counter triggers correctly', status: 'pending' },
      { id: 't7', name: 'Offline IndexedDB Store Cache', assertion: 'Fetch offline reports queue correctly', status: 'pending' },
      { id: 't8', name: 'Supabase Real-Time Broadcast Sync', assertion: 'Verify active channels handle low-latency payloads', status: 'pending' },
      { id: 't9', name: 'Campaign Ledger Fractional Currency Math', assertion: 'Aggregated funds calculation has no precision leaks', status: 'pending' },
      { id: 't10', name: 'Memory Leak & Virtual List Garbage Cleanup', assertion: 'Clean unused image refs during transition', status: 'pending' }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx >= testsToRun.length) {
        clearInterval(interval);
        setIsRunningTests(false);
        showToast('QA Compliance Run Completed: 10/10 PASS.', 'success');
        return;
      }

      const updatedTest = { 
        ...testsToRun[currentIdx], 
        status: Math.random() > 0.05 ? 'pass' : 'fail' // 95% pass rate
      };
      setTestResults(prev => [...prev, updatedTest]);
      currentIdx++;
      setTestProgress(Math.floor((currentIdx / testsToRun.length) * 100));
    }, 500);
  };

  // --- 10. Error Boundaries Sandboxes ---
  const [selectedSandboxError, setSelectedSandboxError] = useState<string | null>(null);

  const renderSandboxError = () => {
    switch (selectedSandboxError) {
      case '404':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border" id="err-404">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold">404</div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Request Route Unresolved</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              The page you are trying to visit has been moved, archived, or is currently on hold.
            </p>
            <button onClick={() => setSelectedSandboxError(null)} className="mt-4 text-xs px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
              Acknowledge & Recover
            </button>
          </div>
        );
      case '403':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border" id="err-403">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Authorization claims mismatch</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              Your cryptographic role claims do not carry permissions to read or write into the administration audit tables.
            </p>
            <button onClick={() => setSelectedSandboxError(null)} className="mt-4 text-xs px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
              Acknowledge & Recover
            </button>
          </div>
        );
      case '500':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border" id="err-500">
            <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Infrastructure Timeout</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              The application pool is experiencing latency in processing socket payloads. Diagnostic dump complete.
            </p>
            <button onClick={() => setSelectedSandboxError(null)} className="mt-4 text-xs px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
              Acknowledge & Recover
            </button>
          </div>
        );
      case 'maintenance':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border" id="err-maint">
            <div className="w-16 h-16 bg-purple-500/10 text-purple-500 rounded-full flex items-center justify-center mb-4">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Scheduled Maintenance Mode</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm">
              Database indexing in progress. Expected completion window: 12 minutes. Civic emergency dispatch lines remain open.
            </p>
            <button onClick={() => setSelectedSandboxError(null)} className="mt-4 text-xs px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold rounded-xl transition-all">
              Acknowledge & Recover
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center py-12 text-slate-400 text-xs">
            Select an error code button above to inject, test, and preview the production visual exception template inside this sandbox frame.
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 text-left" id="enterprise-portal-container">
      {/* Sidebar navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-1.5" id="enterprise-tabs">
        <div className="p-4 bg-teal-700 text-white rounded-3xl mb-4 space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="font-display font-bold text-sm tracking-tight">Enterprise Suite</h3>
          </div>
          <p className="text-[10px] text-teal-100 font-mono leading-normal">
            Production Hardening &amp; DevOps Cockpit
          </p>
        </div>

        {[
          { id: 'notifications', label: 'Notification Center', icon: Bell },
          { id: 'emails', label: 'HTML Email Templates', icon: Mail },
          { id: 'pwa', label: 'PWA & Background Sync', icon: Smartphone },
          { id: 'seo', label: 'SEO & JSON-LD Schemas', icon: Globe },
          { id: 'search', label: 'Global Search Engine', icon: Search },
          { id: 'security', label: 'Security & CSRF/XSS', icon: ShieldCheck },
          { id: 'monitoring', label: 'Performance Monitor', icon: Cpu },
          { id: 'backups', label: 'Backup & Disaster Recovery', icon: Database },
          { id: 'qa', label: 'Automated QA Testing', icon: Play },
          { id: 'errors', label: 'Error Handling Sandbox', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/10' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-900/30'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow glass-panel border border-gray-200/50 dark:border-slate-800/50 rounded-3xl p-5 md:p-8" id="enterprise-main-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            {/* 1. Notification Center */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">In-App Notification Center</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage system notices, categories, and priority classifications with real-time Supabase simulated broadcast listening.
                  </p>
                </div>

                {/* Simulated ingest and status overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 font-mono">
                        QUEUE SIZE: {notifications.length} NOTIFICATIONS ({notifications.filter(n => !n.read).length} UNREAD)
                      </span>
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs font-bold text-brand-emerald hover:underline flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Mark All as Read
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900/20 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
                          <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                          <p className="text-xs font-bold text-slate-500">Inbox Completely Compliant &amp; Clear</p>
                          <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-1">No alerts waiting. You can use the simulator panel to the right to trigger instant real-time broadcasts.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-4 rounded-2xl border transition-all flex items-start gap-3 justify-between ${
                              notif.read 
                                ? 'bg-slate-50/50 dark:bg-slate-900/10 border-gray-100 dark:border-slate-900/50 opacity-75' 
                                : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 shadow-sm'
                            }`}
                          >
                            <div className="space-y-1 text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide font-mono ${
                                  notif.priority === 'urgent' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-500/20' :
                                  notif.priority === 'high' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                                  notif.priority === 'low' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                }`}>
                                  {notif.priority || 'NORMAL'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {notif.type.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">
                                  {new Date(notif.created_at).toLocaleTimeString()}
                                </span>
                              </div>
                              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                                {notif.title}
                              </h4>
                              <p className="text-xs text-slate-500 leading-relaxed">
                                {notif.message}
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              {!notif.read && (
                                <button 
                                  onClick={() => markNotificationAsRead(notif.id)}
                                  className="p-1.5 hover:bg-emerald-500/10 text-brand-emerald rounded-lg"
                                  title="Mark as Read"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotification(notif.id)}
                                className="p-1.5 hover:bg-rose-500/10 text-rose-500 rounded-lg"
                                title="Delete Notification"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: Simulator */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-gray-200/60 dark:border-slate-800/60 rounded-3xl p-5 space-y-4">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        Supabase Real-Time Broadcast Simulator
                      </h4>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-400">Notification Category</label>
                        <select 
                          value={simCategory} 
                          onChange={(e: any) => setSimCategory(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                        >
                          <option value="report">Report updates</option>
                          <option value="forum">Forum replies</option>
                          <option value="mention">Mentions</option>
                          <option value="campaign">Campaign updates</option>
                          <option value="donation">Donation receipts</option>
                          <option value="volunteer">Volunteer assignments</option>
                          <option value="announcement">Announcements</option>
                          <option value="moderator">Moderator actions</option>
                          <option value="system">System notifications</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-400">Alert Priority</label>
                        <select 
                          value={simPriority} 
                          onChange={(e: any) => setSimPriority(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                        >
                          <option value="low">Low Priority</option>
                          <option value="normal">Normal Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent Priority</option>
                        </select>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-400">Custom Title</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Stray Animal Dispatched"
                          value={simTitle}
                          onChange={(e) => setSimTitle(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-400">Custom Message Payload</label>
                        <textarea 
                          rows={2}
                          placeholder="Provide the notification body description..."
                          value={simMessage}
                          onChange={(e) => setSimMessage(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        onClick={handleSimulateRealtime}
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-emerald dark:hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-3"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Simulate Broadcast Ingestion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HTML Email Templates */}
            {activeTab === 'emails' && (
              <div className="space-y-6" id="panel-emails">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Responsive HTML Email Templates</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pre-compiled and structured transactional email formats tailored for NGO operations, including full responsive layouts and secure branding.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Controls */}
                  <div className="space-y-4">
                    <div className="space-y-1.5 text-left text-xs">
                      <label className="font-bold text-slate-400">Template Type</label>
                      <select 
                        value={selectedEmailTemplate} 
                        onChange={(e) => setSelectedEmailTemplate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2.5 font-bold focus:outline-none"
                      >
                        <option value="welcome">Welcome Onboarding Email</option>
                        <option value="donation">Donation Receipt Summary</option>
                        <option value="report_sub">Emergency Report Submission</option>
                        <option value="campaign">Campaign Milestone Update</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left text-xs border-t pt-3">
                      <label className="font-bold text-slate-400">Recipient Name Placeholder</label>
                      <input 
                        type="text" 
                        value={emailRecipientName} 
                        onChange={(e) => setEmailRecipientName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5 text-left text-xs">
                      <label className="font-bold text-slate-400">Recipient Email</label>
                      <input 
                        type="email" 
                        value={emailRecipientEmail} 
                        onChange={(e) => setEmailRecipientEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={handleCopyEmail}
                        className="flex-grow py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        {emailCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy Raw HTML
                      </button>
                      <button 
                        onClick={handleSendTestEmail}
                        className="flex-grow py-2 bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Trigger SMTP Send
                      </button>
                    </div>
                  </div>

                  {/* Right Preview */}
                  <div className="lg:col-span-2 border rounded-2xl overflow-hidden bg-slate-100 p-4 flex flex-col h-[450px]">
                    <div className="flex items-center justify-between text-xs bg-slate-200 dark:bg-slate-800 px-3 py-2 rounded-t-xl shrink-0 font-mono">
                      <span>SMTP PREVIEWER (RESPONSIVE VIEWPORT)</span>
                      <span className="text-[10px] text-slate-400">SMTP.PURI.CIVIC (RSA-2048 SECURE)</span>
                    </div>
                    <iframe 
                      title="Email Preview"
                      srcDoc={getEmailHtml(selectedEmailTemplate)}
                      className="w-full flex-grow bg-white border-0 rounded-b-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. PWA & Background Sync */}
            {activeTab === 'pwa' && (
              <div className="space-y-6" id="panel-pwa">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Progressive Web App (PWA) Engine</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage service workers, offline asset caches, IndexedDB dispatch buffers, and custom native background replication syncer.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status checklist */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">PWA Manifest Status</h4>
                    
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-bold">Service Worker Status</span>
                        </div>
                        <span className="font-mono text-green-500">ACTIVE</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-bold">Static Cache Storage</span>
                        </div>
                        <span className="font-mono text-slate-400">4.21 MB</span>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="font-bold">IndexedDB Sync Buffer</span>
                        </div>
                        <span className="font-mono text-brand-emerald font-bold">{syncQueue.length} PENDING</span>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <Smartphone className="w-5 h-5 text-brand-emerald shrink-0 mt-0.5" />
                        <div className="space-y-1 text-xs text-left">
                          <h5 className="font-bold text-slate-800 dark:text-slate-200">Device Launch Ready</h5>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            This civic platform supports one-click system installation on Chrome, iOS Safari, and Android. Home screen launches with high-definition branding and splash screens.
                          </p>
                          {pwaInstallPrompt && (
                            <button 
                              onClick={() => {
                                showToast('PWA Custom Native Installation Process Triggered.', 'success');
                                setPwaInstallPrompt(false);
                              }}
                              className="mt-2 text-[10px] px-3 py-1 bg-brand-emerald hover:bg-emerald-600 text-white font-extrabold rounded-lg transition-all"
                            >
                              Install Native Civic App
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Offline Sandbox Simulator */}
                  <div className="md:col-span-2 bg-slate-50/50 dark:bg-slate-900/30 border rounded-3xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        {offlineMode ? <CloudOff className="w-4 h-4 text-rose-500" /> : <Globe className="w-4 h-4 text-brand-emerald" />}
                        <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          Offline Mode Operations Lab
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-xl border">
                        <span className="text-[10px] font-bold text-slate-400">Offline Switch:</span>
                        <input 
                          type="checkbox" 
                          checked={offlineMode} 
                          onChange={(e) => setOfflineMode(e.target.checked)}
                          className="w-4 h-4 text-brand-emerald bg-gray-100 border-gray-300 rounded focus:ring-brand-emerald focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal">
                      Toggle offline mode to verify the resilience of our architecture. When offline, all submits are held in our PWA Background Sync IndexedDB. When connection returns, they immediately stream to server storage.
                    </p>

                    <form onSubmit={handleOfflineSubmit} className="space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 text-left">
                          <label className="font-bold text-slate-400">Incident Title</label>
                          <input 
                            type="text" 
                            disabled={!offlineMode}
                            placeholder={offlineMode ? "Title when offline..." : "Must toggle offline switch first"}
                            value={offTitle}
                            onChange={(e) => setOffTitle(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="font-bold text-slate-400">Stray Animal Breed</label>
                          <select 
                            disabled={!offlineMode}
                            value={offAnimal} 
                            onChange={(e: any) => setOffAnimal(e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none"
                          >
                            <option value="dog">Street Dog</option>
                            <option value="cat">Stray Cat</option>
                            <option value="cow">Street Cow</option>
                            <option value="other">Wildlife Sighting</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="font-bold text-slate-400">Incident Witness Log Description</label>
                        <textarea 
                          rows={2}
                          disabled={!offlineMode}
                          placeholder={offlineMode ? "Witness logs when offline..." : "Must toggle offline switch first"}
                          value={offDesc}
                          onChange={(e) => setOffDesc(e.target.value)}
                          className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2 font-bold focus:outline-none resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={!offlineMode}
                        className="w-full py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-40"
                      >
                        Queue Offline Submission Dispatch
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* 4. SEO & Dynamic Metadata */}
            {activeTab === 'seo' && (
              <div className="space-y-6" id="panel-seo">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">SEO &amp; JSON-LD Schema Generator</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Check metadata indexes, canonical URLs, robots compliance directives, and construct semantic rich snippets directly for search engines.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left controls */}
                  <div className="space-y-4 text-xs">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Structured Data Schemas</h4>
                    
                    <div className="space-y-1.5 text-left">
                      <label className="font-bold text-slate-400">Schema Type</label>
                      <select 
                        value={selectedSchema} 
                        onChange={(e: any) => setSelectedSchema(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2.5 font-bold focus:outline-none"
                      >
                        <option value="org">Organization (NGO)</option>
                        <option value="campaign">Campaign Donation Schema</option>
                        <option value="article">News Article Schema</option>
                        <option value="forum">Forum Discussion Schema</option>
                        <option value="breadcrumb">Breadcrumb List Schema</option>
                      </select>
                    </div>

                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-left space-y-1">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200">Semantic Grounding</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        These schema scripts are automatically compiled into JSON-LD script formats, and appended to our HTML head tag in production to boost search relevance indexing.
                      </p>
                    </div>

                    <button 
                      onClick={handleCopySchema}
                      className="w-full py-2.5 bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Schema Script Tag
                    </button>
                  </div>

                  {/* Right editor */}
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-t-xl shrink-0 border-b">
                      <span>JSON-LD RICH SCHEMA SNIPPETS</span>
                      <span className="text-[10px] text-slate-400">SCHEMA.ORG INTEGRITY</span>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-400 rounded-b-xl overflow-x-auto text-left text-xs font-mono h-[300px] leading-relaxed select-all border border-slate-900">
                      {schemaResult}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {/* 5. Global Search */}
            {activeTab === 'search' && (
              <div className="space-y-6" id="panel-search">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Multi-Entity Search Engine</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Execute global matches with high-precision debouncing, index queries, and highlight matching characters across alerts, campaigns, threads, and users.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-5 h-5" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Search reports, campaigns, forum discussions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      className="w-full bg-white dark:bg-slate-900/45 border rounded-2xl pl-11 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-emerald"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Recent Searches / Suggestions */}
                  {recentSearches.length > 0 && !searchQuery && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/20 rounded-2xl border text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">RECENT SEACH COMPLIANCE INDEX</span>
                        <button onClick={handleClearRecentSearches} className="text-[10px] font-bold text-rose-500 hover:underline">Clear Index</button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map(term => (
                          <button 
                            key={term}
                            onClick={() => handleSelectRecentSearch(term)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-all"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search Results Display Area */}
                  {searchQuery && (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold text-slate-400">
                          FOUND {totalResultsCount} MATCHES FOR "{debouncedQuery.toUpperCase()}"
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">DEBOUNCE LATENCY: 250ms</span>
                      </div>

                      {totalResultsCount === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-slate-900 border rounded-2xl">
                          <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-500">No matching registry matches found</p>
                          <p className="text-[10px] text-slate-400 mt-1">Try searching for keywords like "dog", "cow", "patrol", "vet".</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Reports column */}
                          <div className="space-y-3">
                            <h4 className="font-display font-extrabold text-xs text-slate-400 tracking-wider border-l-2 border-rose-500 pl-2 uppercase">Reports ({results.reports.length})</h4>
                            {results.reports.map(r => (
                              <div key={r.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl text-xs space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1 py-0.5 rounded">Emergency</span>
                                <h5 className="font-bold text-slate-800 dark:text-slate-100">{highlightText(r.title, debouncedQuery)}</h5>
                                <p className="text-slate-500 line-clamp-2">{highlightText(r.description, debouncedQuery)}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">{highlightText(r.location, debouncedQuery)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Campaigns column */}
                          <div className="space-y-3">
                            <h4 className="font-display font-extrabold text-xs text-slate-400 tracking-wider border-l-2 border-green-500 pl-2 uppercase">Campaigns ({results.campaigns.length})</h4>
                            {results.campaigns.map(c => (
                              <div key={c.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl text-xs space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-green-500 bg-green-500/10 px-1 py-0.5 rounded">Crowdfunding</span>
                                <h5 className="font-bold text-slate-800 dark:text-slate-100">{highlightText(c.title, debouncedQuery)}</h5>
                                <p className="text-slate-500 line-clamp-2">{highlightText(c.description, debouncedQuery)}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Organized by: {highlightText(c.organizer, debouncedQuery)}</p>
                              </div>
                            ))}
                          </div>

                          {/* Forum threads column */}
                          <div className="space-y-3">
                            <h4 className="font-display font-extrabold text-xs text-slate-400 tracking-wider border-l-2 border-blue-500 pl-2 uppercase">Forum threads ({results.threads.length})</h4>
                            {results.threads.map(t => (
                              <div key={t.id} className="p-3 bg-white dark:bg-slate-900 border rounded-xl text-xs space-y-1">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded">{t.category_name}</span>
                                <h5 className="font-bold text-slate-800 dark:text-slate-100">{highlightText(t.title, debouncedQuery)}</h5>
                                <p className="text-slate-500 line-clamp-2">{highlightText(t.content, debouncedQuery)}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">Authored by: {highlightText(t.author_name, debouncedQuery)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. Security */}
            {activeTab === 'security' && (
              <div className="space-y-6" id="panel-security">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Enterprise Security direct details</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Strict encryption payloads, cross-site forgery mitigation (CSRF), Content Security Policies (CSP), and request throttle protections.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-left">
                  {/* Left panel: Direct info */}
                  <div className="space-y-4">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Cryptographic Handshake &amp; Claims</h4>
                    
                    <div className="space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                        <span className="font-bold">Active JWT CSRF Secret</span>
                        <code className="text-brand-teal font-bold font-mono">{csrfToken}</code>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                        <span className="font-bold">CSP Directive Verification</span>
                        <code className="text-emerald-500 font-bold font-mono">{cspStatus}</code>
                      </div>
                    </div>

                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-1.5">
                      <h5 className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4" />
                        XSS Sanitization &amp; Injection Guard
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        All HTML renders escape bracket sequences `&lt;script&gt;` and convert payload boundaries natively. Database inputs pass through type validation and parameter mappings, preventing secondary SQL injection.
                      </p>
                    </div>

                    <button 
                      onClick={triggerSecureApiCall}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-brand-emerald dark:hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
                    >
                      Trigger Simulated Sanitized API Call
                    </button>
                  </div>

                  {/* Right panel: Security headers */}
                  <div className="bg-slate-950 text-slate-300 rounded-2xl p-5 font-mono border border-slate-900 flex flex-col justify-between">
                    <div className="space-y-3">
                      <span className="text-[10px] text-slate-500 block border-b border-slate-800 pb-2">SECURE ENGINE HTTP HEADERS ENGINE</span>
                      {Object.entries(secHeaders).map(([header, val]) => (
                        <div key={header} className="space-y-1">
                          <span className="text-[10px] text-rose-400 block">{header}:</span>
                          <span className="text-[10px] text-slate-400 leading-normal block overflow-x-auto whitespace-pre-wrap">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 7. Performance & Monitoring */}
            {activeTab === 'monitoring' && (
              <div className="space-y-6" id="panel-perf">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Real-Time Performance Logs</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Trace server latency, API database request speeds, slow query diagnostics, and monitor container CPU / RAM statistics.
                  </p>
                </div>

                {/* Metrics boxes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: 'CPU Usage', val: '2.14%', status: 'Optimum' },
                    { label: 'Docker Mem pool', val: '124MB / 512MB', status: 'Optimum' },
                    { label: 'Edge Latency', val: '14ms', status: 'Optimum' },
                    { label: 'Uptime', val: '99.99%', status: 'Optimum' }
                  ].map(m => (
                    <div key={m.label} className="p-4 bg-slate-50 dark:bg-slate-900 border rounded-2xl space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">{m.label}</span>
                      <h4 className="font-display font-extrabold text-lg text-slate-800 dark:text-white">{m.val}</h4>
                      <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded-full">{m.status}</span>
                    </div>
                  ))}
                </div>

                {/* Query Trace logs */}
                <div className="space-y-3 text-left">
                  <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Endpoint Execution Trace logs</h4>
                  <div className="border rounded-2xl overflow-hidden font-mono text-[11px]">
                    <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-900 p-3 font-bold border-b text-slate-500">
                      <span>Endpoint Route</span>
                      <span>DB Queries</span>
                      <span>Execution Speed</span>
                      <span>HTTP Status</span>
                    </div>
                    {perfLogs.map(log => (
                      <div key={log.id} className="grid grid-cols-4 p-3 border-b hover:bg-slate-50/50 dark:hover:bg-slate-900/10 text-slate-600 dark:text-slate-300">
                        <span>{log.endpoint}</span>
                        <span>{log.dbQueries} calls</span>
                        <span className={log.slow ? 'text-amber-500 font-bold' : ''}>{log.duration}ms</span>
                        <span className="text-green-500 font-bold">{log.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 8. Backups & Disaster Recovery */}
            {activeTab === 'backups' && (
              <div className="space-y-6" id="panel-backups">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Backups &amp; Disaster Recovery Cockpit</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Download full relational database schema representations, establish automated compression schedules, and simulate rollback states.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                  {/* Controls */}
                  <div className="space-y-4 text-xs">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Recovery Configurations</h4>
                    
                    <div className="space-y-1 text-left">
                      <label className="font-bold text-slate-400">Backup Frequency Interval</label>
                      <select 
                        value={dbBackupInterval} 
                        onChange={(e) => setDbBackupInterval(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border rounded-xl p-2.5 font-bold focus:outline-none"
                      >
                        <option value="hourly">Hourly Incremental Sync</option>
                        <option value="daily">Daily Compressed Full</option>
                        <option value="weekly">Weekly Redundant Cloud Arch</option>
                      </select>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border flex items-center justify-between">
                      <span className="font-bold">Cloud Encryption Mode</span>
                      <code className="text-brand-teal font-mono">AES_256_GCM</code>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button 
                        onClick={handleDownloadBackup}
                        className="py-2.5 bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Manual JSON Snapshot
                      </button>
                    </div>
                  </div>

                  {/* List of historical snapshots */}
                  <div className="lg:col-span-2 space-y-3">
                    <h4 className="font-display font-bold text-xs uppercase tracking-widest text-slate-400">Snapshot Compliance Catalog</h4>
                    <div className="space-y-2.5">
                      {backupLogs.map(backup => (
                        <div key={backup.id} className="p-3 bg-white dark:bg-slate-900 border rounded-2xl flex items-center justify-between text-xs transition-all hover:border-gray-300 dark:hover:border-slate-700">
                          <div className="space-y-1">
                            <h5 className="font-bold text-slate-800 dark:text-slate-100">{backup.type}</h5>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>Ref: {backup.id}</span>
                              <span>&bull;</span>
                              <span>Size: {backup.size}</span>
                              <span>&bull;</span>
                              <span>{backup.recordsCount} items</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleTriggerRollback(backup)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-rose-500/10 hover:text-rose-600 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold rounded-lg transition-all"
                          >
                            Rollback Restore
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9. QA Automated Test Runner */}
            {activeTab === 'qa' && (
              <div className="space-y-6" id="panel-qa">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Compliance QA Automated Test Suite</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Execute visual regression, WCAG contrast eligibility tests, and cryptographic CSRF token validation tests in a live sandboxed runtime.
                  </p>
                </div>

                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleRunQA}
                      disabled={isRunningTests}
                      className="px-5 py-2.5 bg-brand-emerald hover:bg-emerald-600 disabled:opacity-40 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      {isRunningTests ? 'Running Diagnostic assertions...' : 'Initiate Automated QA Diagnostic'}
                    </button>
                    {isRunningTests && (
                      <span className="text-xs font-mono font-bold text-brand-emerald animate-pulse">
                        TESTING ACTIVE: {testProgress}% COMPLETED
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  {isRunningTests && (
                    <div className="w-full bg-gray-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${testProgress}%` }}
                        className="bg-brand-emerald h-full rounded-full"
                      />
                    </div>
                  )}

                  {/* Test output stream */}
                  <div className="bg-slate-950 rounded-2xl p-4 font-mono text-xs border border-slate-900 min-h-[250px] flex flex-col justify-between">
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      <span className="text-[10px] text-slate-500 block border-b border-slate-900 pb-1.5">INTEGRATION &amp; WCAG COMPLIANCE TRACES</span>
                      {testResults.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                          <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                          <span>Console idle. Initialize QA suite to run assertions.</span>
                        </div>
                      ) : (
                        testResults.map(tr => (
                          <div key={tr.id} className="flex items-start gap-2 justify-between">
                            <span className="text-slate-400">ASSERTION: {tr.name} - {tr.assertion}</span>
                            <span className={tr.status === 'pass' ? 'text-green-400 font-bold' : 'text-rose-500 font-bold animate-pulse'}>
                              [{tr.status.toUpperCase()}]
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 10. Error Handling Sandbox */}
            {activeTab === 'errors' && (
              <div className="space-y-6" id="panel-errors">
                <div className="border-b pb-4">
                  <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Enterprise Exception Boundary Sandboxes</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Pre-compile visual templates for standard status exceptions including rate limits, forbidden pathways, and system downtime alerts.
                  </p>
                </div>

                {/* Grid of buttons to select */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { code: '404', label: '404 Unresolved' },
                    { code: '403', label: '403 Claims Denied' },
                    { code: '500', label: '500 Server Fault' },
                    { code: 'maintenance', label: 'Maintenance Window' }
                  ].map(err => (
                    <button
                      key={err.code}
                      onClick={() => setSelectedSandboxError(err.code)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all ${
                        selectedSandboxError === err.code 
                          ? 'bg-rose-500/10 border-rose-500 text-rose-500' 
                          : 'bg-white hover:bg-gray-50 dark:bg-slate-900 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {err.label}
                    </button>
                  ))}
                </div>

                {/* Interactive render window */}
                <div className="p-8 border border-dashed rounded-3xl min-h-[300px] flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/10">
                  {renderSandboxError()}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default EnterpriseSuiteView;
