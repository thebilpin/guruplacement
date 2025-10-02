// Student Dashboard API - Comprehensive student overview and statistics
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('� Fetching Student dashboard data...');

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const userId = url.searchParams.get('userId');

    if (!studentId && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID or User ID is required'
      }, { status: 400 });
    }

    // Get student record
    let studentDoc;
    let studentData;
    
    if (studentId) {
      studentDoc = await collections.students().doc(studentId).get();
      if (!studentDoc.exists) {
        return NextResponse.json({
          success: false,
          error: 'Student not found'
        }, { status: 404 });
      }
      studentData = studentDoc.data();
    } else if (userId) {
      const studentSnapshot = await collections.students().where('userId', '==', userId).limit(1).get();
      if (studentSnapshot.empty) {
        return NextResponse.json({
          success: false,
          error: 'Student not found'
        }, { status: 404 });
      }
      studentDoc = studentSnapshot.docs[0];
      studentData = studentDoc.data();
    }

    if (!studentDoc || !studentData) {
      return NextResponse.json({
        success: false,
        error: 'Student data not found'
      }, { status: 404 });
    }

    // Get user data for name
    const userDoc = await collections.users().doc(studentData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Get RTO data
    let rtoData = null;
    if (studentData.rtoId) {
      const rtoDoc = await collections.rtos().doc(studentData.rtoId).get();
      rtoData = rtoDoc.exists ? rtoDoc.data() : null;
    }

    // Get placement data
    const placementsSnapshot = await collections.placements()
      .where('studentId', '==', studentDoc.id)
      .orderBy('createdAt', 'desc')
      .get();

    const placements = placementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    const activePlacement = placements.find((p: any) => p.status === 'in_progress' || p.status === 'active');
    const completedPlacements = placements.filter((p: any) => p.status === 'completed');

    // Calculate hours logged
    const totalHoursLogged = placements.reduce((total, placement: any) => {
      return total + (placement.hoursCompleted || 0);
    }, 0);

    // Get pending tasks (mock data for now)
    const pendingTasks = 3; // This would come from task management system
    const overdueTasks = 1;

    // Calculate progress
    const requiredHours = studentData.requiredHours || 480;
    const progressPercentage = Math.min((totalHoursLogged / requiredHours) * 100, 100);

    // Get recent notifications (mock data)
    const notifications = [
      {
        id: '1',
        title: 'Placement Application Approved',
        message: 'Your application to Sydney Medical Center has been approved!',
        type: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false
      },
      {
        id: '2',
        title: 'Weekly Hours Due',
        message: 'Please log your hours for this week by Friday.',
        type: 'reminder',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: false
      },
      {
        id: '3',
        title: 'Certificate Expiring Soon',
        message: 'Your First Aid certificate expires in 30 days.',
        type: 'warning',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true
      }
    ];

    // Get upcoming deadlines (mock data)
    const upcomingDeadlines = [
      {
        id: '1',
        title: 'Submit weekly reflection',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        priority: 'high'
      },
      {
        id: '2',
        title: 'Complete safety training module',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        priority: 'medium'
      }
    ];

    const studentName = userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() : 'Student';

    const dashboardData = {
      success: true,
      studentName,
      student: {
        id: studentDoc.id,
        studentId: studentData.studentId,
        status: studentData.status || 'enrolled',
        course: studentData.courseName || 'Unknown Course',
        cohort: studentData.cohort || 'Default',
        enrollmentDate: studentData.enrollmentDate,
        progress: progressPercentage
      },
      rto: {
        id: studentData.rtoId,
        name: rtoData?.name || rtoData?.companyName || 'Unknown RTO',
        status: studentData.rtoStatus || 'active'
      },
      stats: {
        hoursLogged: totalHoursLogged,
        totalHoursRequired: requiredHours,
        progressPercentage: Math.round(progressPercentage),
        pendingTasks,
        overdueTasks,
        currentStage: studentData.status || 'enrolled',
        placementsCompleted: completedPlacements.length,
        activePlacement: activePlacement ? {
          id: (activePlacement as any).id,
          position: (activePlacement as any).position,
          provider: (activePlacement as any).providerName,
          startDate: (activePlacement as any).startDate,
          status: (activePlacement as any).status
        } : null
      },
      recentActivity: {
        notifications: notifications.slice(0, 5),
        unreadNotifications: notifications.filter(n => !n.read).length,
        upcomingDeadlines: upcomingDeadlines.slice(0, 3)
      },
      compliance: {
        documentsComplete: studentData.documentsComplete || false,
        backgroundCheck: studentData.backgroundCheck || false,
        medicalClearance: studentData.medicalClearance || false,
        overallScore: calculateComplianceScore(studentData)
      }
    };

    console.log('✅ Student dashboard data fetched successfully');
    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Error fetching Student dashboard:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to calculate compliance score
function calculateComplianceScore(studentData: any): number {
  const checks = [
    studentData.documentsComplete,
    studentData.backgroundCheck,
    studentData.medicalClearance,
    studentData.safetyTrainingComplete,
    studentData.insuranceVerified
  ];

  const completedChecks = checks.filter(Boolean).length;
  return Math.round((completedChecks / checks.length) * 100);
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Updating Student dashboard data...');
    
    const body = await request.json();
    const { studentId, updates } = body;

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Update student record
    const studentRef = collections.students().doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    await studentRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Dashboard data updated successfully'
    });

  } catch (error) {
    console.error('Error updating Student dashboard:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update dashboard data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}