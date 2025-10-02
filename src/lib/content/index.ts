// Content Management System
// Central export for all content modules

export { APP_CONFIG } from './app-config';
export { ADMIN_CONTENT } from './admin-content';
export { UI_CONTENT } from './ui-content';

import { ADMIN_CONTENT } from './admin-content';
import { UI_CONTENT } from './ui-content';

// Utility functions for content management
export const getContent = {
  // Get nested content with fallback
  get: (obj: any, path: string, fallback: string = '') => {
    return path.split('.').reduce((current, key) => current?.[key], obj) || fallback;
  },

  // Format dynamic content
  format: (template: string | ((value: any) => string), value?: any) => {
    if (typeof template === 'function') {
      return template(value);
    }
    return template;
  },

  // Get role display name
  getRoleDisplayName: (role: string) => {
    const roleMap: Record<string, string> = {
      admin: ADMIN_CONTENT.users.roles.admin,
      rto: ADMIN_CONTENT.users.roles.rto,
      provider: ADMIN_CONTENT.users.roles.provider,
      student: ADMIN_CONTENT.users.roles.student,
      supervisor: ADMIN_CONTENT.users.roles.supervisor,
      assessor: ADMIN_CONTENT.users.roles.assessor
    };
    return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
  },

  // Format time ago
  formatTimeAgo: (date: Date | string) => {
    if (!date) return UI_CONTENT.time.never;
    
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return UI_CONTENT.time.justNow;
    if (diffMinutes < 60) return UI_CONTENT.time.minutesAgo(diffMinutes);
    if (diffHours < 24) return UI_CONTENT.time.hoursAgo(diffHours);
    return UI_CONTENT.time.daysAgo(diffDays);
  }
};

// Type definitions for content structure
export type ContentPath = string;
export type ContentValue = string | number | boolean | ((value: any) => string);