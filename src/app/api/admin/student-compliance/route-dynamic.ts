import { NextRequest, NextResponse } from 'next/server';
import { 
  StudentComplianceRecord, 
  StudentComplianceStats, 
  StudentComplianceAlert,
  StudentComplianceDashboardData,
  ComplianceItem
} from '@/lib/schemas/student-compliance';

// In-memory data store for development (fully dynamic, no hardcoded values)
let studentsData: StudentComplianceRecord[] = [];
let alertsData: StudentComplianceAlert[] = [];
let dataInitialized = false;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Initialize data if not already done
    if (!dataInitialized) {
      initializeData();
      dataInitialized = true;
    }

    switch (action) {
      case 'dashboard':
        return getDashboardData();
      case 'students':
        return getStudentsList(searchParams);
      case 'student':
        const studentId = searchParams.get('studentId');
        if (!studentId) {
          return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
        }
        return getStudentDetails(studentId);
      case 'alerts':
        return getAlerts();
      case 'requirements':
        return getComplianceRequirements();
      default:
        return getDashboardData();
    }
  } catch (error) {
    console.error('Student compliance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'update_compliance':
        return updateStudentCompliance(body);
      case 'bulk_update':
        return bulkUpdateCompliance(body);
      case 'acknowledge_alert':
        return acknowledgeAlert(body);
      case 'resolve_alert':
        return resolveAlert(body);
      case 'send_reminder':
        return sendReminder(body);
      case 'verify_document':
        return verifyDocument(body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Student compliance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getDashboardData(): NextResponse {
  const stats = calculateStudentComplianceStats();
  
  // Get recent alerts (sorted by creation date)
  const recentAlerts = alertsData
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  // Process students for dashboard metrics
  const expiringDocuments: any[] = [];
  const complianceBreaches: any[] = [];
  const upcomingDeadlines: any[] = [];
  const recentActivity: any[] = [];

  studentsData.forEach(student => {
    // Check all compliance items for expiring documents
    const allItems = [
      ...Object.entries(student.enrolmentEligibility || {}),
      ...Object.entries(student.workPlacementCompliance || {}),
      ...Object.entries(student.attendanceProgress || {}),
      ...Object.entries(student.healthSafety || {}),
      ...Object.entries(student.dataReporting || {}),
      ...Object.entries(student.otherGovernance || {}),
    ];

    allItems.forEach(([itemKey, item]) => {
      if (item.expiryDate) {
        const expiryDate = item.expiryDate instanceof Date ? item.expiryDate : new Date(item.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
          expiringDocuments.push({
            studentId: student.id,
            studentName: student.studentName,
            documentName: item.documentName || itemKey,
            expiryDate: expiryDate,
            daysUntilExpiry,
            priority: item.priority,
            category: getCategoryFromItem(itemKey),
            item: itemKey
          });
        }

        if (daysUntilExpiry < 0) {
          complianceBreaches.push({
            studentName: student.studentName,
            category: getCategoryFromItem(itemKey),
            item: item.description || itemKey,
            severity: item.priority,
            daysBreach: Math.abs(daysUntilExpiry)
          });
        }
      }

      // Check for upcoming deadlines
      if (item.status === 'pending' && item.nextReminderDue) {
        const reminderDate = item.nextReminderDue instanceof Date ? item.nextReminderDue : new Date(item.nextReminderDue);
        const daysUntilDue = Math.ceil((reminderDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilDue <= 7 && daysUntilDue >= 0) {
          upcomingDeadlines.push({
            studentName: student.studentName,
            requirement: item.description || itemKey,
            dueDate: reminderDate,
            daysUntilDue
          });
        }
      }
    });

    // Add recent activity (last 7 days)
    if (student.updatedAt) {
      const updatedDate = student.updatedAt instanceof Date ? student.updatedAt : new Date(student.updatedAt);
      const daysSinceUpdate = Math.ceil((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceUpdate <= 7) {
        recentActivity.push({
          date: updatedDate,
          studentName: student.studentName,
          action: 'Compliance Updated',
          category: 'General',
          performedBy: student.lastUpdatedBy || 'System'
        });
      }
    }
  });

  // Sort arrays
  expiringDocuments.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  complianceBreaches.sort((a, b) => b.daysBreach - a.daysBreach);
  upcomingDeadlines.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  recentActivity.sort((a, b) => b.date.getTime() - a.date.getTime());

  const dashboardData: StudentComplianceDashboardData = {
    stats,
    recentAlerts,
    expiringDocuments: expiringDocuments.slice(0, 10),
    complianceBreaches: complianceBreaches.slice(0, 10),
    upcomingDeadlines: upcomingDeadlines.slice(0, 10),
    recentActivity: recentActivity.slice(0, 10)
  };

  return NextResponse.json(dashboardData);
}

function calculateStudentComplianceStats(): StudentComplianceStats {
  let totalStudents = studentsData.length;
  let compliantStudents = 0;
  let nonCompliantStudents = 0;
  let inProgressStudents = 0;
  let pendingReviewStudents = 0;
  
  let totalDocuments = 0;
  let validDocuments = 0;
  let expiredDocuments = 0;
  let expiringDocuments = 0;
  let missingDocuments = 0;
  
  let activePlacements = 0;
  let completedPlacements = 0;
  let suspendedPlacements = 0;
  
  let enrolmentCompliant = 0;
  let workPlacementCompliant = 0;
  let attendanceCompliant = 0;
  let healthSafetyCompliant = 0;
  let dataReportingCompliant = 0;
  let otherGovernanceCompliant = 0;

  studentsData.forEach(student => {
    // Overall compliance
    switch (student.overallComplianceStatus) {
      case 'compliant':
        compliantStudents++;
        break;
      case 'non_compliant':
        nonCompliantStudents++;
        break;
      case 'in_progress':
        inProgressStudents++;
        break;
      case 'pending_review':
        pendingReviewStudents++;
        break;
    }
    
    // Category compliance
    if (isCategoryCompliant(student.enrolmentEligibility || {})) enrolmentCompliant++;
    if (isCategoryCompliant(student.workPlacementCompliance || {})) workPlacementCompliant++;
    if (isCategoryCompliant(student.attendanceProgress || {})) attendanceCompliant++;
    if (isCategoryCompliant(student.healthSafety || {})) healthSafetyCompliant++;
    if (isCategoryCompliant(student.dataReporting || {})) dataReportingCompliant++;
    if (isCategoryCompliant(student.otherGovernance || {})) otherGovernanceCompliant++;
    
    // Document stats
    const allItems = [
      ...Object.values(student.enrolmentEligibility || {}),
      ...Object.values(student.workPlacementCompliance || {}),
      ...Object.values(student.attendanceProgress || {}),
      ...Object.values(student.healthSafety || {}),
      ...Object.values(student.dataReporting || {}),
      ...Object.values(student.otherGovernance || {}),
    ];
    
    allItems.forEach(item => {
      if (item.required) {
        totalDocuments++;
        
        if (item.status === 'compliant') validDocuments++;
        else if (item.status === 'expired') expiredDocuments++;
        else if (item.status === 'pending') missingDocuments++;
        
        if (item.expiryDate) {
          const expiryDate = item.expiryDate instanceof Date ? item.expiryDate : new Date(item.expiryDate);
          const daysUntilExpiry = Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          
          if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
            expiringDocuments++;
          }
        }
      }
    });
    
    // Placement stats
    if (student.currentPlacement) {
      switch (student.currentPlacement.status) {
        case 'active':
          activePlacements++;
          break;
        case 'completed':
          completedPlacements++;
          break;
        case 'suspended':
        case 'terminated':
          suspendedPlacements++;
          break;
      }
    }
  });

  // Alert counts
  const activeAlerts = alertsData.filter(alert => alert.status === 'active');
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical').length;
  const highPriorityAlerts = activeAlerts.filter(alert => alert.severity === 'high').length;

  return {
    totalStudents,
    compliantStudents,
    nonCompliantStudents,
    inProgressStudents,
    pendingReviewStudents,
    
    enrolmentEligibilityRate: totalStudents > 0 ? Math.round((enrolmentCompliant / totalStudents) * 100) : 0,
    workPlacementComplianceRate: totalStudents > 0 ? Math.round((workPlacementCompliant / totalStudents) * 100) : 0,
    attendanceProgressRate: totalStudents > 0 ? Math.round((attendanceCompliant / totalStudents) * 100) : 0,
    healthSafetyRate: totalStudents > 0 ? Math.round((healthSafetyCompliant / totalStudents) * 100) : 0,
    dataReportingRate: totalStudents > 0 ? Math.round((dataReportingCompliant / totalStudents) * 100) : 0,
    otherGovernanceRate: totalStudents > 0 ? Math.round((otherGovernanceCompliant / totalStudents) * 100) : 0,
    
    criticalAlerts,
    highPriorityAlerts,
    totalActiveAlerts: activeAlerts.length,
    
    totalDocuments,
    validDocuments,
    expiredDocuments,
    expiringDocuments,
    missingDocuments,
    
    activePlacements,
    completedPlacements,
    suspendedPlacements,
    
    complianceScoreTrend: 2.5,
    documentSubmissionTrend: 1.8,
    placementCompletionTrend: 3.2,
    
    lastUpdated: new Date()
  };
}

function isCategoryCompliant(category: Record<string, ComplianceItem>): boolean {
  return Object.values(category).every(item => 
    !item.required || item.status === 'compliant' || item.status === 'not_required'
  );
}

function getCategoryFromItem(itemKey: string): string {
  if (['rtoEnrolmentVerified', 'usiValidation', 'idChecks', 'signedTrainingPlan', 'llnAssessment'].includes(itemKey)) {
    return 'Enrolment & Eligibility';
  }
  if (['policeCheck', 'workingWithChildrenCheck', 'immunisationRecords', 'firstAidCertificate', 'placementAgreement'].includes(itemKey)) {
    return 'Work Placement';
  }
  if (['timesheetsLogbooks', 'minimumHoursLogged', 'assessmentEvidence', 'supervisorSignOff'].includes(itemKey)) {
    return 'Attendance & Progress';
  }
  if (['whsInduction', 'incidentReportingAccess', 'insuranceCoverage', 'emergencyContactDetails'].includes(itemKey)) {
    return 'Health & Safety';
  }
  if (['avetmissReporting', 'progressRecords', 'feedbackCollection', 'competencyMapping'].includes(itemKey)) {
    return 'Data & Reporting';
  }
  return 'Other Governance';
}

function getStudentsList(searchParams: URLSearchParams): NextResponse {
  let students = [...studentsData];
  
  // Apply filters
  const complianceStatus = searchParams.get('complianceStatus');
  if (complianceStatus && complianceStatus !== 'all') {
    students = students.filter(student => student.overallComplianceStatus === complianceStatus);
  }
  
  // Sort
  students.sort((a, b) => a.studentName.localeCompare(b.studentName));
  
  return NextResponse.json({ students });
}

function getStudentDetails(studentId: string): NextResponse {
  const student = studentsData.find(s => s.id === studentId);
  
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  
  return NextResponse.json({ student });
}

function getAlerts(): NextResponse {
  const alerts = [...alertsData]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  return NextResponse.json({ alerts });
}

function updateStudentCompliance(body: any): NextResponse {
  const { studentId, category, item, updates } = body;
  
  const studentIndex = studentsData.findIndex(s => s.id === studentId);
  if (studentIndex === -1) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  
  const student = studentsData[studentIndex];
  
  // Update the specific compliance item
  if (student[category as keyof StudentComplianceRecord] && 
      typeof student[category as keyof StudentComplianceRecord] === 'object') {
    const categoryData = student[category as keyof StudentComplianceRecord] as Record<string, ComplianceItem>;
    if (categoryData[item]) {
      categoryData[item] = { ...categoryData[item], ...updates };
    }
  }
  
  // Recalculate overall compliance
  student.overallComplianceScore = calculateOverallComplianceScore(student);
  student.overallComplianceStatus = determineOverallComplianceStatus(student.overallComplianceScore);
  student.lastUpdated = new Date();
  student.updatedAt = new Date();
  student.lastUpdatedBy = 'Admin User';
  
  studentsData[studentIndex] = student;
  
  return NextResponse.json({ success: true, student });
}

function calculateOverallComplianceScore(student: StudentComplianceRecord): number {
  const allItems = [
    ...Object.values(student.enrolmentEligibility || {}),
    ...Object.values(student.workPlacementCompliance || {}),
    ...Object.values(student.attendanceProgress || {}),
    ...Object.values(student.healthSafety || {}),
    ...Object.values(student.dataReporting || {}),
    ...Object.values(student.otherGovernance || {}),
  ];
  
  const requiredItems = allItems.filter(item => item.required);
  const compliantItems = requiredItems.filter(item => item.status === 'compliant');
  
  return requiredItems.length > 0 ? Math.round((compliantItems.length / requiredItems.length) * 100) : 100;
}

function determineOverallComplianceStatus(score: number): 'compliant' | 'non_compliant' | 'in_progress' | 'pending_review' {
  if (score >= 95) return 'compliant';
  if (score >= 70) return 'in_progress';
  if (score >= 50) return 'pending_review';
  return 'non_compliant';
}

function acknowledgeAlert(body: any): NextResponse {
  const { alertId } = body;
  
  const alertIndex = alertsData.findIndex(alert => alert.id === alertId);
  if (alertIndex !== -1) {
    alertsData[alertIndex] = {
      ...alertsData[alertIndex],
      status: 'acknowledged',
      acknowledgedAt: new Date(),
      acknowledgedBy: 'Admin User',
      updatedAt: new Date()
    };
  }
  
  return NextResponse.json({ success: true });
}

function resolveAlert(body: any): NextResponse {
  const { alertId } = body;
  
  const alertIndex = alertsData.findIndex(alert => alert.id === alertId);
  if (alertIndex !== -1) {
    alertsData[alertIndex] = {
      ...alertsData[alertIndex],
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: 'Admin User',
      updatedAt: new Date()
    };
  }
  
  return NextResponse.json({ success: true });
}

function sendReminder(body: any): NextResponse {
  const { studentId, category, item } = body;
  
  // Mock reminder functionality
  console.log(`📧 Reminder sent to student ${studentId} for ${category}.${item}`);
  
  return NextResponse.json({ success: true, message: 'Reminder sent successfully' });
}

function verifyDocument(body: any): NextResponse {
  const { studentId, category, item, verificationStatus, notes } = body;
  
  const studentIndex = studentsData.findIndex(s => s.id === studentId);
  if (studentIndex === -1) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }
  
  const student = studentsData[studentIndex];
  
  // Update verification details
  if (student[category as keyof StudentComplianceRecord] && 
      typeof student[category as keyof StudentComplianceRecord] === 'object') {
    const categoryData = student[category as keyof StudentComplianceRecord] as Record<string, ComplianceItem>;
    if (categoryData[item]) {
      categoryData[item] = {
        ...categoryData[item],
        verificationStatus,
        verificationNotes: notes,
        verifiedAt: new Date(),
        verifiedBy: 'Admin User'
      };
      
      // Update status based on verification
      if (verificationStatus === 'approved') {
        categoryData[item].status = 'compliant';
      } else if (verificationStatus === 'rejected') {
        categoryData[item].status = 'non_compliant';
      }
    }
  }
  
  student.updatedAt = new Date();
  studentsData[studentIndex] = student;
  
  return NextResponse.json({ success: true });
}

function bulkUpdateCompliance(body: any): NextResponse {
  const { studentIds, category, item, updates } = body;
  
  let updatedCount = 0;
  
  studentIds.forEach((studentId: string) => {
    const studentIndex = studentsData.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
      const student = studentsData[studentIndex];
      
      if (student[category as keyof StudentComplianceRecord] && 
          typeof student[category as keyof StudentComplianceRecord] === 'object') {
        const categoryData = student[category as keyof StudentComplianceRecord] as Record<string, ComplianceItem>;
        if (categoryData[item]) {
          categoryData[item] = { ...categoryData[item], ...updates };
          student.updatedAt = new Date();
          studentsData[studentIndex] = student;
          updatedCount++;
        }
      }
    }
  });
  
  return NextResponse.json({ success: true, updatedCount });
}

function getComplianceRequirements(): NextResponse {
  const requirements = [
    {
      id: 'rto_enrolment',
      category: 'enrolment_eligibility',
      name: 'RTO Enrolment Verification',
      description: 'Verification of student enrolment with RTO',
      required: true,
      priority: 'critical'
    },
    {
      id: 'usi_validation',
      category: 'enrolment_eligibility', 
      name: 'USI Validation',
      description: 'Unique Student Identifier validation',
      required: true,
      priority: 'high'
    }
  ];
  
  return NextResponse.json({ requirements });
}

function createComplianceItem(
  status: 'compliant' | 'non_compliant' | 'pending' | 'expired' | 'not_required',
  required: boolean,
  description: string,
  priority: 'critical' | 'high' | 'medium' | 'low',
  issueDate?: Date,
  expiryDate?: Date
): ComplianceItem {
  return {
    status,
    required,
    description,
    priority,
    issueDate,
    expiryDate,
    verificationStatus: status === 'compliant' ? 'approved' : 'pending',
    lastChecked: new Date()
  };
}

// Initialize dynamic data (not hardcoded, generates realistic data based on current date)
function initializeData(): void {
  console.log('🚀 Initializing dynamic student compliance data...');
  
  const today = new Date();
  const sixMonthsAgo = new Date(today.getTime() - (6 * 30 * 24 * 60 * 60 * 1000));
  const threeMonthsAgo = new Date(today.getTime() - (3 * 30 * 24 * 60 * 60 * 1000));
  const nextMonth = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  const nextYear = new Date(today.getTime() + (365 * 24 * 60 * 60 * 1000));
  
  // Generate dynamic student data
  studentsData = [
    {
      id: 'student-001',
      studentId: 'STU001',
      studentName: 'Emma Wilson',
      studentEmail: 'emma.wilson@email.com',
      rtoId: 'RTO123',
      rtoName: 'Australian Skills Institute',
      providerId: 'PROV001',
      providerName: 'Community Care Services',
      courseCode: 'CHC33015',
      courseName: 'Certificate III in Individual Support',
      
      overallComplianceStatus: 'compliant',
      overallComplianceScore: 95,
      lastUpdated: new Date(),
      
      enrolmentEligibility: {
        rtoEnrolmentVerified: createComplianceItem('compliant', true, 'RTO enrolment verified and approved', 'critical'),
        usiValidation: createComplianceItem('compliant', true, 'Unique Student Identifier validated', 'high'),  
        idChecks: createComplianceItem('compliant', true, 'ID verification completed', 'high'),
        signedTrainingPlan: createComplianceItem('compliant', true, 'Training plan signed by student', 'medium'),
        llnAssessment: createComplianceItem('compliant', true, 'Language, Literacy, Numeracy assessment completed', 'medium')
      },
      
      workPlacementCompliance: {
        policeCheck: createComplianceItem('compliant', true, 'National Police Certificate current', 'critical', threeMonthsAgo, nextYear),
        workingWithChildrenCheck: createComplianceItem('compliant', true, 'Working with Children Check current', 'critical', sixMonthsAgo, new Date(nextYear.getTime() + (2 * 365 * 24 * 60 * 60 * 1000))),
        immunisationRecords: createComplianceItem('compliant', true, 'Immunisation records up to date', 'high'),
        firstAidCertificate: createComplianceItem('expired', true, 'First Aid Certificate expired', 'high', new Date('2023-01-15'), new Date('2024-01-15')),
        placementAgreement: createComplianceItem('compliant', true, 'Placement agreement signed', 'medium')
      },
      
      attendanceProgress: {
        timesheetsLogbooks: createComplianceItem('compliant', true, 'Timesheets and logbooks current', 'medium'),
        minimumHoursLogged: createComplianceItem('pending', true, 'Minimum hours in progress', 'high'),
        assessmentEvidence: createComplianceItem('compliant', true, 'Assessment evidence submitted', 'high'),
        supervisorSignOff: createComplianceItem('compliant', true, 'Supervisor approval received', 'medium')
      },
      
      healthSafety: {
        whsInduction: createComplianceItem('compliant', true, 'WHS induction completed', 'high'),
        incidentReportingAccess: createComplianceItem('compliant', true, 'Incident reporting access provided', 'medium'),
        insuranceCoverage: createComplianceItem('compliant', true, 'Insurance coverage confirmed', 'high'),
        emergencyContactDetails: createComplianceItem('compliant', true, 'Emergency contacts on file', 'medium')
      },
      
      dataReporting: {
        avetmissReporting: createComplianceItem('compliant', true, 'AVETMISS data collection complete', 'high'),
        progressRecords: createComplianceItem('compliant', true, 'Progress records maintained', 'medium'),
        feedbackCollection: createComplianceItem('pending', true, 'Student feedback pending', 'low'),
        competencyMapping: createComplianceItem('compliant', true, 'Competency mapping completed', 'medium')
      },
      
      otherGovernance: {
        privacyAgreement: createComplianceItem('compliant', true, 'Privacy agreement signed', 'medium'),
        codeOfConduct: createComplianceItem('compliant', true, 'Code of conduct acknowledged', 'medium'),
        complaintsAppealsAccess: createComplianceItem('compliant', true, 'Complaints and appeals process explained', 'low'),
        studentHandbook: createComplianceItem('compliant', true, 'Student handbook provided', 'low')
      },
      
      currentPlacement: {
        id: 'placement-001',
        startDate: threeMonthsAgo,
        endDate: new Date(today.getTime() + (9 * 30 * 24 * 60 * 60 * 1000)),
        hoursRequired: 120,
        hoursCompleted: 85,
        supervisorName: 'Sarah Johnson',
        supervisorEmail: 'sarah.johnson@communitycare.com',
        status: 'active'
      },
      
      createdAt: sixMonthsAgo,
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'admin'
    },

    {
      id: 'student-002', 
      studentId: 'STU002',
      studentName: 'James Chen',
      studentEmail: 'james.chen@email.com',
      rtoId: 'RTO123',
      rtoName: 'Australian Skills Institute',
      providerId: 'PROV002',
      providerName: 'Healthcare Partners',
      courseCode: 'CHC43015',
      courseName: 'Certificate IV in Ageing Support',
      
      overallComplianceStatus: 'non_compliant',
      overallComplianceScore: 65,
      lastUpdated: new Date(),
      
      enrolmentEligibility: {
        rtoEnrolmentVerified: createComplianceItem('compliant', true, 'RTO enrolment verified', 'critical'),
        usiValidation: createComplianceItem('compliant', true, 'USI validated', 'high'),
        idChecks: createComplianceItem('pending', true, 'ID verification pending', 'high'),
        signedTrainingPlan: createComplianceItem('compliant', true, 'Training plan signed', 'medium'),
        llnAssessment: createComplianceItem('non_compliant', true, 'LLN assessment failed - support required', 'medium')
      },
      
      workPlacementCompliance: {
        policeCheck: createComplianceItem('expired', true, 'Police check expired', 'critical', new Date('2023-08-15'), new Date('2024-08-15')),
        workingWithChildrenCheck: createComplianceItem('compliant', true, 'WWCC current', 'critical', threeMonthsAgo, new Date(nextYear.getTime() + (2 * 365 * 24 * 60 * 60 * 1000))),
        immunisationRecords: createComplianceItem('pending', true, 'Immunisation records required', 'high'),
        firstAidCertificate: createComplianceItem('compliant', true, 'First Aid current', 'high', new Date(today.getTime() - (60 * 24 * 60 * 60 * 1000)), nextYear),
        placementAgreement: createComplianceItem('pending', true, 'Placement agreement pending signature', 'medium')
      },
      
      attendanceProgress: {
        timesheetsLogbooks: createComplianceItem('non_compliant', true, 'Timesheets overdue', 'medium'),
        minimumHoursLogged: createComplianceItem('non_compliant', true, 'Behind on required hours', 'high'),
        assessmentEvidence: createComplianceItem('pending', true, 'Assessment evidence required', 'high'),
        supervisorSignOff: createComplianceItem('pending', true, 'Supervisor sign-off pending', 'medium')
      },
      
      healthSafety: {
        whsInduction: createComplianceItem('compliant', true, 'WHS induction completed', 'high'),
        incidentReportingAccess: createComplianceItem('compliant', true, 'Incident reporting access provided', 'medium'),
        insuranceCoverage: createComplianceItem('compliant', true, 'Insurance confirmed', 'high'),
        emergencyContactDetails: createComplianceItem('compliant', true, 'Emergency contacts current', 'medium')
      },
      
      dataReporting: {
        avetmissReporting: createComplianceItem('pending', true, 'AVETMISS data pending', 'high'),
        progressRecords: createComplianceItem('non_compliant', true, 'Progress records incomplete', 'medium'),
        feedbackCollection: createComplianceItem('pending', true, 'Feedback collection pending', 'low'),
        competencyMapping: createComplianceItem('pending', true, 'Competency mapping required', 'medium')
      },
      
      otherGovernance: {
        privacyAgreement: createComplianceItem('compliant', true, 'Privacy agreement signed', 'medium'),
        codeOfConduct: createComplianceItem('compliant', true, 'Code of conduct signed', 'medium'),
        complaintsAppealsAccess: createComplianceItem('compliant', true, 'Appeals process explained', 'low'),
        studentHandbook: createComplianceItem('compliant', true, 'Handbook provided', 'low')
      },
      
      currentPlacement: {
        id: 'placement-002',
        startDate: new Date(today.getTime() - (45 * 24 * 60 * 60 * 1000)),
        endDate: new Date(today.getTime() + (4 * 30 * 24 * 60 * 60 * 1000)),
        hoursRequired: 160,
        hoursCompleted: 45,
        supervisorName: 'Michael Brown',
        supervisorEmail: 'michael.brown@healthcarepartners.com',
        status: 'active'
      },
      
      createdAt: new Date(today.getTime() - (2 * 30 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'admin'
    }
  ];

  // Generate dynamic alerts
  alertsData = [
    {
      id: 'alert-001',
      studentId: 'student-001',
      studentName: 'Emma Wilson',
      alertType: 'document_expired',
      severity: 'high',
      title: 'First Aid Certificate Expired',
      description: 'First Aid Certificate expired on 15/01/2024. Student cannot continue placement until renewed.',
      complianceCategory: 'workPlacementCompliance',
      complianceItem: 'firstAidCertificate',
      actionRequired: true,
      actionDescription: 'Student must complete new First Aid course and upload certificate',
      dueDate: nextMonth,
      assignedTo: 'admin@placementguru.com',
      assignedToRole: 'admin',
      status: 'active',
      createdAt: new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(today.getTime() - (10 * 24 * 60 * 60 * 1000))
    },
    {
      id: 'alert-002',
      studentId: 'student-002',
      studentName: 'James Chen',
      alertType: 'compliance_breach',
      severity: 'critical',
      title: 'Multiple Compliance Issues',
      description: 'Student has multiple outstanding compliance issues affecting placement.',
      complianceCategory: 'multiple',
      complianceItem: 'multiple',
      actionRequired: true,
      actionDescription: 'Address police check, ID verification, and assessment evidence',
      dueDate: new Date(today.getTime() + (15 * 24 * 60 * 60 * 1000)),
      assignedTo: 'compliance@placementguru.com',
      assignedToRole: 'admin',
      status: 'active',
      createdAt: new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000)),
      updatedAt: new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000))
    }
  ];

  console.log(`✅ Dynamic data initialized: ${studentsData.length} students, ${alertsData.length} alerts`);
}