import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { collections } from '@/lib/db';
import { 
  ComplianceStats, 
  ComplianceAlert, 
  AuditRecord, 
  ExpiringDocument,
  ComplianceDashboardData 
} from '@/lib/schemas/compliance';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching compliance dashboard data...');

    // Get all compliance records
    const complianceSnapshot = await collections.complianceRecords().get();
    const complianceRecords = complianceSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastAuditDate: doc.data().lastAuditDate?.toDate() || new Date(),
      nextAuditDue: doc.data().nextAuditDue?.toDate() || new Date(),
    }));

    // If no compliance records exist, create some sample data
    if (complianceRecords.length === 0) {
      console.log('📄 No compliance records found, creating sample data...');
      await createSampleComplianceData();
      // Refetch after creating sample data
      const newSnapshot = await collections.complianceRecords().get();
      complianceRecords.push(...newSnapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastAuditDate: doc.data().lastAuditDate?.toDate() || new Date(),
        nextAuditDue: doc.data().nextAuditDue?.toDate() || new Date(),
      })));
    }

    // Calculate compliance statistics
    const stats = calculateComplianceStats(complianceRecords);

    // Get recent audit records (simplified query to avoid index requirement)
    const auditSnapshot = await collections.activityLogs()
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();
    
    const recentAudits: AuditRecord[] = auditSnapshot.docs
      .filter(doc => doc.data().type === 'audit')  // Filter in memory instead
      .slice(0, 10)  // Limit to 10 after filtering
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        auditDate: doc.data().createdAt?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as AuditRecord[];

    // Get active compliance alerts
    const alertsSnapshot = await collections.activityLogs()
      .where('type', '==', 'compliance_alert')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const activeAlerts: ComplianceAlert[] = alertsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as ComplianceAlert[];

    // Find expiring documents
    const expiringDocuments = findExpiringDocuments(complianceRecords);

    // Get upcoming audits
    const upcomingAudits = getUpcomingAudits(complianceRecords);

    // Get top risk organizations
    const topRisks = getTopRiskOrganizations(complianceRecords);

    const dashboardData: ComplianceDashboardData = {
      stats,
      recentAudits,
      activeAlerts,
      expiringDocuments,
      topRisks,
      upcomingAudits
    };

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Error fetching compliance dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance data' },
      { status: 500 }
    );
  }
}

function calculateComplianceStats(complianceRecords: any[]): ComplianceStats {
  const now = new Date();
  
  const totalOrganizations = complianceRecords.length;
  const compliantOrganizations = complianceRecords.filter(r => r.status === 'compliant').length;
  const nonCompliantOrganizations = complianceRecords.filter(r => r.status === 'non_compliant').length;
  const underReviewOrganizations = complianceRecords.filter(r => r.status === 'under_review').length;

  // Calculate by organization type
  const rtoRecords = complianceRecords.filter(r => r.organizationType === 'rto');
  const providerRecords = complianceRecords.filter(r => r.organizationType === 'provider');
  const studentRecords = complianceRecords.filter(r => r.organizationType === 'student');

  const rtoStats = {
    total: rtoRecords.length,
    compliant: rtoRecords.filter(r => r.status === 'compliant').length,
    averageScore: rtoRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (rtoRecords.length || 1)
  };

  const providerStats = {
    total: providerRecords.length,
    compliant: providerRecords.filter(r => r.status === 'compliant').length,
    averageScore: providerRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (providerRecords.length || 1)
  };

  const studentStats = {
    total: studentRecords.length,
    compliant: studentRecords.filter(r => r.status === 'compliant').length,
    averageScore: studentRecords.reduce((sum, r) => sum + (r.overallScore || 0), 0) / (studentRecords.length || 1)
  };

  // Calculate document statistics
  const allDocuments = complianceRecords.flatMap(r => r.submittedDocuments || []);
  const totalDocuments = allDocuments.length;
  const validDocuments = allDocuments.filter(d => d.status === 'valid').length;
  const expiredDocuments = allDocuments.filter(d => d.status === 'expired').length;
  const expiringDocuments = allDocuments.filter(d => {
    if (!d.expiryDate) return false;
    const expiryDate = new Date(d.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }).length;

  const missingDocuments = complianceRecords.reduce((sum, r) => 
    sum + (r.missingDocuments?.length || 0), 0
  );

  return {
    totalOrganizations,
    compliantOrganizations,
    nonCompliantOrganizations,
    underReviewOrganizations,
    rtoStats,
    providerStats,
    studentStats,
    totalDocuments,
    validDocuments,
    expiredDocuments,
    expiringDocuments,
    missingDocuments,
    criticalAlerts: 0, // Will be calculated from alerts
    highPriorityAlerts: 0,
    totalActiveAlerts: 0,
    complianceScoreTrend: 0, // Calculate from historical data
    documentSubmissionTrend: 0,
    lastUpdated: new Date()
  };
}

function findExpiringDocuments(complianceRecords: any[]): ExpiringDocument[] {
  const now = new Date();
  const expiringDocs: ExpiringDocument[] = [];

  complianceRecords.forEach(record => {
    const submittedDocs = record.submittedDocuments || [];
    submittedDocs.forEach((doc: any) => {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          expiringDocs.push({
            documentId: doc.id,
            documentName: doc.name,
            expiryDate,
            daysUntilExpiry,
            organizationName: record.organizationName,
            organizationType: record.organizationType,
            priority: daysUntilExpiry <= 7 ? 'critical' : daysUntilExpiry <= 14 ? 'high' : 'medium'
          });
        }
      }
    });
  });

  return expiringDocs.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}

