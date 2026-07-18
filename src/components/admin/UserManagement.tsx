/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Award, 
  AlertTriangle, 
  Key, 
  ShieldAlert, 
  Plus, 
  ChevronRight, 
  Star,
  Check,
  X,
  SlidersHorizontal,
  ThumbsUp
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserProfile, UserBadge } from '../../types';
import { ROLE_DEFINITIONS, RbacRole } from './adminTypes';

interface UserManagementProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  actingRole: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onAddAuditLog, actingRole }) => {
  const { reputations, badges, userBadges, awardReputationPoints, showToast } = useApp();

  // Search & Role filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Multi-user list (combines seeded members & admins for auditing and editing)
  const [usersList, setUsersList] = useState<UserProfile[]>([
    {
      id: 'user-default-admin',
      name: 'Satyajit Ray',
      email: 'satyajit.admin@puriwelfare.org',
      phone: '+91 6752 220101',
      role: 'admin',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      bio: 'Welfare admin & board coordinator of Puri Welfare Association.',
      location: 'Grand Road Secretariat, Puri',
      created_at: '2026-01-10T10:00:00Z',
      notifications_enabled: true,
      theme: 'light'
    },
    {
      id: 'user-default-vet',
      name: 'Dr. Arnab Das',
      email: 'arnab.das.vet@gmail.com',
      phone: '+91 9437001122',
      role: 'member', // Treated as member, acting role veterinarian/moderator
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      bio: 'Lead street-trauma specialist & volunteer wildlife surgeon.',
      location: 'VIP Road Veterinary Hospital, Puri',
      created_at: '2026-02-15T09:30:00Z',
      notifications_enabled: true,
      theme: 'light'
    },
    {
      id: 'user-default-1',
      name: 'Animesh Kar',
      email: 'animesh@outlook.com',
      phone: '+91 8877112233',
      role: 'member',
      avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Animesh',
      bio: 'Coastal guard volunteer and sand dune restorative.',
      location: 'Chakra Tirtha Road, Puri',
      created_at: '2026-04-12T14:22:00Z',
      notifications_enabled: true,
      theme: 'light'
    }
  ]);

  // Selected user for advanced configuration modal
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Warning tracking
  const [warnings, setWarnings] = useState<Record<string, number>>({
    'user-default-1': 0,
    'user-default-vet': 0,
    'user-default-admin': 0
  });

  // Reputation points lookup
  const getUserReputation = (userId: string) => {
    return reputations.find(r => r.user_id === userId)?.points || 0;
  };

