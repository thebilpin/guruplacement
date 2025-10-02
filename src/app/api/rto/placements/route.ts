// RTO Placements API - Manage student placements for RTO organizations
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📍 Fetching RTO placements data...');

    const url = new URL(request.url);
    const rtoId = url.searchParams.get('rtoId');
    const studentId = url.searchParams.get('studentId');
    const providerId = url.searchParams.get('providerId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    // Build query for placements
    let placementsQuery = collections.placements();
    
    if (studentId) {
      placementsQuery = placementsQuery.where('studentId', '==', studentId);
    }
    
    if (providerId) {
      placementsQuery = placementsQuery.where('providerId', '==', providerId);
    }
    
    if (status) {
      placementsQuery = placementsQuery.where('status', '==', status);
    }

    const placementsSnapshot = await placementsQuery.limit(100).get();

    // Get detailed placement data with student and provider information
    const placementsData = await Promise.all(
      placementsSnapshot.docs.map(async (doc) => {
        const placementData = doc.data();
        
        try {
          // Get student data
          const studentDoc = await collections.students().doc(placementData.studentId).get();
          const studentData = studentDoc.exists ? studentDoc.data() : null;
          
          // Get student user data
          let studentUserData = null;
          if (studentData?.userId) {
            const userDoc = await collections.users().doc(studentData.userId).get();
            studentUserData = userDoc.exists ? userDoc.data() : null;
          }
          
          // Get provider data
          const providerDoc = await collections.providers().doc(placementData.providerId).get();
          const providerData = providerDoc.exists ? providerDoc.data() : null;
          
          // Get course data if available
          let courseData = null;
          if (studentData?.courseId) {
            const courseDoc = await collections.courses().doc(studentData.courseId).get();
            courseData = courseDoc.exists ? courseDoc.data() : null;
          }
          
          // Apply RTO filter if specified
          if (rtoId && studentData?.rtoId !== rtoId) {
            return null;
          }
          
          // Apply search filter
          const studentName = `${studentUserData?.firstName || ''} ${studentUserData?.lastName || ''}`.trim();
          const providerName = providerData?.name || '';
          
          if (search) {
            const searchLower = search.toLowerCase();
            if (!studentName.toLowerCase().includes(searchLower) && 
                !providerName.toLowerCase().includes(searchLower) &&
                !placementData.position?.toLowerCase().includes(searchLower)) {
              return null;
            }
          }
          
          return {
            id: doc.id,
            student: {
              id: placementData.studentId,
              studentId: studentData?.studentId || placementData.studentId,
              name: studentName || 'Unknown Student',
              email: studentUserData?.email || '',
              course: courseData?.name || studentData?.courseName || 'Unknown Course',
              cohort: studentData?.cohort || 'Default',
              rtoId: studentData?.rtoId
            },
            provider: {
              id: placementData.providerId,
              name: providerName || 'Unknown Provider',
              location: providerData?.location || '',
              contactPerson: providerData?.contactPerson || '',
              email: providerData?.email || '',
              phone: providerData?.phone || ''
            },
            placement: {
              position: placementData.position || 'Unknown Position',
              department: placementData.department || '',
              supervisor: placementData.supervisor || '',
              supervisorEmail: placementData.supervisorEmail || '',
              startDate: placementData.startDate,
              endDate: placementData.endDate,
              duration: placementData.duration || 0,
              status: placementData.status || 'pending',
              workHours: placementData.workHours || 0,
              totalHours: placementData.totalHours || 0,
              requiredHours: placementData.requiredHours || 0
            },
            progress: {
              hoursCompleted: placementData.hoursCompleted || 0,
              percentComplete: placementData.percentComplete || 0,
              lastUpdated: placementData.progressLastUpdated || placementData.updatedAt,
              milestones: placementData.milestones || [],
              assessments: placementData.assessments || []
            },
            compliance: {
              backgroundCheckComplete: placementData.backgroundCheckComplete || false,
              safetyTrainingComplete: placementData.safetyTrainingComplete || false,
              documentationComplete: placementData.documentationComplete || false,
              insuranceVerified: placementData.insuranceVerified || false
            },
            ratings: {
              studentRating: placementData.studentRating || null,
              providerRating: placementData.providerRating || null,
              studentFeedback: placementData.studentFeedback || '',
              providerFeedback: placementData.providerFeedback || ''
            },
            createdAt: placementData.createdAt,
            updatedAt: placementData.updatedAt,
            createdBy: placementData.createdBy
          };
        } catch (error) {
          console.error(`Error processing placement ${doc.id}:`, error);
          return {
            id: doc.id,
            status: placementData.status || 'unknown',
            error: true
          };
        }
      })
    );

    // Filter out null results from filtering
    const filteredPlacements = placementsData.filter(placement => placement !== null);

    // Get summary statistics
    const stats = {
      total: filteredPlacements.length,
      pending: filteredPlacements.filter(p => p.placement?.status === 'pending').length,
      in_progress: filteredPlacements.filter(p => p.placement?.status === 'in_progress').length,
      completed: filteredPlacements.filter(p => p.placement?.status === 'completed').length,
      cancelled: filteredPlacements.filter(p => p.placement?.status === 'cancelled').length,
      at_risk: filteredPlacements.filter(p => p.placement?.status === 'at_risk').length,
      totalHours: filteredPlacements.reduce((sum, p) => sum + (p.progress?.hoursCompleted || 0), 0),
      averageProgress: filteredPlacements.length > 0 
        ? Math.round(filteredPlacements.reduce((sum, p) => sum + (p.progress?.percentComplete || 0), 0) / filteredPlacements.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      placements: filteredPlacements,
      stats,
      filters: {
        rtoId,
        studentId,
        providerId,
        status,
        search
      }
    });

  } catch (error) {
    console.error('Error fetching RTO placements:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch placements data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new RTO placement...');
    
    const body = await request.json();
    const { placementData, rtoId } = body;

    if (!placementData.studentId || !placementData.providerId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and Provider ID are required'
      }, { status: 400 });
    }

    // Verify student belongs to RTO
    const studentDoc = await collections.students().doc(placementData.studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();
    if (rtoId && studentData?.rtoId !== rtoId) {
      return NextResponse.json({
        success: false,
        error: 'Student does not belong to this RTO'
      }, { status: 403 });
    }

    // Create placement record
    const placementRef = collections.placements().doc();
    const newPlacement = {
      studentId: placementData.studentId,
      providerId: placementData.providerId,
      position: placementData.position || 'General Placement',
      department: placementData.department || '',
      supervisor: placementData.supervisor || '',
      supervisorEmail: placementData.supervisorEmail || '',
      startDate: placementData.startDate,
      endDate: placementData.endDate,
      duration: placementData.duration || 0,
      requiredHours: placementData.requiredHours || 0,
      workHours: placementData.workHours || 0,
      status: 'pending',
      hoursCompleted: 0,
      percentComplete: 0,
      milestones: [],
      assessments: [],
      backgroundCheckComplete: false,
      safetyTrainingComplete: false,
      documentationComplete: false,
      insuranceVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: rtoId
    };

    await placementRef.set(newPlacement);

    // Update student status to in_placement if this is an active placement
    if (placementData.startDate && new Date(placementData.startDate) <= new Date()) {
      await collections.students().doc(placementData.studentId).update({
        status: 'in_placement',
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      placementId: placementRef.id,
      message: 'Placement created successfully'
    });

  } catch (error) {
    console.error('Error creating RTO placement:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create placement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating RTO placement...');
    
    const body = await request.json();
    const { placementId, updates, rtoId } = body;

    if (!placementId) {
      return NextResponse.json({
        success: false,
        error: 'Placement ID is required'
      }, { status: 400 });
    }

    // Get and verify placement
    const placementRef = collections.placements().doc(placementId);
    const placementDoc = await placementRef.get();

    if (!placementDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Placement not found'
      }, { status: 404 });
    }

    const placementData = placementDoc.data();

    // Verify student belongs to RTO if rtoId is specified
    if (rtoId) {
      const studentDoc = await collections.students().doc(placementData?.studentId).get();
      const studentData = studentDoc.exists ? studentDoc.data() : null;
      
      if (studentData?.rtoId !== rtoId) {
        return NextResponse.json({
          success: false,
          error: 'Not authorized to update this placement'
        }, { status: 403 });
      }
    }

    // Calculate progress if hours are being updated
    if (updates.hoursCompleted && placementData?.requiredHours) {
      updates.percentComplete = Math.min(100, Math.round((updates.hoursCompleted / placementData.requiredHours) * 100));
      updates.progressLastUpdated = new Date().toISOString();
    }

    // Update placement record
    await placementRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Update student status based on placement status
    const studentRef = collections.students().doc(placementData?.studentId);
    if (updates.status === 'completed') {
      await studentRef.update({
        status: 'completed',
        completionDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else if (updates.status === 'cancelled') {
      await studentRef.update({
        status: 'placement_ready',
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Placement updated successfully'
    });

  } catch (error) {
    console.error('Error updating RTO placement:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update placement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting RTO placement...');
    
    const url = new URL(request.url);
    const placementId = url.searchParams.get('placementId');
    const rtoId = url.searchParams.get('rtoId');

    if (!placementId) {
      return NextResponse.json({
        success: false,
        error: 'Placement ID is required'
      }, { status: 400 });
    }

    // Get and verify placement
    const placementDoc = await collections.placements().doc(placementId).get();
    if (!placementDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Placement not found'
      }, { status: 404 });
    }

    const placementData = placementDoc.data();

    // Verify authorization if rtoId is specified
    if (rtoId) {
      const studentDoc = await collections.students().doc(placementData?.studentId).get();
      const studentData = studentDoc.exists ? studentDoc.data() : null;
      
      if (studentData?.rtoId !== rtoId) {
        return NextResponse.json({
          success: false,
          error: 'Not authorized to delete this placement'
        }, { status: 403 });
      }
    }

    // Delete placement record
    await collections.placements().doc(placementId).delete();

    // Update student status back to placement_ready
    if (placementData?.studentId) {
      await collections.students().doc(placementData.studentId).update({
        status: 'placement_ready',
        updatedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Placement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting RTO placement:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete placement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}