function getUpcomingAudits(complianceRecords: any[]) {
  const now = new Date();
  const upcoming = complianceRecords
    .filter(record => {
      if (!record.nextAuditDue) return false;
      const auditDate = new Date(record.nextAuditDue);
      const daysUntilAudit = Math.ceil((auditDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilAudit <= 90 && daysUntilAudit > 0;
    })
    .map(record => ({
      organizationName: record.organizationName,
      auditType: 'scheduled',
      dueDate: new Date(record.nextAuditDue),
      auditorName: record.currentAuditor
    }))
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return upcoming.slice(0, 10);
}

function getTopRiskOrganizations(complianceRecords: any[]) {
  return complianceRecords
    .filter(record => ['high', 'critical'].includes(record.riskLevel))
    .map(record => ({
      organizationName: record.organizationName,
      riskLevel: record.riskLevel,
      riskFactors: record.riskFactors || [],
      score: record.overallScore || 0
    }))
    .sort((a, b) => {
      // Sort by risk level first (critical > high), then by score (lower = worse)
      if (a.riskLevel === 'critical' && b.riskLevel !== 'critical') return -1;
      if (b.riskLevel === 'critical' && a.riskLevel !== 'critical') return 1;
      return a.score - b.score;
    })
    .slice(0, 10);
}

async function createSampleComplianceData() {
  console.log('🌱 Creating sample compliance data...');
  
  const sampleComplianceRecords = [
    {
      organizationId: 'rto-001',
      organizationType: 'rto',
      organizationName: 'TAFE NSW Healthcare',
      overallScore: 92,
      lastAuditDate: new Date('2024-08-15'),
      nextAuditDue: new Date('2025-02-15'),
      status: 'compliant',
      requiredDocuments: [{
        id: 'doc-001',
        name: 'RTO Registration Certificate',
        type: 'accreditation',
        status: 'valid',
        isRequired: true,
        priority: 'critical',
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2025-12-31'),
        verificationStatus: 'approved'
      }],
      submittedDocuments: [{
        id: 'doc-001',
        name: 'RTO Registration Certificate',
        type: 'accreditation',
        status: 'valid',
        isRequired: true,
        priority: 'critical',
        fileUrl: 'https://example.com/rto-cert.pdf',
        fileName: 'rto-registration-2024.pdf',
        uploadedAt: new Date('2024-01-15'),
        issueDate: new Date('2023-01-01'),
        expiryDate: new Date('2025-12-31'),
        verificationStatus: 'approved',
        verifiedAt: new Date('2024-01-16'),
        verifiedBy: 'admin@placementguru.com'
      }],
      missingDocuments: [],
      expiringDocuments: [],
      auditHistory: [],
      riskLevel: 'low',
      riskFactors: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'admin@placementguru.com'
    },
    {
      organizationId: 'provider-001',
      organizationType: 'provider',
      organizationName: 'HealthBridge Medical Center',
      overallScore: 78,
      lastAuditDate: new Date('2024-07-20'),
      nextAuditDue: new Date('2025-01-20'),
      status: 'under_review',
      requiredDocuments: [{
        id: 'doc-003',
        name: 'Healthcare Provider License',
        type: 'professional_registration',
        status: 'expiring_soon',
        isRequired: true,
        priority: 'critical',
        issueDate: new Date('2023-10-01'),
        expiryDate: new Date('2024-10-15'),
        verificationStatus: 'approved'
      }],
      submittedDocuments: [{
        id: 'doc-003',
        name: 'Healthcare Provider License',
        type: 'professional_registration',
        status: 'expiring_soon',
        isRequired: true,
        priority: 'critical',
        fileUrl: 'https://example.com/healthcare-license.pdf',
        fileName: 'healthcare-license-2023.pdf',
        uploadedAt: new Date('2023-10-05'),
        issueDate: new Date('2023-10-01'),
        expiryDate: new Date('2024-10-15'),
        verificationStatus: 'approved'
      }],
      missingDocuments: ['Updated Safety Procedures'],
      expiringDocuments: [],
      auditHistory: [],
      riskLevel: 'medium',
      riskFactors: ['Expiring license', 'Missing safety procedures'],
      createdAt: new Date('2023-09-01'),
      updatedAt: new Date(),
      createdBy: 'system',
      lastUpdatedBy: 'admin@placementguru.com'
    }
  ];

  // Add sample compliance records
  for (const record of sampleComplianceRecords) {
    await collections.complianceRecords().add(record);
  }

  // Add sample alerts
  const sampleAlerts = [
    {
      type: 'compliance_alert',
      alertType: 'document_expiring',
      severity: 'critical',
      title: 'Healthcare Provider License Expiring Soon',
      description: 'HealthBridge Medical Center\'s healthcare provider license expires in 18 days',
      organizationId: 'provider-001',
      organizationName: 'HealthBridge Medical Center',
      organizationType: 'provider',
      actionRequired: true,
      actionDescription: 'Renew healthcare provider license',
      dueDate: new Date('2024-10-15'),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const alert of sampleAlerts) {
    await collections.activityLogs().add(alert);
  }

  console.log('✅ Sample compliance data created successfully!');
}