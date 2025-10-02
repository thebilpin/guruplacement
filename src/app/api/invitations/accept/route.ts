import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { InvitationStatus, isInvitationExpired } from '@/lib/schemas/verification';

// POST /api/invitations/accept - Accept invitation and activate user
export async function POST(request: NextRequest) {
  try {
    const { invitationToken, newPassword } = await request.json();

    if (!invitationToken) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }

    // Find user by invitation token
    const userQuery = await collections.users()
      .where('invitationToken', '==', invitationToken)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as any;

    // Check if invitation is expired
    if (isInvitationExpired(userData.invitedAt.toDate())) {
      await collections.users().doc(userDoc.id).update({
        invitationStatus: 'expired' as InvitationStatus,
        updatedAt: new Date(),
      });
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (userData.invitationStatus === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation already accepted' },
        { status: 409 }
      );
    }

    // Update user to accepted status
    const updateData: any = {
      invitationStatus: 'accepted' as InvitationStatus,
      acceptedAt: new Date(),
      canAccessDashboard: true,
      dashboardActivatedAt: new Date(),
      emailVerified: true,
      status: 'active',
      updatedAt: new Date(),
    };

    // If new password provided, hash and update
    if (newPassword) {
      const bcrypt = require('bcryptjs');
      updateData.passwordHash = await bcrypt.hash(newPassword, 12);
      updateData.mustChangePassword = false;
      updateData.tempPassword = null; // Clear temporary password
    }

    await collections.users().doc(userDoc.id).update(updateData);

    // Return user info for dashboard redirect
    return NextResponse.json({
      message: 'Invitation accepted successfully',
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        canAccessDashboard: true,
        dashboardUrl: getDashboardUrl(userData.role),
      }
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/invitations/accept - Get invitation details by token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing invitation token' },
        { status: 400 }
      );
    }

    // Find user by invitation token
    const userQuery = await collections.users()
      .where('invitationToken', '==', token)
      .limit(1)
      .get();

    if (userQuery.empty) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as any;

    // Check if invitation is expired
    const expired = isInvitationExpired(userData.invitedAt.toDate());
    
    if (expired) {
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 410 }
      );
    }

    // Check if already accepted
    if (userData.invitationStatus === 'accepted') {
      return NextResponse.json(
        { error: 'Invitation already accepted' },
        { status: 409 }
      );
    }

    // Get organization details
    let organizationName = '';
    try {
      if (userData.rtoId) {
        const rtoDoc = await collections.rtos().doc(userData.rtoId).get();
        organizationName = rtoDoc.exists ? rtoDoc.data()?.name || '' : '';
      } else if (userData.providerId) {
        const providerDoc = await collections.providers().doc(userData.providerId).get();
        organizationName = providerDoc.exists ? providerDoc.data()?.name || '' : '';
      }
    } catch (error) {
      console.log('Could not fetch organization name:', error);
    }

    return NextResponse.json({
      invitation: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        organizationName,
        invitedAt: userData.invitedAt,
        requiresPasswordChange: userData.mustChangePassword,
      }
    });

  } catch (error) {
    console.error('Error fetching invitation details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to get dashboard URL based on role
function getDashboardUrl(role: string): string {
  const dashboardUrls: Record<string, string> = {
    'student': '/student/dashboard',
    'supervisor': '/supervisor/dashboard',
    'assessor': '/assessor/dashboard',
    'rto_admin': '/rto/dashboard',
    'provider_admin': '/provider/dashboard',
    'platform_admin': '/admin/dashboard',
  };
  
  return dashboardUrls[role] || '/dashboard';
}