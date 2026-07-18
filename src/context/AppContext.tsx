/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { emailService } from '../services/EmailService';
import { 
  UserProfile, AnimalReport, Donation, Campaign, ForumThread, 
  Notification, ActivityLog, ReportStatus, AnimalType, ReportCategory,
  ForumCategory, ForumPost, ForumFlag, UserReputation, ForumBadge, UserBadge,
  CampaignCategory, CampaignStatus, CampaignFAQ, CampaignUpdate, CampaignUpdateComment,
  LeaderboardEntry
} from '../types';

interface AppContextType {
  currentUser: UserProfile | null;
  reports: AnimalReport[];
  donations: Donation[];
  campaigns: Campaign[];
  campaignUpdates: CampaignUpdate[];
  leaderboard: LeaderboardEntry[];
  notifications: Notification[];
  logs: ActivityLog[];
  loading: boolean;
  toast: { message: string; type: 'success' | 'error' | 'info' | null };
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  
  // Auth Operations
  signUp: (name: string, email: string, phone: string, bio: string, location: string) => Promise<boolean>;
  logIn: (email: string) => Promise<boolean>;
  logInOTP: (phone: string) => Promise<boolean>;
  logOut: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;

  // Reports Operations
  submitReport: (title: string, description: string, category: ReportCategory, animalType: AnimalType, severity: 'low' | 'medium' | 'high' | 'critical', location: string, images: string[]) => Promise<boolean>;
  updateReportStatus: (reportId: string, status: ReportStatus, note: string) => Promise<boolean>;

