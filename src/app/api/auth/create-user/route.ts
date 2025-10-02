// API endpoint to create users in Firebase Auth
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, role, organization } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const auth = getAuth();
    const db = getFirestore();

    // Create user in Firebase Auth
    console.log(`🔐 Creating Firebase Auth user: ${email}`);
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`,
      emailVerified: true,
    });

    console.log(`✅ Firebase Auth user created with UID: ${userRecord.uid}`);

    // Create user document in Firestore
    const userData = {
      id: userRecord.uid,
      email: email,
      firstName: firstName || 'User',
      lastName: lastName || '',
      name: `${firstName || 'User'} ${lastName || ''}`.trim(),
      role: role || 'student',
      organization: organization || '',
      status: 'active',
      emailVerified: true,
      verificationStatus: role === 'rto_admin' ? 'verified' : 'pending',
      mustChangePassword: false,
      twoFactorEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: getDefaultPermissions(role)
    };

    await db.collection('users').doc(userRecord.uid).set(userData);
    console.log(`📄 Firestore user document created for: ${email}`);

    return NextResponse.json({
      success: true,
      message: `User ${email} created successfully`,
      userId: userRecord.uid,
      userData: userData
    });

  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

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