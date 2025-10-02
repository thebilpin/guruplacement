// Database Setup and Initialization API
import { NextRequest, NextResponse } from 'next/server';
import { collections, db } from '@/lib/db';
import { initializeCollections, initializeDefaultData } from '@/lib/db/initialize';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, seedData = false } = body;

    console.log('🚀 Starting database setup...');

    switch (action) {
      case 'initialize':
        await initializeCollections();
        
        if (seedData) {
          await seedDatabaseWithSampleData();
        }
        
        return NextResponse.json({
          success: true,
          message: 'Database initialized successfully',
          timestamp: new Date()
        });

      case 'seed':
        await seedDatabaseWithSampleData();
        return NextResponse.json({
          success: true,
          message: 'Database seeded with sample data',
          timestamp: new Date()
        });

      case 'reset':
        // WARNING: This deletes all data
        await resetDatabase();
        return NextResponse.json({
          success: true,
          message: 'Database reset completed',
          timestamp: new Date()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: initialize, seed, or reset' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database setup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Seed database with comprehensive sample data
async function seedDatabaseWithSampleData() {
  console.log('🌱 Seeding database with sample data...');

  const batch = db.batch();
  let batchCount = 0;

  // Helper function to commit batch when it gets too large
  const commitBatchIfNeeded = async () => {
    if (batchCount >= 450) { // Firestore limit is 500
      await batch.commit();
      batchCount = 0;
    }
  };

  // Sample RTOs
  const rtos = [
    {
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
    },
    {
      name: 'Healthcare Education Institute',
      code: 'HEI002',
      description: 'Specialized healthcare training and certifications',
      email: 'admin@healthed.edu.au',
      phone: '+61 3 8765 4321',
      addressLine1: '456 Medical Plaza',
      city: 'Melbourne',
      state: 'VIC',
      postcode: '3000',
      country: 'Australia',
      abn: '23456789012',
      subscriptionPlan: 'standard',
      isActive: true,
      verificationStatus: 'verified',
      totalStudents: 89,
      activeStudents: 67,
      completedStudents: 22,
      totalCourses: 5,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const rtoRefs = [];
  for (const rto of rtos) {
    const rtoRef = collections.rtos().doc();
    batch.set(rtoRef, { id: rtoRef.id, ...rto });
    rtoRefs.push({ ref: rtoRef, data: rto });
    batchCount++;
  }

  // Sample Providers
  const providers = [
    {
      name: 'HealthBridge Medical Centre',
      industry: 'Healthcare',
      description: 'Modern medical centre providing comprehensive healthcare services',
      email: 'placements@healthbridge.com.au',
      phone: '+61 3 9876 5432',
      addressLine1: '789 Medical Plaza',
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
    },
    {
      name: 'TechForward Solutions',
      industry: 'Information Technology',
      description: 'Innovative IT solutions and software development',
      email: 'hr@techforward.com.au',
      phone: '+61 2 8765 4321',
      addressLine1: '321 Tech Street',
      city: 'Sydney',
      state: 'NSW',
      postcode: '2000',
      country: 'Australia',
      abn: '87654321098',
      industryCategory: 'Technology',
      isApproved: true,
      verificationStatus: 'verified',
      rating: 4.6,
      totalPlacements: 28,
      activePlacements: 8,
      totalSupervisors: 5,
      activeSupervisors: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  const providerRefs = [];
  for (const provider of providers) {
    const providerRef = collections.providers().doc();
    batch.set(providerRef, { id: providerRef.id, ...provider });
    providerRefs.push({ ref: providerRef, data: provider });
    batchCount++;
  }

  // Sample Users (RTO Admins, Provider Admins, Students, etc.)
  const users = [
    // RTO Admin
    {
      email: 'admin@techskills.edu.au',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'verified',
      rtoId: rtoRefs[0].ref.id,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Provider Admin
    {
      email: 'admin@healthbridge.com.au',
      firstName: 'Michael',
      lastName: 'Chen',
      role: 'provider_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'verified',
      providerId: providerRefs[0].ref.id,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Students
    {
      email: 'sarah.student@example.com',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: 'student',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      invitationStatus: 'accepted',
      rtoId: rtoRefs[0].ref.id,
      verificationStatus: 'verified',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'ben.carter@example.com',
      firstName: 'Ben',
      lastName: 'Carter',
      role: 'student',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      invitationStatus: 'accepted',
      rtoId: rtoRefs[0].ref.id,
      verificationStatus: 'verified',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Supervisor
    {
      email: 'supervisor@healthbridge.com.au',
      firstName: 'Emma',
      lastName: 'Davis',
      role: 'supervisor',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      invitationStatus: 'accepted',
      providerId: providerRefs[0].ref.id,
      verificationStatus: 'verified',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    // Assessor
    {
      email: 'assessor@techskills.edu.au',
      firstName: 'James',
      lastName: 'Brown',
      role: 'assessor',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      invitationStatus: 'accepted',
      rtoId: rtoRefs[0].ref.id,
      verificationStatus: 'verified',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Additional users for verification testing
  const verificationUsers = [
    {
      email: 'rto@placementhero.com.au',
      firstName: 'RTO',
      lastName: 'Administrator',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'verified',
      organization: 'PlacementHero RTO',
      verificationNotes: 'Primary RTO admin account',
      verifiedBy: 'system',
      verifiedAt: new Date(),
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: 'MicrolaB631911' // This will be used for Firebase Auth creation
    },
    {
      email: 'pending@techcollege.edu.au',
      firstName: 'Lisa',
      lastName: 'Anderson',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'pending',
      organization: 'TechCollege Australia',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'review@innovatetraining.com.au',
      firstName: 'David',
      lastName: 'Kim',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'under_review',
      organization: 'InnovateTraining Institute',
      verificationNotes: 'Documentation being reviewed',
      twoFactorEnabled: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date()
    },
    {
      email: 'rejected@oldschool.edu.au',
      firstName: 'Nancy',
      lastName: 'White',
      role: 'rto_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'rejected',
      organization: 'OldSchool Training',
      verificationNotes: 'Missing ASQA compliance documentation',
      verifiedBy: 'admin_1',
      verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      twoFactorEnabled: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      updatedAt: new Date()
    },
    {
      email: 'pending.provider@buildright.com.au',
      firstName: 'Tom',
      lastName: 'Mitchell',
      role: 'provider_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'pending',
      organization: 'BuildRight Construction',
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      email: 'review.provider@greenenergy.com.au',
      firstName: 'Amy',
      lastName: 'Scott',
      role: 'provider_admin',
      status: 'active',
      emailVerified: true,
      mustChangePassword: false,
      verificationStatus: 'under_review',
      organization: 'Green Energy Solutions',
      verificationNotes: 'Checking safety certifications',
      twoFactorEnabled: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date()
    }
  ];

  const allUsers = [...users, ...verificationUsers];
  const userRefs = [];
  for (const user of allUsers) {
    const userRef = collections.users().doc();
    batch.set(userRef, { id: userRef.id, ...user });
    userRefs.push({ ref: userRef, data: user });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // Sample Courses
  const courses = [
    {
      rtoId: rtoRefs[0].ref.id,
      code: 'ICT40120',
      name: 'Certificate IV in Information Technology',
      type: 'certificate_iv',
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
      rtoId: rtoRefs[1].ref.id,
      code: 'HLT33115',
      name: 'Certificate III in Health Services Assistance',
      type: 'certificate_iii',
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

  for (const course of courses) {
    const courseRef = collections.courses().doc();
    batch.set(courseRef, { id: courseRef.id, ...course });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // Sample Students
  const students = [
    {
      userId: userRefs[2].ref.id, // Sarah Wilson
      studentId: 'TSA001-2024-001',
      rtoId: rtoRefs[0].ref.id,
      status: 'in_placement',
      enrollmentDate: new Date('2024-01-15'),
      totalHoursRequired: 400,
      totalHoursCompleted: 265,
      riskLevel: 'low',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      userId: userRefs[3].ref.id, // Ben Carter
      studentId: 'TSA001-2024-002',
      rtoId: rtoRefs[0].ref.id,
      status: 'enrolled',
      enrollmentDate: new Date('2024-02-01'),
      totalHoursRequired: 400,
      totalHoursCompleted: 150,
      riskLevel: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const student of students) {
    const studentRef = collections.students().doc();
    batch.set(studentRef, { id: studentRef.id, ...student });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // Sample Contracts
  const contracts = [
    {
      rtoId: rtoRefs[0].ref.id,
      providerId: providerRefs[0].ref.id,
      title: 'Healthcare Placement Partnership Agreement',
      description: 'Partnership agreement for healthcare student placements',
      contractType: 'placement_agreement',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      maxStudents: 20,
      signedByProvider: true,
      signedByRto: true,
      providerSignedAt: new Date('2024-01-05'),
      rtoSignedAt: new Date('2024-01-03'),
      documentVersion: 1,
      createdBy: userRefs[0].ref.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const contract of contracts) {
    const contractRef = collections.contracts().doc();
    batch.set(contractRef, { id: contractRef.id, ...contract });
    batchCount++;
    await commitBatchIfNeeded();
  }

  // Commit final batch
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log('✅ Sample data seeded successfully');
  console.log(`📊 Created: ${rtos.length} RTOs, ${providers.length} providers, ${users.length} users, ${courses.length} courses, ${students.length} students, ${contracts.length} contracts`);
}

// Reset database (WARNING: Deletes all data)
async function resetDatabase() {
  console.log('⚠️  RESETTING DATABASE - This will delete all data!');
  
  const collections_to_reset = [
    'users', 'rtos', 'providers', 'students', 'courses', 'contracts', 
    'invitations', 'placementOpportunities', 'applications', 'placements',
    'hourLogs', 'assessments', 'complianceRecords', 'messages', 
    'notifications', 'dashboardStats', 'auditLogs'
  ];

  for (const collectionName of collections_to_reset) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      if (snapshot.docs.length > 0) {
        await batch.commit();
        console.log(`🗑️  Cleared ${snapshot.docs.length} documents from ${collectionName}`);
      }
    } catch (error) {
      console.log(`⚠️  Could not clear collection ${collectionName}:`, error);
    }
  }
  
  console.log('✅ Database reset completed');
}