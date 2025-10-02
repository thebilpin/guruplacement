// API to completely fix all user issues
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, emailVerified, verificationStatus } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`🔧 Complete fix for user: ${email}`);

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

    console.log(`📄 Before fix:`, {
      email: currentData.email,
      role: currentData.role,
      verificationStatus: currentData.verificationStatus,
      emailVerified: currentData.emailVerified
    });

    // Complete update with all fixes
    const updateData = {
      role: role || 'rto_admin',
      emailVerified: emailVerified !== undefined ? emailVerified : true,
      verificationStatus: verificationStatus || 'verified',
      verifiedAt: new Date(),
      verifiedBy: 'system_complete_fix',
      verificationNotes: 'Complete user fix - role, verification status, and email verification corrected',
      updatedAt: new Date(),
      // Ensure other required fields are set
      status: 'active',
      mustChangePassword: false,
      twoFactorEnabled: false
    };

    await collections.users().doc(userId).update(updateData);
    console.log(`✅ Complete fix applied for user: ${email}`);

    // Get updated data to confirm
    const updatedDoc = await collections.users().doc(userId).get();
    const updatedData = updatedDoc.data();

    return NextResponse.json({
      success: true,
      message: `Complete fix applied for ${email}`,
      before: {
        role: currentData.role || 'not set',
        verificationStatus: currentData.verificationStatus || 'not set',
        emailVerified: currentData.emailVerified || false
      },
      after: {
        role: updatedData?.role,
        verificationStatus: updatedData?.verificationStatus,
        emailVerified: updatedData?.emailVerified,
        verifiedAt: updatedData?.verifiedAt,
        verifiedBy: updatedData?.verifiedBy
      },
      nextSteps: [
        'User must log out completely',
        'Clear browser cache and cookies',
        'Log back in with the same credentials',
        'Authentication system will load fresh user data',
        'User should now access RTO dashboard instead of verification pending'
      ]
    });

  } catch (error: any) {
    console.error('Error in complete fix:', error);
    return NextResponse.json(
      { error: 'Failed to apply complete fix', details: error.message },
      { status: 500 }
    );
  }
}