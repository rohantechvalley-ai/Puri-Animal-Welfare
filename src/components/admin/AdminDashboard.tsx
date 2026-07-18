/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  ShieldCheck, 
  MessageSquare, 
  DollarSign, 
  Users, 
  Compass, 
  Megaphone, 
  FileText, 
  Settings, 
  Folder, 
  Menu, 
  X, 
  User,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
  Fingerprint,
  ChevronRight,
  Mail,
  Database
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Import child subcomponents
import { AdminDashboardHome } from './AdminDashboardHome';
import { ReportManagement } from './ReportManagement';
import { ModerationQueue } from './ModerationQueue';
import { ForumModeration } from './ForumModeration';
import { DonationManagement } from './DonationManagement';
import { UserManagement } from './UserManagement';
import { VolunteerManagement } from './VolunteerManagement';
import { NotificationManagement } from './NotificationManagement';
import { ActivityLogs } from './ActivityLogs';
import { SettingsView } from './SettingsView';
import { MediaManager } from './MediaManager';
import { OutgoingEmails } from './OutgoingEmails';
import { SupabaseSync } from './SupabaseSync';

// Import Types & Seeds
import { 
  AdminAuditLog, 
  AdminSettings, 
  AdminBroadcast, 
  VolunteerApplication, 
  RbacRole,
  ROLE_DEFINITIONS,
  hasPermission
} from './adminTypes';
import { 
  INITIAL_AUDIT_LOGS, 
  INITIAL_BROADCASTS, 
  DEFAULT_SETTINGS, 
  INITIAL_VOLUNTEERS 
} from './adminSeeds';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useApp();

  // Role simulation toggles
  const [actingRole, setActingRole] = useState<RbacRole>('admin');

  // Sidebar controls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Multi-panel local state coordination
  const [logs, setLogs] = useState<AdminAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>(INITIAL_BROADCASTS);
  const [volunteers, setVolunteers] = useState<VolunteerApplication[]>(INITIAL_VOLUNTEERS);

  // Append new audit log pipeline
  const handleAddAuditLog = (action: string, affected: string, prev?: string, next?: string) => {
    const newLog: AdminAuditLog = {
      id: `log-${Date.now()}`,
      action,
      timestamp: new Date().toISOString(),
      user: 'Satyajit Ray',
      role: actingRole,
      affectedRecord: affected,
      previousValue: prev,
      newValue: next,
      ipAddress: '192.168.1.15',
      browser: 'Mozilla Firefox v128 / Linux Kernel'
    };
    setLogs([newLog, ...logs]);
  };

  // Menu Definition
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard Home', icon: LayoutDashboard, permission: 'view_dashboard' },
    { id: 'alerts', label: 'Rescue Alerts', icon: AlertTriangle, permission: 'view_reports' },
    { id: 'triage', label: 'Priority Triage', icon: ShieldAlert, permission: 'view_flags' },
    { id: 'forum', label: 'Forum Moderation', icon: MessageSquare, permission: 'moderate_forum' },
    { id: 'donations', label: 'Donation Ledger', icon: DollarSign, permission: 'view_donations' },
    { id: 'users', label: 'User RBAC Directory', icon: Users, permission: 'manage_users' },
    { id: 'volunteers', label: 'Volunteers Dispatch', icon: Compass, permission: 'manage_volunteers' },
    { id: 'broadcaster', label: 'Announcements Feed', icon: Megaphone, permission: 'broadcast_notifications' },
    { id: 'audit', label: 'Audit Security Logs', icon: FileText, permission: 'view_audit_logs' },
    { id: 'settings', label: 'System Settings', icon: Settings, permission: 'configure_system' },
    { id: 'emails', label: 'Outgoing Emails', icon: Mail, permission: 'configure_system' },
    { id: 'supabase', label: 'Supabase Cloud DB', icon: Database, permission: 'configure_system' },
    { id: 'media', label: 'Media CDN Assets', icon: Folder, permission: 'configure_system' },
  ];

  // Render Panel content
  const renderPanel = () => {
    // 1. RBAC Guard validation checks
    const activeMenuItem = sidebarItems.find(item => item.id === activeTab);
    if (activeMenuItem && !hasPermission(actingRole, activeMenuItem.permission as any)) {
      return (
        <div className="flex flex-col items-center justify-center p-16 text-center max-w-md mx-auto space-y-4" id="rbac-error-boundary">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shadow-lg shadow-rose-500/5 animate-pulse">
            <Fingerprint className="w-8 h-8" />
          </div>
          <h3 className="font-display font-bold text-lg text-gray-950 dark:text-white">Authorization Boundary Restrained</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            Your simulated role <span className="font-bold text-rose-500 underline font-mono uppercase">{actingRole}</span> does not carry the necessary <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded font-bold">"{activeMenuItem.permission}"</span> claims required to unlock the {activeMenuItem.label} portal.
          </p>
          <div className="p-3 bg-gray-50 dark:bg-slate-900 border rounded-xl text-[11px] text-gray-400 font-mono text-left w-full leading-normal">
            <strong>Active Claims Registry:</strong>
            <ul className="list-disc pl-4 mt-1 space-y-0.5">
              {ROLE_DEFINITIONS[actingRole].permissions.map(p => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'overview':
        return (
          <AdminDashboardHome 
            onNavigateTab={setActiveTab} 
            volunteers={volunteers} 
            auditLogs={logs} 
            actingRole={actingRole} 
          />
        );
      case 'alerts':
        return <ReportManagement onAddAuditLog={handleAddAuditLog} actingRole={actingRole} />;
      case 'triage':
        return <ModerationQueue onAddAuditLog={handleAddAuditLog} actingRole={actingRole} />;
      case 'forum':
        return <ForumModeration onAddAuditLog={handleAddAuditLog} actingRole={actingRole} />;
      case 'donations':
        return <DonationManagement onAddAuditLog={handleAddAuditLog} actingRole={actingRole} />;
      case 'users':
        return <UserManagement onAddAuditLog={handleAddAuditLog} actingRole={actingRole} />;
      case 'volunteers':
        return (
          <VolunteerManagement 
            volunteers={volunteers}
            onUpdateVolunteers={setVolunteers}
            onAddAuditLog={handleAddAuditLog}
            showToast={showToast}
            actingRole={actingRole}
          />
        );
      case 'broadcaster':
        return (
          <NotificationManagement
            broadcasts={broadcasts}
            onUpdateBroadcasts={setBroadcasts}
            onAddAuditLog={handleAddAuditLog}
            showToast={showToast}
            actingRole={actingRole}
          />
        );
      case 'audit':
        return (
          <ActivityLogs 
            logs={logs}
            onClearLogs={() => setLogs([])}
            showToast={showToast}
            actingRole={actingRole}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            settings={settings}
            onUpdateSettings={setSettings}
            onAddAuditLog={handleAddAuditLog}
            showToast={showToast}
            actingRole={actingRole}
          />
        );
      case 'emails':
        return <OutgoingEmails />;
      case 'supabase':
        return <SupabaseSync />;
      case 'media':
        return <MediaManager onAddAuditLog={handleAddAuditLog} showToast={showToast} actingRole={actingRole} />;
      default:
        return (
          <AdminDashboardHome 
            onNavigateTab={setActiveTab} 
            volunteers={volunteers} 
            auditLogs={logs} 
            actingRole={actingRole} 
          />
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-6 text-left" id="admin-portal-viewport">
      {/* Sidebar Navigation */}
      <div 
        className={`bg-white/70 dark:bg-slate-900/30 border border-gray-200/50 dark:border-slate-850/50 rounded-3xl p-4 md:p-5 flex flex-col justify-between shrink-0 transition-all duration-300 shadow-sm ${
          sidebarCollapsed ? 'md:w-20' : 'md:w-64'
        }`}
        id="admin-sidebar"
      >
        <div className="space-y-6">
          {/* Collapse Controller */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className={`font-display font-extrabold text-xs uppercase tracking-widest text-brand-emerald ${sidebarCollapsed ? 'hidden' : 'block'}`}>
              Community Controls
            </h3>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-400"
              title="Collapse Sidebar"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Menus */}
          <nav className="space-y-1">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const hasAccess = hasPermission(actingRole, item.permission as any);

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isSelected 
                      ? 'bg-brand-emerald text-white shadow-md shadow-brand-emerald/10' 
                      : 'text-gray-500 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-slate-800/20'
                  } ${!hasAccess ? 'opacity-40' : ''}`}
                  id={`admin-sidebar-link-${item.id}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-grow text-left">{item.label}</span>
                  )}
                  {isSelected && (
                    <motion.div 
                      layoutId="sidebarActiveIndicator" 
                      className="absolute right-2 w-1 h-3 bg-white rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info (if not collapsed) */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-100 dark:border-slate-850 pt-4 mt-6 text-[10px] text-gray-400 font-mono flex items-center gap-1.5 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Authenticated session: <strong>SECURE_AES_256</strong></span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-grow space-y-6" id="admin-main-stage">
        {/* Top Header Block with simulated Role Switcher */}
        <div className="glass-panel rounded-3xl p-5 md:p-6 border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-extrabold text-xl text-gray-950 dark:text-white tracking-tight">Community Administration</h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold font-mono tracking-wider bg-brand-emerald/15 text-brand-teal uppercase">
                Active Portal
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-300">
              Manage field rescue alerts, coordinate volunteers, moderate comments, audit financial ledgers, and adjust configurations.
            </p>
          </div>

          {/* Role switcher simulation */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-850 p-1.5 rounded-xl border">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase pl-1.5">Simulate RBAC:</span>
            <select
              value={actingRole}
              onChange={e => {
                const role = e.target.value as RbacRole;
                setActingRole(role);
                showToast(`Switched active administrative simulation to ${role.toUpperCase()}`, 'info');
              }}
              className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg text-[10px] focus:outline-none font-bold text-brand-emerald shrink-0"
            >
              <option value="visitor">Visitor</option>
              <option value="registered_user">Registered User</option>
              <option value="volunteer">Volunteer</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Administrator</option>
              <option value="super_admin">Super Administrator</option>
            </select>
          </div>
        </div>

        {/* Dynamic Panel content render wrapper with entering transition animation */}
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + actingRole}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              id="admin-panel-stage-wrapper"
            >
              {renderPanel()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