  // Donations & Campaigns Operations
  makeDonation: (amount: number, campaignId: string, campaignTitle: string, isAnonymous: boolean) => Promise<boolean>;
  makeDetailedDonation: (donationData: {
    amount: number;
    campaignId: string;
    campaignTitle: string;
    isAnonymous: boolean;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    message?: string;
    paymentMethod: string;
  }) => Promise<{ success: boolean; donation?: Donation }>;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'raised_amount' | 'created_at' | 'donors_count'>) => Promise<boolean>;
  updateCampaign: (campaignId: string, updates: Partial<Campaign>) => Promise<boolean>;
  deleteCampaign: (campaignId: string) => Promise<boolean>;
  addCampaignUpdate: (campaignId: string, update: Omit<CampaignUpdate, 'id' | 'likes' | 'comments'>) => Promise<boolean>;
  likeCampaignUpdate: (campaignId: string, updateId: string) => Promise<boolean>;
  commentCampaignUpdate: (campaignId: string, updateId: string, content: string) => Promise<boolean>;

  // Notifications Operations
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (title: string, message: string, type: 'report' | 'donation' | 'forum' | 'system' | 'campaign' | 'volunteer' | 'announcement' | 'moderator' | 'mention', priority?: 'low' | 'normal' | 'high' | 'urgent') => void;
  deleteNotification: (notificationId: string) => void;

  // Forum States
  categories: ForumCategory[];
  threads: ForumThread[];
  posts: ForumPost[];
  flags: ForumFlag[];
  reputations: UserReputation[];
  badges: ForumBadge[];
  userBadges: UserBadge[];

  // Forum Operations
  createThread: (title: string, content: string, categoryId: string, tags: string[], images: string[], reportId?: string) => Promise<string | null>;
  updateThread: (threadId: string, updates: Partial<ForumThread>) => Promise<boolean>;
  deleteThread: (threadId: string) => Promise<boolean>;
  addReply: (threadId: string, content: string, parentId?: string, quotedPostId?: string, images?: string[]) => Promise<boolean>;
  deleteReply: (replyId: string) => Promise<boolean>;
  editReply: (replyId: string, newContent: string) => Promise<boolean>;
  toggleLikeThread: (threadId: string) => Promise<boolean>;
  toggleBookmarkThread: (threadId: string) => Promise<boolean>;
  toggleFollowThread: (threadId: string) => Promise<boolean>;
  toggleLikePost: (postId: string) => Promise<boolean>;
  flagContent: (type: 'thread' | 'post', id: string, reportedUserId: string, reportedUserName: string, reason: 'spam' | 'harassment' | 'animal_abuse' | 'false_info' | 'offensive' | 'other', details?: string) => Promise<boolean>;
  moderateThread: (threadId: string, action: 'pin' | 'lock' | 'delete' | 'feature') => Promise<boolean>;
  moderatePost: (postId: string, action: 'hide' | 'delete') => Promise<boolean>;
  awardReputationPoints: (userId: string, points: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SEED_CAMPAIGNS: Campaign[] = [];

const SEED_CAMPAIGN_UPDATES: CampaignUpdate[] = [];

const SEED_LEADERBOARD: LeaderboardEntry[] = [];

const SEED_REPORTS: AnimalReport[] = [];

const SEED_DONATIONS: Donation[] = [];

const SEED_FORUM_CATEGORIES: ForumCategory[] = [
  {
    id: 'cat-animal-welfare',
    name: 'Animal Welfare',
    slug: 'animal-welfare',
    icon: 'ShieldAlert',
    description: 'Emergency updates, medical dispatches, street feeding zones, and rescue coordinates across Puri.',
    cover_image: 'https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=800',
    threads_count: 0,
    replies_count: 0,
    latest_activity: new Date().toISOString()
  },
  {
    id: 'cat-environment-ecosystem',
    name: 'Environment & Ecosystem',
    slug: 'environment-ecosystem',
    icon: 'Trees',
    description: 'Preserving coastal dunes, beach plastic cleaning, waste bin installation, and community reforestation drives.',
    cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800',
    threads_count: 0,
    replies_count: 0,
    latest_activity: new Date().toISOString()
  },
  {
    id: 'cat-announcements',
    name: 'Announcements',
    slug: 'announcements',
    icon: 'Megaphone',
    description: 'Official updates from Puri Welfare board, veterinary camp schedules, and critical wildlife notices.',
    cover_image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800',
    threads_count: 0,
    replies_count: 0,
    latest_activity: new Date().toISOString()
  },
  {
    id: 'cat-general-discussion',
    name: 'General Discussion',
    slug: 'general-discussion',
    icon: 'MessageSquare',
    description: 'Ask questions, share animal photos, discuss coexistence tips, or coordinate volunteer get-togethers.',
    cover_image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    threads_count: 0,
    replies_count: 0,
    latest_activity: new Date().toISOString()
  }
];

const SEED_FORUM_BADGES: ForumBadge[] = [
  { id: 'badge-rescuer', name: 'Animal Rescuer', description: 'Awarded for filing an emergency report that is successfully dispatched.', icon: 'Heart', color: 'text-red-500 bg-red-500/10' },
  { id: 'badge-protector', name: 'Nature Protector', description: 'Awarded for initiating environment preservation discussions.', icon: 'Leaf', color: 'text-emerald-500 bg-emerald-500/10' },
  { id: 'badge-volunteer', name: 'Volunteer', description: 'Verified volunteer for beach cleaning or Swargadwar street feeding.', icon: 'Compass', color: 'text-blue-500 bg-blue-500/10' },
  { id: 'badge-hero', name: 'Community Hero', description: 'For earning over 100 reputation points on the platform.', icon: 'Award', color: 'text-amber-500 bg-amber-500/10' },
  { id: 'badge-mod', name: 'Moderator', description: 'Official community content moderator.', icon: 'Shield', color: 'text-purple-500 bg-purple-500/10' },
  { id: 'badge-admin', name: 'Administrator', description: 'Platform creator and community coordinator.', icon: 'Crown', color: 'text-rose-500 bg-rose-500/10' }
];

const SEED_FORUM_THREADS = (reports: AnimalReport[]): ForumThread[] => [];

const SEED_FORUM_POSTS: ForumPost[] = [];

const SEED_NOTIFICATIONS = (userId: string): Notification[] => [];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [reports, setReports] = useState<AnimalReport[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignUpdates, setCampaignUpdates] = useState<CampaignUpdate[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | null }>({
    message: '',
    type: null
  });

  // Forum States
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [flags, setFlags] = useState<ForumFlag[]>([]);
  const [reputations, setReputations] = useState<UserReputation[]>([]);
  const [badges] = useState<ForumBadge[]>(SEED_FORUM_BADGES);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast({ message: '', type: null });
  };

  // Sync utilities
  const syncUser = (user: UserProfile | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('puri_user', JSON.stringify(user));
      if (user.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      localStorage.removeItem('puri_user');
      document.documentElement.classList.remove('dark');
    }
  };

  const syncReports = (newReports: AnimalReport[]) => {
    setReports(newReports);
    localStorage.setItem('puri_reports', JSON.stringify(newReports));
  };

  const syncDonations = (newDonations: Donation[]) => {
    setDonations(newDonations);
    localStorage.setItem('puri_donations', JSON.stringify(newDonations));
  };

  const syncCampaigns = (newCampaigns: Campaign[]) => {
    setCampaigns(newCampaigns);
    localStorage.setItem('puri_campaigns', JSON.stringify(newCampaigns));
  };

  const syncCampaignUpdates = (newUpdates: CampaignUpdate[]) => {
    setCampaignUpdates(newUpdates);
    localStorage.setItem('puri_campaign_updates', JSON.stringify(newUpdates));
  };

  const syncLeaderboard = (newLeaderboard: LeaderboardEntry[]) => {
    setLeaderboard(newLeaderboard);
    localStorage.setItem('puri_leaderboard', JSON.stringify(newLeaderboard));
  };

  const syncNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
    localStorage.setItem('puri_notifications', JSON.stringify(newNotifications));
  };

  const syncCategories = (newCats: ForumCategory[]) => {
    setCategories(newCats);
    localStorage.setItem('puri_forum_categories', JSON.stringify(newCats));
  };

  const syncThreads = (newThreads: ForumThread[]) => {
    setThreads(newThreads);
    localStorage.setItem('puri_threads', JSON.stringify(newThreads));
  };

  const syncPosts = (newPosts: ForumPost[]) => {
    setPosts(newPosts);
    localStorage.setItem('puri_forum_posts', JSON.stringify(newPosts));
  };

  const syncFlags = (newFlags: ForumFlag[]) => {
    setFlags(newFlags);
    localStorage.setItem('puri_forum_flags', JSON.stringify(newFlags));
  };

  const syncReputations = (newReps: UserReputation[]) => {
    setReputations(newReps);
    localStorage.setItem('puri_forum_reputations', JSON.stringify(newReps));
  };

  const syncUserBadges = (newUserBadges: UserBadge[]) => {
    setUserBadges(newUserBadges);
    localStorage.setItem('puri_forum_user_badges', JSON.stringify(newUserBadges));
  };

  const addLog = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      user_id: currentUser?.id || 'anonymous',
      action,
      details,
      created_at: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('puri_logs', JSON.stringify(updatedLogs));
  };

  // Load from localStorage or seed
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('puri_user');
      const storedReports = localStorage.getItem('puri_reports');
      const storedDonations = localStorage.getItem('puri_donations');
      const storedCampaigns = localStorage.getItem('puri_campaigns');
      const storedThreads = localStorage.getItem('puri_threads');
      const storedNotifications = localStorage.getItem('puri_notifications');
      const storedLogs = localStorage.getItem('puri_logs');

      const storedCategories = localStorage.getItem('puri_forum_categories');
      const storedPosts = localStorage.getItem('puri_forum_posts');
      const storedFlags = localStorage.getItem('puri_forum_flags');
      const storedReputations = localStorage.getItem('puri_forum_reputations');
      const storedUserBadges = localStorage.getItem('puri_forum_user_badges');

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
        
        // Document load in dark mode / light mode
        if (parsedUser.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else {
        // Start as clean guest user
        setCurrentUser(null);
      }

      const loadedReports = storedReports ? JSON.parse(storedReports) : SEED_REPORTS;
      setReports(loadedReports);
      setDonations(storedDonations ? JSON.parse(storedDonations) : SEED_DONATIONS);
      setCampaigns(storedCampaigns ? JSON.parse(storedCampaigns) : SEED_CAMPAIGNS);
      
      const storedUpdates = localStorage.getItem('puri_campaign_updates');
      const storedLeaderboard = localStorage.getItem('puri_leaderboard');
      setCampaignUpdates(storedUpdates ? JSON.parse(storedUpdates) : SEED_CAMPAIGN_UPDATES);
      setLeaderboard(storedLeaderboard ? JSON.parse(storedLeaderboard) : SEED_LEADERBOARD);
      
      setThreads(storedThreads ? JSON.parse(storedThreads) : SEED_FORUM_THREADS(loadedReports));
      setCategories(storedCategories ? JSON.parse(storedCategories) : SEED_FORUM_CATEGORIES);
      setPosts(storedPosts ? JSON.parse(storedPosts) : SEED_FORUM_POSTS);
      setFlags(storedFlags ? JSON.parse(storedFlags) : []);
      setReputations(storedReputations ? JSON.parse(storedReputations) : []);
      setUserBadges(storedUserBadges ? JSON.parse(storedUserBadges) : []);
      
      setLogs(storedLogs ? JSON.parse(storedLogs) : []);

      const user_id = storedUser ? JSON.parse(storedUser).id : 'anonymous';
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : SEED_NOTIFICATIONS(user_id));
      
    } catch (e) {
      console.error('Error loading localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auth Functions
  const signUp = async (name: string, email: string, phone: string, bio: string, location: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // Mimic networking
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name,
      email,
      phone,
      bio,
      location,
      role: 'member',
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`,
      created_at: new Date().toISOString(),
      notifications_enabled: true,
      theme: 'light'
    };
    syncUser(newUser);
    syncNotifications(SEED_NOTIFICATIONS(newUser.id));
    addLog('User Sign Up', `Account created with email ${email}`);
    showToast('Welcome aboard! Account created successfully.', 'success');
    setLoading(false);
    return true;
  };

  const logIn = async (email: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const username = email.split('@')[0];
    const formattedName = username
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: formattedName,
      email: email,
      phone: '+91 9999999999',
      role: 'member',
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(formattedName)}`,
      bio: 'Puri Welfare volunteer & community guard.',
      location: 'Puri, Odisha',
      created_at: new Date().toISOString(),
      notifications_enabled: true,
      theme: 'light'
    };
    syncUser(user);
    addLog('User Login', `Logged in via email: ${email}`);
    showToast('Welcome back to Puri Welfare!', 'success');
    setLoading(false);
    return true;
  };

  const logInOTP = async (phone: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const user: UserProfile = {
      id: `user-${Date.now()}`,
      name: `Citizen ${phone.slice(-4)}`,
      email: `citizen.${phone.slice(-4)}@puriwelfare.org`,
      phone: phone,
      role: 'member',
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${phone}`,
      bio: 'Puri Coastal Guardian.',
      location: 'Puri, Odisha',
      created_at: new Date().toISOString(),
      notifications_enabled: true,
      theme: 'light'
    };
    syncUser(user);
    addLog('User Login', `Logged in via OTP validation: ${phone}`);
    showToast('Securely authenticated with OTP.', 'success');
    setLoading(false);
    return true;
  };

  const logOut = () => {
    addLog('User Logout', `Logged out securely`);
    syncUser(null);
    showToast('Logged out successfully.', 'info');
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser) return false;
    const updatedUser = { ...currentUser, ...updates } as UserProfile;
    syncUser(updatedUser);
    addLog('Profile Update', `Updated fields: ${Object.keys(updates).join(', ')}`);
    showToast('Profile and settings updated.', 'success');
    return true;
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!currentUser) return false;
    addLog('Account Deleted', `Account ${currentUser.email} deleted permanent record`);
    syncUser(null);
    showToast('Your account was deactivated permanently.', 'info');
    return true;
  };

  // Reports Functions
  const submitReport = async (
    title: string,
    description: string,
    category: ReportCategory,
    animalType: AnimalType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    location: string,
    images: string[]
  ): Promise<boolean> => {
    if (!currentUser) {
      showToast('You must be logged in to submit a report.', 'error');
      return false;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));

    const newReport: AnimalReport = {
      id: `rep-${Date.now()}`,
      title,
      description,
      category,
      animal_type: animalType,
      severity,
      location,
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      status: 'submitted',
      created_at: new Date().toISOString(),
      images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600'],
      lat: 19.8 + (Math.random() - 0.5) * 0.05,
      lng: 85.8 + (Math.random() - 0.5) * 0.05
    };

    const updatedReports = [newReport, ...reports];
    syncReports(updatedReports);

    // Auto create notification for user
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      user_id: currentUser.id,
      title: 'Emergency Report Submitted',
      message: `Your report regarding "${title}" was successfully filed. Local rescue teams have been notified.`,
      type: 'report',
      read: false,
      created_at: new Date().toISOString()
    };
    syncNotifications([newNotif, ...notifications]);
    addLog('Emergency Report Created', `Report id: ${newReport.id} title: ${title}`);
    showToast('Emergency rescue report submitted successfully!', 'success');
    setLoading(false);
    return true;
  };

  const updateReportStatus = async (reportId: string, status: ReportStatus, note: string): Promise<boolean> => {
    const updatedReports = reports.map(r => {
      if (r.id === reportId) {
        return { ...r, status };
      }
      return r;
    });
    syncReports(updatedReports);

    const report = reports.find(r => r.id === reportId);
    if (report) {
      const targetEmail = (currentUser && currentUser.id === report.reporter_id)
        ? currentUser.email
        : 'reporter.puri.citizen@gmail.com';

      emailService.sendEmail(targetEmail, 'report_status', {
        name: report.reporter_name,
        reportTitle: report.title,
        location: report.location,
        status: status.toUpperCase(),
        notes: note
      }).catch(err => console.error('Failed to send status email:', err));
    }

    if (currentUser) {
      const newNotif: Notification = {
        id: `not-${Date.now()}`,
        user_id: currentUser.id,
        title: 'Report Status Changed',
        message: `Your reported incident status has been updated to "${status.toUpperCase()}": ${note}`,
        type: 'report',
        read: false,
        created_at: new Date().toISOString()
      };
      syncNotifications([newNotif, ...notifications]);
      addLog('Report Status Updated', `Report: ${reportId} -> ${status}`);
    }
    showToast(`Rescue status updated to: ${status}`, 'success');
    return true;
  };

  // Donations Functions
  const makeDetailedDonation = async (donationData: {
    amount: number;
    campaignId: string;
    campaignTitle: string;
    isAnonymous: boolean;
    donorName: string;
    donorEmail: string;
    donorPhone?: string;
    message?: string;
    paymentMethod: string;
  }): Promise<{ success: boolean; donation?: Donation }> => {
    setLoading(true);
    // Simulate premium payment network delay for full emotional investment
    await new Promise(r => setTimeout(r, 1200));

    const methodPrefix = donationData.paymentMethod.toUpperCase().substring(0, 4);
    const transactionId = `TXN_PURI_${methodPrefix}_${Math.floor(100000000 + Math.random() * 900000000)}`;
    const donationId = `don-${Date.now()}`;
    
    const newDonation: Donation = {
      id: donationId,
      amount: donationData.amount,
      donor_id: donationData.isAnonymous ? undefined : currentUser?.id,
      donor_name: donationData.isAnonymous ? 'Anonymous Donor' : donationData.donorName || currentUser?.name || 'Guest Contributor',
      donor_email: donationData.isAnonymous ? 'anonymous@puriwelfare.org' : donationData.donorEmail || currentUser?.email || 'guest@puriwelfare.org',
      donor_phone: donationData.isAnonymous ? undefined : donationData.donorPhone || currentUser?.phone,
      campaign_id: donationData.campaignId,
      campaign_title: donationData.campaignTitle,
      transaction_id: transactionId,
      created_at: new Date().toISOString(),
      is_anonymous: donationData.isAnonymous,
      message: donationData.message,
      status: 'success',
      payment_method: donationData.paymentMethod,
      receipt_url: `/receipts/${donationId}.pdf`
    };

    const newDonationsList = [newDonation, ...donations];
    syncDonations(newDonationsList);

    // Update campaign raised amount and donors count
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === donationData.campaignId) {
        return { 
          ...c, 
          raised_amount: c.raised_amount + donationData.amount,
          donors_count: (c.donors_count || 0) + 1
        };
      }
      return c;
    });
    syncCampaigns(updatedCampaigns);

    // Update Leaderboard entry
    const nameToRegister = donationData.isAnonymous ? 'Anonymous Donor' : donationData.donorName || currentUser?.name || 'Guest Contributor';
    const existingIndex = leaderboard.findIndex(l => l.name === nameToRegister);
    let updatedLeaderboard = [...leaderboard];
    if (existingIndex > -1) {
      updatedLeaderboard[existingIndex] = {
        ...updatedLeaderboard[existingIndex],
        total_donated: updatedLeaderboard[existingIndex].total_donated + donationData.amount,
        donations_count: updatedLeaderboard[existingIndex].donations_count + 1
      };
    } else {
      updatedLeaderboard.push({
        id: `lead-${Date.now()}`,
        name: nameToRegister,
        total_donated: donationData.amount,
        donations_count: 1,
        rank: 999,
        type: 'supporter',
        period: 'all'
      });
    }

    // Sort and re-rank leaderboard
    updatedLeaderboard.sort((a, b) => b.total_donated - a.total_donated);
    updatedLeaderboard = updatedLeaderboard.map((entry, idx) => ({
      ...entry,
      rank: idx + 1,
      badge: entry.total_donated >= 25000 ? 'Coastal Guardian' : entry.total_donated >= 10000 ? 'Holy Cow Sponsor' : 'Friend of Nature'
    }));
    syncLeaderboard(updatedLeaderboard);

    // Create user notifications
    if (currentUser && !donationData.isAnonymous) {
      const newNotif: Notification = {
        id: `not-${Date.now()}`,
        user_id: currentUser.id,
        title: 'Donation Received & Receipt Generated',
        message: `Your donation of ₹${donationData.amount.toLocaleString()} for "${donationData.campaignTitle}" was successful. Receipt ID: ${donationId}. Thank you!`,
        type: 'donation',
        read: false,
        created_at: new Date().toISOString()
      };
      syncNotifications([newNotif, ...notifications]);
      
      // Award some reputation points to user: +10 points for every ₹100 donated
      const pointsToAward = Math.max(10, Math.floor(donationData.amount / 10));
      awardReputationPoints(currentUser.id, pointsToAward);
    }

    addLog('Donation Complete', `Amount: ₹${donationData.amount} via ${donationData.paymentMethod} to ${donationData.campaignTitle}`);
    showToast(`Generous donation of ₹${donationData.amount.toLocaleString()} processed successfully!`, 'success');
    setLoading(false);
    return { success: true, donation: newDonation };
  };

  const makeDonation = async (amount: number, campaignId: string, campaignTitle: string, isAnonymous: boolean): Promise<boolean> => {
    const res = await makeDetailedDonation({
      amount,
      campaignId,
      campaignTitle,
      isAnonymous,
      donorName: currentUser?.name || 'Guest Contributor',
      donorEmail: currentUser?.email || 'guest@puriwelfare.org',
      donorPhone: currentUser?.phone || '',
      message: 'Support for campaign',
      paymentMethod: 'upi'
    });
    return res.success;
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'raised_amount' | 'created_at' | 'donors_count'>): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      raised_amount: 0,
      donors_count: 0,
      created_at: new Date().toISOString()
    };
    syncCampaigns([newCampaign, ...campaigns]);
    showToast(`Campaign "${campaignData.title}" created successfully!`, 'success');
    setLoading(false);
    return true;
  };

  const updateCampaign = async (campaignId: string, updates: Partial<Campaign>): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const updated = campaigns.map(c => c.id === campaignId ? { ...c, ...updates } as Campaign : c);
    syncCampaigns(updated);
    showToast('Campaign updated successfully.', 'success');
    setLoading(false);
    return true;
  };

  const deleteCampaign = async (campaignId: string): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const updated = campaigns.filter(c => c.id !== campaignId);
    syncCampaigns(updated);
    showToast('Campaign deleted successfully.', 'info');
    setLoading(false);
    return true;
  };

  const addCampaignUpdate = async (campaignId: string, updateData: Omit<CampaignUpdate, 'id' | 'likes' | 'comments'>): Promise<boolean> => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const newUpdate: CampaignUpdate = {
      ...updateData,
      id: `upd-${Date.now()}`,
      likes: [],
      comments: []
    };
    const newUpdatesList = [newUpdate, ...campaignUpdates];
    syncCampaignUpdates(newUpdatesList);
    showToast('Campaign transparency update published!', 'success');
    setLoading(false);
    return true;
  };

  const likeCampaignUpdate = async (campaignId: string, updateId: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please log in to like updates.', 'error');
      return false;
    }
    const updated = campaignUpdates.map(up => {
      if (up.id === updateId) {
        const isLiked = up.likes.includes(currentUser.id);
        const newLikes = isLiked 
          ? up.likes.filter(id => id !== currentUser.id)
          : [...up.likes, currentUser.id];
        return { ...up, likes: newLikes };
      }
      return up;
    });
    syncCampaignUpdates(updated);
    return true;
  };

  const commentCampaignUpdate = async (campaignId: string, updateId: string, content: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please log in to leave a comment.', 'error');
      return false;
    }
    const updated = campaignUpdates.map(up => {
      if (up.id === updateId) {
        const newComment: CampaignUpdateComment = {
          id: `comment-${Date.now()}`,
          update_id: updateId,
          author_id: currentUser.id,
          author_name: currentUser.name,
          author_avatar: currentUser.avatar_url,
          content,
          created_at: new Date().toISOString()
        };
        return { ...up, comments: [...up.comments, newComment] };
      }
      return up;
    });
    syncCampaignUpdates(updated);
    showToast('Comment posted successfully.', 'success');
    return true;
  };

  // Notifications Functions
  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifs = notifications.map(n => {
      if (n.id === notificationId) return { ...n, read: true };
      return n;
    });
    syncNotifications(updatedNotifs);
  };

  const markAllNotificationsAsRead = () => {
    const updatedNotifs = notifications.map(n => ({ ...n, read: true }));
    syncNotifications(updatedNotifs);
    showToast('All notifications marked as read.', 'info');
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'report' | 'donation' | 'forum' | 'system' | 'campaign' | 'volunteer' | 'announcement' | 'moderator' | 'mention',
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ) => {
    const newNotif: Notification = {
      id: `not-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: currentUser?.id || 'anonymous',
      title,
      message,
      type,
      read: false,
      created_at: new Date().toISOString(),
      priority
    };
    syncNotifications([newNotif, ...notifications]);
  };

  const deleteNotification = (notificationId: string) => {
    const updatedNotifs = notifications.filter(n => n.id !== notificationId);
    syncNotifications(updatedNotifs);
  };

  // Forum Operations
  const createThread = async (
    title: string,
    content: string,
    categoryId: string,
    tags: string[],
    images: string[],
    reportId?: string
  ): Promise<string | null> => {
    if (!currentUser) {
      showToast('You must be logged in to start a discussion.', 'error');
      return null;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const category = categories.find(c => c.id === categoryId);
    const categoryName = category ? category.name : 'General Discussion';

    const newThread: ForumThread = {
      id: `th-${Date.now()}`,
      title,
      content,
      category_id: categoryId,
      category_name: categoryName,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_avatar: currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
      replies_count: 0,
      upvotes: 1,
      pinned: false,
      locked: false,
      solved: false,
      featured: false,
      created_at: new Date().toISOString(),
      tags,
      images,
      report_id: reportId,
      views_count: 1,
      bookmarked_by: [],
      liked_by: [currentUser.id],
      following_users: [currentUser.id]
    };

    const updatedThreads = [newThread, ...threads];
    syncThreads(updatedThreads);

    // Update categories count
    const updatedCats = categories.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          threads_count: c.threads_count + 1,
          latest_activity: new Date().toISOString()
        };
      }
      return c;
    });
    syncCategories(updatedCats);

    // Reputation points for posting a thread: +15
    awardReputationPoints(currentUser.id, 15);

    // Check environment badge award
    if (categoryId === 'cat-environment-ecosystem') {
      awardBadge(currentUser.id, 'badge-protector');
    }

    addLog('Forum Thread Created', `Thread id: ${newThread.id} Title: ${title}`);
    showToast('Discussion published successfully!', 'success');
    setLoading(false);
    return newThread.id;
  };

  const updateThread = async (threadId: string, updates: Partial<ForumThread>): Promise<boolean> => {
    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return { ...t, ...updates };
      }
      return t;
    });
    syncThreads(updatedThreads);
    return true;
  };

  const deleteThread = async (threadId: string): Promise<boolean> => {
    const threadToDelete = threads.find(t => t.id === threadId);
    if (!threadToDelete) return false;

    const updatedThreads = threads.filter(t => t.id !== threadId);
    syncThreads(updatedThreads);

    // Update Category counts
    const updatedCats = categories.map(c => {
      if (c.id === threadToDelete.category_id) {
        return {
          ...c,
          threads_count: Math.max(0, c.threads_count - 1)
        };
      }
      return c;
    });
    syncCategories(updatedCats);

    // Delete corresponding posts
    const updatedPosts = posts.filter(p => p.thread_id !== threadId);
    syncPosts(updatedPosts);

    addLog('Forum Thread Deleted', `Deleted thread id: ${threadId}`);
    showToast('Discussion thread deleted.', 'info');
    return true;
  };

  const addReply = async (
    threadId: string,
    content: string,
    parentId?: string,
    quotedPostId?: string,
    images?: string[]
  ): Promise<boolean> => {
    if (!currentUser) {
      showToast('You must be logged in to reply.', 'error');
      return false;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    const newPost: ForumPost = {
      id: `post-${Date.now()}`,
      thread_id: threadId,
      author_id: currentUser.id,
      author_name: currentUser.name,
      author_avatar: currentUser.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
      content,
      created_at: new Date().toISOString(),
      images,
      parent_id: parentId,
      liked_by: [],
      quoted_post_id: quotedPostId
    };

    const updatedPosts = [...posts, newPost];
    syncPosts(updatedPosts);

    // Update thread replies_count
    const thread = threads.find(t => t.id === threadId);
    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return { ...t, replies_count: t.replies_count + 1 };
      }
      return t;
    });
    syncThreads(updatedThreads);

    // Update categories replies count
    if (thread) {
      const updatedCats = categories.map(c => {
        if (c.id === thread.category_id) {
          return {
            ...c,
            replies_count: c.replies_count + 1,
            latest_activity: new Date().toISOString()
          };
        }
        return c;
      });
      syncCategories(updatedCats);

      // Notify thread author (if it is someone else)
      if (thread.author_id !== currentUser.id) {
        const newNotif: Notification = {
          id: `not-${Date.now()}`,
          user_id: thread.author_id,
          title: 'New Reply on your Thread',
          message: `${currentUser.name} replied to "${thread.title}".`,
          type: 'forum',
          read: false,
          created_at: new Date().toISOString()
        };
        syncNotifications([newNotif, ...notifications]);
      }

      // Notify followed users of this thread
      if (thread.following_users) {
        thread.following_users.forEach(uid => {
          if (uid !== currentUser.id && uid !== thread.author_id) {
            const newNotif: Notification = {
              id: `not-follow-${uid}-${Date.now()}`,
              user_id: uid,
              title: 'Discussion Updated',
              message: `There is a new reply in the thread "${thread.title}" you follow.`,
              type: 'forum',
              read: false,
              created_at: new Date().toISOString()
            };
            syncNotifications([newNotif, ...notifications]);
          }
        });
      }
    }

    // Reputation points for replying: +5
    awardReputationPoints(currentUser.id, 5);

    // If they reply to help, check volunteer badge eligibility
    if (thread?.category_id === 'cat-animal-welfare' || thread?.category_id === 'cat-environment-ecosystem') {
      awardBadge(currentUser.id, 'badge-volunteer');
    }

    addLog('Forum Reply Created', `Reply id: ${newPost.id} on thread: ${threadId}`);
    showToast('Reply posted successfully!', 'success');
    setLoading(false);
    return true;
  };

  const deleteReply = async (replyId: string): Promise<boolean> => {
    const postToDelete = posts.find(p => p.id === replyId);
    if (!postToDelete) return false;

    const updatedPosts = posts.filter(p => p.id !== replyId);
    syncPosts(updatedPosts);

    // Update thread replies count
    const updatedThreads = threads.map(t => {
      if (t.id === postToDelete.thread_id) {
        return { ...t, replies_count: Math.max(0, t.replies_count - 1) };
      }
      return t;
    });
    syncThreads(updatedThreads);

    addLog('Forum Reply Deleted', `Deleted reply id: ${replyId}`);
    showToast('Reply removed.', 'info');
    return true;
  };

  const editReply = async (replyId: string, newContent: string): Promise<boolean> => {
    const updatedPosts = posts.map(p => {
      if (p.id === replyId) {
        return { ...p, content: newContent };
      }
      return p;
    });
    syncPosts(updatedPosts);
    showToast('Reply updated successfully.', 'success');
    return true;
  };

  const toggleLikeThread = async (threadId: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to upvote.', 'error');
      return false;
    }

    const thread = threads.find(t => t.id === threadId);
    if (!thread) return false;

    const hasLiked = thread.liked_by?.includes(currentUser.id);
    let updatedLikes = thread.liked_by || [];

    if (hasLiked) {
      updatedLikes = updatedLikes.filter(uid => uid !== currentUser.id);
    } else {
      updatedLikes = [...updatedLikes, currentUser.id];
      // Notify thread author
      if (thread.author_id !== currentUser.id) {
        const newNotif: Notification = {
          id: `not-like-${Date.now()}`,
          user_id: thread.author_id,
          title: 'Discussion Upvoted',
          message: `${currentUser.name} upvoted your thread "${thread.title}".`,
          type: 'forum',
          read: false,
          created_at: new Date().toISOString()
        };
        syncNotifications([newNotif, ...notifications]);
        // Author gets +10 points for a liked thread
        awardReputationPoints(thread.author_id, 10);
      }
    }

    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          liked_by: updatedLikes,
          upvotes: hasLiked ? Math.max(1, t.upvotes - 1) : t.upvotes + 1
        };
      }
      return t;
    });
    syncThreads(updatedThreads);
    return true;
  };

  const toggleBookmarkThread = async (threadId: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to bookmark.', 'error');
      return false;
    }

    const thread = threads.find(t => t.id === threadId);
    if (!thread) return false;

    const isBookmarked = thread.bookmarked_by?.includes(currentUser.id);
    let updatedBookmarks = thread.bookmarked_by || [];

    if (isBookmarked) {
      updatedBookmarks = updatedBookmarks.filter(uid => uid !== currentUser.id);
      showToast('Bookmark removed.', 'info');
    } else {
      updatedBookmarks = [...updatedBookmarks, currentUser.id];
      showToast('Thread bookmarked!', 'success');
    }

    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          bookmarked_by: updatedBookmarks
        };
      }
      return t;
    });
    syncThreads(updatedThreads);
    return true;
  };

  const toggleFollowThread = async (threadId: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to follow.', 'error');
      return false;
    }

    const thread = threads.find(t => t.id === threadId);
    if (!thread) return false;

    const isFollowing = thread.following_users?.includes(currentUser.id);
    let updatedFollowers = thread.following_users || [];

    if (isFollowing) {
      updatedFollowers = updatedFollowers.filter(uid => uid !== currentUser.id);
      showToast('Stopped following this discussion.', 'info');
    } else {
      updatedFollowers = [...updatedFollowers, currentUser.id];
      showToast('Following this discussion! You will receive notifications for new replies.', 'success');
    }

    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          following_users: updatedFollowers
        };
      }
      return t;
    });
    syncThreads(updatedThreads);
    return true;
  };

  const toggleLikePost = async (postId: string): Promise<boolean> => {
    if (!currentUser) {
      showToast('Please sign in to like replies.', 'error');
      return false;
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    const hasLiked = post.liked_by.includes(currentUser.id);
    let updatedLikes = post.liked_by;

    if (hasLiked) {
      updatedLikes = updatedLikes.filter(uid => uid !== currentUser.id);
    } else {
      updatedLikes = [...updatedLikes, currentUser.id];
      // Notify post author
      if (post.author_id !== currentUser.id) {
        // Author gets +10 points for a liked reply
        awardReputationPoints(post.author_id, 10);
      }
    }

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, liked_by: updatedLikes };
      }
      return p;
    });
    syncPosts(updatedPosts);
    return true;
  };

  const flagContent = async (
    type: 'thread' | 'post',
    id: string,
    reportedUserId: string,
    reportedUserName: string,
    reason: 'spam' | 'harassment' | 'animal_abuse' | 'false_info' | 'offensive' | 'other',
    details?: string
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const newFlag: ForumFlag = {
      id: `flag-${Date.now()}`,
      thread_id: type === 'thread' ? id : undefined,
      post_id: type === 'post' ? id : undefined,
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      reported_user_id: reportedUserId,
      reported_user_name: reportedUserName,
      reason,
      details,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    syncFlags([...flags, newFlag]);
    showToast('Content flagged for moderator review.', 'info');
    return true;
  };

  const moderateThread = async (
    threadId: string,
    action: 'pin' | 'lock' | 'delete' | 'feature'
  ): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'rescuer')) {
      showToast('Access denied. Moderator privileges required.', 'error');
      return false;
    }

    if (action === 'delete') {
      return deleteThread(threadId);
    }

    const updatedThreads = threads.map(t => {
      if (t.id === threadId) {
        return {
          ...t,
          pinned: action === 'pin' ? !t.pinned : t.pinned,
          locked: action === 'lock' ? !t.locked : t.locked,
          featured: action === 'feature' ? !t.featured : t.featured
        };
      }
      return t;
    });

    syncThreads(updatedThreads);
    showToast(`Moderator action committed: ${action.toUpperCase()}`, 'success');
    return true;
  };

  const moderatePost = async (postId: string, action: 'hide' | 'delete'): Promise<boolean> => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'rescuer')) {
      showToast('Access denied. Moderator privileges required.', 'error');
      return false;
    }

    if (action === 'delete') {
      return deleteReply(postId);
    }

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return { ...p, is_hidden: !p.is_hidden };
      }
      return p;
    });

    syncPosts(updatedPosts);
    showToast(`Moderator action committed: ${action.toUpperCase()}`, 'success');
    return true;
  };

  const awardReputationPoints = (userId: string, points: number) => {
    const existing = reputations.find(r => r.user_id === userId);
    let updatedReps = [...reputations];

    if (existing) {
      const newPoints = existing.points + points;
      const newLevel = Math.floor(Math.sqrt(newPoints / 10)) + 1;
      
      updatedReps = reputations.map(r => {
        if (r.user_id === userId) {
          return { ...r, points: newPoints, level: newLevel };
        }
        return r;
      });

      if (newLevel > existing.level && userId === currentUser?.id) {
        showToast(`🎉 Level Up! You reached Level ${newLevel}!`, 'success');
      }
    } else {
      const newLevel = Math.floor(Math.sqrt(points / 10)) + 1;
      updatedReps.push({ user_id: userId, points, level: newLevel });
    }

    syncReputations(updatedReps);

    const finalPoints = (existing?.points || 0) + points;
    if (finalPoints >= 100) {
      awardBadge(userId, 'badge-hero');
    }
  };

  const awardBadge = (userId: string, badgeId: string) => {
    const alreadyHas = userBadges.some(ub => ub.user_id === userId && ub.badge_id === badgeId);
    if (alreadyHas) return;

    const newAward: UserBadge = {
      id: `ub-${Date.now()}-${badgeId}`,
      user_id: userId,
      badge_id: badgeId,
      awarded_at: new Date().toISOString()
    };

    const updatedUserBadges = [...userBadges, newAward];
    syncUserBadges(updatedUserBadges);

    if (userId === currentUser?.id) {
      const bInfo = badges.find(b => b.id === badgeId);
      showToast(`🏅 Awarded Badge: "${bInfo?.name || 'Contributor'}"!`, 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        reports,
        donations,
        campaigns,
        campaignUpdates,
        leaderboard,
        notifications,
        logs,
        loading,
        toast,
        showToast,
        hideToast,
        signUp,
        logIn,
        logInOTP,
        logOut,
        updateProfile,
        deleteAccount,
        submitReport,
        updateReportStatus,
        makeDonation,
        makeDetailedDonation,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        addCampaignUpdate,
        likeCampaignUpdate,
        commentCampaignUpdate,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        deleteNotification,
        categories,
        threads,
        posts,
        flags,
        reputations,
        badges,
        userBadges,
        createThread,
        updateThread,
        deleteThread,
        addReply,
        deleteReply,
        editReply,
        toggleLikeThread,
        toggleBookmarkThread,
        toggleFollowThread,
        toggleLikePost,
        flagContent,
        moderateThread,
        moderatePost,
        awardReputationPoints
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
