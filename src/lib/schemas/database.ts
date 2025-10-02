// PlacementGuru Database Types
// TypeScript interfaces matching the PostgreSQL database schema

// ========================================
// ENUMS
// ========================================

export type UserRole = 
  | 'student'
  | 'rto_admin'
  | 'provider_admin'
  | 'supervisor'
  | 'assessor'
  | 'platform_admin';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export type CourseType = 
  | 'certificate_i'
  | 'certificate_ii'
  | 'certificate_iii'
  | 'certificate_iv'
  | 'diploma'
  | 'advanced_diploma'
  | 'bachelor'
  | 'other';

export type StudentStatus = 
  | 'enrolled'
  | 'in_placement'
  | 'completed'
  | 'withdrawn'
  | 'suspended';

export type PlacementStatus = 
  | 'draft'
  | 'published'
  | 'applications_open'
  | 'applications_closed'
  | 'filled'
  | 'cancelled';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type ActivePlacementStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'terminated'
  | 'on_hold';

export type AssessmentType = 
  | 'formative'
  | 'summative'
  | 'competency'
  | 'portfolio';

export type CompetencyResult = 
  | 'competent'
  | 'not_yet_competent'
  | 'not_assessed';

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
  | 'other';

export type DocumentStatus = 'pending' | 'verified' | 'expired' | 'rejected';

export type MessageType = 'direct' | 'group' | 'announcement' | 'system';

export type MessageStatus = 'sent' | 'delivered' | 'read';

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
  | 'compliance_reminder';

// ========================================
// CORE ENTITIES
// ========================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar_url?: string;
  role: UserRole;
  status: UserStatus;
  email_verified: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserSession {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
}

export interface RTO {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  subscription_plan: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PlacementProvider {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  logo_url?: string;
  website?: string;
  phone?: string;
  email?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country: string;
  rating?: number;
  total_placements: number;
  is_approved: boolean;
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RTOProviderPartnership {
  id: string;
  rto_id: string;
  provider_id: string;
  status: string;
  partnership_start?: Date;
  partnership_end?: Date;
  created_at: Date;
}

export interface RTOUser {
  id: string;
  user_id: string;
  rto_id: string;
  position?: string;
  permissions?: Record<string, any>;
  is_primary: boolean;
  created_at: Date;
}

export interface ProviderUser {
  id: string;
  user_id: string;
  provider_id: string;
  position?: string;
  permissions?: Record<string, any>;
  is_primary: boolean;
  created_at: Date;
}

// ========================================
// EDUCATION SYSTEM
// ========================================

export interface Course {
  id: string;
  rto_id: string;
  code: string;
  name: string;
  type: CourseType;
  description?: string;
  duration_weeks?: number;
  total_placement_hours?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UnitOfCompetency {
  id: string;
  course_id: string;
  code: string;
  name: string;
  description?: string;
  required_hours?: number;
  is_core: boolean;
  assessment_criteria?: Record<string, any>;
  created_at: Date;
}

export interface Cohort {
  id: string;
  course_id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  max_students?: number;
  current_students: number;
  is_active: boolean;
  created_at: Date;
}

export interface Student {
  id: string;
  user_id: string;
  student_id: string;
  rto_id: string;
  cohort_id: string;
  status: StudentStatus;
  enrollment_date: Date;
  expected_completion_date?: Date;
  actual_completion_date?: Date;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  dietary_requirements?: string;
  medical_conditions?: string;
  accessibility_needs?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentUnitProgress {
  id: string;
  student_id: string;
  unit_id: string;
  status: string;
  hours_completed: number;
  hours_required: number;
  completion_date?: Date;
  created_at: Date;
  updated_at: Date;
}

// ========================================
// PLACEMENT SYSTEM
// ========================================

export interface PlacementOpportunity {
  id: string;
  provider_id: string;
  title: string;
  description?: string;
  industry?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_postcode?: string;
  required_hours: number;
  max_students: number;
  application_deadline?: Date;
  placement_start_date?: Date;
  placement_end_date?: Date;
  requirements?: string;
  benefits?: string;
  hourly_rate?: number;
  is_paid: boolean;
  status: PlacementStatus;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface PlacementCourseMatch {
  id: string;
  placement_id: string;
  course_id: string;
  match_percentage?: number;
  created_at: Date;
}

export interface PlacementApplication {
  id: string;
  student_id: string;
  placement_id: string;
  status: ApplicationStatus;
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string[];
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface StudentPlacement {
  id: string;
  student_id: string;
  placement_id: string;
  application_id: string;
  supervisor_id?: string;
  assessor_id?: string;
  status: ActivePlacementStatus;
  start_date: Date;
  end_date: Date;
  total_hours_required: number;
  total_hours_completed: number;
  current_progress: number;
  risk_level: string;
  risk_factors?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PlacementHourLog {
  id: string;
  placement_id: string;
  log_date: Date;
  hours_worked: number;
  activities_performed?: string;
  reflection_notes?: string;
  supervisor_verified: boolean;
  supervisor_notes?: string;
  verified_at?: Date;
  verified_by?: string;
  created_at: Date;
  updated_at: Date;
}

// ========================================
// ASSESSMENT SYSTEM
// ========================================

export interface Assessment {
  id: string;
  student_id: string;
  unit_id: string;
  placement_id?: string;
  assessor_id: string;
  assessment_type: AssessmentType;
  result: CompetencyResult;
  feedback?: string;
  assessment_date?: Date;
  due_date?: Date;
  evidence_documents?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface SupervisorEvaluation {
  id: string;
  placement_id: string;
  supervisor_id: string;
  evaluation_period: string;
  communication_rating?: number;
  technical_skills_rating?: number;
  professionalism_rating?: number;
  initiative_rating?: number;
  overall_rating?: number;
  strengths?: string;
  areas_for_improvement?: string;
  additional_comments?: string;
  evaluation_date: Date;
  created_at: Date;
}

export interface PlacementFeedback {
  id: string;
  placement_id: string;
  overall_rating?: number;
  supervisor_rating?: number;
  learning_opportunities_rating?: number;
  workplace_culture_rating?: number;
  support_rating?: number;
  would_recommend?: boolean;
  positive_aspects?: string;
  improvement_suggestions?: string;
  additional_comments?: string;
  feedback_date: Date;
  created_at: Date;
}

// ========================================
// DOCUMENT MANAGEMENT
// ========================================

export interface Document {
  id: string;
  user_id: string;
  student_id?: string;
  document_type: DocumentType;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size?: number;
  mime_type?: string;
  status: DocumentStatus;
  expiry_date?: Date;
  verified_by?: string;
  verified_at?: Date;
  verification_notes?: string;
  created_at: Date;
  updated_at: Date;
}

// ========================================
// COMMUNICATION SYSTEM
// ========================================

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  subject?: string;
  content: string;
  message_type: MessageType;
  parent_message_id?: string;
  placement_id?: string;
  status: MessageStatus;
  read_at?: Date;
  created_at: Date;
}

export interface MessageGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  rto_id?: string;
  cohort_id?: string;
  is_active: boolean;
  created_at: Date;
}

export interface MessageGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  joined_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  content?: string;
  related_id?: string;
  is_read: boolean;
  read_at?: Date;
  expires_at?: Date;
  created_at: Date;
}

// ========================================
// ANALYTICS & REPORTING
// ========================================

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

export interface PlacementMetrics {
  id: string;
  placement_id: string;
  completion_rate?: number;
  satisfaction_score?: number;
  competency_achievement_rate?: number;
  time_to_completion_days?: number;
  risk_incidents: number;
  calculated_at: Date;
}

export interface ProviderPerformance {
  id: string;
  provider_id: string;
  period_start: Date;
  period_end: Date;
  total_placements: number;
  successful_completions: number;
  average_satisfaction_rating?: number;
  response_time_hours?: number;
  calculated_at: Date;
}

// ========================================
// SYSTEM CONFIGURATION
// ========================================

export interface SystemSetting {
  id: string;
  key: string;
  value: Record<string, any>;
  description?: string;
  is_public: boolean;
  updated_by: string;
  updated_at: Date;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// ========================================
// VIEW TYPES (for dashboard queries)
// ========================================

export interface StudentDashboardView {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  student_number: string;
  rto_name: string;
  course_name: string;
  cohort_name: string;
  student_status: StudentStatus;
  current_placement_progress: number;
  placement_status?: ActivePlacementStatus;
  current_provider?: string;
  total_documents: number;
  verified_documents: number;
}

export interface RTODashboardView {
  rto_id: string;
  rto_name: string;
  total_students: number;
  students_in_placement: number;
  students_completed: number;
  active_placements: number;
  partner_providers: number;
  average_placement_rating?: number;
}

export interface ProviderPerformanceView {
  provider_id: string;
  provider_name: string;
  industry?: string;
  total_placements: number;
  completed_placements: number;
  average_rating?: number;
  supervisor_rating?: number;
  active_opportunities: number;
}

// ========================================
// API REQUEST/RESPONSE TYPES
// ========================================

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
  expires_at: Date;
}

export interface CreatePlacementRequest {
  title: string;
  description?: string;
  industry?: string;
  location_address?: string;
  location_city?: string;
  location_state?: string;
  location_postcode?: string;
  required_hours: number;
  max_students?: number;
  application_deadline?: Date;
  placement_start_date?: Date;
  placement_end_date?: Date;
  requirements?: string;
  benefits?: string;
  hourly_rate?: number;
  is_paid?: boolean;
}

export interface CreateApplicationRequest {
  placement_id: string;
  cover_letter?: string;
  resume_url?: string;
  additional_documents?: string[];
}

export interface LogHoursRequest {
  placement_id: string;
  log_date: Date;
  hours_worked: number;
  activities_performed?: string;
  reflection_notes?: string;
}

export interface CreateAssessmentRequest {
  student_id: string;
  unit_id: string;
  placement_id?: string;
  assessment_type: AssessmentType;
  result?: CompetencyResult;
  feedback?: string;
  assessment_date?: Date;
  due_date?: Date;
  evidence_documents?: string[];
}

export interface SendMessageRequest {
  recipient_id?: string;
  subject?: string;
  content: string;
  message_type?: MessageType;
  placement_id?: string;
}

// ========================================
// UTILITY TYPES
// ========================================

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface FilterParams {
  search?: string;
  status?: string;
  date_from?: Date;
  date_to?: Date;
  [key: string]: any;
}

// Error response type
export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
}

// Success response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}