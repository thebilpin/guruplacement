// API to link existing Firebase Auth user to Firestore document
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { getAuth } from 'firebase-admin/auth';
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
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const auth = getAuth();

    // Get the existing Firebase Auth user
    console.log(`🔍 Looking for Firebase Auth user: ${email}`);
    let authUser;
    try {
      authUser = await auth.getUserByEmail(email);
      console.log(`✅ Found Firebase Auth user: ${authUser.uid}`);
    } catch (error) {
      return NextResponse.json(
        { error: 'Firebase Auth user not found', details: 'User needs to sign up first' },
        { status: 404 }
      );
    }

    // Check if Firestore document already exists
    const existingUserSnapshot = await collections.users()
      .where('email', '==', email)
      .get();

    if (!existingUserSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'User document already exists',
        userId: existingUserSnapshot.docs[0].id,
        userData: existingUserSnapshot.docs[0].data()
      });
    }

    // Create Firestore document using the Firebase Auth UID
    console.log(`📄 Creating Firestore document for: ${email}`);
    const userData = {
      id: authUser.uid,
      email: authUser.email,
      firstName: authUser.displayName?.split(' ')[0] || 'RTO',
      lastName: authUser.displayName?.split(' ').slice(1).join(' ') || 'Administrator',
      name: authUser.displayName || 'RTO Administrator',
      role: 'rto_admin',
      organization: 'PlacementHero RTO',
      status: 'active',
      emailVerified: authUser.emailVerified,
      verificationStatus: 'pending',
      mustChangePassword: false,
      twoFactorEnabled: false,
      createdAt: authUser.metadata.creationTime ? new Date(authUser.metadata.creationTime) : new Date(),
      updatedAt: new Date(),
      permissions: {
        students: { read: true, write: true },
        courses: { read: true, write: true },
        placements: { read: true, write: true },
        providers: { read: true, write: false },
        reports: { read: true, write: false }
      }
    };

    // Use the same UID as Firebase Auth
    const userRef = collections.users().doc(authUser.uid);
    await userRef.set(userData);
    console.log(`✅ Firestore user document created with UID: ${authUser.uid}`);

    return NextResponse.json({
      success: true,
      message: `User ${email} linked successfully`,
      userId: authUser.uid,
      userData: userData,
      status: 'User can now appear in verification queue'
    });

  } catch (error: any) {
    console.error('Error linking user:', error);
    return NextResponse.json(
      { error: 'Failed to link user', details: error.message },
      { status: 500 }
    );
  }
}