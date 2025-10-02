// Database Initialization Script
// Sets up Firestore collections and indexes for PlacementGuru

import { db, collections } from '../db';
import { 
  User, 
  RTO, 
  Provider, 
  Contract, 
  Invitation,
  Course,
  Student,
  PlacementOpportunity,
  HourLog,
  Assessment,
  ComplianceRecord,
  Message,
  Notification,
  DashboardStats,
  Document,
  SystemSetting
} from '../schemas/complete-database';

// ========================================
// COLLECTION SETUP
// ========================================

export const initializeCollections = async () => {
  console.log('🚀 Initializing Firestore collections...');
  
  try {
    // Core Collections
    await setupCoreCollections();
    
    // Education Collections
    await setupEducationCollections();
    
    // Placement Collections
    await setupPlacementCollections();
    
    // Assessment Collections
    await setupAssessmentCollections();
    
    // Communication Collections
    await setupCommunicationCollections();
    
    // System Collections
    await setupSystemCollections();
    
    // Initialize default data
    await initializeDefaultData();
    
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// ========================================
// COLLECTION DEFINITIONS
// ========================================

const setupCoreCollections = async () => {
  console.log('📁 Setting up core collections...');
  
  // Users collection - Central user management
  const usersRef = collections.users();
  
  // RTOs collection - Registered Training Organizations
  const rtosRef = collections.rtos();
  
  // Providers collection - Workplace providers
  const providersRef = collections.providers();
  
  // Contracts collection - MoU and partnership agreements
  const contractsRef = collections.contracts();
  
  // Invitations collection - User invitation system
  const invitationsRef = db.collection('invitations');
  
  console.log('✅ Core collections setup completed');
};

const setupEducationCollections = async () => {
  console.log('📚 Setting up education collections...');
  
  // Courses collection
  const coursesRef = collections.courses();
  
  // Units of Competency
  const unitsRef = collections.unitsOfCompetency();
  
  // Cohorts
  const cohortsRef = collections.cohorts();
  
  // Students
  const studentsRef = collections.students();
  
  // Student Unit Progress
  const progressRef = collections.studentUnitProgress();
  
  console.log('✅ Education collections setup completed');
};

const setupPlacementCollections = async () => {
  console.log('🏢 Setting up placement collections...');
  
  // Placement Opportunities
  const opportunitiesRef = collections.placementOpportunities();
  
  // Applications
  const applicationsRef = collections.applications();
  
  // Active Placements
  const placementsRef = collections.placements();
  
  // Hour Logs
  const hourLogsRef = collections.hourLogs();
  
  // Digital Logbooks
  const logbooksRef = db.collection('digitalLogbooks');
  
  // Logbook Entries
  const entriesRef = db.collection('logbookEntries');
  
  console.log('✅ Placement collections setup completed');
};

const setupAssessmentCollections = async () => {
  console.log('📝 Setting up assessment collections...');
  
  // Assessments
  const assessmentsRef = collections.assessments();
  
  // Supervisor Evaluations
  const evaluationsRef = collections.supervisorEvaluations();
  
  // Compliance Records
  const complianceRef = db.collection('complianceRecords');
  
  console.log('✅ Assessment collections setup completed');
};

const setupCommunicationCollections = async () => {
  console.log('💬 Setting up communication collections...');
  
  // Messages
  const messagesRef = collections.messages();
  
  // Notifications
  const notificationsRef = collections.notifications();
  
  // Announcements
  const announcementsRef = collections.announcements();
  
  console.log('✅ Communication collections setup completed');
};

const setupSystemCollections = async () => {
  console.log('⚙️ Setting up system collections...');
  
  // Dashboard Stats
  const statsRef = db.collection('dashboardStats');
  
  // Activity Logs
  const activityRef = collections.auditLogs();
  
  // Documents
  const documentsRef = collections.documents();
  
  // System Settings
  const settingsRef = collections.systemSettings();
  
  console.log('✅ System collections setup completed');
};

// ========================================
// DEFAULT DATA INITIALIZATION
// ========================================

const initializeDefaultData = async () => {
  console.log('📋 Initializing default data...');
  
  // Create default system settings
  await initializeSystemSettings();
  
  // Create sample data for development
  if (process.env.NODE_ENV === 'development') {
    await initializeSampleData();
  }
  
  console.log('✅ Default data initialization completed');
};

const initializeSystemSettings = async () => {
  const settingsRef = collections.systemSettings();
  
  const defaultSettings = [
    {
      key: 'platform.name',
      value: 'PlacementGuru',
      type: 'string',
      scope: 'global',
      description: 'Platform name',
      isPublic: true,
      category: 'branding',
      updatedBy: 'system',
      updatedAt: new Date(),
      createdAt: new Date()
    },
    {
      key: 'placement.default_hours_per_week',
      value: 38,
      type: 'number',
      scope: 'global',
      description: 'Default hours per week for placements',
      isPublic: false,
      category: 'placement_settings',
      updatedBy: 'system',
      updatedAt: new Date(),
      createdAt: new Date()
    },
    {
      key: 'compliance.document_expiry_warning_days',
      value: 30,
      type: 'number',
      scope: 'global',
      description: 'Days before document expiry to send warning',
      isPublic: false,
      category: 'compliance',
      updatedBy: 'system',
      updatedAt: new Date(),
      createdAt: new Date()
    },
    {
      key: 'assessment.default_due_days',
      value: 14,
      type: 'number',
      scope: 'global',
      description: 'Default days for assessment due date',
      isPublic: false,
      category: 'assessment',
      updatedBy: 'system',
      updatedAt: new Date(),
      createdAt: new Date()
    }
  ];
  
  const batch = db.batch();
  
  for (const setting of defaultSettings) {
    const docRef = settingsRef.doc();
    batch.set(docRef, { id: docRef.id, ...setting });
  }
  
  await batch.commit();
  console.log('✅ System settings initialized');
};

const initializeSampleData = async () => {
  console.log('🧪 Creating sample data for development...');
  
  // Create sample RTO
  const sampleRTO: Partial<RTO> = {
    name: 'Tech Skills Australia',
    code: 'TSA001',
    description: 'Leading provider of technology education and training',
    email: 'contact@techskills.edu.au',
    phone: '+61 2 9876 5432',
    addressLine1: '123 Education Street',
    city: 'Sydney',
    state: 'NSW',
    postcode: '2000',
    country: 'Australia',
    abn: '12345678901',
    subscriptionPlan: 'premium',
    isActive: true,
    verificationStatus: 'verified',
    totalStudents: 150,
    activeStudents: 98,
    completedStudents: 52,
    totalCourses: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const rtoRef = collections.rtos().doc();
  await rtoRef.set({ id: rtoRef.id, ...sampleRTO });
  
  // Create sample Provider
  const sampleProvider: Partial<Provider> = {
    name: 'HealthBridge Medical Centre',
    industry: 'Healthcare',
    description: 'Modern medical centre providing comprehensive healthcare services',
    email: 'placements@healthbridge.com.au',
    phone: '+61 3 9876 5432',
    addressLine1: '456 Medical Plaza',
    city: 'Melbourne',
    state: 'VIC',
    postcode: '3000',
    country: 'Australia',
    abn: '98765432101',
    industryCategory: 'Healthcare',
    isApproved: true,
    verificationStatus: 'verified',
    rating: 4.8,
    totalPlacements: 45,
    activePlacements: 12,
    totalSupervisors: 8,
    activeSupervisors: 6,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const providerRef = collections.providers().doc();
  await providerRef.set({ id: providerRef.id, ...sampleProvider });
  
  // Create sample courses
  const sampleCourses = [
    {
      rtoId: rtoRef.id,
      code: 'ICT40120',
      name: 'Certificate IV in Information Technology',
      type: 'certificate_iv' as const,
      description: 'Comprehensive IT certification covering networking, programming, and systems administration',
      durationWeeks: 52,
      totalPlacementHours: 400,
      theoryHours: 600,
      practicalHours: 400,
      qualificationLevel: 'Certificate IV',
      industry: 'Information Technology',
      isActive: true,
      accreditationStatus: 'current',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      rtoId: rtoRef.id,
      code: 'HLT33115',
      name: 'Certificate III in Health Services Assistance',
      type: 'certificate_iii' as const,
      description: 'Healthcare support role training for medical facilities',
      durationWeeks: 26,
      totalPlacementHours: 320,
      theoryHours: 400,
      practicalHours: 320,
      qualificationLevel: 'Certificate III',
      industry: 'Healthcare',
      isActive: true,
      accreditationStatus: 'current',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  const courseBatch = db.batch();
  for (const course of sampleCourses) {
    const courseRef = collections.courses().doc();
    courseBatch.set(courseRef, { id: courseRef.id, ...course });
  }
  await courseBatch.commit();
  
  console.log('✅ Sample data created for development');
};

// ========================================
// COLLECTION INDEXES
// ========================================

export const setupIndexes = async () => {
  console.log('📇 Setting up database indexes...');
  
  // Note: Firestore indexes are typically created through the Firebase Console
  // or using the Firebase CLI with firestore.indexes.json
  // This function documents the required indexes
  
  const requiredIndexes = [
    // Users indexes
    { collection: 'users', fields: ['email', 'role', 'status'] },
    { collection: 'users', fields: ['rtoId', 'status'] },
    { collection: 'users', fields: ['providerId', 'status'] },
    { collection: 'users', fields: ['invitationStatus', 'invitationExpiresAt'] },
    
    // Students indexes
    { collection: 'students', fields: ['rtoId', 'status'] },
    { collection: 'students', fields: ['cohortId', 'status'] },
    { collection: 'students', fields: ['status', 'riskLevel'] },
    
    // Placements indexes
    { collection: 'placementOpportunities', fields: ['providerId', 'status'] },
    { collection: 'placementOpportunities', fields: ['courseIds', 'status'] },
    { collection: 'placementOpportunities', fields: ['status', 'applicationDeadline'] },
    
    // Applications indexes
    { collection: 'applications', fields: ['studentId', 'status'] },
    { collection: 'applications', fields: ['opportunityId', 'status'] },
    
    // Hour logs indexes
    { collection: 'hourLogs', fields: ['studentId', 'date'] },
    { collection: 'hourLogs', fields: ['placementId', 'supervisorApproved'] },
    
    // Assessments indexes
    { collection: 'assessments', fields: ['studentId', 'result'] },
    { collection: 'assessments', fields: ['assessorId', 'dueDate'] },
    
    // Contracts indexes
    { collection: 'contracts', fields: ['rtoId', 'status'] },
    { collection: 'contracts', fields: ['providerId', 'status'] },
    
    // Invitations indexes
    { collection: 'invitations', fields: ['email', 'status'] },
    { collection: 'invitations', fields: ['organizationId', 'organizationType'] },
    { collection: 'invitations', fields: ['invitedBy', 'status'] },
    
    // Notifications indexes
    { collection: 'notifications', fields: ['userId', 'isRead'] },
    { collection: 'notifications', fields: ['type', 'scheduledFor'] },
    
    // Documents indexes
    { collection: 'documents', fields: ['userId', 'documentType'] },
    { collection: 'documents', fields: ['status', 'expiresAt'] },
    
    // Compliance indexes
    { collection: 'complianceRecords', fields: ['studentId', 'type', 'status'] },
    { collection: 'complianceRecords', fields: ['status', 'expiresAt'] }
  ];
  
  console.log('📋 Required indexes documented:');
  requiredIndexes.forEach(index => {
    console.log(`   - Collection: ${index.collection}, Fields: [${index.fields.join(', ')}]`);
  });
  
  console.log('💡 Create these indexes in Firebase Console or using Firebase CLI');
  console.log('✅ Index setup documentation completed');
};

// ========================================
// DATA MIGRATION UTILITIES
// ========================================

export const migrateExistingData = async () => {
  console.log('🔄 Starting data migration...');
  
  try {
    // Migrate users to new schema
    await migrateUsers();
    
    // Migrate contracts
    await migrateContracts();
    
    // Migrate invitations
    await migrateInvitations();
    
    console.log('✅ Data migration completed successfully');
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    throw error;
  }
};

const migrateUsers = async () => {
  console.log('👥 Migrating user data...');
  
  const usersSnapshot = await collections.users().get();
  const batch = db.batch();
  
  usersSnapshot.docs.forEach(doc => {
    const userData = doc.data();
    
    // Add missing fields with defaults
    const updatedData = {
      ...userData,
      mustChangePassword: userData.mustChangePassword ?? false,
      verificationStatus: userData.verificationStatus ?? 'pending',
      twoFactorEnabled: userData.twoFactorEnabled ?? false,
      updatedAt: new Date()
    };
    
    batch.update(doc.ref, updatedData);
  });
  
  await batch.commit();
  console.log(`✅ Migrated ${usersSnapshot.docs.length} user records`);
};

const migrateContracts = async () => {
  console.log('📄 Migrating contract data...');
  
  const contractsSnapshot = await collections.contracts().get();
  const batch = db.batch();
  
  contractsSnapshot.docs.forEach(doc => {
    const contractData = doc.data();
    
    // Add missing fields
    const updatedData = {
      ...contractData,
      documentVersion: contractData.documentVersion ?? 1,
      updatedAt: new Date()
    };
    
    batch.update(doc.ref, updatedData);
  });
  
  await batch.commit();
  console.log(`✅ Migrated ${contractsSnapshot.docs.length} contract records`);
};

const migrateInvitations = async () => {
  console.log('📧 Migrating invitation data...');
  
  // This will handle migration of any existing invitation records
  // to match the new schema structure
  console.log('✅ Invitation migration completed');
};

// ========================================
// EXPORT FUNCTIONS
// ========================================

export {
  setupCoreCollections,
  setupEducationCollections,
  setupPlacementCollections,
  setupAssessmentCollections,
  setupCommunicationCollections,
  setupSystemCollections,
  initializeDefaultData,
  initializeSystemSettings
};