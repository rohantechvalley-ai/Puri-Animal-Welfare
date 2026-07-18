/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AdminAuditLog, VolunteerApplication, AdminBroadcast, MediaAsset, AdminSettings } from './adminTypes';

export const INITIAL_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'alog-1',
    action: 'Status Change',
    user: 'Satyajit Ray',
    role: 'super_admin',
    affectedRecord: 'Animal Report #rep-1 (Injured Cow)',
    previousValue: 'submitted',
    newValue: 'in_treatment',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.104',
    browser: 'Chrome 125.0.0 (Linux)'
  },
  {
    id: 'alog-2',
    action: 'Create Campaign',
    user: 'Satyajit Ray',
    role: 'super_admin',
    affectedRecord: 'Campaign #camp-5 (Odisha Cyclone Fund)',
    newValue: 'Published as Active',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.104',
    browser: 'Chrome 125.0.0 (Linux)'
  },
  {
    id: 'alog-3',
    action: 'Forum Flag Resolved',
    user: 'Dr. Arnab Das',
    role: 'moderator',
    affectedRecord: 'Flag #flag-104 on Post #post-welfare-2',
    previousValue: 'pending',
    newValue: 'dismissed (valid comment)',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.88',
    browser: 'Safari 17.4 (macOS)'
  },
  {
    id: 'alog-4',
    action: 'User Role Update',
    user: 'Satyajit Ray',
    role: 'super_admin',
    affectedRecord: 'User "Animesh Kar"',
    previousValue: 'member',
    newValue: 'volunteer',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.104',
    browser: 'Firefox 126.0 (Windows)'
  },
  {
    id: 'alog-5',
    action: 'Mute Spammer',
    user: 'Dr. Arnab Das',
    role: 'moderator',
    affectedRecord: 'User "CryptoSpamPuri" (#user-temp-90)',
    previousValue: 'active',
    newValue: 'muted (72 hours)',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.88',
    browser: 'Chrome 124.0 (Android)'
  },
  {
    id: 'alog-6',
    action: 'Refund Donation',
    user: 'Satyajit Ray',
    role: 'super_admin',
    affectedRecord: 'Donation #don-2 (₹2,500 by Pratibha Mohanty)',
    previousValue: 'success',
    newValue: 'refunded_reverted',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.104',
    browser: 'Chrome 125.0 (Linux)'
  },
  {
    id: 'alog-7',
    action: 'Configure Settings',
    user: 'Satyajit Ray',
    role: 'super_admin',
    affectedRecord: 'SMTP Server config',
    previousValue: 'smtp.gmail.com',
    newValue: 'smtp.mailgun.org',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: '192.168.1.104',
    browser: 'Chrome 125.0 (Linux)'
  }
];

export const INITIAL_VOLUNTEERS: VolunteerApplication[] = [
  {
    id: 'vol-1',
    name: 'Kabir Dev',
    email: 'kabir.dev@outlook.com',
    phone: '+91 9110283492',
    skills: ['Swimmer', 'First Aid Certified', 'Driving License'],
    interestCategory: 'rescue',
    status: 'pending',
    dateApplied: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    completedTasksCount: 0,
    badges: []
  },
  {
    id: 'vol-2',
    name: 'Pooja Patnaik',
    email: 'pooja.p@gmail.com',
    phone: '+91 9887766554',
    skills: ['Veterinary Student', 'Social Media Coordinator', 'Public Speaking'],
    interestCategory: 'medical',
    status: 'approved',
    dateApplied: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    performanceScore: 94,
    assignedTasks: ['Support Ambulance shift on Grand Road', 'Verify street dog vaccination roster'],
    completedTasksCount: 5,
    badges: ['Volunteer', 'Nature Protector']
  },
  {
    id: 'vol-3',
    name: 'Tusar Kanti Mohanty',
    email: 'tusar.kanti@yahoo.co.in',
    phone: '+91 9437108922',
    skills: ['Deep Sea Diving', 'Physical Labor', 'Odisha Forest Guard Alumnus'],
    interestCategory: 'cleanup',
    status: 'approved',
    dateApplied: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    performanceScore: 98,
    assignedTasks: ['Night beach safety watch patrol near Lighthouse', 'Dune cleaning coordinator'],
    completedTasksCount: 14,
    badges: ['Volunteer', 'Coastal Guardian', 'Community Hero']
  },
  {
    id: 'vol-4',
    name: 'Gopal Sahu',
    email: 'gopal.cowfeed@gmail.com',
    phone: '+91 9937283419',
    skills: ['Fodder sourcing', 'Dairy farm operator'],
    interestCategory: 'feeding',
    status: 'approved',
    dateApplied: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    performanceScore: 88,
    assignedTasks: ['Swargadwar Cow Shelter Feed stock replenishing'],
    completedTasksCount: 8,
    badges: ['Volunteer', 'Holy Cow Sponsor']
  }
];

