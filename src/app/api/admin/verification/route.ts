import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { VerificationStatus } from '@/lib/schemas/verification';

// GET /api/admin/verification - Get all users pending verification
export async function GET() {
  try {
    // Get all users that need verification (RTOs and Providers)
    const usersSnapshot = await collections.users()
      .where('role', 'in', ['rto_admin', 'provider_admin'])
      .get();

    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // Separate by status
    const pendingVerification = users.filter((user: any) => 
      !user.verificationStatus || user.verificationStatus === 'pending'
    );
    
    const underReview = users.filter((user: any) => 
      user.verificationStatus === 'under_review'
    );
    
    const verified = users.filter((user: any) => 
      user.verificationStatus === 'verified'
    );
    
    const rejected = users.filter((user: any) => 
      user.verificationStatus === 'rejected'
    );

    return NextResponse.json({
      pendingVerification,
      underReview,
      verified,
      rejected,
      totals: {
        pending: pendingVerification.length,
        underReview: underReview.length,
        verified: verified.length,
        rejected: rejected.length,
        total: users.length
      }
    });

  } catch (error) {
    console.error('Error fetching verification data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/verification - Update verification status
export async function POST(request: NextRequest) {
  try {
    const { userId, verificationStatus, verificationNotes, adminId } = await request.json();

    if (!userId || !verificationStatus || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, verificationStatus, adminId' },
        { status: 400 }
      );
    }

    // Validate verification status
    const validStatuses: VerificationStatus[] = ['pending', 'under_review', 'verified', 'rejected', 'suspended'];
    if (!validStatuses.includes(verificationStatus)) {
      return NextResponse.json(
        { error: 'Invalid verification status' },
        { status: 400 }
      );
    }

    // Update user verification status
    const updateData: any = {
      verificationStatus,
      verificationNotes: verificationNotes || '',
      verifiedBy: adminId,
      verifiedAt: new Date(),
      updatedAt: new Date(),
    };

    // If verified, also update canAccessDashboard
    if (verificationStatus === 'verified') {
      updateData.canAccessDashboard = true;
      updateData.dashboardActivatedAt = new Date();
    } else if (verificationStatus === 'rejected' || verificationStatus === 'suspended') {
      updateData.canAccessDashboard = false;
      updateData.dashboardActivatedAt = null;
    }

    await collections.users().doc(userId).update(updateData);

    // Get updated user data
    const userDoc = await collections.users().doc(userId).get();
    const userData = { id: userDoc.id, ...userDoc.data() };

    return NextResponse.json({
      message: 'Verification status updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Error updating verification status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}