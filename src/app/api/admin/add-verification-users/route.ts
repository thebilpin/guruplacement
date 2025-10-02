import { NextResponse } from 'next/server';
import { collections, db } from '@/lib/db';

export async function POST() {
  try {
    // Create sample RTO and Provider users that need verification
    const verificationUsers = [
      {
        id: 'rto_admin_1',
        email: 'admin@techskills-rto.edu.au',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'rto_admin',
        status: 'active',
        verificationStatus: 'pending',
        organization: 'TechSkills RTO',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'rto_admin_2',
        email: 'coordinator@vocation-edu.com.au',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'rto_admin',
        status: 'active',
        verificationStatus: 'under_review',
        organization: 'VocationEd Institute',
        verificationNotes: 'Documents under review',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date()
      },
      {
        id: 'provider_admin_1',
        email: 'hr@innovatetech.com.au',
        firstName: 'Emma',
        lastName: 'Wilson',
        role: 'provider_admin',
        status: 'active',
        verificationStatus: 'pending',
        organization: 'InnovateTech Solutions',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'provider_admin_2',
        email: 'director@greenbuilds.com.au',
        firstName: 'James',
        lastName: 'Brown',
        role: 'provider_admin',
        status: 'active',
        verificationStatus: 'verified',
        organization: 'GreenBuilds Construction',
        verifiedBy: 'admin_1',
        verifiedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        verificationNotes: 'All documentation verified successfully',
        canAccessDashboard: true,
        dashboardActivatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date()
      },
      {
        id: 'rto_admin_3',
        email: 'admin@skillscentral.edu.au',
        firstName: 'Lisa',
        lastName: 'Davis',
        role: 'rto_admin',
        status: 'active',
        verificationStatus: 'rejected',
        organization: 'Skills Central',
        verificationNotes: 'Missing required compliance documentation. Please resubmit with complete ASQA registration.',
        verifiedBy: 'admin_1',
        verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date()
      },
      {
        id: 'provider_admin_3',
        email: 'manager@digitalcorp.com.au',
        firstName: 'Robert',
        lastName: 'Taylor',
        role: 'provider_admin',
        status: 'active',
        verificationStatus: 'under_review',
        organization: 'Digital Corp Australia',
        verificationNotes: 'Checking workplace safety certifications',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date()
      }
    ];

    const batch = db.batch();
    
    for (const user of verificationUsers) {
      const userRef = collections.users().doc(user.id);
      batch.set(userRef, user);
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Added ${verificationUsers.length} verification users`,
      users: verificationUsers.map(u => ({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        email: u.email,
        role: u.role,
        organization: u.organization,
        verificationStatus: u.verificationStatus
      }))
    });

  } catch (error) {
    console.error('Error adding verification users:', error);
    return NextResponse.json(
      { error: 'Failed to add verification users' },
      { status: 500 }
    );
  }
}