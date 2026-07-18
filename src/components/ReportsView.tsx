/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  User, 
  Clock, 
  Wrench,
  CheckCircle2,
  FileCheck2,
  ListFilter,
  Camera,
  Upload,
  X,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  Share2,
  Send,
  MessageSquare,
  Check,
  FileText,
  Info,
  HelpCircle,
  Activity,
  Globe,
  Phone,
  Mail,
  ExternalLink,
  Sliders,
  Award,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AnimalReport, ReportCategory, AnimalType, ReportStatus } from '../types';

// Puri Famous Regions for Area / Landmark dropdown
const PURI_AREAS = [
  'Swargadwar Beach',
  'Jagannath Temple Entrance (Grand Road)',
  'Puri Beach (near Lighthouse)',
  'Swargadwar Road',
  'Puri Railway Station',
  'Swargadwar Municipal Ward 4',
  'Chilika Estuary Coast',
  'Swargadwar Sands (Golden Beach)',
  'Chakra Tirtha Road',
  'Other (describe in details)'
];

// Pre-configured high quality Unsplash images to easily test reports with real visual anchors
const QUICK_PHOTOS = [
  { label: 'Injured Sea Gull', url: 'https://images.unsplash.com/photo-1445262102387-5febb22245d9?auto=format&fit=crop&q=80&w=600' },
  { label: 'Injured Street Cow', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=600' },
  { label: 'Beach Plastic Hazard', url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600' },
  { label: 'Stray Puppy Rescue', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600' }
];

interface Comment {
  id: string;
  author: string;
  role: string;
  text: string;
  date: string;
  isPrivate?: boolean;
}

export const ReportsView: React.FC<{ setTab?: (tab: string) => void }> = ({ setTab }) => {
  const { reports, updateReportStatus, submitReport, currentUser, showToast } = useApp();
  
  // Public Feed UI states
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Pagination & Infinite scroll
  const [visibleCount, setVisibleCount] = useState(6);
  const [isInfiniteScrolling, setIsInfiniteScrolling] = useState(false);

  // Active Detail modal
  const [selectedReport, setSelectedReport] = useState<AnimalReport | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Discussion / Comments state
  const [localComments, setLocalComments] = useState<Record<string, Comment[]>>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [commentIsPrivate, setCommentIsPrivate] = useState(false);

  // Dispatch tools
  const [statusNotes, setStatusNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState<ReportStatus>('submitted');
  const [resolutionImage, setResolutionImage] = useState('');
  const [enableDispatcherMode, setEnableDispatcherMode] = useState(false);

  // Wizard Overlay States
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Wizard Form Fields
  const [formCategory, setFormCategory] = useState<ReportCategory>('dog_welfare');
  const [formAnimalType, setFormAnimalType] = useState<AnimalType>('dog');
  const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formArea, setFormArea] = useState(PURI_AREAS[0]);
  const [formCustomArea, setFormCustomArea] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [formContactPreference, setFormContactPreference] = useState<'phone' | 'email' | 'hidden'>('phone');
  const [formTermsCertified, setFormTermsCertified] = useState(false);
  
  // Image Upload Simulation UI states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStageText, setUploadStageText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success screen
  const [isSuccess, setIsSuccess] = useState(false);
  const [successReportId, setSuccessReportId] = useState('');

  // Local storage keys
  const DRAFT_STORAGE_KEY = 'panw_welfare_report_draft';
  const COMMENTS_STORAGE_KEY = 'panw_welfare_report_comments';

  // Restore draft state on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormCategory(parsed.category || 'dog_welfare');
        setFormAnimalType(parsed.animalType || 'dog');
        setFormSeverity(parsed.severity || 'medium');
        setFormTitle(parsed.title || '');
        setFormDescription(parsed.description || '');
        setFormArea(parsed.area || PURI_AREAS[0]);
        setFormCustomArea(parsed.customArea || '');
        setFormImages(parsed.images || []);
        setFormContactPreference(parsed.contactPreference || 'phone');
        
        // If there's real content, we can nudge the user gently
        if (parsed.title || parsed.description) {
          showToast('Restored your draft. You can continue writing.', 'info');
        }
      } catch (e) {
        console.error('Error parsing draft from localStorage', e);
      }
    }

    // Load persisted comments
    const savedComments = localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (savedComments) {
      try {
        setLocalComments(JSON.parse(savedComments));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed default comments for existing reports
      const seedComments: Record<string, Comment[]> = {
        'rep-1': [
          {
            id: 'c1',
            author: 'Dr. Arnab Das (Lead Vet)',
            role: 'veterinarian',
            text: 'I have reviewed the limb laceration. Patrolling ambulance is heading out from Swargadwar now.',
            date: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'c2',
            author: 'Satyajit Ray (Welfare Admin)',
            role: 'admin',
            text: 'Balaram team has confirmed placement in Swargadwar holding facility. Splint applied successfully.',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        'rep-2': [
          {
            id: 'c3',
            author: 'Ranger Dipti Ranjan',
            role: 'rescuer',
            text: 'Coastal rescue team notified. Netting cleared from the seagull. Released back safely!',
            date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      setLocalComments(seedComments);
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(seedComments));
    }
  }, []);

  // Autosave draft on form changes
  useEffect(() => {
    if (isWizardOpen && !isSuccess) {
      const draft = {
        category: formCategory,
        animalType: formAnimalType,
        severity: formSeverity,
        title: formTitle,
        description: formDescription,
        area: formArea,
        customArea: formCustomArea,
        images: formImages,
        contactPreference: formContactPreference
      };
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    }
  }, [
    isWizardOpen,
    formCategory,
    formAnimalType,
    formSeverity,
    formTitle,
    formDescription,
    formArea,
    formCustomArea,
    formImages,
    formContactPreference,
    isSuccess
  ]);

  // Handle page scrolling simulations for infinite scroll
  const handleLoadMore = () => {
    setIsInfiniteScrolling(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + 6);
      setIsInfiniteScrolling(false);
    }, 800);
  };

  // Drag and drop photo logic
  const handleDragOver = (e: React.DragOverEvent) => {
    e.preventDefault();
  };

  const simulateImageUpload = (fileName: string) => {
    if (formImages.length >= 5) {
      showToast('Maximum of 5 images allowed.', 'error');
      return;
    }
    setIsUploading(true);
    setUploadProgress(0);
    setUploadStageText('Reading image metadata...');

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Randomly assign one high-quality animal/nature image as mock
            const randomPick = QUICK_PHOTOS[Math.floor(Math.random() * QUICK_PHOTOS.length)].url;
            setFormImages(old => [...old, randomPick]);
            setIsUploading(false);
            showToast(`"${fileName}" uploaded and compressed successfully by 74%!`, 'success');
          }, 300);
          return 100;
        }

        if (prev === 25) setUploadStageText('Compressing high-resolution pixels...');
        if (prev === 55) setUploadStageText('Optimizing metadata headers...');
        if (prev === 80) setUploadStageText('Generating preview buffers...');
        
        return prev + 5;
      });
    }, 45);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      simulateImageUpload(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      simulateImageUpload(e.target.files[0].name);
    }
  };

  // Reordering images
  const moveImage = (index: number, direction: 'left' | 'right') => {
    const updated = [...formImages];
    if (direction === 'left' && index > 0) {
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
    } else if (direction === 'right' && index < updated.length - 1) {
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
    }
    setFormImages(updated);
  };

  const removeImage = (index: number) => {
    setFormImages(old => old.filter((_, i) => i !== index));
  };

  // Comment submit logic
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedReport) return;

    const newComment: Comment = {
      id: `c-${Date.now()}`,
      author: currentUser?.name || 'Anonymous Guardian',
      role: currentUser?.role || 'member',
      text: newCommentText,
      date: new Date().toISOString(),
      isPrivate: commentIsPrivate
    };

    const updatedCommentsForReport = [...(localComments[selectedReport.id] || []), newComment];
    const updatedAllComments = {
      ...localComments,
      [selectedReport.id]: updatedCommentsForReport
    };

    setLocalComments(updatedAllComments);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedAllComments));
    setNewCommentText('');
    showToast('Your comment was added to the emergency logs.', 'success');
  };

  // Submitting the Wizard report
  const handleWizardSubmit = async () => {
    if (!formTermsCertified) {
      showToast('Please certify that you have witnessed this incident.', 'error');
      return;
    }

    const finalLocation = formArea === 'Other (describe in details)' 
      ? formCustomArea || 'Puri, Odisha'
      : formArea;

    const imagesToSubmit = formImages.length > 0 ? formImages : [QUICK_PHOTOS[1].url];

    const success = await submitReport(
      formTitle,
      formDescription,
      formCategory,
      formCategory === 'dog_welfare' ? 'dog' : formCategory === 'cow_welfare' ? 'cow' : 'none',
      formSeverity,
      finalLocation,
      imagesToSubmit
    );

    if (success) {
      // Clear draft
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      
      // Get the newly created report ID (it will be the first one in list due to context prepend)
      const generatedId = `PANW-${Math.floor(10000 + Math.random() * 90000)}`;
      setSuccessReportId(generatedId);
      setIsSuccess(true);
    } else {
      showToast('Could not submit. Make sure you are signed in.', 'error');
    }
  };

  // Handle exits
  const handleCloseWizardRequest = () => {
    // If they have filled some details, ask for exit confirmation
    if (formTitle.trim() || formDescription.trim() || formImages.length > 0) {
      setShowExitConfirm(true);
    } else {
      setIsWizardOpen(false);
      resetWizardForm();
    }
  };

  const resetWizardForm = () => {
    setWizardStep(1);
    setFormTitle('');
    setFormDescription('');
    setFormImages([]);
    setFormTermsCertified(false);
    setIsSuccess(false);
    setShowExitConfirm(false);
  };

  // Status modifier
  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    
    await updateReportStatus(selectedReport.id, updatingStatus, statusNotes || `Rescue status updated by local coordinator.`);
    
    // Add an audit comment dynamically
    const auditComment: Comment = {
      id: `audit-${Date.now()}`,
      author: currentUser?.name || 'Dispatcher Team',
      role: 'admin',
      text: `Status updated to ${updatingStatus.toUpperCase()}. Note: ${statusNotes || 'Ambulance logs synchronized.'}`,
      date: new Date().toISOString()
    };

    const updatedCommentsForReport = [...(localComments[selectedReport.id] || []), auditComment];
    const updatedAllComments = {
      ...localComments,
      [selectedReport.id]: updatedCommentsForReport
    };

    setLocalComments(updatedAllComments);
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(updatedAllComments));

    setSelectedReport(prev => prev ? { ...prev, status: updatingStatus } : null);
    setStatusNotes('');
    showToast(`Status updated successfully!`, 'success');
  };

  // Social sharing logic helper
  const getShareLink = (platform: 'whatsapp' | 'facebook' | 'x', report: AnimalReport) => {
    const text = encodeURIComponent(`🚨 Puri Animal Rescue Alert: ${report.title} in ${report.location}. Status: ${report.status}. Help save lives!`);
    const url = encodeURIComponent(window.location.href);
    
    switch (platform) {
      case 'whatsapp': return `https://api.whatsapp.com/send?text=${text}%20${url}`;
      case 'facebook': return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      case 'x': return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    }
  };

  // Search and filter algorithms
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                          r.description.toLowerCase().includes(search.toLowerCase()) ||
                          r.location.toLowerCase().includes(search.toLowerCase());
    
    // Filter maps
    let matchesCategory = false;
    if (categoryFilter === 'all') {
      matchesCategory = true;
    } else if (categoryFilter === 'animal') {
      matchesCategory = ['dog_welfare', 'cow_welfare'].includes(r.category);
    } else if (categoryFilter === 'environment') {
      matchesCategory = r.category === 'nature';
    } else if (categoryFilter === 'feedback') {
      matchesCategory = false;
    } else {
      matchesCategory = r.category === categoryFilter;
    }

    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'open') {
      matchesStatus = r.status === 'submitted';
    } else if (statusFilter === 'under_review') {
      matchesStatus = r.status === 'dispatched';
    } else if (statusFilter === 'in_progress') {
      matchesStatus = r.status === 'in_treatment';
    } else if (statusFilter === 'resolved') {
      matchesStatus = r.status === 'resolved';
    } else {
      matchesStatus = r.status === statusFilter;
    }

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  }).sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const paginatedReports = filteredReports.slice(0, visibleCount);

  // Helper colors for report types
  const getCategoryDetails = (cat: ReportCategory) => {
    switch (cat) {
      case 'dog_welfare':
        return {
          label: 'Dog Welfare',
          color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50',
          badge: 'bg-emerald-500',
          bgGradient: 'from-emerald-50 to-teal-100/30 dark:from-slate-900 dark:to-teal-950/20'
        };
      case 'cow_welfare':
        return {
          label: 'Cow Welfare',
          color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50',
          badge: 'bg-amber-500',
          bgGradient: 'from-amber-50 to-orange-100/30 dark:from-slate-900 dark:to-orange-950/20'
        };
      case 'nature':
      default:
        return {
          label: 'Nature & Environment',
          color: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200/50',
          badge: 'bg-sky-500',
          bgGradient: 'from-sky-50 to-blue-100/30 dark:from-slate-900 dark:to-blue-950/20'
        };
    }
  };

  // Get status details
  const getStatusDetails = (status: ReportStatus) => {
    switch (status) {
      case 'submitted':
        return { label: 'Open', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200/50', step: 1 };
      case 'dispatched':
        return { label: 'Under Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200/50', step: 2 };
      case 'in_treatment':
        return { label: 'In Progress', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/50', step: 3 };
      case 'resolved':
        return { label: 'Resolved', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/50', step: 4 };
      default:
        return { label: 'Closed', color: 'bg-gray-100 text-gray-800 dark:bg-gray-850/40 dark:text-gray-400 border-gray-200/50', step: 4 };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 text-left" id="reports-view-root">
      
      {/* 1. HEADER HERO BLOCK */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-gray-200/50 dark:border-slate-800/50 pb-8" id="reports-header">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-[10px] font-mono font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block mr-1" />
            24/7 Live Emergency Network
          </div>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-gray-900 dark:text-white tracking-tight">
            Puri Wildlife &amp; Nature Alerts
          </h2>
          <p className="text-sm md:text-md text-gray-500 dark:text-slate-300 leading-relaxed">
            Report injured street animals, marine emergencies, and environmental violations. Patrolling rangers and veteran veterinarians are dispatched immediately.
          </p>
        </div>

        {/* Floating Core CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsWizardOpen(true)}
          className="flex items-center justify-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-4 rounded-2xl shadow-xl shadow-red-600/15 transition-all self-start lg:self-center"
          id="new-alert-button"
        >
          <ShieldAlert className="w-5 h-5 animate-pulse" />
          File Emergency Report
        </motion.button>
      </div>

      {/* 2. DYNAMIC LIVE GRID CONSOLE (Search, Sort & Filters) */}
      <div className="glass-panel p-6 rounded-3xl border border-gray-200/50 dark:border-slate-800/50 space-y-5 shadow-sm" id="filters-panel">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Live Search bar */}
          <div className="md:col-span-6 flex items-center gap-3 bg-white/60 dark:bg-slate-900/60 border border-gray-200 dark:border-slate-800/70 rounded-2xl px-4 py-3.5 shadow-inner">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search reports by description, animal, landmark... (e.g. Swargadwar, cow)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs md:text-sm outline-none dark:text-white"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick category filter buttons */}
          <div className="md:col-span-6 flex flex-wrap gap-2.5 items-center justify-start md:justify-end">
            <span className="text-xs font-mono font-bold text-gray-400 mr-1.5 flex items-center gap-1">
              <ListFilter className="w-4.5 h-4.5" /> Filter Type:
            </span>
            {[
              { id: 'all', label: 'All Alerts' },
              { id: 'animal', label: 'Animal' },
              { id: 'environment', label: 'Environment' },
              { id: 'feedback', label: 'Feedback' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setCategoryFilter(filter.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === filter.id
                    ? 'bg-brand-emerald text-white shadow-lg shadow-brand-emerald/10'
                    : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 border hover:bg-gray-50'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Secondary Filters */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100 dark:border-slate-800/50 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center text-xs">
            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none font-semibold focus:border-brand-emerald dark:text-white"
            >
              <option value="all">All Urgencies</option>
              <option value="low">Low (Routine Check)</option>
              <option value="medium">Medium (Rescue Needed)</option>
              <option value="high">High (Open Wound / Trauma)</option>
              <option value="critical">Critical (Immobile / Danger)</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none font-semibold focus:border-brand-emerald dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open (Filed)</option>
              <option value="under_review">Under Review (Patrol Dispatched)</option>
              <option value="in_progress">In Progress (Active Veterinary Care)</option>
              <option value="resolved">Resolved (Healed / Released)</option>
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl px-3 py-2 outline-none font-semibold focus:border-brand-emerald dark:text-white"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

          {(search || categoryFilter !== 'all' || severityFilter !== 'all' || statusFilter !== 'all') && (
            <button 
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setSeverityFilter('all');
                setStatusFilter('all');
                setSortBy('newest');
              }}
              className="text-xs font-mono font-bold text-red-500 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. GRID OF PUBLIC ALERTS */}
      {filteredReports.length === 0 ? (
        <div className="text-center py-24 border border-dashed rounded-3xl border-gray-200 dark:border-slate-800" id="empty-state">
          <AlertTriangle className="w-12 h-12 text-gray-300 dark:text-slate-700 mx-auto animate-bounce" />
          <h4 className="font-display font-extrabold text-lg text-gray-800 dark:text-slate-200 mt-4">No Rescue Alerts Tracked</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto leading-relaxed">
            There are no reported incidents matching your selection. Try typing a different landmark or category.
          </p>
        </div>
      ) : (
        <div className="space-y-10" id="reports-grid-section">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="reports-grid">
            {paginatedReports.map((report) => {
              const catMeta = getCategoryDetails(report.category);
              const statusMeta = getStatusDetails(report.status);
              const commentCount = localComments[report.id]?.length || 0;

              return (
                <motion.div 
                  key={report.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setSelectedReport(report);
                    setUpdatingStatus(report.status);
                    setEnableDispatcherMode(false);
                  }}
                  className={`glass-card rounded-3xl border overflow-hidden p-5 flex flex-col justify-between hover:shadow-2xl hover:border-brand-emerald/30 hover:scale-[1.01] transition-all duration-300 text-left cursor-pointer group bg-gradient-to-b ${catMeta.bgGradient}`}
                >
                  <div className="space-y-4">
                    {/* Urgency Badge & ID */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full border ${
                        report.severity === 'critical' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/50'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/50'
                      }`}>
                        {report.severity} Urgency
                      </span>
                      <span className="text-[10px] font-mono text-gray-400">{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Image Thumbnail with Category Label overlay */}
                    <div className="relative h-48 rounded-2xl overflow-hidden shadow-inner">
                      <img 
                        src={report.images[0]} 
                        alt={report.title} 
                        className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                        {report.animal_type}
                      </div>
                    </div>

                    {/* Details block */}
                    <div className="space-y-2">
                      <div className="flex gap-1.5 items-center">
                        <span className={`w-2 h-2 rounded-full ${catMeta.badge}`} />
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 dark:text-slate-400">{catMeta.label}</p>
                      </div>
                      <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-snug group-hover:text-brand-emerald transition-colors line-clamp-1">
                        {report.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Metadata and Status Tag */}
                  <div className="mt-6 pt-4 border-t border-gray-200/30 dark:border-slate-800/40 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                      <MapPin className="w-4 h-4 text-brand-emerald flex-shrink-0" />
                      <span className="truncate max-w-[150px] font-medium">{report.location}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {commentCount > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-gray-400 bg-white/40 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                          <MessageSquare className="w-3 h-3 text-brand-blue" />
                          {commentCount}
                        </span>
                      )}
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border ${statusMeta.color}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dynamic Pagination Loader / Scroll */}
          {filteredReports.length > visibleCount && (
            <div className="text-center pt-4" id="pagination-panel">
              <button
                onClick={handleLoadMore}
                disabled={isInfiniteScrolling}
                className="inline-flex items-center gap-2.5 bg-white dark:bg-slate-900 hover:bg-gray-50 border border-gray-200 dark:border-slate-800 px-6 py-3.5 rounded-2xl text-xs font-bold text-gray-700 dark:text-slate-200 shadow-md transition-all disabled:opacity-50"
              >
                {isInfiniteScrolling ? (
                  <>
                    <Activity className="w-4.5 h-4.5 animate-spin text-brand-emerald" />
                    Connecting to live database stream...
                  </>
                ) : (
                  <>
                    Load More Active Alerts
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. PUBLIC DETAIL LIGHTBOX MODAL OVERLAY */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-[2.5rem] max-w-4xl w-full border border-gray-200 dark:border-slate-850 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
            >
              {/* Left Side: Images & Related Items */}
              <div className="md:w-5/12 bg-gray-50 dark:bg-slate-900 border-r border-gray-200/50 dark:border-slate-850/50 relative flex flex-col justify-between overflow-hidden">
                <div className="p-6 space-y-4">
                  {/* Category info */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-emerald">
                      Incident: #{selectedReport.id}
                    </span>
                    <button 
                      onClick={() => setSelectedReport(null)}
                      className="md:hidden text-gray-400 hover:text-gray-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Primary interactive image */}
                  <div className="relative h-64 rounded-3xl overflow-hidden border group shadow-md bg-black">
                    <img 
                      src={selectedReport.images[0]} 
                      alt={selectedReport.title} 
                      className="w-full h-full object-cover cursor-zoom-in"
                      onClick={() => setLightboxImage(selectedReport.images[0])}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-lg">
                      Click image to expand
                    </div>
                  </div>

                  {/* Slider gallery simulation */}
                  {selectedReport.images.length > 1 && (
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-mono uppercase text-gray-400 font-semibold">Incident Evidence Attachments</p>
                      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                        {selectedReport.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setLightboxImage(img)}
                            className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 cursor-pointer flex-shrink-0 hover:border-brand-emerald/40 hover:scale-102 transition-all"
                          >
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* GPS Coordinates Simulation */}
                  <div className="p-4 rounded-2xl bg-white/60 dark:bg-slate-950/40 border border-gray-200/50 dark:border-slate-850/50 space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-brand-emerald font-extrabold flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Live GPS Dispatch Coordinates
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      Latitude: {selectedReport.lat.toFixed(6)} N <br />
                      Longitude: {selectedReport.lng.toFixed(6)} E
                    </p>
                  </div>

                  {/* Related Reports widget */}
                  <div className="space-y-2 pt-2 border-t border-gray-200/40 dark:border-slate-850/30">
                    <p className="text-[9px] font-mono uppercase text-gray-400 font-bold tracking-widest flex items-center gap-1">
                      <Award className="w-3 h-3 text-brand-emerald" /> Related Incidents (Nearby)
                    </p>
                    <div className="space-y-2">
                      {reports.filter(r => r.category === selectedReport.category && r.id !== selectedReport.id).slice(0, 2).map(rel => (
                        <div 
                          key={rel.id} 
                          onClick={() => {
                            setSelectedReport(rel);
                            setUpdatingStatus(rel.status);
                            setEnableDispatcherMode(false);
                          }}
                          className="flex items-center gap-3 p-2 rounded-xl bg-white/35 dark:bg-slate-950/20 hover:bg-white/70 dark:hover:bg-slate-950/60 border cursor-pointer transition-all"
                        >
                          <img src={rel.images[0]} className="w-9 h-9 rounded-lg object-cover border" referrerPolicy="no-referrer" />
                          <div className="text-[11px] truncate flex-grow">
                            <p className="font-bold text-gray-800 dark:text-slate-200 truncate leading-tight">{rel.title}</p>
                            <p className="text-gray-400 font-mono text-[9px] truncate">{rel.location}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="p-5 bg-white/40 dark:bg-slate-950/30 border-t border-gray-200/40 dark:border-slate-850/30 space-y-2">
                  <p className="text-[10px] font-mono uppercase text-gray-400 font-semibold tracking-wider flex items-center gap-1">
                    <Share2 className="w-3 h-3 text-brand-blue" /> Mobilize Community (Share)
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <a 
                      href={getShareLink('whatsapp', selectedReport)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-xl text-[10px] uppercase shadow-sm"
                    >
                      WhatsApp
                    </a>
                    <a 
                      href={getShareLink('facebook', selectedReport)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-[10px] uppercase shadow-sm"
                    >
                      Facebook
                    </a>
                    <a 
                      href={getShareLink('x', selectedReport)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white font-semibold py-2 rounded-xl text-[10px] uppercase shadow-sm"
                    >
                      X.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Side: Timeline, Discussion, Dispatch */}
              <div className="md:w-7/12 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-full">
                <div className="space-y-6">
                  {/* Close header */}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1 text-left">
                      <span className="text-[10px] font-mono font-bold bg-brand-emerald/15 text-brand-teal dark:text-brand-mint px-3 py-1 rounded-full uppercase tracking-wider">
                        {selectedReport.category.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-display font-extrabold text-xl md:text-2xl text-gray-900 dark:text-white mt-1.5 leading-snug">
                        {selectedReport.title}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setSelectedReport(null)}
                      className="hidden md:block p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-900 rounded-xl transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Incident Description */}
                  <div className="space-y-2 text-left">
                    <p className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Witness Description</p>
                    <p className="text-sm text-gray-600 dark:text-slate-200 leading-relaxed bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border">
                      {selectedReport.description}
                    </p>
                  </div>

                  {/* Meta tags details list */}
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="flex items-center gap-2.5 p-3.5 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <MapPin className="w-5 h-5 text-brand-emerald flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-gray-400 uppercase">Landmark</p>
                        <p className="text-gray-800 dark:text-slate-100 truncate max-w-[170px]">{selectedReport.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 p-3.5 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl border">
                      <Clock className="w-5 h-5 text-brand-blue flex-shrink-0" />
                      <div>
                        <p className="text-[9px] font-mono text-gray-400 uppercase">Reported Date</p>
                        <p className="text-gray-800 dark:text-slate-100">
                          {new Date(selectedReport.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 5. INTERACTIVE TREATMENT STATUS TIMELINE */}
                  <div className="space-y-4 text-left border-t border-gray-100 dark:border-slate-850 pt-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-mono uppercase text-gray-400 font-extrabold tracking-widest flex items-center gap-1">
                        <Activity className="w-4 h-4 text-brand-emerald" /> Emergency Status Timeline
                      </p>
                      <span className="text-[10px] font-mono text-gray-400">Patrol Priority: {selectedReport.severity.toUpperCase()}</span>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative pl-6 space-y-5 border-l border-gray-100 dark:border-slate-850 ml-3">
                      {/* Step 1: Submitted */}
                      <div className="relative">
                        <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          ['submitted', 'dispatched', 'in_treatment', 'resolved'].includes(selectedReport.status)
                            ? 'bg-brand-emerald border-brand-emerald'
                            : 'bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800'
                        }`} />
                        <div className="text-xs">
                          <p className="font-bold text-gray-850 dark:text-slate-200">Alert Registered (Open)</p>
                          <p className="text-[10px] text-gray-400">Incident logged in central system. Local rescue coordinators notified.</p>
                        </div>
                      </div>

                      {/* Step 2: Dispatched */}
                      <div className="relative">
                        <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          ['dispatched', 'in_treatment', 'resolved'].includes(selectedReport.status)
                            ? 'bg-brand-emerald border-brand-emerald animate-pulse'
                            : 'bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800'
                        }`} />
                        <div className="text-xs">
                          <p className="font-bold text-gray-850 dark:text-slate-200">Ranger Patrol Dispatched (Under Review)</p>
                          <p className="text-[10px] text-gray-400">Coastal rangers/medics are currently navigating Swargadwar roads towards the landmark.</p>
                        </div>
                      </div>

                      {/* Step 3: Treatment */}
                      <div className="relative">
                        <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          ['in_treatment', 'resolved'].includes(selectedReport.status)
                            ? 'bg-brand-emerald border-brand-emerald'
                            : 'bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800'
                        }`} />
                        <div className="text-xs">
                          <p className="font-bold text-gray-850 dark:text-slate-200">Admitted to Clinical Shelter (In Progress)</p>
                          <p className="text-[10px] text-gray-400">Underactive professional veterinary treatment. Wound cleaning, splints, and nutrition provided.</p>
                        </div>
                      </div>

                      {/* Step 4: Resolved */}
                      <div className="relative">
                        <div className={`absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border-2 ${
                          selectedReport.status === 'resolved'
                            ? 'bg-brand-emerald border-brand-emerald shadow-lg shadow-brand-emerald/20'
                            : 'bg-white dark:bg-slate-950 border-gray-300 dark:border-slate-800'
                        }`} />
                        <div className="text-xs">
                          <p className="font-bold text-gray-850 dark:text-slate-200">Incident Resolved (Released Safely)</p>
                          <p className="text-[10px] text-gray-400">Treatment completed. Animal returned safely to habitat or stray sanctuary. Dune hazard cleared.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6. LIVE CITIZEN DISCUSSION COMMENTS */}
                  <div className="space-y-4 text-left border-t border-gray-100 dark:border-slate-850 pt-5">
                    <p className="text-[11px] font-mono uppercase text-gray-400 font-extrabold tracking-widest flex items-center gap-1">
                      <MessageSquare className="w-4 h-4 text-brand-blue" /> Live Emergency Notes &amp; Chat
                    </p>

                    <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                      {(!localComments[selectedReport.id] || localComments[selectedReport.id].length === 0) ? (
                        <p className="text-xs text-gray-400 py-3 italic">No comments filed on this emergency. Be the first to share logs or coordinate.</p>
                      ) : (
                        localComments[selectedReport.id].map(comment => (
                          <div key={comment.id} className="p-3.5 rounded-2xl bg-gray-50/70 dark:bg-slate-900/40 border border-gray-200/50 dark:border-slate-800 text-xs relative space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                              <span className="font-bold text-gray-600 dark:text-slate-200 uppercase tracking-wide">
                                {comment.author} ({comment.role})
                              </span>
                              <span>{new Date(comment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-gray-700 dark:text-slate-200 leading-relaxed font-medium">{comment.text}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Chat Form */}
                    <form onSubmit={handleAddComment} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add landmark details, volunteer dispatch updates, or questions..."
                        className="flex-grow bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none focus:border-brand-emerald dark:text-white"
                        required
                      />
                      <button 
                        type="submit"
                        className="bg-brand-emerald text-white p-2.5 rounded-xl hover:bg-brand-teal transition-all shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>

                {/* Dispatcher Moderator Tools Collapse */}
                <div className="border-t border-gray-100 dark:border-slate-850 pt-4 mt-6">
                  <button
                    onClick={() => setEnableDispatcherMode(!enableDispatcherMode)}
                    className="w-full flex justify-between items-center text-[10px] font-mono text-brand-teal hover:underline uppercase font-bold"
                  >
                    <span>🛠️ Patrolling Ranger &amp; Dispatcher Tools</span>
                    <span>{enableDispatcherMode ? '✕ Collapse Console' : '▼ Expand Console'}</span>
                  </button>

                  <AnimatePresence>
                    {enableDispatcherMode && (
                      <motion.form 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={handleStatusChange} 
                        className="mt-4 space-y-3.5 bg-slate-55/10 dark:bg-slate-900/20 p-4 border rounded-2xl text-left"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-gray-400">Set Network Stage</label>
                          <select 
                            value={updatingStatus} 
                            onChange={(e) => setUpdatingStatus(e.target.value as ReportStatus)}
                            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                          >
                            <option value="submitted">Submitted Alert (Open / Awaiting Ranger)</option>
                            <option value="dispatched">Dispatched (Medics enroute)</option>
                            <option value="in_treatment">In Treatment (Sheltered clinical care)</option>
                            <option value="resolved">Resolved (Healed / Released / Closed)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-bold text-gray-400">Dispatcher Logs / Medical Notes</label>
                          <input 
                            type="text" 
                            value={statusNotes} 
                            onChange={(e) => setStatusNotes(e.target.value)}
                            placeholder="Add clinical logs, vehicle number, surgical outcome..."
                            className="w-full bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-emerald hover:bg-brand-teal text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                          <Wrench className="w-4 h-4" />
                          Commit Dispatch Updates
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIGHTBOX FOR HERO IMAGES */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl relative"
            >
              <img src={lightboxImage} alt="Fullscreen evidence" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. MULTI-STEP EMERGENCY REPORTING WIZARD OVERLAY */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 bg-black/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            
            {/* Exit confirmation overlay */}
            <AnimatePresence>
              {showExitConfirm && (
                <div className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.95 }}
                    className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-gray-200 dark:border-slate-850 shadow-2xl max-w-sm w-full space-y-4"
                  >
                    <div className="flex items-center gap-2.5 text-red-500">
                      <AlertTriangle className="w-6 h-6 animate-pulse" />
                      <h4 className="font-display font-bold text-md text-gray-900 dark:text-white">Discard Witness Draft?</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Your draft is automatically saved to local storage, but exiting now will delay dispatching rangers to save this life.
                    </p>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setIsWizardOpen(false);
                          resetWizardForm();
                        }}
                        className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 text-xs font-bold rounded-xl"
                      >
                        Yes, Exit Wizard
                      </button>
                      <button
                        onClick={() => setShowExitConfirm(false)}
                        className="px-4 py-2 bg-brand-emerald text-white text-xs font-bold rounded-xl"
                      >
                        Keep Writing
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 rounded-[2.5rem] max-w-2xl w-full border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-between max-h-[92vh]"
            >
              
              {/* If not logged in, restrict flow */}
              {!currentUser ? (
                <div className="p-8 md:p-12 text-center space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-extrabold text-2xl text-gray-900 dark:text-white">Verification Required</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                      To prevent prank calls and ensure rescue logistics, you must have a verified account to submit reports to the live emergency dispatch.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3.5 justify-center pt-2">
                    <button
                      onClick={() => {
                        setIsWizardOpen(false);
                        if (setTab) setTab('auth-login');
                      }}
                      className="px-6 py-3 bg-brand-emerald text-white font-bold text-xs rounded-xl shadow-lg"
                    >
                      Sign In to Account
                    </button>
                    <button
                      onClick={() => {
                        setIsWizardOpen(false);
                        if (setTab) setTab('auth-signup');
                      }}
                      className="px-6 py-3 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Register New Guardian
                    </button>
                    <button
                      onClick={() => setIsWizardOpen(false)}
                      className="px-6 py-3 bg-transparent text-gray-400 text-xs font-bold hover:underline"
                    >
                      Cancel / Go Back
                    </button>
                  </div>
                </div>
              ) : isSuccess ? (
                /* Success screen */
                <div className="p-8 md:p-12 text-center space-y-6 overflow-y-auto">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1 rounded-full uppercase tracking-widest">
                      Incident Filed Successfully
                    </span>
                    <h3 className="font-display font-extrabold text-3xl text-gray-900 dark:text-white tracking-tight">
                      Thank You, Life Savior!
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                      Your rescue alert has been logged onto our live console. A patrolling ranger is checking Swargadwar maps for dispatch.
                    </p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border max-w-md mx-auto space-y-3.5 text-xs text-left">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-mono text-gray-400 font-bold uppercase text-[10px]">INCIDENT ID</span>
                      <span className="font-mono font-bold text-brand-emerald">{successReportId}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-mono text-gray-400 font-bold uppercase text-[10px]">CURRENT STAGE</span>
                      <span className="font-mono font-bold text-yellow-500 uppercase">SUBMITTED (Pending Dispatch)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-gray-400 font-bold uppercase text-[10px]">ESTIMATED RESPONSE TIMELINE</span>
                      <span className="font-mono font-bold text-brand-blue">Within 12-15 minutes</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    <button
                      onClick={() => {
                        resetWizardForm();
                        setIsWizardOpen(false);
                      }}
                      className="px-6 py-3 bg-brand-emerald text-white font-bold text-xs rounded-xl shadow-lg"
                    >
                      Browse Emergency Feed
                    </button>
                    <button
                      onClick={resetWizardForm}
                      className="px-6 py-3 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 text-gray-700 dark:text-slate-200 font-bold text-xs rounded-xl"
                    >
                      Submit Another Incident
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary 5-Step Form */
                <>
                  {/* Form Header */}
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <div className="space-y-0.5">
                      <h3 className="font-display font-extrabold text-md text-gray-900 dark:text-white">Emergency Witness Portal</h3>
                      <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                        Step {wizardStep} of 5: {
                          wizardStep === 1 ? 'Incident Classification' :
                          wizardStep === 2 ? 'Witness Notes & Location' :
                          wizardStep === 3 ? 'Evidence Visual Attachments' :
                          wizardStep === 4 ? 'Identity & Contact Preference' : 'Confirm & Dispatch Emergency'
                        }
                      </p>
                    </div>
                    <button 
                      onClick={handleCloseWizardRequest}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Wizard Progress Bar */}
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-slate-900 flex">
                    <div 
                      className="h-full bg-brand-emerald transition-all duration-300" 
                      style={{ width: `${(wizardStep / 5) * 100}%` }}
                    />
                  </div>

                  {/* Form Step Body Wrapper */}
                  <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    
                    {/* STEP 1: CHOOSE CLASSIFICATION */}
                    {wizardStep === 1 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <p className="text-xs text-gray-500">What category of incident did you witness in Puri?</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {[
                            { 
                              id: 'dog_welfare', 
                              title: 'Dog Welfare', 
                              desc: 'Stray dogs, puppies, accidents, sickness, street feeding support, or medical emergencies.', 
                              color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-50/10 hover:bg-emerald-50/20 text-emerald-500' 
                            },
                            { 
                              id: 'cow_welfare', 
                              title: 'Cow Welfare', 
                              desc: 'Street cows, trauma, stomach blockages, feeding help, or animal abuse alerts.', 
                              color: 'border-amber-200 hover:border-amber-500 bg-amber-50/10 hover:bg-amber-50/20 text-amber-500' 
                            },
                            { 
                              id: 'nature', 
                              title: 'Nature & Environment', 
                              desc: 'Plastic waste, beach pollution, illegal dumping, tree damage, or general environmental issues.', 
                              color: 'border-blue-200 hover:border-brand-blue bg-blue-50/10 hover:bg-blue-50/20 text-blue-500' 
                            }
                          ].map(opt => (
                            <div
                              key={opt.id}
                              onClick={() => {
                                setFormCategory(opt.id as any);
                                if (opt.id === 'dog_welfare') {
                                  setFormAnimalType('dog');
                                } else if (opt.id === 'cow_welfare') {
                                  setFormAnimalType('cow');
                                } else {
                                  setFormAnimalType('none');
                                }
                              }}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between text-left h-48 ${opt.color} ${
                                formCategory === opt.id ? 'ring-2 ring-offset-2 ring-brand-emerald border-transparent' : ''
                              }`}
                            >
                              <div className="space-y-1">
                                <h4 className="font-display font-extrabold text-xs uppercase tracking-wide text-gray-850 dark:text-white">{opt.title}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-slate-300 leading-normal">{opt.desc}</p>
                              </div>
                              <span className="text-[10px] font-mono opacity-80 font-bold uppercase">Select Type →</span>
                            </div>
                          ))}
                        </div>

                        {/* Specific Issue Buttons based on selected category */}
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3 pt-3 border-t text-left"
                        >
                          <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Select Specific Issue / Incident</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {(formCategory === 'dog_welfare' ? [
                              'Injured Dog', 'Sick Dog', 'Dog Accident', 'Dog Abuse', 'Dog Feeding Required', 'Dog Medical Emergency'
                            ] : formCategory === 'cow_welfare' ? [
                              'Injured Cow', 'Sick Cow', 'Cow Accident', 'Cow Abuse', 'Cow Feeding Required', 'Cow Medical Emergency'
                            ] : [
                              'Plastic Waste', 'Beach Pollution', 'Illegal Dumping', 'Tree Damage', 'Water Pollution', 'Garbage Accumulation', 'General Environmental Issue'
                            ]).map(issue => (
                              <button
                                type="button"
                                key={issue}
                                onClick={() => setFormTitle(issue)}
                                className={`p-2.5 rounded-xl border font-semibold text-center transition-all truncate ${
                                  formTitle === issue
                                    ? 'bg-brand-emerald text-white border-transparent'
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300'
                                }`}
                              >
                                {issue}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    {/* STEP 2: DETAILS, LANDMARK */}
                    {wizardStep === 2 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 text-left"
                      >
                        {/* Title input */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Brief Alert Summary / Title</label>
                          <input 
                            type="text" 
                            value={formTitle}
                            onChange={(e) => setFormTitle(e.target.value)}
                            placeholder="e.g. Broken wing seagull near Lighthouse beach"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                            required
                          />
                          <p className="text-[9px] text-gray-400">Summarize the incident in less than 60 characters for rangers.</p>
                        </div>

                        {/* Severity Urgency */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Urgency Severity Level</label>
                          <div className="grid grid-cols-4 gap-2 text-xs">
                            {[
                              { id: 'low', label: 'Low', desc: 'Inspection', color: 'border-blue-200 text-blue-500' },
                              { id: 'medium', label: 'Medium', desc: 'Need help', color: 'border-yellow-200 text-yellow-500' },
                              { id: 'high', label: 'High', desc: 'Trauma / Bleeding', color: 'border-orange-200 text-orange-500' },
                              { id: 'critical', label: 'Critical', desc: 'Dying / Immobile', color: 'border-red-200 text-red-500 animate-pulse' }
                            ].map(sev => (
                              <button
                                type="button"
                                key={sev.id}
                                onClick={() => setFormSeverity(sev.id as any)}
                                className={`p-2.5 rounded-xl border text-center font-bold flex flex-col justify-center items-center transition-all ${
                                  formSeverity === sev.id
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent shadow-md'
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{sev.label}</span>
                                <span className="text-[8px] opacity-70 font-mono font-normal">{sev.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Dropdown Landmark Select */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Puri Area / Landmark</label>
                          <select
                            value={formArea}
                            onChange={(e) => setFormArea(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white font-semibold"
                          >
                            {PURI_AREAS.map((area, idx) => (
                              <option key={idx} value={area}>{area}</option>
                            ))}
                          </select>
                        </div>

                        {formArea === 'Other (describe in details)' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1"
                          >
                            <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Specify Custom Area Description</label>
                            <input 
                              type="text" 
                              value={formCustomArea}
                              onChange={(e) => setFormCustomArea(e.target.value)}
                              placeholder="e.g. Swargadwar Ward 4 behind Temple parking"
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                            />
                          </motion.div>
                        )}

                        {/* Detailed Description */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono tracking-wider font-semibold uppercase text-gray-400">Detailed Description of Incident</label>
                          <textarea 
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            placeholder="Provide details about the animal's physical trauma, physical behavior, specific wounds, and precise location hints..."
                            rows={4}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:border-brand-emerald outline-none dark:text-white"
                            required
                          />
                          <div className="flex justify-between text-[9px] font-mono text-gray-400">
                            <span>Minimum 20 characters required.</span>
                            <span>{formDescription.length} chars</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: PHOTO EVIDENCE UPLOAD */}
                    {wizardStep === 3 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-5 text-left"
                      >
                        <p className="text-xs text-gray-500">Attach clear visual evidence of the incident. Max 5 images. Local optimization compresses files automatically.</p>
                        
                        {/* Drag and Drop Box */}
                        <div
                          onDragOver={handleDragOver}
                          onDrop={handleDrop}
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl p-8 text-center cursor-pointer hover:border-brand-emerald/40 hover:bg-slate-55/10 transition-all space-y-3 relative overflow-hidden"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden" 
                          />
                          
                          {isUploading ? (
                            <div className="space-y-3">
                              <Activity className="w-10 h-10 text-brand-emerald mx-auto animate-spin" />
                              <div className="space-y-1">
                                <p className="font-semibold text-xs text-gray-700 dark:text-slate-200">{uploadStageText}</p>
                                <p className="text-[10px] text-gray-400">Progress: {uploadProgress}%</p>
                              </div>
                              <div className="h-1.5 w-40 bg-gray-100 dark:bg-slate-900 rounded-full overflow-hidden mx-auto">
                                <div className="h-full bg-brand-emerald" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Upload className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto" />
                              <div>
                                <p className="font-bold text-xs text-gray-750 dark:text-slate-200">Drag &amp; Drop Photos Here</p>
                                <p className="text-[10px] text-gray-400 mt-1">or click to browse local computer memory (GIF, PNG, JPEG)</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pre-uploaded sample anchors shortcuts for quick testing */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-mono uppercase text-gray-400 font-bold tracking-widest flex items-center gap-1">
                            <Camera className="w-3.5 h-3.5" /> High-Quality Demonstration Shortcuts
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {QUICK_PHOTOS.map((qp, i) => (
                              <button
                                type="button"
                                key={i}
                                onClick={() => {
                                  if (formImages.length >= 5) {
                                    showToast('Max 5 images allowed.', 'error');
                                    return;
                                  }
                                  setFormImages(old => [...old, qp.url]);
                                  showToast(`Attached demonstration: ${qp.label}`, 'success');
                                }}
                                className="p-2 bg-slate-50 dark:bg-slate-900 border hover:border-brand-emerald/30 rounded-xl flex items-center gap-1.5 text-[10px] text-left hover:bg-slate-100 transition-all font-semibold"
                              >
                                <img src={qp.url} className="w-6 h-6 rounded object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                                <span className="truncate">{qp.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Preview grid */}
                        {formImages.length > 0 && (
                          <div className="space-y-2.5">
                            <p className="text-[10px] font-mono uppercase text-gray-400 font-bold tracking-widest">
                              Attached Evidence Gallery ({formImages.length}/5)
                            </p>
                            
                            <div className="grid grid-cols-5 gap-3.5">
                              {formImages.map((img, idx) => (
                                <div key={idx} className="relative aspect-square border rounded-2xl overflow-hidden shadow group">
                                  <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  
                                  {/* Delete button overlay */}
                                  <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1.5 right-1.5 p-1 bg-red-650/80 text-white rounded-lg hover:bg-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Reordering indicators overlay */}
                                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex justify-between bg-black/60 rounded-lg p-0.5 opacity-0 group-hover:opacity-100 transition-all text-[9px] text-white">
                                    <button 
                                      type="button" 
                                      onClick={() => moveImage(idx, 'left')} 
                                      className="hover:text-brand-emerald font-bold"
                                      disabled={idx === 0}
                                    >
                                      ◀
                                    </button>
                                    <span className="font-bold">{idx + 1}</span>
                                    <button 
                                      type="button" 
                                      onClick={() => moveImage(idx, 'right')} 
                                      className="hover:text-brand-emerald font-bold"
                                      disabled={idx === formImages.length - 1}
                                    >
                                      ▶
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {wizardStep === 4 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 text-left"
                      >
                        <p className="text-xs text-gray-500">Your profile is verified. Choose how your identity metadata is exposed on the public emergency dispatcher feed.</p>
                        
                        <div className="grid grid-cols-1 gap-3.5">
                          {[
                            {
                              id: 'phone',
                              title: 'Share Registered Phone Number',
                              desc: 'Exposes your phone number directly so other nearby Swargadwar rescuers can call you to clarify landmarks or status.',
                              icon: <Phone className="w-5 h-5 text-brand-emerald" />
                            },
                            {
                              id: 'email',
                              title: 'Share Registered Email ID Only',
                              desc: 'Allows users to click your profile and drop you an email query. Highly balance of transparency and privacy.',
                              icon: <Mail className="w-5 h-5 text-brand-blue" />
                            },
                            {
                              id: 'hidden',
                              title: 'Strict Privacy Mode (Hidden)',
                              desc: 'Masks your identity as "Anonymous Guardian". Location details are fully shared, but personal contacts are visible only to certified forest rangers/vets.',
                              icon: <Lock className="w-5 h-5 text-brand-amber" />
                            }
                          ].map(pref => (
                            <div
                              key={pref.id}
                              onClick={() => setFormContactPreference(pref.id as any)}
                              className={`p-4 rounded-2xl border cursor-pointer flex gap-4 items-center text-left hover:bg-slate-55/10 transition-all ${
                                formContactPreference === pref.id
                                  ? 'ring-2 ring-offset-2 ring-brand-emerald border-transparent bg-brand-emerald/5'
                                  : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800'
                              }`}
                            >
                              <div className="p-3 bg-white dark:bg-slate-950 border rounded-xl flex-shrink-0">
                                {pref.icon}
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="font-bold text-xs text-gray-800 dark:text-white">{pref.title}</h4>
                                <p className="text-[10px] text-gray-400 dark:text-slate-300 leading-normal">{pref.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 5: REVIEW CONFIRMATION */}
                    {wizardStep === 5 && (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4 text-left font-semibold"
                      >
                        <p className="text-xs text-gray-500">Review your emergency alert summary before committing and broadcasting to the live dispatcher network.</p>
                        
                        {/* Summary Card */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/60 rounded-3xl border space-y-4 text-xs font-medium">
                          <div className="flex gap-4">
                            <img 
                              src={formImages[0] || QUICK_PHOTOS[1].url} 
                              alt="Review" 
                              className="w-16 h-16 rounded-xl object-cover border" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1 truncate">
                              <span className="text-[9px] font-mono bg-brand-emerald/15 text-brand-teal px-2 py-0.5 rounded-full uppercase">
                                {formCategory.replace(/_/g, ' ')}
                              </span>
                              <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate mt-0.5">{formTitle || 'Untitled Incident'}</h4>
                              <p className="text-gray-400 font-mono text-[10px] flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-brand-emerald" /> {formArea}
                              </p>
                            </div>
                          </div>

                          <div className="p-3 bg-white dark:bg-slate-950 border rounded-xl leading-relaxed text-[11px] text-gray-500">
                            {formDescription || 'No description provided.'}
                          </div>

                          <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                            <div className="p-2 border rounded-lg bg-white dark:bg-slate-950">
                              <span className="text-gray-450 block text-[9px]">INCIDENT URGENCY</span>
                              <span className="font-bold text-red-500 uppercase">{formSeverity} Severity</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 border rounded-lg bg-white dark:bg-slate-950">
                              <div>
                                <span className="text-gray-450 block text-[9px]">CONTACT EXPOSURE</span>
                                <span className="font-bold text-gray-850 uppercase">{formContactPreference}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Certify Checkbox */}
                        <label className="flex items-start gap-3 p-3.5 bg-red-50/10 border border-red-200/50 rounded-2xl cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={formTermsCertified}
                            onChange={(e) => setFormTermsCertified(e.target.checked)}
                            className="w-4 h-4 text-brand-emerald border-gray-300 rounded focus:ring-brand-emerald mt-0.5"
                          />
                          <div className="text-[10px] leading-relaxed text-gray-500 dark:text-slate-300 font-medium">
                            I certify that I am physically present or have personally witnessed this biological/animal incident in Puri, and all information is 100% genuine and verified.
                          </div>
                        </label>
                      </motion.div>
                    )}

                  </div>

                  {/* Form Footer Action buttons */}
                  <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-900 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    {wizardStep > 1 ? (
                      <button
                        type="button"
                        onClick={() => setWizardStep(prev => prev - 1)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 px-4 py-2.5 rounded-xl transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCloseWizardRequest}
                        className="text-xs font-bold text-red-550 hover:underline"
                      >
                        Cancel Witness
                      </button>
                    )}

                    {wizardStep < 5 ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (wizardStep === 2 && formTitle.trim().length < 5) {
                            showToast('Please provide an alert summary of at least 5 characters.', 'error');
                            return;
                          }
                          if (wizardStep === 2 && formDescription.trim().length < 20) {
                            showToast('Description is too short. Please provide at least 20 characters of details.', 'error');
                            return;
                          }
                          setWizardStep(prev => prev + 1);
                        }}
                        className="inline-flex items-center gap-1.5 bg-brand-emerald text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md"
                      >
                        Continue Step
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleWizardSubmit}
                        className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg shadow-red-600/15"
                      >
                        <ShieldAlert className="w-4 h-4" /> Broadcast Rescue Emergency
                      </button>
                    )}
                  </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
