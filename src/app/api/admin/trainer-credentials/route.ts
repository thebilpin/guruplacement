import { NextRequest, NextResponse } from 'next/server';

// In-memory data store for trainer credentials (replace with database in production)
let trainersData: any[] = [];
let credentialsData: any[] = [];
let complianceReports: any[] = [];
let auditLogs: any[] = [];

// Initialize with sample data
const initializeData = () => {
  if (trainersData.length === 0) {
    console.log('🚀 Initializing trainer credentials data...');
    
    trainersData = [
      {
        id: 'TR001',
        firstName: 'Sarah',
        lastName: 'Mitchell',
        email: 'sarah.mitchell@placementguru.com',
        employeeId: 'EMP001',
        position: 'Senior Trainer',
        department: 'Information Technology',
        startDate: new Date('2022-03-15'),
        status: 'Active',
        complianceStatus: 'Compliant',
        lastReviewDate: new Date('2024-08-15'),
        nextReviewDate: new Date('2025-08-15'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TR002',
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael.chen@placementguru.com',
        employeeId: 'EMP002',
        position: 'Assessor',
        department: 'Business Administration',
        startDate: new Date('2023-01-20'),
        status: 'Active',
        complianceStatus: 'Action Required',
        lastReviewDate: new Date('2024-06-10'),
        nextReviewDate: new Date('2025-06-10'),
        issues: ['Industry currency documentation required'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'TR003',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.watson@placementguru.com',
        employeeId: 'EMP003',
        position: 'Lead Trainer/Assessor',
        department: 'Health Services',
        startDate: new Date('2021-09-10'),
        status: 'Active',
        complianceStatus: 'Compliant',
        lastReviewDate: new Date('2024-09-01'),
        nextReviewDate: new Date('2025-09-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    credentialsData = [
      // Sarah Mitchell's credentials
      {
        id: 'CRED001',
        trainerId: 'TR001',
        category: 'Core Credentials',
        type: 'TAE Qualification',
        name: 'TAE40122 Certificate IV in Training and Assessment',
        issuer: 'Australian Skills Academy',
        issueDate: new Date('2022-02-01'),
        expiryDate: null,
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/sarah-tae40122.pdf',
        notes: 'Current TAE qualification - no upgrade required',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CRED002',
        trainerId: 'TR001',
        category: 'Vocational Competency',
        type: 'Industry Qualification',
        name: 'Diploma of Information Technology',
        issuer: 'Sydney TAFE',
        issueDate: new Date('2020-12-15'),
        expiryDate: null,
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/sarah-dit.pdf',
        notes: 'Meets vocational competency requirements for IT training',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CRED003',
        trainerId: 'TR001',
        category: 'Current Industry Skills',
        type: 'Professional Development',
        name: 'Cloud Computing Certification',
        issuer: 'AWS',
        issueDate: new Date('2024-03-10'),
        expiryDate: new Date('2027-03-10'),
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/sarah-aws.pdf',
        notes: 'Recent industry upskilling',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Michael Chen's credentials
      {
        id: 'CRED004',
        trainerId: 'TR002',
        category: 'Core Credentials',
        type: 'Assessment Qualification',
        name: 'TAEASS502 Design and develop assessment tools',
        issuer: 'Melbourne Institute of Training',
        issueDate: new Date('2022-11-20'),
        expiryDate: null,
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/michael-taeass502.pdf',
        notes: 'Assessor qualification current',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CRED005',
        trainerId: 'TR002',
        category: 'Vocational Competency',
        type: 'Industry Qualification',
        name: 'Advanced Diploma of Business',
        issuer: 'Business College Australia',
        issueDate: new Date('2021-06-30'),
        expiryDate: null,
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/michael-adb.pdf',
        notes: 'Appropriate level for business training',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Emily Watson's credentials
      {
        id: 'CRED006',
        trainerId: 'TR003',
        category: 'Core Credentials',
        type: 'TAE Qualification',
        name: 'TAE40116 Certificate IV in Training and Assessment (upgraded)',
        issuer: 'Health Training Institute',
        issueDate: new Date('2021-08-15'),
        expiryDate: null,
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/emily-tae40116.pdf',
        notes: 'Upgraded to meet current standards',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CRED007',
        trainerId: 'TR003',
        category: 'Additional Requirements',
        type: 'Safety Qualification',
        name: 'First Aid Certificate',
        issuer: 'Red Cross Australia',
        issueDate: new Date('2024-01-15'),
        expiryDate: new Date('2027-01-15'),
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/emily-firstaid.pdf',
        notes: 'Required for health services training',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'CRED008',
        trainerId: 'TR003',
        category: 'Additional Requirements',
        type: 'Background Check',
        name: 'Working with Children Check',
        issuer: 'NSW Office of the Children\'s Guardian',
        issueDate: new Date('2023-05-20'),
        expiryDate: new Date('2028-05-20'),
        status: 'Current',
        verificationStatus: 'Verified',
        documentUrl: '/documents/emily-wwcc.pdf',
        notes: 'Required for training minors',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    complianceReports = [
      {
        id: 'RPT001',
        title: 'Q3 2024 Trainer Compliance Review',
        type: 'Quarterly Review',
        period: '2024-Q3',
        generatedDate: new Date('2024-09-30'),
        status: 'Completed',
        summary: {
          totalTrainers: 3,
          compliant: 2,
          actionRequired: 1,
          nonCompliant: 0,
          complianceRate: 66.7
        },
        findings: [
          'Michael Chen requires industry currency documentation',
          'All TAE qualifications are current and verified',
          'First aid certificates due for renewal in Q1 2025'
        ],
        recommendations: [
          'Schedule industry currency review for Michael Chen',
          'Set up renewal reminders for expiring certificates',
          'Consider additional PD opportunities for all trainers'
        ],
        createdBy: 'System',
        createdAt: new Date('2024-09-30'),
        updatedAt: new Date('2024-09-30')
      }
    ];

    auditLogs = [
      {
        id: 'LOG001',
        trainerId: 'TR001',
        action: 'Credential Added',
        details: 'AWS Cloud Computing Certification uploaded',
        performedBy: 'sarah.mitchell@placementguru.com',
        timestamp: new Date('2024-03-12T10:30:00'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'LOG002',
        trainerId: 'TR002',
        action: 'Compliance Review',
        details: 'Quarterly compliance review completed - Action required status assigned',
        performedBy: 'admin@placementguru.com',
        timestamp: new Date('2024-09-30T14:15:00'),
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: 'LOG003',
        trainerId: 'TR003',
        action: 'Document Verified',
        details: 'First Aid Certificate verification completed',
        performedBy: 'compliance@placementguru.com',
        timestamp: new Date('2024-01-18T09:45:00'),
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    console.log(`✅ Trainer credentials data initialized: ${trainersData.length} trainers, ${credentialsData.length} credentials`);
  }
};

// Helper functions
const getTrainers = () => {
  initializeData();
  return {
    trainers: trainersData,
    summary: {
      total: trainersData.length,
      active: trainersData.filter(t => t.status === 'Active').length,
      compliant: trainersData.filter(t => t.complianceStatus === 'Compliant').length,
      actionRequired: trainersData.filter(t => t.complianceStatus === 'Action Required').length,
      nonCompliant: trainersData.filter(t => t.complianceStatus === 'Non-Compliant').length
    }
  };
};

const getCredentials = (trainerId?: string) => {
  initializeData();
  const credentials = trainerId 
    ? credentialsData.filter(c => c.trainerId === trainerId)
    : credentialsData;
  
  return {
    credentials,
    categories: [
      'Core Credentials',
      'Vocational Competency', 
      'Current Industry Skills',
      'Current VET Knowledge & Skills',
      'Additional Requirements'
    ]
  };
};

const getDashboardData = () => {
  initializeData();
  
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  const ninetyDaysFromNow = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000));
  
  const expiringCredentials = credentialsData.filter(c => 
    c.expiryDate && new Date(c.expiryDate) <= ninetyDaysFromNow
  );
  
  const recentActivity = auditLogs
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  const complianceOverview = {
    totalTrainers: trainersData.length,
    compliantTrainers: trainersData.filter(t => t.complianceStatus === 'Compliant').length,
    actionRequiredTrainers: trainersData.filter(t => t.complianceStatus === 'Action Required').length,
    nonCompliantTrainers: trainersData.filter(t => t.complianceStatus === 'Non-Compliant').length,
    complianceRate: Math.round((trainersData.filter(t => t.complianceStatus === 'Compliant').length / trainersData.length) * 100)
  };

  const credentialStats = {
    totalCredentials: credentialsData.length,
    verifiedCredentials: credentialsData.filter(c => c.verificationStatus === 'Verified').length,
    pendingVerification: credentialsData.filter(c => c.verificationStatus === 'Pending').length,
    expiringSoon: expiringCredentials.length,
    expired: credentialsData.filter(c => c.expiryDate && new Date(c.expiryDate) < now).length
  };

  return {
    complianceOverview,
    credentialStats,
    expiringCredentials: expiringCredentials.slice(0, 5),
    recentActivity,
    upcomingReviews: trainersData
      .filter(t => t.nextReviewDate && new Date(t.nextReviewDate) <= thirtyDaysFromNow)
      .slice(0, 5),
    alerts: [
      ...expiringCredentials.map(c => ({
        id: `EXP-${c.id}`,
        type: 'Expiring Credential',
        message: `${c.name} expires on ${new Date(c.expiryDate).toLocaleDateString()}`,
        trainerId: c.trainerId,
        severity: 'warning',
        createdAt: new Date()
      })),
      ...trainersData
        .filter(t => t.complianceStatus === 'Action Required')
        .map(t => ({
          id: `ACT-${t.id}`,
          type: 'Action Required',
          message: `${t.firstName} ${t.lastName} requires compliance action`,
          trainerId: t.id,
          severity: 'error',
          createdAt: new Date()
        }))
    ]
  };
};

const getReports = () => {
  initializeData();
  return {
    reports: complianceReports,
    availableReportTypes: [
      'Quarterly Review',
      'Annual Audit',
      'Credential Expiry Report',
      'Non-Compliance Report'
    ]
  };
};

const getAuditLogs = (trainerId?: string) => {
  initializeData();
  const logs = trainerId
    ? auditLogs.filter(log => log.trainerId === trainerId)
    : auditLogs;
  
  return {
    logs: logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    totalCount: logs.length
  };
};

export async function GET(request: NextRequest) {
  console.log('🎯 Trainer credentials API called');
  
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'dashboard';
  const trainerId = searchParams.get('trainerId');

  try {
    switch (action) {
      case 'dashboard':
        return NextResponse.json(getDashboardData());
      
      case 'trainers':
        return NextResponse.json(getTrainers());
      
      case 'credentials':
        return NextResponse.json(getCredentials(trainerId || undefined));
      
      case 'reports':
        return NextResponse.json(getReports());
      
      case 'audit-logs':
        return NextResponse.json(getAuditLogs(trainerId || undefined));
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in trainer credentials API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    initializeData();

    switch (action) {
      case 'add-trainer':
        const newTrainer = {
          id: `TR${String(trainersData.length + 1).padStart(3, '0')}`,
          ...body.trainer,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        trainersData.push(newTrainer);
        
        auditLogs.push({
          id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
          trainerId: newTrainer.id,
          action: 'Trainer Added',
          details: `New trainer ${newTrainer.firstName} ${newTrainer.lastName} added to system`,
          performedBy: 'admin@placementguru.com',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
        
        return NextResponse.json({ success: true, trainer: newTrainer });

      case 'add-credential':
        const newCredential = {
          id: `CRED${String(credentialsData.length + 1).padStart(3, '0')}`,
          ...body.credential,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        credentialsData.push(newCredential);
        
        auditLogs.push({
          id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
          trainerId: newCredential.trainerId,
          action: 'Credential Added',
          details: `New credential ${newCredential.name} added`,
          performedBy: 'admin@placementguru.com',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
        
        return NextResponse.json({ success: true, credential: newCredential });

      case 'update-compliance-status':
        const trainerIndex = trainersData.findIndex(t => t.id === body.trainerId);
        if (trainerIndex === -1) {
          return NextResponse.json({ error: 'Trainer not found' }, { status: 404 });
        }
        
        const oldStatus = trainersData[trainerIndex].complianceStatus;
        trainersData[trainerIndex].complianceStatus = body.status;
        trainersData[trainerIndex].updatedAt = new Date();
        if (body.issues) {
          trainersData[trainerIndex].issues = body.issues;
        }
        
        auditLogs.push({
          id: `LOG${String(auditLogs.length + 1).padStart(3, '0')}`,
          trainerId: body.trainerId,
          action: 'Compliance Status Updated',
          details: `Status changed from ${oldStatus} to ${body.status}`,
          performedBy: 'admin@placementguru.com',
          timestamp: new Date(),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        });
        
        return NextResponse.json({ success: true, trainer: trainersData[trainerIndex] });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in trainer credentials POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}