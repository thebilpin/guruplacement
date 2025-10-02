// Student Compliance Management System Schemas
// This defines all student compliance requirements and tracking

export interface StudentComplianceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rtoId: string;
  rtoName: string;
  providerId?: string;
  providerName?: string;
  courseCode: string;
  courseName: string;
  
  // Overall Status
  overallComplianceStatus: 'compliant' | 'non_compliant' | 'in_progress' | 'pending_review';
  overallComplianceScore: number; // 0-100
  lastUpdated: Date;
  
  // Enrolment & Eligibility
  enrolmentEligibility: {
    rtoEnrolmentVerified: ComplianceItem;
    usiValidation: ComplianceItem;
    idChecks: ComplianceItem;
    signedTrainingPlan: ComplianceItem;
    llnAssessment: ComplianceItem; // Language, Literacy, Numeracy
  };
  
  // Work Placement Compliance
  workPlacementCompliance: {
    policeCheck: ComplianceItem;
    workingWithChildrenCheck: ComplianceItem;
    immunisationRecords: ComplianceItem;
    firstAidCertificate: ComplianceItem;
    placementAgreement: ComplianceItem;
  };
  
  // Attendance & Progress
  attendanceProgress: {
    timesheetsLogbooks: ComplianceItem;
    minimumHoursLogged: ComplianceItem;
    assessmentEvidence: ComplianceItem;
    supervisorSignOff: ComplianceItem;
  };
  
  // Health & Safety
  healthSafety: {
    whsInduction: ComplianceItem;
    incidentReportingAccess: ComplianceItem;
    insuranceCoverage: ComplianceItem;
    emergencyContactDetails: ComplianceItem;
  };
  
  // Data & Reporting
  dataReporting: {
    avetmissReporting: ComplianceItem;
    progressRecords: ComplianceItem;
    feedbackCollection: ComplianceItem;
    competencyMapping: ComplianceItem;
  };
  
  // Other Governance
  otherGovernance: {
    privacyAgreement: ComplianceItem;
    codeOfConduct: ComplianceItem;
    complaintsAppealsAccess: ComplianceItem;
    studentHandbook: ComplianceItem;
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
  
  // Placement Details
  currentPlacement?: {
    id: string;
    startDate: Date;
    endDate: Date;
    hoursRequired: number;
    hoursCompleted: number;
    supervisorName: string;
    supervisorEmail: string;
    status: 'active' | 'completed' | 'suspended' | 'terminated';
  };
}

export interface ComplianceItem {
  status: 'compliant' | 'non_compliant' | 'pending' | 'expired' | 'not_required';
  required: boolean;
  description: string;
  
  // Document Details
  documentId?: string;
  documentName?: string;
  documentUrl?: string;
  uploadedAt?: Date;
  uploadedBy?: string;
  
  // Validity Details
  issueDate?: Date;
  expiryDate?: Date;
  validUntil?: Date;
  
  // Verification Details
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requires_update';
  verificationNotes?: string;
  
  // Reminder Details
  reminderSent?: Date;
  nextReminderDue?: Date;
  
  // Additional Details
  notes?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  lastChecked?: Date;
}

export interface StudentComplianceAlert {
  id: string;
  studentId: string;
  studentName: string;
  alertType: 
    | 'document_expiring'
    | 'document_expired' 
    | 'missing_document'
    | 'compliance_breach'
    | 'placement_issue'
    | 'assessment_overdue'
    | 'hours_shortage'
    | 'verification_required';
  
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  
  // Related Compliance Item
  complianceCategory: string;
  complianceItem: string;
  
  // Action Required
  actionRequired: boolean;
  actionDescription?: string;
  dueDate?: Date;
  
  // Assignment
  assignedTo?: string;
  assignedToRole?: 'admin' | 'rto' | 'provider' | 'assessor' | 'supervisor';
  
  // Status
  status: 'active' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentComplianceStats {
  totalStudents: number;
  compliantStudents: number;
  nonCompliantStudents: number;
  inProgressStudents: number;
  pendingReviewStudents: number;
  
  // By Category Compliance Rates
  enrolmentEligibilityRate: number;
  workPlacementComplianceRate: number;
  attendanceProgressRate: number;
  healthSafetyRate: number;
  dataReportingRate: number;
  otherGovernanceRate: number;
  
  // Alerts
  criticalAlerts: number;
  highPriorityAlerts: number;
  totalActiveAlerts: number;
  
  // Documents
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  missingDocuments: number;
  
  // Placements
  activePlacements: number;
  completedPlacements: number;
  suspendedPlacements: number;
  
  // Trends
  complianceScoreTrend: number;
  documentSubmissionTrend: number;
  placementCompletionTrend: number;
  
  lastUpdated: Date;
}

export interface ComplianceRequirement {
  id: string;
  category: 'enrolment_eligibility' | 'work_placement' | 'attendance_progress' | 'health_safety' | 'data_reporting' | 'other_governance';
  name: string;
  description: string;
  required: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Validity Settings
  hasExpiry: boolean;
  validityPeriod?: number; // days
  reminderDays?: number; // days before expiry
  
  // Course/Industry Specific
  applicableCourses?: string[];
  applicableIndustries?: string[];
  
  // Document Requirements
  documentTypes: string[];
  acceptedFormats: string[];
  maxFileSize: number; // MB
  
  // Verification Requirements
  requiresVerification: boolean;
  verificationRole?: 'admin' | 'rto' | 'provider' | 'assessor' | 'supervisor';
  
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface StudentComplianceDashboardData {
  stats: StudentComplianceStats;
  recentAlerts: StudentComplianceAlert[];
  expiringDocuments: {
    studentName: string;
    documentName: string;
    expiryDate: Date;
    daysUntilExpiry: number;
    priority: string;
  }[];
  complianceBreaches: {
    studentName: string;
    category: string;
    item: string;
    severity: string;
    daysBreach: number;
  }[];
  upcomingDeadlines: {
    studentName: string;
    requirement: string;
    dueDate: Date;
    daysUntilDue: number;
  }[];
  recentActivity: {
    date: Date;
    studentName: string;
    action: string;
    category: string;
    performedBy: string;
  }[];
}

export interface UpdateStudentComplianceRequest {
  studentId: string;
  category: string;
  item: string;
  updates: Partial<ComplianceItem>;
}

export interface BulkComplianceUpdateRequest {
  studentIds: string[];
  category: string;
  item: string;
  updates: Partial<ComplianceItem>;
}

export interface StudentComplianceSearchFilters {
  complianceStatus?: 'compliant' | 'non_compliant' | 'in_progress' | 'pending_review';
  rtoId?: string;
  providerId?: string;
  courseCode?: string;
  placementStatus?: 'active' | 'completed' | 'suspended' | 'terminated';
  hasActiveAlerts?: boolean;
  hasExpiringDocuments?: boolean;
  searchQuery?: string;
  sortBy?: 'name' | 'compliance_score' | 'last_updated' | 'alerts_count';
  sortOrder?: 'asc' | 'desc';
}