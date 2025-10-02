// Provider Dashboard API - Real-time placement and supervisor statistics
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider dashboard data...');

    // Get Provider ID from query params (in real app, from auth)
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    
    // Fetch provider-specific data in parallel
    const [
      placementOpportunitiesSnapshot,
      applicationsSnapshot,
      contractsSnapshot,
      supervisorsSnapshot,
      invitationsSnapshot,
      providerSnapshot
    ] = await Promise.all([
      providerId 
        ? collections.placementOpportunities().where('providerId', '==', providerId).get()
        : collections.placementOpportunities().limit(20).get(),
      collections.applications().limit(50).get().catch(() => ({ docs: [] })),
      providerId 
        ? collections.contracts().where('providerId', '==', providerId).get()
        : collections.contracts().get(),
      providerId 
        ? collections.users()
            .where('role', '==', 'supervisor')
            .where('providerId', '==', providerId)
            .get()
        : collections.users().where('role', '==', 'supervisor').limit(20).get(),
      collections.invitations()
        .where('organizationType', '==', 'provider')
        .get().catch(() => ({ docs: [] })),
      providerId 
        ? collections.providers().doc(providerId).get()
        : Promise.resolve({ exists: false, data: () => ({}) })
    ]);

    const providerData = providerSnapshot.exists ? providerSnapshot.data() : {};

    // Process placement opportunities
    const allOpportunities = placementOpportunitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Process applications for this provider's opportunities
    const allApplications = applicationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    // Filter applications for this provider's opportunities
    const providerApplications = allApplications.filter(app => 
      allOpportunities.some(opp => opp.id === app.opportunityId)
    );

    // Get recent applications with student details
    const recentApplications = await Promise.all(
      providerApplications
        .sort((a, b) => {
          const aDate = a.applicationDate?.toDate?.() || new Date(a.applicationDate || 0);
          const bDate = b.applicationDate?.toDate?.() || new Date(b.applicationDate || 0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5)
        .map(async (app) => {
          try {
            // Get student details
            const studentDoc = await collections.students().doc(app.studentId).get();
            const studentData = studentDoc.exists ? studentDoc.data() : {};
            
            const userDoc = await collections.users().doc(studentData?.userId || app.studentId).get();
            const userData = userDoc.exists ? userDoc.data() : {};

            // Get opportunity details
            const opportunity = allOpportunities.find(opp => opp.id === app.opportunityId);

            return {
              id: app.id,
              name: `${userData?.firstName || 'Unknown'} ${userData?.lastName || 'Student'}`,
              course: opportunity?.title || 'Unknown Course',
              applied: formatTimeAgo(app.applicationDate),
              avatar: userData?.avatarUrl || `https://picsum.photos/seed/${userData?.email || app.id}/100/100`,
              status: app.status || 'submitted',
              studentId: app.studentId,
              opportunityId: app.opportunityId
            };
          } catch (error) {
            console.error('Error processing application:', app.id, error);
            return {
              id: app.id,
              name: 'Unknown Student',
              course: 'Unknown Course',
              applied: 'Recently',
              avatar: `https://picsum.photos/seed/${app.id}/100/100`,
              status: app.status || 'submitted'
            };
          }
        })
    );

    // Calculate placement statistics
    const activePlacements = allOpportunities.filter(opp => 
      ['published', 'applications_open'].includes(opp.status)
    ).length;

    const studentsHosted = allOpportunities.reduce((total, opp) => 
      total + (opp.currentStudents || 0), 0
    );

    const pendingApplications = providerApplications.filter(app => 
      ['submitted', 'under_review'].includes(app.status)
    ).length;

    // Process supervisors
    const allSupervisors = supervisorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const activeSupervisors = allSupervisors.filter(supervisor => 
      supervisor.invitationStatus === 'accepted'
    ).length;

    // Process contracts
    const allContracts = contractsSnapshot.docs.map(doc => doc.data()) as any[];
    const activeContracts = allContracts.filter(contract => 
      contract.status === 'active'
    ).length;
    const pendingSignatures = allContracts.filter(contract => 
      contract.status === 'pending_signatures'
    ).length;

    // Process invitations
    const allInvitations = invitationsSnapshot.docs.map(doc => doc.data()) as any[];
    const pendingInvitations = allInvitations.filter(invitation => 
      invitation.status === 'invited' && invitation.organizationId === providerId
    ).length;

    const stats = {
      activePlacements,
      studentsHosted,
      pendingApplications,
      activeSupervisors,
      averageSatisfaction: 4.8, // This would come from evaluations
      activeContracts,
      pendingSignatures,
      pendingInvitations
    };

    console.log('✅ Provider dashboard data fetched successfully');
    console.log('📊 Stats:', stats);
    console.log('📝 Recent applications:', recentApplications.length);

    return NextResponse.json({
      success: true,
      stats,
      recentApplications,
      metadata: {
        providerName: (providerData as any)?.name || 'Unknown Provider',
        totalOpportunities: allOpportunities.length,
        totalSupervisors: allSupervisors.length
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('❌ Error fetching Provider dashboard data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch Provider dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to format time ago
function formatTimeAgo(date: any): string {
  if (!date) return 'Recently';
  
  const now = new Date();
  const dateObj = date?.toDate?.() || new Date(date);
  const diffMs = now.getTime() - dateObj.getTime();
  
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}