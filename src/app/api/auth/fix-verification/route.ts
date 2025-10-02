// API to directly fix user verification status
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationStatus } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Fixing verification status for: ${email}`);

    // Find the user in Firestore
    const userSnapshot = await collections.users()
      .where('email', '==', email)
      .get();

    if (userSnapshot.empty) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    const currentData = userDoc.data();

    console.log(`📄 Current user data:`, {
      email: currentData.email,
      role: currentData.role,
      verificationStatus: currentData.verificationStatus
    });

    // Update the user document with verified status
    const updateData = {
      verificationStatus: verificationStatus || 'verified',
      verifiedAt: new Date(),
      verifiedBy: 'system_fix',
      verificationNotes: 'Status corrected via fix API',
      updatedAt: new Date()
    };

    await collections.users().doc(userId).update(updateData);
    console.log(`✅ Updated user verification status to: ${verificationStatus || 'verified'}`);

    // Get updated data to confirm
    const updatedDoc = await collections.users().doc(userId).get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: `User ${email} verification status fixed`,
      before: {
        verificationStatus: currentData.verificationStatus || 'not set'
      },
      after: {
        verificationStatus: updatedData?.verificationStatus,
        verifiedAt: updatedData?.verifiedAt,
        verifiedBy: updatedData?.verifiedBy
      },
      instructions: [
        'User should now log out completely',
        'Clear browser cache/cookies', 
        'Log back in',
        'Should now access RTO dashboard instead of verification pending'
      ]
    });

  } catch (error: any) {
    console.error('Error fixing user verification:', error);
    return NextResponse.json(
      { error: 'Failed to fix verification status', details: error.message },
      { status: 500 }
    );
  }
}