// Comprehensive Announcement and Notification System Schema
import { z } from 'zod';

// Announcement types for different levels of importance
export type AnnouncementType = 'info' | 'success' | 'warning' | 'critical';

// User roles for targeting announcements
export type UserRole = 'student' | 'rto_admin' | 'provider_admin' | 'supervisor' | 'assessor' | 'admin';

// Announcement status for scheduling and management
export type AnnouncementStatus = 'draft' | 'scheduled' | 'published' | 'archived' | 'cancelled';

// Notification delivery status
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

// Main announcement interface
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  status: AnnouncementStatus;
  
  // Targeting
  targetRoles: UserRole[];
  targetAllUsers: boolean;
  specificUserIds?: string[]; // For targeted announcements
  
  // Scheduling
  sendImmediately: boolean;
  scheduledAt?: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  
  // Rich content options
  imageUrl?: string;
  actionButton?: {
    text: string;
    url: string;
  };
  
  // Metadata
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
  
  // Analytics
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  clickCount: number;
}

// Individual notification record for each user
export interface UserNotification {
  id: string;
  announcementId: string;
  userId: string;
  userRole: UserRole;
  
  // Delivery status
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  clickedAt?: Date;
  
  // Notification content (snapshot for reliability)
  title: string;
  content: string;
  type: AnnouncementType;
  imageUrl?: string;
  actionButton?: {
    text: string;
    url: string;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// FCM token management for push notifications
export interface FCMToken {
  id: string;
  userId: string;
  token: string;
  deviceType: 'web' | 'android' | 'ios';
  deviceInfo?: string;
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
}

// Notification preferences per user
export interface NotificationPreferences {
  id: string;
  userId: string;
  
  // Channel preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  smsNotifications: boolean;
  
  // Type preferences
  receiveInfo: boolean;
  receiveSuccess: boolean;
  receiveWarning: boolean;
  receiveCritical: boolean;
  
  // Timing preferences
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string;   // HH:MM format
  timezone: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Analytics and reporting
export interface AnnouncementAnalytics {
  announcementId: string;
  date: Date;
  
  // Delivery metrics
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  totalClicked: number;
  
  // Engagement by role
  engagementByRole: Record<UserRole, {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
  }>;
  
  // Device breakdown
  deviceBreakdown: {
    web: number;
    android: number;
    ios: number;
  };
  
  createdAt: Date;
}

// Validation schemas using Zod
export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required').max(5000, 'Content too long'),
  type: z.enum(['info', 'success', 'warning', 'critical']),
  targetRoles: z.array(z.enum(['student', 'rto_admin', 'provider_admin', 'supervisor', 'assessor', 'admin'])),
  targetAllUsers: z.boolean().default(false),
  specificUserIds: z.array(z.string()).optional(),
  sendImmediately: z.boolean().default(true),
  scheduledAt: z.date().optional(),
  expiresAt: z.date().optional(),
  imageUrl: z.string().url().optional(),
  actionButton: z.object({
    text: z.string(),
    url: z.string().url()
  }).optional()
});

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();

export const NotificationPreferencesSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  receiveInfo: z.boolean(),
  receiveSuccess: z.boolean(),
  receiveWarning: z.boolean(),
  receiveCritical: z.boolean(),
  quietHoursEnabled: z.boolean(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  timezone: z.string()
});

// Helper function to get user display name by role
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    student: 'Students',
    rto_admin: 'RTO Administrators',
    provider_admin: 'Training Providers',
    supervisor: 'Workplace Supervisors',
    assessor: 'Assessors',
    admin: 'Platform Administrators'
  };
  return roleNames[role];
};

// Helper function to get announcement type styling
export const getAnnouncementTypeStyle = (type: AnnouncementType) => {
  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'text-blue-600'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: 'text-green-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: 'text-yellow-600'
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: 'text-red-600'
    }
  };
  return styles[type];
};

export type CreateAnnouncementData = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementData = z.infer<typeof UpdateAnnouncementSchema>;
export type NotificationPreferencesData = z.infer<typeof NotificationPreferencesSchema>;