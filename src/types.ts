/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'member' | 'rescuer' | 'veterinarian' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  bio?: string;
  location?: string;
  created_at: string;
  notifications_enabled: boolean;
  theme: 'light' | 'dark';
}

export type ReportCategory = 'dog_welfare' | 'cow_welfare' | 'nature';
export type AnimalType = 'dog' | 'cow' | 'none';
export type ReportStatus = 'submitted' | 'dispatched' | 'in_treatment' | 'resolved' | 'closed';

export interface AnimalReport {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  animal_type: AnimalType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  reporter_id: string;
  reporter_name: string;
  status: ReportStatus;
  created_at: string;
  images: string[];
  lat: number;
  lng: number;
}

export interface ReportStatusHistory {
  id: string;
  report_id: string;
  status: ReportStatus;
  notes: string;
  updated_by: string;
  created_at: string;
}

export type CampaignCategory = 
  | 'dog_feeding'
  | 'dog_medical'
  | 'cow_rescue'
  | 'cow_feeding'
  | 'beach_cleanup'
  | 'tree_plantation'
  | 'environmental_awareness';

export type CampaignStatus = 'active' | 'completed' | 'paused' | 'closed';

export interface CampaignFAQ {
  question: string;
  answer: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string; // short description
  long_description: string;
  goal_amount: number;
  raised_amount: number;
  image: string; // cover image
  images: string[]; // gallery
  category: CampaignCategory;
  created_at: string;
  start_date: string;
  end_date: string;
  status: CampaignStatus;
  organizer: string;
  organizer_avatar?: string;
  organizer_bio?: string;
  is_featured: boolean;
  is_urgent: boolean;
  is_verified: boolean;
  donors_count: number;
  faqs?: CampaignFAQ[];
}

export interface Donation {
  id: string;
  amount: number;
  donor_id?: string;
  donor_name: string;
  donor_email: string;
  donor_phone?: string;
  campaign_id: string;
  campaign_title: string;
  transaction_id: string;
  created_at: string;
  is_anonymous: boolean;
  message?: string;
  status: 'success' | 'failed' | 'pending';
  payment_method: string;
  receipt_url?: string;
}

export interface CampaignUpdateComment {
  id: string;
  update_id: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface CampaignUpdate {
  id: string;
  campaign_id: string;
  title: string;
  description: string;
  amount_spent: number;
  date: string;
  milestones?: string[];
  before_image?: string;
  after_image?: string;
  gallery?: string[];
  likes: string[]; // user IDs who liked
  comments: CampaignUpdateComment[];
}

export interface LeaderboardEntry {
  id: string;
  user_id?: string;
  name: string;
  avatar?: string;
  total_donated: number;
  donations_count: number;
  badge?: string;
  rank: number;
  type: 'supporter' | 'volunteer';
  period: 'monthly' | 'annual' | 'all';
}

export interface ForumThread {
  id: string;
  title: string;
  category_id: string;
  category_name: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  replies_count: number;
  upvotes: number;
  pinned: boolean;
  locked: boolean;
  solved: boolean;
  featured: boolean;
  created_at: string;
  content: string;
  tags: string[];
  images?: string[];
  report_id?: string;
  views_count: number;
  bookmarked_by?: string[];
  liked_by?: string[];
  following_users?: string[];
}

export interface ForumCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  cover_image: string;
  threads_count: number;
  replies_count: number;
  latest_activity?: string;
  slug: string;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  images?: string[];
  parent_id?: string;
  liked_by: string[];
  bookmarked_by?: string[];
  quoted_post_id?: string;
  is_hidden?: boolean;
}

export interface ForumTag {
  id: string;
  name: string;
  slug: string;
}

export interface ForumFlag {
  id: string;
  thread_id?: string;
  post_id?: string;
  reporter_id: string;
  reporter_name: string;
  reported_user_id: string;
  reported_user_name: string;
  reason: 'spam' | 'harassment' | 'animal_abuse' | 'false_info' | 'offensive' | 'other';
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface UserReputation {
  user_id: string;
  points: number;
  level: number;
}

export interface ForumBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'report' | 'donation' | 'forum' | 'system' | 'campaign' | 'volunteer' | 'announcement' | 'moderator' | 'mention';
  read: boolean;
  created_at: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  ip_address?: string;
  created_at: string;
}
