// API endpoint to create user in Firestore only (without Firebase Auth)
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, role, organization } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`📄 Creating Firestore user document for: ${email}`);

    // Generate a user ID (you can use any format)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user document in Firestore using server-side Admin SDK
    const userData = {
      id: userId,
      email: email,
      firstName: firstName || 'User',
      lastName: lastName || '',
      name: `${firstName || 'User'} ${lastName || ''}`.trim(),
      role: role || 'student',
      organization: organization || '',
      status: 'active',
      emailVerified: true,
      verificationStatus: role === 'rto_admin' ? 'pending' : 'pending',
      mustChangePassword: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: getDefaultPermissions(role),
      // Add note that this user needs Firebase Auth account
      needsFirebaseAuth: true,
      manualRegistrationRequired: true
    };

    // Use server-side Firebase Admin SDK
    const userRef = collections.users().doc(userId);
    await userRef.set(userData);
    console.log(`✅ Firestore user document created for: ${email}`);

    return NextResponse.json({
      success: true,
      message: `User ${email} created in database successfully`,
      userId: userId,
      userData: userData,
      nextSteps: [
        'User can now register through normal sign-up flow with the same email',
        'Firebase Auth account will be automatically linked to this profile',
        'User will be able to login immediately after registration'
      ]
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string) {
  switch (role) {
    case 'admin':
      return {
        users: { read: true, write: true, delete: true },
        courses: { read: true, write: true, delete: true },
        placements: { read: true, write: true, delete: true },
        reports: { read: true, write: true },
        settings: { read: true, write: true }
      };
    case 'rto_admin':
      return {
        students: { read: true, write: true },
        courses: { read: true, write: true },
        placements: { read: true, write: true },
        providers: { read: true, write: false },
        reports: { read: true, write: false }
      };
    case 'provider_admin':
      return {
        placements: { read: true, write: true },
        students: { read: true, write: false },
        reports: { read: true, write: false }
      };
    case 'assessor':
      return {
        assessments: { read: true, write: true },
        students: { read: true, write: false }
      };
    case 'supervisor':
      return {
        placements: { read: true, write: true },
        students: { read: true, write: false }
      };
    default:
      return {
        profile: { read: true, write: true }
      };
  }
}