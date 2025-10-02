// Compliance Management System Schemas
// This file defines TypeScript interfaces for the compliance system

export interface ComplianceRecord {
  id: string;
  organizationId: string; // RTO or Provider ID
  organizationType: 'rto' | 'provider' | 'student';
  organizationName: string;
  
  // Compliance Status
  overallScore: number; // 0-100
  lastAuditDate: Date;
  nextAuditDue: Date;
  status: 'compliant' | 'non_compliant' | 'under_review' | 'expired';
  
  // Document Compliance
  requiredDocuments: ComplianceDocument[];
  submittedDocuments: ComplianceDocument[];
  missingDocuments: string[];
  expiringDocuments: ExpiringDocument[];
  
  // Audit Information
  auditHistory: AuditRecord[];
  currentAuditor?: string;
  auditNotes?: string;
  
  // Risk Assessment
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastUpdatedBy: string;
}

export interface ComplianceDocument {
  id: string;
  name: string;
  type: 
    | 'insurance_certificate'
    | 'accreditation'
    | 'police_check'
    | 'working_with_children'
    | 'professional_registration'
    | 'training_certificate'
    | 'policy_document'
    | 'procedure_document'
    | 'other';
  
  // Document Status
  status: 'valid' | 'expired' | 'expiring_soon' | 'missing' | 'under_review';
  isRequired: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // File Information
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedAt?: Date;
  uploadedBy?: string;
  
  // Validity Information
  issueDate?: Date;
  expiryDate?: Date;
  validFor?: number; // days
  
  // Verification
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
}

export interface ExpiringDocument {
  documentId: string;
  documentName: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  organizationName: string;
  organizationType: 'rto' | 'provider' | 'student';
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface AuditRecord {
  id: string;
  complianceRecordId: string;
  
  // Audit Details
  auditType: 'scheduled' | 'random' | 'complaint_triggered' | 'self_assessment';
  auditDate: Date;
  auditorId: string;
  auditorName: string;
  
  // Results
  overallScore: number;
  findings: AuditFinding[];
  recommendations: string[];
  
  // Status
  status: 'in_progress' | 'completed' | 'draft' | 'published';
  completedAt?: Date;
  
  // Follow-up
  followUpRequired: boolean;
  followUpDate?: Date;
  followUpActions: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditFinding {
  id: string;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'observation';
  description: string;
  evidence?: string;
  recommendation: string;
  
  // Corrective Action
  correctiveActionRequired: boolean;
  correctiveActionDescription?: string;
  correctiveActionDueDate?: Date;
  correctiveActionStatus?: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export interface ComplianceAlert {
  id: string;
  type: 'document_expiring' | 'audit_due' | 'non_compliance' | 'missing_document' | 'high_risk';
  severity: 'critical' | 'high' | 'medium' | 'low';
  
  // Alert Details
  title: string;
  description: string;
  organizationId: string;
  organizationName: string;
  organizationType: 'rto' | 'provider' | 'student';
  
  // Action Required
  actionRequired: boolean;
  actionDescription?: string;
  dueDate?: Date;
  
  // Status
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplianceStats {
  totalOrganizations: number;
  compliantOrganizations: number;
  nonCompliantOrganizations: number;
  underReviewOrganizations: number;
  
  // By Type
  rtoStats: {
    total: number;
    compliant: number;
    averageScore: number;
  };
  providerStats: {
    total: number;
    compliant: number;
    averageScore: number;
  };
  studentStats: {
    total: number;
    compliant: number;
    averageScore: number;
  };
  
  // Documents
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  missingDocuments: number;
  
  // Alerts
  criticalAlerts: number;
  highPriorityAlerts: number;
  totalActiveAlerts: number;
  
  // Trends
  complianceScoreTrend: number; // percentage change
  documentSubmissionTrend: number;
  
  lastUpdated: Date;
}

// API Types
export interface CreateComplianceRecordRequest {
  organizationId: string;
  organizationType: 'rto' | 'provider' | 'student';
  organizationName: string;
  requiredDocuments: string[]; // Document type IDs
}

export interface UpdateComplianceRecordRequest {
  overallScore?: number;
  status?: 'compliant' | 'non_compliant' | 'under_review' | 'expired';
  auditNotes?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskFactors?: string[];
}

export interface ComplianceSearchFilters {
  organizationType?: 'rto' | 'provider' | 'student';
  status?: 'compliant' | 'non_compliant' | 'under_review' | 'expired';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  scoreRange?: { min: number; max: number };
  auditDueWithinDays?: number;
  hasExpiringDocuments?: boolean;
  searchQuery?: string;
}

export interface ComplianceDashboardData {
  stats: ComplianceStats;
  recentAudits: AuditRecord[];
  activeAlerts: ComplianceAlert[];
  expiringDocuments: ExpiringDocument[];
  topRisks: {
    organizationName: string;
    riskLevel: string;
    riskFactors: string[];
    score: number;
  }[];
  upcomingAudits: {
    organizationName: string;
    auditType: string;
    dueDate: Date;
    auditorName?: string;
  }[];
}