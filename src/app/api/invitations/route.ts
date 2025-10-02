import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { InvitationStatus, generateInvitationToken } from '@/lib/schemas/verification';
import { hash } from 'bcryptjs';

// POST /api/invitations/send - Send invitation to user
export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      firstName, 
      lastName, 
      role, 
      invitedBy, 
      organizationId, 
      organizationType // 'rto' or 'provider'
    } = await request.json();

    if (!email || !firstName || !lastName || !role || !invitedBy || !organizationId || !organizationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role-organization mapping
    const validRoleMappings = {
      'student': 'rto',
      'assessor': 'rto', 
      'supervisor': 'provider'
    };

    if (validRoleMappings[role as keyof typeof validRoleMappings] !== organizationType) {
      return NextResponse.json(
        { error: `Role ${role} cannot be invited by ${organizationType}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUserQuery = await collections.users()
      .where('email', '==', email.toLowerCase())
      .get();

    if (!existingUserQuery.empty) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate invitation token and temporary password
    const invitationToken = generateInvitationToken();
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await hash(tempPassword, 12);

    // Create user with invitation status
    const userData = {
      email: email.toLowerCase(),
      firstName,
      lastName,
      role,
      status: 'pending',
      
      // Invitation fields
      invitationStatus: 'invited' as InvitationStatus,
      invitedBy,
      invitedAt: new Date(),
      invitationToken,
      
      // Organization linkage
      ...(organizationType === 'rto' ? { rtoId: organizationId } : { providerId: organizationId }),
      
      // Dashboard access
      canAccessDashboard: false,
      
      // Authentication
      passwordHash: hashedPassword,
      tempPassword, // Store temporarily for invitation email
      mustChangePassword: true,
      emailVerified: false,
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const userRef = await collections.users().add(userData);

    // TODO: Send invitation email with tempPassword and acceptance link
    // For now, we'll return the temp password for manual sharing

    return NextResponse.json({
      message: 'Invitation sent successfully',
      userId: userRef.id,
      tempPassword, // In production, this should be sent via email only
      invitationToken,
      invitationUrl: `/accept-invitation?token=${invitationToken}`,
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/invitations - Get invitations sent by current user/organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const invitedBy = searchParams.get('invitedBy');
    const organizationId = searchParams.get('organizationId');
    const organizationType = searchParams.get('organizationType');

    if (!invitedBy) {
      return NextResponse.json(
        { error: 'Missing invitedBy parameter' },
        { status: 400 }
      );
    }

    let query = collections.users().where('invitedBy', '==', invitedBy);

    // Filter by organization if provided
    if (organizationType && organizationId) {
      const orgField = organizationType === 'rto' ? 'rtoId' : 'providerId';
      query = query.where(orgField, '==', organizationId);
    }

    const invitationsSnapshot = await query.get();

    const invitations = invitationsSnapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        invitationStatus: data.invitationStatus,
        invitedAt: data.invitedAt,
        acceptedAt: data.acceptedAt,
        organizationId: data.rtoId || data.providerId,
        organizationType: data.rtoId ? 'rto' : 'provider',
      };
    });

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}