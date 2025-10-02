import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { config } from 'dotenv'
import path from 'path'

// Load environment variables if not in production
if (process.env.NODE_ENV !== 'production') {
  config({ path: path.resolve(process.cwd(), '.env.local') })
}

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'
  
  let serviceAccount
  try {
    serviceAccount = JSON.parse(serviceAccountString)
  } catch (error) {
    throw new Error('Invalid Firebase service account JSON. Check your FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variable.')
  }
  
  if (!serviceAccount.project_id) {
    throw new Error('Firebase service account must include project_id. Check your FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variable.')
  }
  
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id
  })
}

// Get Firestore instance
export const db = getFirestore()

// Helper functions for common operations
export const collections = {
  // Core User & Organization Collections
  users: () => db.collection('users'),
  students: () => db.collection('students'),
  rtos: () => db.collection('rtos'),
  providers: () => db.collection('providers'),
  
  // Course & Education Collections
  courses: () => db.collection('courses'),
  cohorts: () => db.collection('cohorts'),
  unitsOfCompetency: () => db.collection('unitsOfCompetency'),
  studentUnitProgress: () => db.collection('studentUnitProgress'),
  
  // Placement Collections
  placements: () => db.collection('placements'),
  placementOpportunities: () => db.collection('placementOpportunities'),
  applications: () => db.collection('applications'),
  studentPlacements: () => db.collection('studentPlacements'),
  
  // Assessment Collections
  assessments: () => db.collection('assessments'),
  supervisorEvaluations: () => db.collection('supervisorEvaluations'),
  
  // Activity & Communication Collections
  hourLogs: () => db.collection('hourLogs'),
  messages: () => db.collection('messages'),
  notifications: () => db.collection('notifications'),
  feedback: () => db.collection('feedback'),
  wellness: () => db.collection('wellness'),
  wellnessGoals: () => db.collection('wellnessGoals'),
  appointments: () => db.collection('appointments'),
  aiConversations: () => db.collection('aiConversations'),
  
  // Document & File Collections
  documents: () => db.collection('documents'),
  certificates: () => db.collection('certificates'),
  
  // System & Configuration Collections
  systemSettings: () => db.collection('systemSettings'),
  auditLogs: () => db.collection('auditLogs'),
  
  // Announcements & Notifications Collections
  announcements: () => db.collection('announcements'),
  userNotifications: () => db.collection('userNotifications'),
  fcmTokens: () => db.collection('fcmTokens'),
  notificationPreferences: () => db.collection('notificationPreferences'),
  announcementAnalytics: () => db.collection('announcementAnalytics'),
  
  // CMS & Content Collections
  cmsPages: () => db.collection('cmsPages'),
  cmsBlocks: () => db.collection('cmsBlocks'),
  testimonials: () => db.collection('testimonials'),
  features: () => db.collection('features'),
  statistics: () => db.collection('statistics'),
  faqItems: () => db.collection('faqItems'),
  
  // Partnership & Relationship Collections
  rtoProviderPartnerships: () => db.collection('rtoProviderPartnerships'),
  contracts: () => db.collection('contracts'),
  rtoUsers: () => db.collection('rtoUsers'),
  providerUsers: () => db.collection('providerUsers'),
  invitations: () => db.collection('invitations'),
  
  // Compliance & Documentation Collections
  complianceRecords: () => db.collection('complianceRecords'),
  digitalLogbooks: () => db.collection('digitalLogbooks'),
  logbookEntries: () => db.collection('logbookEntries'),
  
  // Analytics & Reporting Collections
  dashboardStats: () => db.collection('dashboardStats'),
  activityLogs: () => db.collection('activityLogs'),
  
  // Legacy/Compatibility Collections
  opportunities: () => db.collection('placementOpportunities'), // Alias for backwards compatibility
}

// Utility function to convert Firestore timestamp to Date
export function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp._seconds) return new Date(timestamp._seconds * 1000)
  return new Date(timestamp)
}

// Utility function to add timestamps to documents
export function addTimestamps(data: any) {
  const now = new Date()
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  }
}

// Utility function to update timestamp
export function updateTimestamp(data: any) {
  return {
    ...data,
    updatedAt: new Date()
  }
}