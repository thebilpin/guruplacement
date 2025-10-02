const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'placementguru-29ca4'
});

const db = getFirestore();

async function seedComplianceData() {
  console.log('🌱 Starting compliance data seed...');

  try {
    // Sample compliance records
    const sampleComplianceRecords = [
      {
        organizationId: 'rto-001',
        organizationType: 'rto',
        organizationName: 'TAFE NSW Healthcare',
        overallScore: 92,
        lastAuditDate: new Date('2024-08-15'),
        nextAuditDue: new Date('2025-02-15'),
        status: 'compliant',
        requiredDocuments: [
          {
            id: 'doc-001',
            name: 'RTO Registration Certificate',
            type: 'accreditation',
            status: 'valid',
            isRequired: true,
            priority: 'critical',
            issueDate: new Date('2023-01-01'),
            expiryDate: new Date('2025-12-31'),
            verificationStatus: 'approved'
          },
          {
            id: 'doc-002',
            name: 'Public Liability Insurance',
            type: 'insurance_certificate',
            status: 'valid',
            isRequired: true,
            priority: 'high',
            issueDate: new Date('2024-01-01'),
            expiryDate: new Date('2024-12-31'),
            verificationStatus: 'approved'
          }
        ],
        submittedDocuments: [
          {
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
          }
        ],
        missingDocuments: [],
        expiringDocuments: [
          {
            documentId: 'doc-002',
            documentName: 'Public Liability Insurance',
            expiryDate: new Date('2024-12-31'),
            daysUntilExpiry: 95,
            organizationName: 'TAFE NSW Healthcare',
            organizationType: 'rto',
            priority: 'high'
          }
        ],
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
        requiredDocuments: [
          {
            id: 'doc-003',
            name: 'Healthcare Provider License',
            type: 'professional_registration',
            status: 'expiring_soon',
            isRequired: true,
            priority: 'critical',
            issueDate: new Date('2023-10-01'),
            expiryDate: new Date('2024-10-15'),
            verificationStatus: 'approved'
          }
        ],
        submittedDocuments: [
          {
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
            verificationStatus: 'approved',
            verifiedAt: new Date('2023-10-06'),
            verifiedBy: 'admin@placementguru.com'
          }
        ],
        missingDocuments: ['Updated Safety Procedures'],
        expiringDocuments: [
          {
            documentId: 'doc-003',
            documentName: 'Healthcare Provider License',
            expiryDate: new Date('2024-10-15'),
            daysUntilExpiry: 18,
            organizationName: 'HealthBridge Medical Center',
            organizationType: 'provider',
            priority: 'critical'
          }
        ],
        auditHistory: [],
        riskLevel: 'medium',
        riskFactors: ['Expiring license', 'Missing safety procedures'],
        createdAt: new Date('2023-09-01'),
        updatedAt: new Date(),
        createdBy: 'system',
        lastUpdatedBy: 'admin@placementguru.com'
      },
      {
        organizationId: 'provider-002',
        organizationType: 'provider',
        organizationName: 'CareWell Community Health',
        overallScore: 65,
        lastAuditDate: new Date('2024-06-10'),
        nextAuditDue: new Date('2024-12-10'),
        status: 'non_compliant',
        requiredDocuments: [
          {
            id: 'doc-004',
            name: 'Professional Indemnity Insurance',
            type: 'insurance_certificate',
            status: 'expired',
            isRequired: true,
            priority: 'critical',
            issueDate: new Date('2023-01-01'),
            expiryDate: new Date('2024-01-01'),
            verificationStatus: 'rejected'
          }
        ],
        submittedDocuments: [],
        missingDocuments: ['Professional Indemnity Insurance', 'Staff Training Records', 'Emergency Procedures'],
        expiringDocuments: [],
        auditHistory: [],
        riskLevel: 'high',
        riskFactors: ['Expired insurance', 'Multiple missing documents', 'Failed recent audit'],
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date(),
        createdBy: 'system',
        lastUpdatedBy: 'auditor@placementguru.com'
      }
    ];

    // Sample audit records
    const sampleAuditRecords = [
      {
        type: 'audit',
        complianceRecordId: 'rto-001',
        auditType: 'scheduled',
        auditDate: new Date('2024-08-15'),
        auditorId: 'auditor-001',
        auditorName: 'Sarah Johnson',
        overallScore: 92,
        status: 'completed',
        completedAt: new Date('2024-08-15'),
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-08-15')
      },
      {
        type: 'audit',
        complianceRecordId: 'provider-001',
        auditType: 'random',
        auditDate: new Date('2024-07-20'),
        auditorId: 'auditor-002',
        auditorName: 'Michael Chen',
        overallScore: 78,
        status: 'completed',
        completedAt: new Date('2024-07-20'),
        createdAt: new Date('2024-07-20'),
        updatedAt: new Date('2024-07-20')
      }
    ];

    // Sample compliance alerts
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
      },
      {
        type: 'compliance_alert',
        alertType: 'non_compliance',
        severity: 'high',
        title: 'Multiple Missing Documents',
        description: 'CareWell Community Health has 3 missing required documents',
        organizationId: 'provider-002',
        organizationName: 'CareWell Community Health',
        organizationType: 'provider',
        actionRequired: true,
        actionDescription: 'Submit missing compliance documents',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        type: 'compliance_alert',
        alertType: 'audit_due',
        severity: 'medium',
        title: 'Scheduled Audit Due',
        description: 'CareWell Community Health audit is due within 30 days',
        organizationId: 'provider-002',
        organizationName: 'CareWell Community Health',
        organizationType: 'provider',
        actionRequired: true,
        actionDescription: 'Schedule compliance audit',
        dueDate: new Date('2024-12-10'),
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Seed compliance records
    console.log('📄 Seeding compliance records...');
    for (const record of sampleComplianceRecords) {
      await db.collection('complianceRecords').add(record);
    }

    // Seed audit records
    console.log('🔍 Seeding audit records...');
    for (const audit of sampleAuditRecords) {
      await db.collection('activityLogs').add(audit);
    }

    // Seed compliance alerts
    console.log('🚨 Seeding compliance alerts...');
    for (const alert of sampleAlerts) {
      await db.collection('activityLogs').add(alert);
    }

    console.log('✅ Compliance data seeding completed successfully!');
    console.log(`📊 Seeded:`);
    console.log(`   - ${sampleComplianceRecords.length} compliance records`);
    console.log(`   - ${sampleAuditRecords.length} audit records`);
    console.log(`   - ${sampleAlerts.length} compliance alerts`);

  } catch (error) {
    console.error('❌ Error seeding compliance data:', error);
    throw error;
  }
}

// Run the seed
seedComplianceData()
  .then(() => {
    console.log('🎉 Compliance data seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });