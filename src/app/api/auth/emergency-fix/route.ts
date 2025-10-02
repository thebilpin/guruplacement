// Emergency API to bypass verification check temporarily
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, action } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`🚨 Emergency fix for: ${email}`);

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

    if (action === 'check') {
      // Just return current status
      return NextResponse.json({
        success: true,
        currentData: {
          id: userId,
          email: currentData.email,
          role: currentData.role,
          verificationStatus: currentData.verificationStatus,
          emailVerified: currentData.emailVerified,
          status: currentData.status,
          name: currentData.name,
          firstName: currentData.firstName,
          lastName: currentData.lastName
        }
      });
    }

    // Emergency override - set everything to ensure access
    const emergencyUpdateData = {
      role: 'rto_admin',
      verificationStatus: 'verified',
      emailVerified: true,
      status: 'active',
      mustChangePassword: false,
      twoFactorEnabled: false,
      verifiedAt: new Date(),
      verifiedBy: 'emergency_override',
      verificationNotes: 'Emergency override to bypass verification issues',
      updatedAt: new Date(),
      // Ensure name fields are set
      firstName: currentData.firstName || 'RTO',
      lastName: currentData.lastName || 'Administrator',
      name: currentData.name || 'RTO Administrator',
      organization: currentData.organization || 'PlacementHero RTO'
    };

    await collections.users().doc(userId).set(emergencyUpdateData, { merge: true });
    console.log(`🚨 Emergency override applied for: ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Emergency override applied',
      action: 'CRITICAL: User MUST log out completely and log back in',
      data: emergencyUpdateData
    });

  } catch (error: any) {
    console.error('Emergency fix error:', error);
    return NextResponse.json(
      { error: 'Emergency fix failed', details: error.message },
      { status: 500 }
    );
  }
}