  // Filters logic
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase()) || 
                          u.location.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Action handlers
  const handleRoleChange = (userId: string, newRole: RbacRole) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        onAddAuditLog('Update User Role', u.name, u.role, newRole);
        return { ...u, role: newRole as any };
      }
      return u;
    }));
    showToast(`Assigned role ${newRole.toUpperCase()} successfully.`, 'success');
  };

  const handleIssueWarning = (userId: string) => {
    const current = warnings[userId] || 0;
    const next = current + 1;
    setWarnings({ ...warnings, [userId]: next });
    
    const user = usersList.find(u => u.id === userId);
    if (user) {
      onAddAuditLog('Issue Official Warning', user.name, `${current} warnings`, `${next} warnings`);
    }

    if (next >= 3) {
      showToast(`Warning issued! ${user?.name} has reached 3 warnings. Flagged for suspension.`, 'error');
    } else {
      showToast(`Warning issued to ${user?.name}. (${next}/3 warnings)`, 'info');
    }
  };

  const handleResetPasswordSim = (username: string) => {
    showToast(`Password reset link generated and queued for ${username}.`, 'success');
    onAddAuditLog('Password Reset Dispatched', username);
  };

  const handleAwardRepPoints = (userId: string, points: number) => {
    awardReputationPoints(userId, points);
    showToast(`Awarded ${points} reputation points. Leaderboard synchronizing...`, 'success');
    onAddAuditLog('Award Reputation Points', `User ID ${userId}`, '0', `+${points}`);
  };

  return (
    <div className="space-y-4" id="user-management-panel">
      {/* Advanced search and filters */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-grow w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search users by name, email, biography, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none w-full md:w-auto"
        >
          <option value="all">All Roles</option>
          <option value="admin">Administrators</option>
          <option value="member">Registered Users</option>
          <option value="volunteer">Volunteers</option>
          <option value="moderator">Moderators</option>
        </select>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-mono uppercase tracking-wider">
                <th className="p-4">User Details</th>
                <th className="p-4">Location Zone</th>
                <th className="p-4">Assigned Role</th>
                <th className="p-4">Reputation</th>
                <th className="p-4">Policy Warnings</th>
                <th className="p-4 text-right">RBAC Adjuster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
              {filteredUsers.map(user => {
                const warnCount = warnings[user.id] || 0;
                return (
                  <tr key={user.id} className="hover:bg-gray-50/30 dark:hover:bg-slate-800/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={user.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg'} 
                          alt={user.name} 
                          className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-emerald/10"
                        />
                        <div>
                          <h4 className="font-semibold text-gray-950 dark:text-white leading-tight">{user.name}</h4>
                          <span className="text-[10px] text-gray-400 font-mono">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 dark:text-slate-300 font-medium">
                      {user.location}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border uppercase ${
                        user.role === 'admin' 
                          ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' 
                          : 'text-blue-500 bg-blue-500/10 border-blue-500/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-brand-emerald font-mono">
                      {getUserReputation(user.id)} pts
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 font-bold font-mono ${
                        warnCount > 0 ? 'text-rose-500 animate-pulse' : 'text-gray-400'
                      }`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {warnCount}/3 Warnings
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value as RbacRole)}
                          className="p-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg text-[10px] focus:outline-none text-gray-700 dark:text-slate-300"
                        >
                          <option value="visitor">Visitor</option>
                          <option value="registered_user">Registered User</option>
                          <option value="volunteer">Volunteer</option>
                          <option value="moderator">Moderator</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-1 bg-gray-100 hover:bg-brand-emerald/10 dark:bg-slate-800 dark:hover:bg-brand-emerald/10 text-gray-500 hover:text-brand-emerald rounded-lg transition-all"
                          title="Open RBAC Action Center"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Advanced User Modification Dialog */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingUser(null)}
              className="absolute inset-0 bg-slate-950"
            />
            
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-slate-850">
                <div className="flex items-center gap-2">
                  <img src={editingUser.avatar_url} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <span className="font-mono text-[9px] text-gray-400">USER PROFILE ACTIONS</span>
                    <h4 className="font-display font-bold text-sm text-gray-950 dark:text-white">{editingUser.name}</h4>
                  </div>
                </div>
                <button onClick={() => setEditingUser(null)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bio & Details display */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Profile Bio:</span>
                <p className="text-gray-600 dark:text-slate-300 italic">"{editingUser.bio || 'No bio listed'}"</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-slate-850 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block font-mono">REGISTRATION:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{new Date(editingUser.created_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono">PHONE CONTACT:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">{editingUser.phone}</span>
                </div>
              </div>

              {/* Operations buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-850">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAwardRepPoints(editingUser.id, 25)}
                    className="flex-1 py-1.5 bg-brand-emerald/10 hover:bg-brand-emerald/20 text-brand-emerald rounded-lg font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    +25 Rep
                  </button>
                  <button
                    onClick={() => handleIssueWarning(editingUser.id)}
                    className="flex-1 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-lg font-bold transition-all flex items-center justify-center gap-1 border border-rose-500/10"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Issue Warn
                  </button>
                </div>

                <button
                  onClick={() => handleResetPasswordSim(editingUser.name)}
                  className="w-full py-1.5 bg-gray-150 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-200 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 border"
                >
                  <Key className="w-3.5 h-3.5" />
                  Reset Password / Force Sync
                </button>
              </div>

              <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-center justify-between text-[11px]">
                <span className="text-rose-600 font-semibold">Account Block status</span>
                <button
                  onClick={() => {
                    onAddAuditLog('Ban Account Permanent', editingUser.name);
                    showToast(`Banned user profile permanently. Account frozen.`, 'success');
                    setEditingUser(null);
                  }}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold transition-all flex items-center gap-1"
                >
                  <UserX className="w-3.5 h-3.5" />
                  Ban
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
