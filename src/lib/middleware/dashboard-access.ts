import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { canAccessDashboard, VerificationUser } from '@/lib/schemas/verification';

// Middleware to check if user can access their dashboard
export async function checkDashboardAccess(request: NextRequest, userId: string) {
  try {
    // Get user data
    const userDoc = await collections.users().doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        canAccess: false,
        redirectTo: '/login',
        reason: 'User not found'
      };
    }

    const userData = { id: userDoc.id, ...userDoc.data() } as VerificationUser;
    
    // Check dashboard access rules
    const access = canAccessDashboard(userData);
    
    if (!access.canAccess) {
      return {
        canAccess: false,
        redirectTo: getRedirectUrl(userData.role, userData),
        reason: access.reason
      };
    }

    return {
      canAccess: true,
      user: userData
    };

  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return {
      canAccess: false,
      redirectTo: '/login',
      reason: 'Authentication error'
    };
  }
}

// Get appropriate redirect URL based on user status
function getRedirectUrl(role: string, user: VerificationUser): string {
  switch (role) {
    case 'rto_admin':
      if (user.verificationStatus === 'pending' || !user.verificationStatus) {
        return '/rto/verification-pending';
      } else if (user.verificationStatus === 'rejected') {
        return '/rto/verification-rejected';
      } else if (user.verificationStatus === 'suspended') {
        return '/rto/account-suspended';
      }
      return '/rto/verification-pending';
      
    case 'provider_admin':
      if (user.verificationStatus === 'pending' || !user.verificationStatus) {
        return '/provider/verification-pending';
      } else if (user.verificationStatus === 'rejected') {
        return '/provider/verification-rejected';
      } else if (user.verificationStatus === 'suspended') {
        return '/provider/account-suspended';
      }
      return '/provider/verification-pending';
      
    case 'student':
      if (user.invitationStatus === 'invited') {
        return `/accept-invitation?token=${user.invitationToken}`;
      } else if (!user.rtoId) {
        return '/student/no-rto';
      }
      return '/student/invitation-pending';
      
    case 'supervisor':
      if (user.invitationStatus === 'invited') {
        return `/accept-invitation?token=${user.invitationToken}`;
      } else if (!user.providerId) {
        return '/supervisor/no-provider';
      }
      return '/supervisor/invitation-pending';
      
    case 'assessor':
      if (user.invitationStatus === 'invited') {
        return `/accept-invitation?token=${user.invitationToken}`;
      } else if (!user.rtoId) {
        return '/assessor/no-rto';
      }
      return '/assessor/invitation-pending';
      
    default:
      return '/login';
  }
}

// API endpoint to check current user's dashboard access
export async function GET(request: NextRequest) {
  try {
    // Get userId from request headers or authentication
    const userId = request.headers.get('X-User-ID');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const result = await checkDashboardAccess(request, userId);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error checking dashboard access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}