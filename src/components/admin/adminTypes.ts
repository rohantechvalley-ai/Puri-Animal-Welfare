/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RbacRole = 'visitor' | 'registered_user' | 'volunteer' | 'moderator' | 'admin' | 'super_admin';

export type RbacPermission =
  | 'view_reports'
  | 'edit_reports'
  | 'delete_reports'
  | 'review_reports'
  | 'manage_campaigns'
  | 'manage_donations'
  | 'manage_users'
  | 'manage_moderators'
  | 'manage_forum'
  | 'view_analytics'
  | 'export_data'
  | 'manage_settings'
  | 'manage_roles'
  | 'manage_notifications';

export interface RbacRoleDef {
  role: RbacRole;
  label: string;
  color: string;
  permissions: RbacPermission[];
}

export const ROLE_DEFINITIONS: Record<RbacRole, RbacRoleDef> = {
  visitor: {
    role: 'visitor',
    label: 'Visitor',
    color: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
    permissions: ['view_reports']
  },
  registered_user: {
    role: 'registered_user',
    label: 'Registered User',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    permissions: ['view_reports']
  },
  volunteer: {
    role: 'volunteer',
    label: 'Volunteer',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    permissions: ['view_reports', 'review_reports']
  },
  moderator: {
    role: 'moderator',
    label: 'Moderator',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    permissions: [
      'view_reports',
      'review_reports',
      'edit_reports',
      'manage_forum',
      'view_analytics',
      'manage_notifications'
    ]
  },
  admin: {
    role: 'admin',
    label: 'Admin',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    permissions: [
      'view_reports',
      'edit_reports',
      'delete_reports',
      'review_reports',
      'manage_campaigns',
      'manage_donations',
      'manage_users',
      'manage_forum',
      'view_analytics',
      'export_data',
      'manage_settings',
      'manage_notifications'
    ]
  },
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    permissions: [
      'view_reports',
      'edit_reports',
      'delete_reports',
      'review_reports',
      'manage_campaigns',
      'manage_donations',
      'manage_users',
      'manage_moderators',
      'manage_forum',
      'view_analytics',
      'export_data',
      'manage_settings',
      'manage_roles',
      'manage_notifications'
    ]
  }
};

export interface AdminAuditLog {
  id: string;
  action: string;
  user: string;
  role: RbacRole;
  affectedRecord: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress: string;
  browser: string;
}

export interface AdminSettings {
  platformName: string;
  logoUrl: string;
  contactEmail: string;
  supportPhone: string;
  maintenanceMode: boolean;
  socialTwitter: string;
  socialInstagram: string;
  seoTitle: string;
  seoDescription: string;
  paymentGatewayEnabled: boolean;
  upiAddress: string;
  smtpServer: string;
  smtpPort: string;
  storageQuotaGb: number;
}

export interface VolunteerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  interestCategory: 'rescue' | 'feeding' | 'cleanup' | 'medical' | 'awareness';
  status: 'pending' | 'approved' | 'rejected';
  dateApplied: string;
  performanceScore?: number;
  assignedTasks?: string[];
  completedTasksCount: number;
  badges: string[];
}

export interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  target: 'all' | 'volunteers' | 'moderators' | 'donors' | 'specific';
  status: 'draft' | 'scheduled' | 'sent';
  created_at: string;
  scheduled_for?: string;
  sent_at?: string;
  author: string;
}

export interface MediaAsset {
  id: string;
  name: string;
  url: string;
  type: 'campaign' | 'report' | 'forum' | 'receipt' | 'document';
  sizeKb: number;
  createdAt: string;
}

/**
 * Checks if a role is authorized to perform a certain permission activity
 */
export function hasPermission(role: RbacRole, permission: string): boolean {
  if (role === 'super_admin') return true;
  
  // Custom capability boundaries
  switch (permission) {
    case 'view_dashboard':
      return ['admin', 'moderator', 'volunteer'].includes(role);
    case 'view_reports':
      return ['admin', 'moderator', 'volunteer', 'registered_user', 'visitor'].includes(role);
    case 'view_flags':
      return ['admin', 'moderator'].includes(role);
    case 'moderate_forum':
      return ['admin', 'moderator'].includes(role);
    case 'view_donations':
      return ['admin'].includes(role);
    case 'manage_users':
      return ['admin'].includes(role);
    case 'manage_volunteers':
      return ['admin', 'moderator'].includes(role);
    case 'broadcast_notifications':
      return ['admin', 'moderator'].includes(role);
    case 'view_audit_logs':
      return ['admin'].includes(role);
    case 'configure_system':
      return ['admin'].includes(role);
    default:
      // Fallback check against official claims
      const def = ROLE_DEFINITIONS[role];
      if (!def) return false;
      return def.permissions.includes(permission as RbacPermission);
  }
}

