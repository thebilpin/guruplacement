// Complete PlacementGuru Database Schema
// Comprehensive schema covering all dashboard features and compliance requirements

// ========================================
// CORE USER MANAGEMENT
// ========================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  mustChangePassword: boolean;
  
  // Invitation & Access Control
  invitationStatus?: InvitationStatus;
  invitationToken?: string;
  invitationExpiresAt?: Date;
  invitedBy?: string;
  invitedAt?: Date;
  acceptedAt?: Date;
  
  // Organization Links
  rtoId?: string;
  providerId?: string;
  
  // Verification Status
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Login & Security
  lastLogin?: Date;
  passwordResetToken?: string;
  passwordResetExpiresAt?: Date;
  twoFactorEnabled: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'student' 
  | 'rto_admin' 
  | 'provider_admin' 
  | 'supervisor' 
  | 'assessor' 
  | 'platform_admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';
export type InvitationStatus = 'invited' | 'accepted' | 'declined' | 'expired';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

// ========================================
// ORGANIZATIONS
// ========================================

export interface RTO {
  id: string;
  name: string;
  code: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  
  // Business Details
  abn?: string;
  registrationNumber?: string;
  accreditationStatus: string;
  
  // Platform Status
  subscriptionPlan: string;
  isActive: boolean;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Stats
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  totalCourses: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Provider {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  
  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  
  // Business Details
  abn?: string;
  businessLicense?: string;
  industryCategory: string;
  
  // Platform Status
  isApproved: boolean;
  verificationStatus: VerificationStatus;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Stats & Metrics
  rating?: number;
  totalPlacements: number;
  activePlacements: number;
  totalSupervisors: number;
  activeSupervisors: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// CONTRACTS & PARTNERSHIPS
// ========================================

export interface Contract {
  id: string;
  rtoId: string;
  providerId: string;
  
  // Contract Details
  title: string;
  description?: string;
  contractType: ContractType;
  status: ContractStatus;
  
  // Terms
  startDate: Date;
  endDate: Date;
  maxStudents?: number;
  placementDuration?: number; // in weeks
  
  // Signatures
  signedByProvider: boolean;
  signedByRto: boolean;
  providerSignedAt?: Date;
  rtoSignedAt?: Date;
  providerSignedBy?: string;
  rtoSignedBy?: string;
  
  // Document Management
  documentUrl?: string;
  documentVersion: number;
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ContractType = 'placement_agreement' | 'assessment_agreement' | 'full_partnership' | 'mou';
export type ContractStatus = 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated';

// ========================================
// INVITATIONS SYSTEM
// ========================================

export interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  
  // Organization Context
  invitedBy: string;
  organizationId: string;
  organizationType: 'rto' | 'provider';
  
  // Invitation Details
  status: InvitationStatus;
  token: string;
  expiresAt: Date;
  sentAt: Date;
  acceptedAt?: Date;
  declinedAt?: Date;
  
  // Temporary Credentials
  tempPassword?: string;
  invitationUrl: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// COURSES & EDUCATION
// ========================================

export interface Course {
  id: string;
  rtoId: string;
  code: string;
  name: string;
  type: CourseType;
  description?: string;
  
  // Duration & Requirements
  durationWeeks?: number;
  totalPlacementHours?: number;
  theoryHours?: number;
  practicalHours?: number;
  
  // Course Details
  qualificationLevel: string;
  industry: string;
  prerequisites?: string[];
  
  // Status
  isActive: boolean;
  accreditationStatus: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type CourseType = 
  | 'certificate_i' 
  | 'certificate_ii' 
  | 'certificate_iii' 
  | 'certificate_iv' 
  | 'diploma' 
  | 'advanced_diploma' 
  | 'bachelor' 
  | 'other';

export interface UnitOfCompetency {
  id: string;
  courseId: string;
  code: string;
  name: string;
  description?: string;
  
  // Requirements
  requiredHours?: number;
  isCore: boolean;
  assessmentCriteria?: Record<string, any>;
  
  // Learning Resources
  resources?: string[];
  prerequisites?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Cohort {
  id: string;
  courseId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  
  // Capacity
  maxStudents?: number;
  currentStudents: number;
  
  // Management
  coordinatorId?: string;
  isActive: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// STUDENTS & ENROLLMENT
// ========================================

export interface Student {
  id: string;
  userId: string;
  studentId: string; // Unique student number
  rtoId: string;
  cohortId?: string;
  
  // Personal Details
  dateOfBirth?: Date;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  
  // Educational Background
  previousQualifications?: string[];
  englishLevel?: string;
  
  // Status & Progress
  status: StudentStatus;
  enrollmentDate: Date;
  expectedGraduationDate?: Date;
  actualGraduationDate?: Date;
  
  // Progress Tracking
  totalHoursRequired: number;
  totalHoursCompleted: number;
  currentPlacementId?: string;
  
  // Risk Assessment
  riskLevel: RiskLevel;
  riskFactors?: string[];
  lastRiskAssessment?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type StudentStatus = 
  | 'enrolled' 
  | 'in_placement' 
  | 'completed' 
  | 'withdrawn' 
  | 'suspended' 
  | 'deferred';

export type RiskLevel = 'low' | 'medium' | 'high';

// ========================================
// PLACEMENTS & OPPORTUNITIES
// ========================================

export interface PlacementOpportunity {
  id: string;
  providerId: string;
  supervisorId?: string;
  
  // Opportunity Details
  title: string;
  description: string;
  industry: string;
  location: string;
  
  // Requirements
  courseIds: string[]; // Courses this placement accepts
  requiredSkills?: string[];
  minimumQualifications?: string[];
  
  // Capacity & Timing
  maxStudents: number;
  currentStudents: number;
  startDate: Date;
  endDate: Date;
  hoursPerWeek: number;
  totalHours: number;
  
  // Application Management
  status: PlacementStatus;
  applicationDeadline?: Date;
  
  // Requirements
  requiresPoliceCheck: boolean;
  requiresWorkingWithChildren: boolean;
  requiresVaccination: boolean;
  requiresFirstAid: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type PlacementStatus = 
  | 'draft' 
  | 'published' 
  | 'applications_open' 
  | 'applications_closed' 
  | 'filled' 
  | 'cancelled';

export interface PlacementApplication {
  id: string;
  studentId: string;
  opportunityId: string;
  
  // Application Details
  status: ApplicationStatus;
  coverLetter?: string;
  applicationDate: Date;
  
  // Review Process
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  
  // Decision
  decisionDate?: Date;
  decisionReason?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'accepted' 
  | 'rejected' 
  | 'withdrawn';

export interface ActivePlacement {
  id: string;
  studentId: string;
  opportunityId: string;
  providerId: string;
  supervisorId?: string;
  
  // Placement Details
  status: ActivePlacementStatus;
  startDate: Date;
  endDate: Date;
  
  // Progress Tracking
  totalHoursRequired: number;
  hoursCompleted: number;
  
  // Evaluation
  midtermEvaluationDate?: Date;
  finalEvaluationDate?: Date;
  overallRating?: number;
  
  // Completion
  completedAt?: Date;
  certificateIssued: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export type ActivePlacementStatus = 
  | 'scheduled' 
  | 'in_progress' 
  | 'completed' 
  | 'terminated' 
  | 'on_hold';

// ========================================
// HOUR LOGGING & ATTENDANCE
// ========================================

export interface HourLog {
  id: string;
  studentId: string;
  placementId: string;
  supervisorId?: string;
  
  // Time Details
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakTime?: number;
  
  // Activity Description
  tasksCompleted: string;
  skillsPracticed?: string[];
  learningOutcomes?: string;
  
  // Verification
  supervisorApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  
  // Evidence & Documentation
  evidenceFiles?: string[];
  notes?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// ASSESSMENTS & EVALUATIONS
// ========================================

export interface Assessment {
  id: string;
  studentId: string;
  unitId: string;
  assessorId?: string;
  placementId?: string;
  
  // Assessment Details
  title: string;
  type: AssessmentType;
  description?: string;
  
  // Scheduling
  scheduledDate?: Date;
  dueDate?: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  
  // Results
  result: CompetencyResult;
  score?: number;
  maxScore?: number;
  feedback?: string;
  
  // Evidence & Documentation
  evidenceFiles?: string[];
  assessmentCriteria?: Record<string, any>;
  
  createdAt: Date;
  updatedAt: Date;
}

export type AssessmentType = 
  | 'formative' 
  | 'summative' 
  | 'competency' 
  | 'portfolio' 
  | 'observation' 
  | 'project';

export type CompetencyResult = 
  | 'competent' 
  | 'not_yet_competent' 
  | 'not_assessed';

export interface SupervisorEvaluation {
  id: string;
  studentId: string;
  supervisorId: string;
  placementId: string;
  
  // Evaluation Details
  evaluationType: 'midterm' | 'final' | 'weekly';
  evaluationDate: Date;
  
  // Ratings (1-5 scale)
  technicalSkills: number;
  professionalBehavior: number;
  communication: number;
  teamwork: number;
  punctuality: number;
  initiative: number;
  overallRating: number;
  
  // Feedback
  strengths: string;
  areasForImprovement: string;
  additionalComments?: string;
  
  // Recommendations
  recommendForFutureEmployment: boolean;
  recommendationComments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// COMPLIANCE & DOCUMENTATION
// ========================================

export interface ComplianceRecord {
  id: string;
  studentId: string;
  providerId?: string;
  rtoId?: string;
  
  // Record Details
  type: ComplianceType;
  title: string;
  description?: string;
  
  // Status
  status: ComplianceStatus;
  requiredBy?: Date;
  completedAt?: Date;
  expiresAt?: Date;
  
  // Documentation
  documentUrl?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  
  // Compliance Chain
  parentRecordId?: string;
  relatedRecords?: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export type ComplianceType = 
  | 'police_check' 
  | 'working_with_children' 
  | 'vaccination' 
  | 'first_aid' 
  | 'safety_induction' 
  | 'workplace_agreement' 
  | 'insurance_coverage' 
  | 'medical_clearance' 
  | 'training_record' 
  | 'audit_evidence';

export type ComplianceStatus = 
  | 'not_started' 
  | 'in_progress' 
  | 'completed' 
  | 'expired' 
  | 'rejected' 
  | 'exempted';

export interface DigitalLogbook {
  id: string;
  studentId: string;
  placementId: string;
  
  // Logbook Details
  title: string;
  description?: string;
  templateId?: string;
  
  // Progress
  totalEntries: number;
  requiredEntries: number;
  completionPercentage: number;
  
  // Status
  status: 'active' | 'completed' | 'archived';
  submittedAt?: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface LogbookEntry {
  id: string;
  logbookId: string;
  studentId: string;
  
  // Entry Details
  date: Date;
  title: string;
  content: string;
  
  // Classification
  entryType: 'daily_log' | 'learning_reflection' | 'skill_practice' | 'incident_report' | 'assessment_evidence';
  skillsAreas?: string[];
  unitCodes?: string[];
  
  // Attachments
  attachments?: string[];
  images?: string[];
  
  // Verification
  supervisorReviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewComments?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// COMMUNICATIONS & NOTIFICATIONS
// ========================================

export interface Message {
  id: string;
  senderId: string;
  
  // Recipients
  recipientIds: string[];
  recipientType: 'individual' | 'group' | 'broadcast';
  
  // Message Content
  subject?: string;
  content: string;
  messageType: MessageType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Attachments
  attachments?: string[];
  
  // Status Tracking
  sentAt: Date;
  deliveredAt?: Record<string, Date>;
  readAt?: Record<string, Date>;
  
  // Threading
  threadId?: string;
  replyToId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'direct' | 'group' | 'announcement' | 'system' | 'compliance_alert';

export interface Notification {
  id: string;
  userId: string;
  
  // Notification Details
  title: string;
  content: string;
  type: NotificationType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Action & Context
  actionUrl?: string;
  actionText?: string;
  contextId?: string;
  contextType?: string;
  
  // Status
  isRead: boolean;
  readAt?: Date;
  dismissedAt?: Date;
  
  // Scheduling
  scheduledFor?: Date;
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 
  | 'placement_application' 
  | 'placement_accepted' 
  | 'placement_rejected' 
  | 'evaluation_due' 
  | 'document_expiring' 
  | 'hours_logged' 
  | 'announcement' 
  | 'message_received' 
  | 'assessment_graded' 
  | 'compliance_reminder' 
  | 'contract_signed' 
  | 'invitation_received' 
  | 'system_maintenance';

// ========================================
// ANALYTICS & REPORTING
// ========================================

export interface DashboardStats {
  id: string;
  entityId: string; // RTO ID, Provider ID, etc.
  entityType: 'rto' | 'provider' | 'student' | 'platform';
  
  // Timestamp
  date: Date;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  // Generic Stats (JSON for flexibility)
  stats: Record<string, any>;
  
  // Common Metrics
  totalUsers?: number;
  activeUsers?: number;
  newUsers?: number;
  completions?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  
  // Activity Details
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  createdAt: Date;
}

// ========================================
// SYSTEM CONFIGURATION
// ========================================

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  
  // Organization Context
  scope: 'global' | 'rto' | 'provider';
  entityId?: string;
  
  // Metadata
  description?: string;
  isPublic: boolean;
  category?: string;
  
  updatedBy: string;
  updatedAt: Date;
  createdAt: Date;
}

// ========================================
// FILE & DOCUMENT MANAGEMENT
// ========================================

export interface Document {
  id: string;
  userId: string;
  
  // File Details
  filename: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  
  // Storage
  storageUrl: string;
  storagePath: string;
  
  // Classification
  documentType: DocumentType;
  category?: string;
  
  // Access Control
  isPublic: boolean;
  allowedRoles?: UserRole[];
  allowedUsers?: string[];
  
  // Metadata
  title?: string;
  description?: string;
  tags?: string[];
  
  // Status
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  expiresAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentType = 
  | 'resume' 
  | 'cover_letter' 
  | 'certificate' 
  | 'police_check' 
  | 'working_with_children' 
  | 'first_aid' 
  | 'vaccination' 
  | 'insurance' 
  | 'assessment_evidence' 
  | 'timesheet' 
  | 'contract' 
  | 'logbook_entry' 
  | 'evaluation_form' 
  | 'compliance_document' 
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'expired' | 'rejected';

// ========================================
// HELPER INTERFACES
// ========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  category?: string;
  tags?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}