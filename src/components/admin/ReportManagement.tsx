/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  Clock, 
  User, 
  CheckCircle2, 
  Trash2, 
  FileCheck, 
  X, 
  ExternalLink, 
  Download, 
  FileText, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Eye,
  FileDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimalReport, ReportStatus, ReportCategory, AnimalType } from '../../types';

interface ReportManagementProps {
  onAddAuditLog: (action: string, affected: string, prev?: string, next?: string) => void;
  actingRole: string;
}

export const ReportManagement: React.FC<ReportManagementProps> = ({ onAddAuditLog, actingRole }) => {
  const { reports, updateReportStatus, showToast } = useApp();

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Bulk selections
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  
  // Drawer / Details active report
  const [activeReport, setActiveReport] = useState<AnimalReport | null>(null);
  
  // Detail editing states
  const [internalNotes, setInternalNotes] = useState<Record<string, string>>({
    'rep-1': 'Awaiting mobile vet response. Local vendor Hari Sahu is guarding her.',
    'rep-2': 'Entanglement cleared. Released seagull with minor tail feather trim.',
    'rep-3': 'Puppies placed at Municipal Shelter temporary nursery. Feeding scheduled.'
  });
  const [currentNoteText, setCurrentNoteText] = useState('');
  
  const [assignedRanger, setAssignedRanger] = useState<Record<string, string>>({
    'rep-1': 'Ranger Dipti Ranjan',
    'rep-2': 'Ranger Balaram Senapati',
    'rep-3': 'Volunteer Pooja Patnaik'
  });
  const [rangerInput, setRangerInput] = useState('');

  // Status Change Dialog inside drawer
  const [updatingStatus, setUpdatingStatus] = useState<ReportStatus>('submitted');
  const [statusChangeNote, setStatusChangeNote] = useState('');

  // Bulk actions handlers
  const handleToggleSelectAll = () => {
    if (selectedReportIds.length === filteredReports.length) {
      setSelectedReportIds([]);
    } else {
      setSelectedReportIds(filteredReports.map(r => r.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedReportIds.includes(id)) {
      setSelectedReportIds(selectedReportIds.filter(x => x !== id));
    } else {
      setSelectedReportIds([...selectedReportIds, id]);
    }
  };

  const handleBulkStatusUpdate = (status: ReportStatus) => {
    if (selectedReportIds.length === 0) return;
    selectedReportIds.forEach(id => {
      updateReportStatus(id, status, `Bulk status change to ${status}`);
    });
    onAddAuditLog('Bulk Status Update', `${selectedReportIds.length} Reports`, 'various', status);
    showToast(`Bulk updated ${selectedReportIds.length} reports to ${status.toUpperCase()}`, 'success');
    setSelectedReportIds([]);
  };

  // Export Simulations
  const handleExport = (format: 'csv' | 'pdf' | 'excel') => {
    showToast(`Compiled report ledger. Downloading Animal_Rescue_Audit.${format}...`, 'success');
    onAddAuditLog('Export Ledger', `Report database exported as ${format.toUpperCase()}`);
  };

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.location.toLowerCase().includes(search.toLowerCase()) || 
                          r.reporter_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesSeverity && matchesCategory;
  });

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'medium': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'submitted': return 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200 border-gray-200 dark:border-slate-700';
      case 'dispatched': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/40';
      case 'in_treatment': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/40';
      case 'resolved': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4" id="report-management-panel">
      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/30 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by title, location, reporter, or landmark..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-emerald"
            />
          </div>

          {/* Export utilities */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              title="Export as CSV Ledger"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              title="Export as Excel Ledger"
            >
              <FileDown className="w-3.5 h-3.5" />
              XLSX
            </button>
            <button 
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              title="Print PDF Audit Digest"
            >
              <FileText className="w-3.5 h-3.5" />
              PDF Audit
            </button>
          </div>
        </div>

        {/* Filters Select Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-emerald"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="dispatched">Dispatched</option>
              <option value="in_treatment">In Treatment</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-emerald"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical Urgent</option>
              <option value="high">High priority</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-white dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-emerald"
            >
              <option value="all">All Categories</option>
              <option value="injured_animal">Injured Stray Trauma</option>
              <option value="stray_rescue">Stray Rescue / Orphaned</option>
              <option value="abuse_alert">Abuse / Cruelty Warning</option>
              <option value="wildlife_sighting">Wildlife Sighting</option>
              <option value="beach_cleanup">Beach Cleanup / Plastics</option>
            </select>
          </div>

          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSeverityFilter('all');
                setCategoryFilter('all');
              }}
              className="w-full p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors font-semibold"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk actions bar (if selections exist) */}
      <AnimatePresence>
        {selectedReportIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs"
            id="bulk-actions-banner"
          >
            <div className="flex items-center gap-2 text-brand-emerald font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedReportIds.length} Rescue alerts selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkStatusUpdate('dispatched')}
                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
              >
                Dispatch Ranger
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('in_treatment')}
                className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all"
              >
                Mark In Treatment
              </button>
              <button 
                onClick={() => handleBulkStatusUpdate('resolved')}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-all"
              >
                Mark Resolved
              </button>
              <button 
                onClick={() => {
                  setSelectedReportIds([]);
                  showToast('Selections cleared.', 'info');
                }}
                className="px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Reports Ledger Table */}
      <div className="rounded-2xl border border-gray-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800 text-gray-500 font-mono uppercase tracking-wider">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox"
                    checked={filteredReports.length > 0 && selectedReportIds.length === filteredReports.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald"
                  />
                </th>
                <th className="p-4">Report Details</th>
                <th className="p-4">Incident Area</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-850">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-gray-400 dark:text-slate-400">
                    No matching reports found inside the welfare database.
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => {
                  const isChecked = selectedReportIds.includes(report.id);
                  return (
                    <tr 
                      key={report.id}
                      className={`hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors ${
                        isChecked ? 'bg-brand-emerald/5 dark:bg-brand-emerald/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectOne(report.id)}
                          className="rounded border-gray-300 text-brand-emerald focus:ring-brand-emerald"
                        />
                      </td>
                      <td className="p-4 max-w-sm">
                        <div className="flex items-start gap-2.5">
                          {report.images && report.images.length > 0 && (
                            <img 
                              src={report.images[0]} 
                              alt="Thumbnail" 
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200/50 flex-shrink-0"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white leading-tight hover:underline cursor-pointer" onClick={() => {
                              setActiveReport(report);
                              setUpdatingStatus(report.status);
                            }}>
                              {report.title}
                            </h4>
                            <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                              <User className="w-3 h-3" /> Reported by {report.reporter_name} &bull; <Clock className="w-3 h-3" /> {new Date(report.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-slate-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{report.location}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityColor(report.severity)}`}>
                          {report.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(report.status)}`}>
                          {report.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => {
                            setActiveReport(report);
                            setUpdatingStatus(report.status);
                          }}
                          className="p-1.5 bg-gray-100 hover:bg-brand-emerald/10 dark:bg-slate-800 dark:hover:bg-brand-emerald/10 text-gray-500 hover:text-brand-emerald rounded-lg transition-colors inline-flex items-center gap-1 font-semibold"
                          title="Open Operational Drawer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Operational Drawer */}
      <AnimatePresence>
        {activeReport && (
          <>
            {/* Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReport(null)}
              className="fixed inset-0 bg-slate-950 z-40"
            />

            {/* Slide drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 border-l border-gray-200 dark:border-slate-800 flex flex-col justify-between"
              id="active-report-drawer"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-gray-400">ALERT CASE #{activeReport.id}</span>
                  <h3 className="font-display font-semibold text-sm text-gray-900 dark:text-white truncate max-w-xs">{activeReport.title}</h3>
                </div>
                <button 
                  onClick={() => setActiveReport(null)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-850 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 flex-grow overflow-y-auto space-y-5 text-xs">
                {/* Images gallery preview */}
                {activeReport.images && activeReport.images.length > 0 && (
                  <div className="relative group">
                    <img 
                      src={activeReport.images[0]} 
                      alt="Full alert view" 
                      className="w-full h-44 rounded-xl object-cover border border-gray-200/50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-mono text-[10px] flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> Inspect original photo
                      </span>
                    </div>
                  </div>
                )}

                {/* Info Block */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-gray-50 dark:bg-slate-800/40 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div>
                    <span className="text-gray-400 font-mono block">REPORTER</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200">{activeReport.reporter_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 font-mono block">ANIMAL TYPE</span>
                    <span className="font-bold text-gray-800 dark:text-slate-200 uppercase">{activeReport.animal_type}</span>
                  </div>
                  <div className="col-span-2 mt-2 border-t border-gray-200/10 pt-2">
                    <span className="text-gray-400 font-mono block">INCIDENT AREA</span>
                    <span className="text-gray-800 dark:text-slate-200 leading-relaxed font-semibold flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 text-brand-emerald flex-shrink-0" />
                      {activeReport.location}
                    </span>
                  </div>
                </div>

                {/* Original Description */}
                <div className="space-y-1">
                  <h4 className="font-mono text-gray-400">ALERT WITNESS ACCOUNT</h4>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-850 p-2.5 rounded-xl">
                    "{activeReport.description}"
                  </p>
                </div>

                {/* Dispatch Assignee */}
                <div className="space-y-1.5">
                  <h4 className="font-mono text-gray-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    ASSIGNED FIELD OPERATOR
                  </h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder={assignedRanger[activeReport.id] || "No dispatcher assigned yet"}
                      value={rangerInput}
                      onChange={e => setRangerInput(e.target.value)}
                      className="flex-grow p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
                    />
                    <button 
                      onClick={() => {
                        if (!rangerInput) return;
                        setAssignedRanger({ ...assignedRanger, [activeReport.id]: rangerInput });
                        onAddAuditLog('Assign field operator', `Assign ${rangerInput} to ${activeReport.id}`);
                        showToast(`Ranger assigned successfully.`, 'success');
                        setRangerInput('');
                      }}
                      className="px-3 bg-brand-emerald text-white rounded-xl font-semibold hover:bg-brand-teal transition-all text-xs"
                    >
                      Assign
                    </button>
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="space-y-1.5">
                  <h4 className="font-mono text-gray-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    INTERNAL NGO LOGS
                  </h4>
                  <p className="text-xs bg-brand-blue/5 border border-brand-blue/10 p-2 rounded-lg text-brand-blue">
                    {internalNotes[activeReport.id] || 'No operational notes listed yet.'}
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Append internal logs memo..."
                      value={currentNoteText}
                      onChange={e => setCurrentNoteText(e.target.value)}
                      className="flex-grow p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl focus:outline-none text-xs"
                    />
                    <button 
                      onClick={() => {
                        if (!currentNoteText) return;
                        const prevNote = internalNotes[activeReport.id] || '';
                        setInternalNotes({ ...internalNotes, [activeReport.id]: prevNote + ' ' + currentNoteText });
                        onAddAuditLog('Add Incident Notes', `Notes added for ${activeReport.id}`);
                        showToast(`Operational notes appended.`, 'success');
                        setCurrentNoteText('');
                      }}
                      className="px-3 bg-gray-150 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl font-semibold hover:bg-gray-100 transition-all text-xs"
                    >
                      Append
                    </button>
                  </div>
                </div>

                {/* Status Updater */}
                <div className="space-y-2 border-t border-gray-200/10 pt-3">
                  <h4 className="font-mono text-gray-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    DISPATCH & TREATMENT STATUS
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {(['submitted', 'dispatched', 'in_treatment', 'resolved'] as ReportStatus[]).map(st => (
                      <button
                        key={st}
                        onClick={() => setUpdatingStatus(st)}
                        className={`p-2 rounded-xl border text-center transition-all ${
                          updatingStatus === st 
                            ? 'bg-brand-emerald text-white border-brand-emerald font-bold' 
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {st.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <label className="text-[10px] font-mono text-gray-400 block uppercase">Public Resolution Comment</label>
                    <textarea
                      placeholder="Detail veterinary results or dispatch conclusions (this is shared publicly for transparency)..."
                      value={statusChangeNote}
                      onChange={e => setStatusChangeNote(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-emerald"
                    />
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900 flex gap-2">
                <button
                  onClick={() => {
                    updateReportStatus(activeReport.id, updatingStatus, statusChangeNote || 'Status changed from admin panel');
                    onAddAuditLog('Report Status Update', activeReport.id, activeReport.status, updatingStatus);
                    showToast(`Alert status updated to ${updatingStatus.toUpperCase()}`, 'success');
                    setActiveReport(null);
                  }}
                  className="flex-grow py-2.5 bg-brand-emerald text-white rounded-xl font-bold hover:bg-brand-teal transition-all text-xs"
                >
                  Apply Status Change
                </button>
                <button
                  onClick={() => setActiveReport(null)}
                  className="py-2.5 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
