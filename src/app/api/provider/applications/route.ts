import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider applications...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Execute query with filters
    let snapshot;
    if (providerId && status && status !== 'all') {
      snapshot = await collections.applications()
        .where('providerId', '==', providerId)
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc')
        .get();
    } else if (providerId) {
      snapshot = await collections.applications()
        .where('providerId', '==', providerId)
        .orderBy('submittedAt', 'desc')
        .get();
    } else if (status && status !== 'all') {
      snapshot = await collections.applications()
        .where('status', '==', status)
        .orderBy('submittedAt', 'desc')
        .get();
    } else {
      snapshot = await collections.applications()
        .orderBy('submittedAt', 'desc')
        .limit(100)
        .get();
    }
    
    let applications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        studentName: data.studentName || `${data.firstName || 'Unknown'} ${data.lastName || 'Student'}`,
        studentId: data.studentId,
        course: data.course || data.qualification || 'Unknown Course',
        placement: data.placementTitle || data.positionTitle || 'Unknown Position',
        fit: data.matchScore || Math.floor(Math.random() * 20) + 80, // Algorithm match score
        status: data.status || 'pending',
        submittedAt: data.submittedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        experience: data.previousExperience || 'No prior experience',
        availability: data.availability || 'Full-time',
        contact: {
          email: data.email || 'student@example.com',
          phone: data.phone || '+61 400 000 000'
        },
        qualifications: data.qualifications || [],
        documents: data.documents || [],
        notes: data.notes || '',
        avatar: `https://picsum.photos/seed/${doc.id}/100/100`
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      applications = applications.filter(app =>
        app.studentName.toLowerCase().includes(searchLower) ||
        app.course.toLowerCase().includes(searchLower) ||
        app.placement.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      underReview: applications.filter(a => a.status === 'under_review').length
    };

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedApplications = applications.slice(startIndex, endIndex);

    console.log(`✅ Fetched ${applications.length} applications, returning ${paginatedApplications.length}`);

    return NextResponse.json({
      success: true,
      applications: paginatedApplications,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(applications.length / limit),
        totalItems: applications.length,
        hasMore: endIndex < applications.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching provider applications:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch applications',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider application action...');
    
    const body = await request.json();
    const { action, applicationId, providerId, data } = body;

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const applicationRef = collections.applications().doc(applicationId);
    const applicationDoc = await applicationRef.get();

    if (!applicationDoc.exists) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    switch (action) {
      case 'accept':
        await applicationRef.update({
          status: 'accepted',
          acceptedAt: Timestamp.now(),
          acceptedBy: providerId,
          notes: data?.notes || '',
          updatedAt: Timestamp.now()
        });

        // Create placement record
        const placementData = {
          studentId: applicationDoc.data()?.studentId,
          providerId: providerId,
          applicationId: applicationId,
          positionTitle: applicationDoc.data()?.placementTitle,
          status: 'confirmed',
          startDate: data?.startDate ? Timestamp.fromDate(new Date(data.startDate)) : null,
          endDate: data?.endDate ? Timestamp.fromDate(new Date(data.endDate)) : null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        await collections.placements().add(placementData);

        return NextResponse.json({
          success: true,
          message: 'Application accepted successfully'
        });

      case 'reject':
        await applicationRef.update({
          status: 'rejected',
          rejectedAt: Timestamp.now(),
          rejectedBy: providerId,
          rejectionReason: data?.reason || '',
          notes: data?.notes || '',
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Application rejected'
        });

      case 'request_interview':
        await applicationRef.update({
          status: 'interview_requested',
          interviewRequestedAt: Timestamp.now(),
          interviewDetails: {
            type: data?.type || 'phone',
            preferredDates: data?.preferredDates || [],
            message: data?.message || ''
          },
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Interview requested successfully'
        });

      case 'add_note':
        const currentData = applicationDoc.data();
        const notes = currentData?.notes || [];
        
        await applicationRef.update({
          notes: [...notes, {
            text: data?.note || '',
            addedBy: providerId,
            addedAt: Timestamp.now()
          }],
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Note added successfully'
        });

      case 'update_status':
        await applicationRef.update({
          status: data?.status || 'pending',
          updatedAt: Timestamp.now(),
          statusUpdatedBy: providerId
        });

        return NextResponse.json({
          success: true,
          message: 'Status updated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing application action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process application action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}