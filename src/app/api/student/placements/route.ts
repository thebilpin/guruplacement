// Student Placements API - Track placement progress and manage placement data
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📍 Fetching Student placements...');

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const status = url.searchParams.get('status'); // active, completed, pending
    const includeHistory = url.searchParams.get('includeHistory') === 'true';

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Get student data
    const studentDoc = await collections.students().doc(studentId).get();
    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Build placement query
    let placementsQuery = collections.placements().where('studentId', '==', studentId);

    if (status) {
      placementsQuery = placementsQuery.where('status', '==', status);
    }

    const placementsSnapshot = await placementsQuery.orderBy('createdAt', 'desc').get();

    // Process placements with provider and supervisor data
    const placements = await Promise.all(
      placementsSnapshot.docs.map(async (doc) => {
        const placementData = doc.data();
        
        try {
          // Get provider data
          const providerDoc = await collections.providers().doc(placementData.providerId).get();
          const providerData = providerDoc.exists ? providerDoc.data() : null;

          // Get supervisor data if available
          let supervisorData = null;
          if (placementData.supervisorId) {
            const supervisorDoc = await collections.users().doc(placementData.supervisorId).get();
            supervisorData = supervisorDoc.exists ? supervisorDoc.data() : null;
          }

          // Get recent hour logs for this placement
          const hourLogsSnapshot = await collections.hourLogs()
            .where('placementId', '==', doc.id)
            .orderBy('date', 'desc')
            .limit(10)
            .get();

          const hourLogs = hourLogsSnapshot.docs.map(logDoc => ({
            id: logDoc.id,
            ...logDoc.data()
          }));

          // Calculate progress
          const totalHoursLogged = hourLogs.reduce((sum: number, log: any) => sum + (log.hours || 0), 0);
          const requiredHours = placementData.requiredHours || 160;
          const progressPercentage = Math.min((totalHoursLogged / requiredHours) * 100, 100);

          return {
            id: doc.id,
            placement: {
              position: placementData.position || 'Unknown Position',
              department: placementData.department || '',
              description: placementData.description || '',
              status: placementData.status || 'pending',
              startDate: placementData.startDate,
              endDate: placementData.endDate,
              duration: placementData.duration || 0,
              requiredHours,
              weeklyHours: placementData.weeklyHours || 35,
              schedule: placementData.schedule || 'Full-time'
            },
            provider: {
              id: placementData.providerId,
              name: providerData?.name || 'Unknown Provider',
              location: providerData?.location || placementData.location || '',
              address: providerData?.address || {},
              industry: providerData?.industry || 'Healthcare',
              contactPerson: providerData?.contactPerson || '',
              phone: providerData?.phone || '',
              email: providerData?.email || ''
            },
            supervisor: supervisorData ? {
              id: placementData.supervisorId,
              name: `${supervisorData.firstName || ''} ${supervisorData.lastName || ''}`.trim(),
              title: supervisorData.title || placementData.supervisorTitle || '',
              email: supervisorData.email || placementData.supervisorEmail || '',
              phone: supervisorData.phone || placementData.supervisorPhone || ''
            } : null,
            progress: {
              hoursLogged: totalHoursLogged,
              hoursRequired: requiredHours,
              percentage: Math.round(progressPercentage),
              weeksCompleted: Math.floor(totalHoursLogged / (placementData.weeklyHours || 35)),
              weeksCurrent: Math.ceil((new Date().getTime() - new Date(placementData.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)),
              onTrack: progressPercentage >= (Math.ceil((new Date().getTime() - new Date(placementData.startDate).getTime()) / (7 * 24 * 60 * 60 * 1000)) / (placementData.duration || 12)) * 100
            },
            compliance: {
              orientationComplete: placementData.orientationComplete || false,
              safetyTrainingComplete: placementData.safetyTrainingComplete || false,
              documentsSubmitted: placementData.documentsSubmitted || false,
              supervisorAssigned: !!placementData.supervisorId,
              emergencyContactsProvided: placementData.emergencyContactsProvided || false
            },
            assessment: {
              midPointComplete: placementData.midPointAssessmentComplete || false,
              finalComplete: placementData.finalAssessmentComplete || false,
              supervisorFeedback: placementData.supervisorFeedback || null,
              studentSelfAssessment: placementData.studentSelfAssessment || null,
              grades: placementData.grades || {}
            },
            documents: placementData.documents || [],
            notes: placementData.studentNotes || '',
            recentHourLogs: hourLogs.slice(0, 5),
            createdAt: placementData.createdAt,
            updatedAt: placementData.updatedAt
          };
        } catch (error) {
          console.error(`Error processing placement ${doc.id}:`, error);
          return {
            id: doc.id,
            error: true,
            placement: {
              position: placementData.position || 'Unknown Position',
              status: placementData.status || 'unknown'
            }
          };
        }
      })
    );

    // Filter out error results
    const validPlacements = placements.filter(p => !p.error);

    // Get current/active placement
    const currentPlacement = validPlacements.find(p => p.placement.status === 'in_progress' || p.placement.status === 'active');

    // Calculate summary statistics
    const stats = {
      total: validPlacements.length,
      active: validPlacements.filter(p => p.placement.status === 'in_progress' || p.placement.status === 'active').length,
      completed: validPlacements.filter(p => p.placement.status === 'completed').length,
      pending: validPlacements.filter(p => p.placement.status === 'pending').length,
      totalHoursLogged: validPlacements.reduce((sum, p) => sum + (p.progress?.hoursLogged || 0), 0),
      totalHoursRequired: validPlacements.reduce((sum, p) => sum + (p.progress?.hoursRequired || 0), 0),
      averageProgress: validPlacements.length > 0 
        ? Math.round(validPlacements.reduce((sum, p) => sum + (p.progress?.percentage || 0), 0) / validPlacements.length)
        : 0
    };

    const response = {
      success: true,
      currentPlacement,
      placements: includeHistory ? validPlacements : validPlacements.slice(0, 1),
      stats,
      student: {
        id: studentId,
        name: studentData?.name || 'Student',
        course: studentData?.courseName || 'Unknown Course',
        cohort: studentData?.cohort || 'Default'
      }
    };

    console.log('✅ Student placements fetched successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching Student placements:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch placements',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating Student hour log entry...');
    
    const body = await request.json();
    const { placementId, logData } = body;

    if (!placementId || !logData) {
      return NextResponse.json({
        success: false,
        error: 'Placement ID and log data are required'
      }, { status: 400 });
    }

    // Verify placement exists and belongs to student
    const placementDoc = await collections.placements().doc(placementId).get();
    if (!placementDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Placement not found'
      }, { status: 404 });
    }

    // Create hour log entry
    const hourLogRef = collections.hourLogs().doc();
    const hourLog = {
      placementId,
      studentId: placementDoc.data()?.studentId,
      date: logData.date,
      startTime: logData.startTime,
      endTime: logData.endTime,
      hours: logData.hours,
      activities: logData.activities || '',
      learningOutcomes: logData.learningOutcomes || '',
      supervisorPresent: logData.supervisorPresent || false,
      supervisorName: logData.supervisorName || '',
      notes: logData.notes || '',
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await hourLogRef.set(hourLog);

    // Update placement progress
    const placementData = placementDoc.data();
    const currentHours = placementData?.hoursCompleted || 0;
    const newTotalHours = currentHours + logData.hours;
    const requiredHours = placementData?.requiredHours || 160;
    const newProgress = Math.min((newTotalHours / requiredHours) * 100, 100);

    await collections.placements().doc(placementId).update({
      hoursCompleted: newTotalHours,
      progressPercentage: newProgress,
      lastActivityDate: logData.date,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      hourLogId: hourLogRef.id,
      message: 'Hour log submitted successfully',
      newTotalHours,
      newProgress: Math.round(newProgress)
    });

  } catch (error) {
    console.error('Error creating Student hour log:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit hour log',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating Student placement data...');
    
    const body = await request.json();
    const { placementId, updates, section } = body;

    if (!placementId) {
      return NextResponse.json({
        success: false,
        error: 'Placement ID is required'
      }, { status: 400 });
    }

    // Verify placement exists
    const placementRef = collections.placements().doc(placementId);
    const placementDoc = await placementRef.get();

    if (!placementDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Placement not found'
      }, { status: 404 });
    }

    // Update based on section
    let updateData: any = {
      updatedAt: new Date().toISOString()
    };

    switch (section) {
      case 'notes':
        updateData.studentNotes = updates.notes;
        break;
      case 'compliance':
        updateData = { ...updateData, ...updates };
        break;
      case 'assessment':
        updateData.studentSelfAssessment = updates.selfAssessment;
        updateData.studentReflection = updates.reflection;
        break;
      default:
        updateData = { ...updateData, ...updates };
    }

    await placementRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Placement updated successfully'
    });

  } catch (error) {
    console.error('Error updating Student placement:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update placement',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}