export const INITIAL_BROADCASTS: AdminBroadcast[] = [
  {
    id: 'bc-1',
    title: 'Urgent: High tide warning near Puri Swargadwar Beach',
    message: 'Attention Volunteers: Due to cyclonic depressions in the Bay of Bengal, high tides are expected tonight. All beach safety and rescue patrols are advised to keep 50 meters back from the high water mark and carry waterproof emergency lights.',
    target: 'volunteers',
    status: 'sent',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    author: 'Satyajit Ray (Welfare Admin)'
  },
  {
    id: 'bc-2',
    title: 'Community Announcement: Free Rabies Vaccination Camp',
    message: 'Puri Animal Welfare is conducting a free street dog anti-rabies vaccination and deworming camp near the Swargadwar Municipal Ward 4 on Sunday from 8:00 AM to 1:00 PM. Spread the word and help us secure our street animals!',
    target: 'all',
    status: 'sent',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Satyajit Ray (Welfare Admin)'
  },
  {
    id: 'bc-3',
    title: 'Scheduled Release: Quarterly Impact Statement Q2 2026',
    message: 'Dear Supporters, our full audited financial statements and physical rescue report digest for Q2 2026 has been published. Read about the 142 rescues completed and the ₹2.4 Lakhs spent transparently.',
    target: 'donors',
    status: 'scheduled',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    scheduled_for: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    author: 'Satyajit Ray (Welfare Admin)'
  }
];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  { id: 'media-1', name: 'beach_plastic_mesh_cleanup.jpg', url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=800', type: 'campaign', sizeKb: 284, createdAt: '2026-07-01' },
  { id: 'media-2', name: 'injured_cow_grand_road.jpg', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&q=80&w=800', type: 'report', sizeKb: 195, createdAt: '2026-07-16' },
  { id: 'media-3', name: 'beach_plastic_hazard_lighthouse.jpg', url: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?auto=format&fit=crop&q=80&w=600', type: 'report', sizeKb: 342, createdAt: '2026-07-15' },
  { id: 'media-4', name: 'stray_puppy_cleanup_rescue.jpg', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=600', type: 'campaign', sizeKb: 154, createdAt: '2026-07-10' },
  { id: 'media-5', name: 'official_stamp_receipt_12903.pdf', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600', type: 'receipt', sizeKb: 1042, createdAt: '2026-07-14' }
];

export const DEFAULT_SETTINGS: AdminSettings = {
  platformName: 'Puri Animal & Nature Welfare',
  logoUrl: 'https://images.unsplash.com/photo-1591025207163-942350609a13?auto=format&fit=crop&q=80&w=150',
  contactEmail: 'support@purianimalwelfare.org',
  supportPhone: '+91 6752 223400',
  maintenanceMode: false,
  socialTwitter: 'https://twitter.com/purianimalwelfare',
  socialInstagram: 'https://instagram.com/purianimalwelfare',
  seoTitle: 'Puri Animal & Nature Welfare Platform - Save street animals, protect Olive Ridleys',
  seoDescription: 'Odisha\'s premium coastal animal response and community environmental discussion network. Report injured wildlife in under 60 seconds.',
  paymentGatewayEnabled: true,
  upiAddress: 'puriwelfare@sbi',
  smtpServer: 'smtp.mailgun.org',
  smtpPort: '587',
  storageQuotaGb: 10
};
