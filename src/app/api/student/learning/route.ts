// Student Learning API - Manage learning progress, courses, and educational content
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📚 Fetching Student learning data...');

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const section = url.searchParams.get('section'); // courses, progress, certificates, recommendations
    const search = url.searchParams.get('search');

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

    // Get enrolled courses for the student (using existing placements as course enrollments for now)
    const placementsSnapshot = await collections.placements()
      .where('studentId', '==', studentId)
      .get();

    const placements = placementsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get course details for each placement (treating placements as course enrollments)
    const coursesWithProgress = await Promise.all(
      placements.map(async (placement: any) => {
        try {
          // Use the student's main course
          const courseDoc = await collections.courses().doc(studentData?.courseId || 'default-course').get();
          const courseData = courseDoc.exists ? courseDoc.data() : {
            title: 'Professional Practice Placement',
            description: 'Hands-on learning experience in a professional environment',
            category: 'Practical Training',
            level: 'Intermediate'
          };

          // Mock learning modules based on placement activities
          const modules = [
            {
              id: 'orientation',
              title: 'Workplace Orientation',
              description: 'Introduction to workplace policies and procedures',
              type: 'orientation',
              duration: 4,
              order: 1,
              progress: {
                status: placement.orientationComplete ? 'completed' : 'not_started',
                completedAt: placement.orientationDate,
                score: placement.orientationComplete ? 100 : 0,
                timeSpent: placement.orientationComplete ? 4 : 0,
                lastAccessed: placement.orientationDate
              },
              resources: [],
              assessments: []
            },
            {
              id: 'safety-training',
              title: 'Safety Training',
              description: 'Workplace health and safety requirements',
              type: 'training',
              duration: 2,
              order: 2,
              progress: {
                status: placement.safetyTrainingComplete ? 'completed' : 'not_started',
                completedAt: placement.safetyTrainingDate,
                score: placement.safetyTrainingComplete ? 100 : 0,
                timeSpent: placement.safetyTrainingComplete ? 2 : 0,
                lastAccessed: placement.safetyTrainingDate
              },
              resources: [],
              assessments: []
            },
            {
              id: 'practical-skills',
              title: 'Practical Skills Development',
              description: 'Hands-on skill development in professional setting',
              type: 'practical',
              duration: 40,
              order: 3,
              progress: {
                status: (placement.hoursCompleted || 0) > 0 ? 'in_progress' : 'not_started',
                completedAt: placement.status === 'completed' ? placement.endDate : null,
                score: Math.min(Math.round(((placement.hoursCompleted || 0) / (placement.requiredHours || 160)) * 100), 100),
                timeSpent: placement.hoursCompleted || 0,
                lastAccessed: placement.lastActivityDate
              },
              resources: [],
              assessments: []
            }
          ];

          // Calculate overall course progress
          const completedModules = modules.filter((m: any) => m.progress.status === 'completed').length;
          const totalModules = modules.length;
          const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

          return {
            id: placement.id,
            enrollment: {
              id: placement.id,
              enrolledAt: placement.startDate,
              status: placement.status || 'active',
              progress: overallProgress,
              completedModules,
              totalModules
            },
            course: {
              title: courseData?.title || 'Professional Practice Placement',
              description: courseData?.description || 'Hands-on learning experience',
              category: courseData?.category || 'Practical Training',
              level: courseData?.level || 'Intermediate',
              duration: placement.requiredHours || 160,
              instructor: placement.supervisorName || 'Workplace Supervisor',
              image: 'https://picsum.photos/seed/course/300/200'
            },
            modules,
            stats: {
              totalLessons: modules.length,
              completedLessons: completedModules,
              totalDuration: modules.reduce((sum: number, m: any) => sum + m.duration, 0),
              timeSpent: modules.reduce((sum: number, m: any) => sum + m.progress.timeSpent, 0),
              averageScore: modules.length > 0 
                ? Math.round(modules.reduce((sum: number, m: any) => sum + m.progress.score, 0) / modules.length)
                : 0
            }
          };
        } catch (error) {
          console.error(`Error processing placement ${placement.id}:`, error);
          return null;
        }
      })
    );

    const validCourses = coursesWithProgress.filter((course: any) => course !== null);

    // Get recommended courses based on student's course and progress
    const recommendedCoursesSnapshot = await collections.courses()
      .where('category', '==', studentData?.courseCategory || 'healthcare')
      .where('recommended', '==', true)
      .limit(6)
      .get();

    const recommendedCourses = recommendedCoursesSnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      category: doc.data().category,
      level: doc.data().level,
      duration: doc.data().estimatedDuration,
      instructor: doc.data().instructor,
      rating: doc.data().rating || 4.5,
      image: doc.data().thumbnail || 'https://picsum.photos/seed/recommended/300/200'
    }));

    // Get recent certificates
    const certificatesSnapshot = await collections.certificates()
      .where('studentId', '==', studentId)
      .orderBy('issuedDate', 'desc')
      .limit(5)
      .get();

    const certificates = certificatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Mock learning achievements/badges (using certificates as achievements for now)
    const achievements = certificates.map((cert: any) => ({
      id: cert.id,
      name: `${cert.name} Achievement`,
      description: `Earned ${cert.name} certification`,
      icon: 'award',
      earnedAt: cert.issuedDate,
      category: 'certification'
    }));

    // Calculate overall learning statistics
    const overallStats = {
      totalCourses: validCourses.length,
      activeCourses: validCourses.filter((c: any) => c && c.enrollment.status === 'active').length,
      completedCourses: validCourses.filter((c: any) => c && c.enrollment.progress === 100).length,
      totalHoursLearned: validCourses.reduce((sum: number, c: any) => sum + (c ? c.stats.timeSpent : 0), 0),
      averageProgress: validCourses.length > 0 
        ? Math.round(validCourses.reduce((sum: number, c: any) => sum + (c ? c.enrollment.progress : 0), 0) / validCourses.length)
        : 0,
      certificatesEarned: certificates.length,
      achievementsUnlocked: achievements.length
    };

    // Filter courses by search if provided
    let filteredCourses = validCourses;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCourses = validCourses.filter((course: any) =>
        course && (
          course.course.title.toLowerCase().includes(searchLower) ||
          course.course.description.toLowerCase().includes(searchLower) ||
          course.course.category.toLowerCase().includes(searchLower)
        )
      );
    }

    const response: any = {
      success: true,
      student: {
        id: studentId,
        name: studentData?.name || 'Student',
        level: studentData?.level || 'Beginner'
      },
      overview: overallStats
    };

    // Return specific section or all data
    switch (section) {
      case 'courses':
        response.courses = filteredCourses;
        break;
      case 'recommendations':
        response.recommendations = recommendedCourses;
        break;
      case 'certificates':
        response.certificates = certificates;
        break;
      case 'achievements':
        response.achievements = achievements;
        break;
      default:
        response.courses = filteredCourses;
        response.recommendations = recommendedCourses.slice(0, 3);
        response.certificates = certificates.slice(0, 3);
        response.achievements = achievements.slice(0, 4);
    }

    console.log('✅ Student learning data fetched successfully');
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching Student learning data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch learning data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Recording Student learning progress...');
    
    const body = await request.json();
    const { studentId, moduleId, progressData } = body;

    if (!studentId || !moduleId || !progressData) {
      return NextResponse.json({
        success: false,
        error: 'Student ID, Module ID, and progress data are required'
      }, { status: 400 });
    }

    // Use studentUnitProgress collection to track learning progress
    const existingProgressSnapshot = await collections.studentUnitProgress()
      .where('studentId', '==', studentId)
      .where('unitId', '==', moduleId)
      .limit(1)
      .get();

    if (!existingProgressSnapshot.empty) {
      // Update existing progress
      const progressDoc = existingProgressSnapshot.docs[0];
      await progressDoc.ref.update({
        status: progressData.status,
        score: progressData.score || progressDoc.data().score,
        timeSpent: (progressDoc.data().timeSpent || 0) + (progressData.timeSpent || 0),
        lastAccessed: new Date().toISOString(),
        completedAt: progressData.status === 'completed' ? new Date().toISOString() : progressDoc.data().completedAt,
        updatedAt: new Date().toISOString()
      });
    } else {
      // Create new progress record
      const progressRef = collections.studentUnitProgress().doc();
      await progressRef.set({
        studentId,
        unitId: moduleId,
        status: progressData.status || 'in_progress',
        score: progressData.score || 0,
        timeSpent: progressData.timeSpent || 0,
        lastAccessed: new Date().toISOString(),
        completedAt: progressData.status === 'completed' ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    // Check if this completion unlocks any achievements
    if (progressData.status === 'completed') {
      // Logic to check and award achievements would go here
      console.log('Module completed, checking for achievements...');
    }

    return NextResponse.json({
      success: true,
      message: 'Progress recorded successfully'
    });

  } catch (error) {
    console.error('Error recording Student learning progress:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('📚 Enrolling Student in course...');
    
    const body = await request.json();
    const { studentId, courseId, enrollmentData } = body;

    if (!studentId || !courseId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and Course ID are required'
      }, { status: 400 });
    }

    // Check if already enrolled by looking at existing placements
    const existingPlacementSnapshot = await collections.placements()
      .where('studentId', '==', studentId)
      .where('status', 'in', ['pending', 'active', 'in_progress'])
      .limit(1)
      .get();

    if (!existingPlacementSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Already have an active placement/course'
      }, { status: 400 });
    }

    // Create a placement request (treating course enrollment as placement request)
    const placementRef = collections.placements().doc();
    const placement = {
      studentId,
      courseId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      progress: 0,
      hoursCompleted: 0,
      preferences: enrollmentData?.preferences || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await placementRef.set(placement);

    return NextResponse.json({
      success: true,
      placementId: placementRef.id,
      message: 'Successfully enrolled in course'
    });

  } catch (error) {
    console.error('Error enrolling Student in course:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to enroll in course',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}