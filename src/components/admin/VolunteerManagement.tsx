/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Check, 
  X, 
  Compass, 
  Clock, 
  Star, 
  Plus, 
  Award, 
  Heart, 
  Trash2, 
  CheckCircle2, 
  ListTodo,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { VolunteerApplication } from './adminTypes';

interface VolunteerManagementProps {
  volunteers: VolunteerApplication[];
  onUpdateVolunteers: (volunteers: VolunteerApplication[]) => void;
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  actingRole: string;
}

export const VolunteerManagement: React.FC<VolunteerManagementProps> = ({ 
  volunteers, 
  onUpdateVolunteers, 
  onAddAuditLog,
  showToast,
  actingRole 
}) => {
  // Tabs: "pending" vs "roster"
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'roster'>('pending');

  // Input state for assigning task
  const [taskInput, setTaskInput] = useState('');
  const [activeAssigneeId, setActiveAssigneeId] = useState<string | null>(null);

  // Filter lists
  const pendingApps = volunteers.filter(v => v.status === 'pending');
  const activeRoster = volunteers.filter(v => v.status === 'approved');

  // Action: Approve Volunteer
  const handleApprove = (id: string) => {
    const updated = volunteers.map(v => {
      if (v.id === id) {
        onAddAuditLog('Approve Volunteer Application', v.name, 'pending', 'approved');
        return { ...v, status: 'approved' as const, badges: ['Volunteer'] };
      }
      return v;
    });
    onUpdateVolunteers(updated);
    showToast('Volunteer application approved. Roster synced.', 'success');
  };

  // Action: Reject Volunteer
  const handleReject = (id: string) => {
    const updated = volunteers.map(v => {
      if (v.id === id) {
        onAddAuditLog('Reject Volunteer Application', v.name, 'pending', 'rejected');
        return { ...v, status: 'rejected' as const };
      }
      return v;
    });
    onUpdateVolunteers(updated);
    showToast('Application declined.', 'info');
  };

  // Action: Assign Task
  const handleAssignTask = (id: string) => {
    if (!taskInput) return;
    const updated = volunteers.map(v => {
      if (v.id === id) {
        const currentTasks = v.assignedTasks || [];
        onAddAuditLog('Assign Volunteer Task', v.name, `${currentTasks.length} tasks`, `${currentTasks.length + 1} tasks`);
        return { 
          ...v, 
          assignedTasks: [...currentTasks, taskInput] 
        };
      }
      return v;
    });
    onUpdateVolunteers(updated);
    showToast(`Task assigned successfully.`, 'success');
    setTaskInput('');
    setActiveAssigneeId(null);
  };

  // Action: Complete Task
  const handleCompleteTask = (volId: string, taskIndex: number) => {
    const updated = volunteers.map(v => {
      if (v.id === volId) {
        const tasks = [...(v.assignedTasks || [])];
        tasks.splice(taskIndex, 1);
        const nextScore = Math.min(100, (v.performanceScore || 85) + 2);
        onAddAuditLog('Complete Volunteer Task', v.name, `${v.completedTasksCount} completed`, `${v.completedTasksCount + 1} completed`);
        return { 
          ...v, 
          assignedTasks: tasks,
          completedTasksCount: v.completedTasksCount + 1,
          performanceScore: nextScore
        };
      }
      return v;
    });
    onUpdateVolunteers(updated);
    showToast('Task marked completed. Performance score improved!', 'success');
  };

  // Action: Award Badge
  const handleAwardBadge = (volId: string, badgeName: string) => {
    const updated = volunteers.map(v => {
      if (v.id === volId) {
        if (v.badges.includes(badgeName)) return v;
        onAddAuditLog('Award Volunteer Badge', v.name, 'none', badgeName);
        return { 
          ...v, 
          badges: [...v.badges, badgeName] 
        };
      }
      return v;
    });
    onUpdateVolunteers(updated);
    showToast(`Awarded ${badgeName} badge to volunteer!`, 'success');
  };

  return (
    <div className="space-y-4" id="volunteer-management-panel">
      {/* Sub tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            activeSubTab === 'pending' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending Applications ({pendingApps.length})
        </button>
        <button
          onClick={() => setActiveSubTab('roster')}
          className={`px-4 py-2 font-semibold border-b-2 transition-colors relative flex items-center gap-1.5 ${
            activeSubTab === 'roster' 
              ? 'border-brand-emerald text-brand-emerald font-bold' 
              : 'border-transparent text-gray-500 hover:text-gray-950'
          }`}
        >
          <Users className="w-3.5 h-3.5 animate-pulse" />
          Active Roster &amp; Dispatch ({activeRoster.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeSubTab === 'pending' ? (
          /* Pending Applications list */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApps.length === 0 ? (
              <div className="col-span-2 text-center text-xs text-gray-400 dark:text-slate-400 py-12 border border-dashed rounded-2xl">
                No new volunteer applications waiting inside the pending registry.
              </div>
            ) : (
              pendingApps.map(app => (
                <div key={app.id} className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/40 p-4 space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-950 dark:text-white text-sm leading-tight">{app.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono block">{app.email} &bull; {app.phone}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-500 font-mono text-[9px] uppercase">
                      Category: {app.interestCategory}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-400 uppercase">Applicant Skills &amp; Credentials:</span>
                    <div className="flex flex-wrap gap-1">
                      {app.skills.map(skill => (
                        <span key={skill} className="px-1.5 py-0.5 bg-brand-emerald/5 text-brand-emerald border border-brand-emerald/10 font-medium text-[9px] rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-slate-850">
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="flex-grow py-1.5 bg-brand-emerald text-white rounded-lg text-xs font-semibold hover:bg-brand-teal transition-all flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Approve &amp; Register
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="px-3 py-1.5 bg-rose-50/10 hover:bg-rose-50/20 text-rose-600 rounded-lg text-xs font-semibold transition-all border border-rose-200/10"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Active Volunteer Roster view with task dispatcher and performance tracking */
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeRoster.map(vol => (
                <div key={vol.id} className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 p-5 shadow-sm space-y-4">
                  {/* Name Header and score */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-950 dark:text-white text-sm">{vol.name}</h4>
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">{vol.email} &bull; Sector: {vol.interestCategory.toUpperCase()}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-brand-emerald font-mono">{vol.performanceScore || 85}% Score</span>
                      <p className="text-[9px] text-gray-400 font-mono">{vol.completedTasksCount} shifts completed</p>
                    </div>
                  </div>

                  {/* Badges / Rewards */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-gray-400 uppercase block">Recognition Badges:</span>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {vol.badges.length === 0 ? (
                        <span className="text-[10px] text-gray-400">No active badges awarded.</span>
                      ) : (
                        vol.badges.map(b => (
                          <span key={b} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/15 rounded text-[9px] font-bold font-mono">
                            <Award className="w-3 h-3" />
                            {b}
                          </span>
                        ))
                      )}

                      {/* Add badge awards dropdown inline */}
                      <select
                        onChange={e => {
                          if (e.target.value) {
                            handleAwardBadge(vol.id, e.target.value);
                            e.target.value = ''; // reset selection
                          }
                        }}
                        className="p-1 bg-gray-100 dark:bg-slate-800 text-[9px] font-bold text-gray-500 rounded border border-transparent focus:outline-none"
                      >
                        <option value="">+ Award Badge</option>
                        <option value="Coastal Guardian">Coastal Guardian</option>
                        <option value="Holy Cow Sponsor">Holy Cow Sponsor</option>
                        <option value="Nature Protector">Nature Protector</option>
                        <option value="Community Hero">Community Hero</option>
                      </select>
                    </div>
                  </div>

                  {/* Active tasks dispatcher */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-slate-850 pt-3">
                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                      <span className="uppercase flex items-center gap-1"><ListTodo className="w-3.5 h-3.5" /> Active Field Tasks:</span>
                      <button
                        onClick={() => setActiveAssigneeId(activeAssigneeId === vol.id ? null : vol.id)}
                        className="text-brand-emerald font-semibold hover:underline"
                      >
                        {activeAssigneeId === vol.id ? 'Cancel' : '+ New Task'}
                      </button>
                    </div>

                    <AnimatePresence>
                      {activeAssigneeId === vol.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <input 
                            type="text" 
                            placeholder="Describe shift or task details..."
                            value={taskInput}
                            onChange={e => setTaskInput(e.target.value)}
                            className="flex-grow p-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                          />
                          <button
                            onClick={() => handleAssignTask(vol.id)}
                            className="px-3 bg-brand-emerald text-white text-xs font-bold rounded-lg hover:bg-brand-teal transition-all"
                          >
                            Dispatch
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Task list list */}
                    <div className="space-y-1.5">
                      {!vol.assignedTasks || vol.assignedTasks.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic">No current assignments. Dispatcher is idle.</p>
                      ) : (
                        vol.assignedTasks.map((task, idx) => (
                          <div key={idx} className="p-2 border border-brand-emerald/10 bg-brand-emerald/[0.01] rounded-lg flex items-center justify-between gap-2 text-xs">
                            <span className="text-gray-700 dark:text-slate-300 font-medium">{task}</span>
                            <button
                              onClick={() => handleCompleteTask(vol.id, idx)}
                              className="p-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded transition-colors"
                              title="Mark Task Completed"
                            >
                              <Check className="w-3.5 h-3.5 font-bold" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
