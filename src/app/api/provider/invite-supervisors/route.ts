import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider supervisors...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Fetch supervisors for this provider
    let supervisorsSnapshot;
    if (status && status !== 'all') {
      supervisorsSnapshot = await collections.users()
        .where('role', '==', 'supervisor')
        .where('providerId', '==', providerId)
        .where('invitationStatus', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
    } else {
      supervisorsSnapshot = await collections.users()
        .where('role', '==', 'supervisor')
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc')
        .get();
    }

    // Fetch pending invitations
    const invitationsSnapshot = await collections.invitations()
      .where('organizationType', '==', 'provider')
      .where('organizationId', '==', providerId)
      .where('role', '==', 'supervisor')
      .orderBy('createdAt', 'desc')
      .get();

    // Process supervisors
    const supervisors = supervisorsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unnamed Supervisor',
        email: data.email || '',
        phone: data.phone || '',
        department: data.department || '',
        position: data.position || data.jobTitle || 'Supervisor',
        status: data.invitationStatus || data.status || 'pending',
        invitedAt: data.invitedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString(),
        acceptedAt: data.acceptedAt?.toDate?.()?.toISOString() || null,
        lastActive: data.lastLoginAt?.toDate?.()?.toISOString() || null,
        studentsSupervised: data.studentsSupervised || 0,
        completedPlacements: data.completedPlacements || 0,
        averageRating: data.averageRating || 0,
        specializations: data.specializations || [],
        qualifications: data.qualifications || [],
        avatar: `https://picsum.photos/seed/${doc.id}/100/100`
      };
    });

    // Process pending invitations
    const invitations = invitationsSnapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email || '',
        name: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'Pending',
        department: data.department || '',
        position: data.position || 'Supervisor',
        status: data.status || 'invited',
        invitedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        expiresAt: data.expiresAt?.toDate?.()?.toISOString() || null,
        invitedBy: data.invitedBy || 'System'
      };
    });

    // Combine and categorize all supervisors
    const allSupervisors = [
      ...supervisors,
      ...invitations.map(inv => ({
        ...inv,
        studentsSupervised: 0,
        completedPlacements: 0,
        averageRating: 0,
        specializations: [],
        qualifications: [],
        avatar: `https://picsum.photos/seed/${inv.id}/100/100`
      }))
    ];

    // Calculate statistics
    const stats = {
      total: allSupervisors.length,
      active: supervisors.filter(s => s.status === 'accepted').length,
      pending: supervisors.filter(s => s.status === 'pending').length + invitations.length,
      declined: supervisors.filter(s => s.status === 'declined').length,
      invited: invitations.length,
      totalStudentsSupervised: supervisors.reduce((sum, s) => sum + s.studentsSupervised, 0),
      averageRating: supervisors.length > 0 
        ? (supervisors.reduce((sum, s) => sum + s.averageRating, 0) / supervisors.length).toFixed(1)
        : '0.0'
    };

    // Get recent supervisor activities
    const recentActivities = supervisors
      .filter(s => s.lastActive)
      .sort((a, b) => new Date(b.lastActive!).getTime() - new Date(a.lastActive!).getTime())
      .slice(0, 5)
      .map(s => ({
        supervisorId: s.id,
        supervisorName: s.name,
        activity: 'Last active',
        timestamp: s.lastActive
      }));

    console.log(`✅ Fetched ${supervisors.length} supervisors and ${invitations.length} pending invitations`);

    return NextResponse.json({
      success: true,
      supervisors: allSupervisors,
      stats,
      recentActivities
    });

  } catch (error) {
    console.error('❌ Error fetching provider supervisors:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch supervisors',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider supervisor action...');
    
    const body = await request.json();
    const { action, providerId, data } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'invite_supervisor':
        // Create invitation record
        const invitationData = {
          organizationType: 'provider',
          organizationId: providerId,
          role: 'supervisor',
          email: data.email,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          department: data.department || '',
          position: data.position || 'Supervisor',
          phone: data.phone || '',
          specializations: data.specializations || [],
          status: 'invited',
          createdAt: Timestamp.now(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days
          invitedBy: data.invitedBy || 'Provider Admin'
        };

        const invitationRef = await collections.invitations().add(invitationData);

        // Create notification for the invitee (if they have an account)
        const existingUserSnapshot = await collections.users().where('email', '==', data.email).get();
        if (!existingUserSnapshot.empty) {
          await collections.notifications().add({
            type: 'supervisor_invitation',
            userId: existingUserSnapshot.docs[0].id,
            providerId,
            invitationId: invitationRef.id,
            message: `You've been invited to supervise placements at ${data.organizationName || 'an organization'}`,
            createdAt: Timestamp.now(),
            read: false
          });
        }

        // Create audit log
        await collections.auditLogs().add({
          providerId,
          action: 'Supervisor invited',
          details: `Invited ${data.email} as supervisor`,
          timestamp: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          invitationId: invitationRef.id,
          message: 'Supervisor invitation sent successfully'
        });

      case 'resend_invitation':
        const { invitationId } = data;
        if (!invitationId) {
          return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
        }

        await collections.invitations().doc(invitationId).update({
          status: 'invited',
          resentAt: Timestamp.now(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Invitation resent successfully'
        });

      case 'cancel_invitation':
        const { invitationId: cancelId } = data;
        if (!cancelId) {
          return NextResponse.json({ error: 'Invitation ID is required' }, { status: 400 });
        }

        await collections.invitations().doc(cancelId).update({
          status: 'cancelled',
          cancelledAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Invitation cancelled successfully'
        });

      case 'update_supervisor':
        const { supervisorId } = data;
        if (!supervisorId) {
          return NextResponse.json({ error: 'Supervisor ID is required' }, { status: 400 });
        }

        const updateData: any = {
          updatedAt: Timestamp.now()
        };

        // Only update provided fields
        if (data.firstName) updateData.firstName = data.firstName;
        if (data.lastName) updateData.lastName = data.lastName;
        if (data.email) updateData.email = data.email;
        if (data.phone) updateData.phone = data.phone;
        if (data.department) updateData.department = data.department;
        if (data.position) updateData.position = data.position;
        if (data.specializations) updateData.specializations = data.specializations;
        if (data.qualifications) updateData.qualifications = data.qualifications;

        await collections.users().doc(supervisorId).update(updateData);

        return NextResponse.json({
          success: true,
          message: 'Supervisor updated successfully'
        });

      case 'deactivate_supervisor':
        const { supervisorId: deactivateId } = data;
        if (!deactivateId) {
          return NextResponse.json({ error: 'Supervisor ID is required' }, { status: 400 });
        }

        await collections.users().doc(deactivateId).update({
          status: 'inactive',
          deactivatedAt: Timestamp.now(),
          deactivatedBy: data.deactivatedBy || 'Provider Admin',
          deactivationReason: data.reason || '',
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Supervisor deactivated successfully'
        });

      case 'bulk_invite':
        const { supervisors } = data;
        if (!Array.isArray(supervisors) || supervisors.length === 0) {
          return NextResponse.json({ error: 'Supervisors array is required' }, { status: 400 });
        }

        const invitationPromises = supervisors.map(supervisor => {
          return collections.invitations().add({
            organizationType: 'provider',
            organizationId: providerId,
            role: 'supervisor',
            email: supervisor.email,
            firstName: supervisor.firstName || '',
            lastName: supervisor.lastName || '',
            department: supervisor.department || '',
            position: supervisor.position || 'Supervisor',
            phone: supervisor.phone || '',
            status: 'invited',
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            invitedBy: data.invitedBy || 'Provider Admin'
          });
        });

        await Promise.all(invitationPromises);

        return NextResponse.json({
          success: true,
          message: `${supervisors.length} supervisor invitations sent successfully`
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing supervisor action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process supervisor action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}