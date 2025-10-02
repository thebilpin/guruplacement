import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider placements...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Execute query with filters
    let snapshot;
    if (providerId && status && status !== 'all') {
      snapshot = await collections.placementOpportunities()
        .where('providerId', '==', providerId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
    } else if (providerId) {
      snapshot = await collections.placementOpportunities()
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc')
        .get();
    } else if (status && status !== 'all') {
      snapshot = await collections.placementOpportunities()
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
    } else {
      snapshot = await collections.placementOpportunities()
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
    }
    
    let placements = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || data.positionTitle || 'Untitled Placement',
        department: data.department || 'General',
        location: data.location || 'TBD',
        duration: data.duration || '4 weeks',
        status: data.status || 'draft',
        studentsRequired: data.studentsRequired || data.maxStudents || 1,
        currentStudents: data.currentStudents || 0,
        applications: data.applicationsCount || 0,
        startDate: data.startDate?.toDate?.()?.toISOString() || null,
        endDate: data.endDate?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        requirements: data.requirements || [],
        skills: data.requiredSkills || data.skills || [],
        description: data.description || '',
        type: data.placementType || 'internship',
        supervisor: data.supervisor || 'TBA',
        pay: data.compensation || data.allowance || 'Unpaid',
        lastUpdated: data.updatedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString()
      };
    });

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      placements = placements.filter(placement =>
        placement.title.toLowerCase().includes(searchLower) ||
        placement.department.toLowerCase().includes(searchLower) ||
        placement.location.toLowerCase().includes(searchLower)
      );
    }

    // Calculate statistics
    const stats = {
      total: placements.length,
      active: placements.filter(p => p.status === 'active').length,
      pending: placements.filter(p => p.status === 'pending').length,
      completed: placements.filter(p => p.status === 'completed').length,
      draft: placements.filter(p => p.status === 'draft').length,
      totalStudents: placements.reduce((sum, p) => sum + p.currentStudents, 0),
      totalApplications: placements.reduce((sum, p) => sum + p.applications, 0)
    };

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPlacements = placements.slice(startIndex, endIndex);

    console.log(`✅ Fetched ${placements.length} placements, returning ${paginatedPlacements.length}`);

    return NextResponse.json({
      success: true,
      placements: paginatedPlacements,
      stats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(placements.length / limit),
        totalItems: placements.length,
        hasMore: endIndex < placements.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching provider placements:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch placements',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider placement action...');
    
    const body = await request.json();
    const { action, placementId, providerId, data } = body;

    switch (action) {
      case 'create':
        const newPlacement = {
          ...data,
          providerId: providerId,
          status: 'draft',
          currentStudents: 0,
          applicationsCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const placementRef = await collections.placementOpportunities().add(newPlacement);

        return NextResponse.json({
          success: true,
          placementId: placementRef.id,
          message: 'Placement created successfully'
        });

      case 'update':
        if (!placementId) {
          return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
        }

        const placementDocRef = collections.placementOpportunities().doc(placementId);
        const placementDoc = await placementDocRef.get();

        if (!placementDoc.exists) {
          return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
        }

        await placementDocRef.update({
          ...data,
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Placement updated successfully'
        });

      case 'publish':
        if (!placementId) {
          return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
        }

        await collections.placementOpportunities().doc(placementId).update({
          status: 'published',
          publishedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Placement published successfully'
        });

      case 'close':
        if (!placementId) {
          return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
        }

        await collections.placementOpportunities().doc(placementId).update({
          status: 'closed',
          closedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Placement closed successfully'
        });

      case 'delete':
        if (!placementId) {
          return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
        }

        await collections.placementOpportunities().doc(placementId).delete();

        return NextResponse.json({
          success: true,
          message: 'Placement deleted successfully'
        });

      case 'duplicate':
        if (!placementId) {
          return NextResponse.json({ error: 'Placement ID is required' }, { status: 400 });
        }

        const originalDoc = await collections.placementOpportunities().doc(placementId).get();
        if (!originalDoc.exists) {
          return NextResponse.json({ error: 'Original placement not found' }, { status: 404 });
        }

        const originalData = originalDoc.data();
        const duplicatedPlacement = {
          ...originalData,
          title: `${originalData?.title || 'Untitled'} (Copy)`,
          status: 'draft',
          currentStudents: 0,
          applicationsCount: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          publishedAt: null
        };

        const duplicateRef = await collections.placementOpportunities().add(duplicatedPlacement);

        return NextResponse.json({
          success: true,
          placementId: duplicateRef.id,
          message: 'Placement duplicated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing placement action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process placement action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}