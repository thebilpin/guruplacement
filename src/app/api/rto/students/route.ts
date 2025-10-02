// RTO Students API - Manage students for RTO organizations
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🎓 Fetching RTO students data...');

    const url = new URL(request.url);
    const rtoId = url.searchParams.get('rtoId');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const cohort = url.searchParams.get('cohort');
    const course = url.searchParams.get('course');

    // Build query
    let studentsQuery = collections.students();
    
    if (rtoId) {
      studentsQuery = studentsQuery.where('rtoId', '==', rtoId);
    }
    
    if (status) {
      studentsQuery = studentsQuery.where('status', '==', status);
    }

    const studentsSnapshot = await studentsQuery.limit(100).get();

    // Get detailed student data with user info and placements
    const studentsData = await Promise.all(
      studentsSnapshot.docs.map(async (doc) => {
        const studentData = doc.data();
        
        try {
          // Get user data
          const userDoc = await collections.users().doc(studentData.userId).get();
          const userData = userDoc.exists ? userDoc.data() : null;
        
          // Get course info
          const courseDoc = studentData.courseId 
            ? await collections.courses().doc(studentData.courseId).get()
            : null;
          const courseData = courseDoc?.exists ? courseDoc.data() : null;
          
          // Get active placement
          const placementsSnapshot = await collections.placements()
            .where('studentId', '==', doc.id)
            .where('status', '==', 'in_progress')
            .limit(1)
            .get();
            
          const activePlacement = placementsSnapshot.docs[0]?.data();
          
          // Apply client-side filters
          const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
          const studentId = studentData.studentId || doc.id;
          
          if (search) {
            const searchLower = search.toLowerCase();
            if (!fullName.toLowerCase().includes(searchLower) && 
                !studentId.toLowerCase().includes(searchLower) &&
                !userData?.email?.toLowerCase().includes(searchLower)) {
              return null;
            }
          }
          
          if (cohort && studentData.cohort !== cohort) {
            return null;
          }
          
          if (course && courseData?.name !== course) {
            return null;
          }          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            userId: studentData.userId,
            firstName: userData?.firstName || 'Unknown',
            lastName: userData?.lastName || 'User',
            email: userData?.email || '',
            phone: userData?.phone || '',
            avatarUrl: userData?.avatarUrl || '',
            status: studentData.status || 'enrolled',
            course: courseData?.name || studentData.courseName || 'Unknown Course',
            courseId: studentData.courseId,
            cohort: studentData.cohort || 'Default',
            enrollmentDate: studentData.enrollmentDate,
            completionDate: studentData.completionDate,
            progress: studentData.progress || 0,
            activePlacement: activePlacement ? {
              id: placementsSnapshot.docs[0].id,
              providerName: activePlacement.providerName,
              position: activePlacement.position,
              startDate: activePlacement.startDate,
              status: activePlacement.status
            } : null,
            compliance: {
              documentsComplete: studentData.documentsComplete || false,
              backgroundCheck: studentData.backgroundCheck || false,
              medicalClearance: studentData.medicalClearance || false
            },
            rtoId: studentData.rtoId,
            createdAt: studentData.createdAt,
            updatedAt: studentData.updatedAt
          };
        } catch (error) {
          console.error(`Error processing student ${doc.id}:`, error);
          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            firstName: 'Error',
            lastName: 'Loading',
            status: studentData.status || 'unknown',
            error: true
          };
        }
      })
    );

    // Filter out null results from search filtering
    const filteredStudents = studentsData.filter(student => student !== null);

    // Get summary statistics
    const stats = {
      total: filteredStudents.length,
      enrolled: filteredStudents.filter(s => s.status === 'enrolled').length,
      active: filteredStudents.filter(s => s.status === 'active').length,
      completed: filteredStudents.filter(s => s.status === 'completed').length,
      at_risk: filteredStudents.filter(s => s.status === 'at_risk').length,
      placement_ready: filteredStudents.filter(s => s.status === 'placement_ready').length,
      in_placement: filteredStudents.filter(s => s.activePlacement).length
    };

    return NextResponse.json({
      success: true,
      students: filteredStudents,
      stats,
      filters: {
        search,
        status,
        cohort,
        course,
        rtoId
      }
    });

  } catch (error) {
    console.error('Error fetching RTO students:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch students data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new RTO student...');
    
    const body = await request.json();
    const { studentData, userId, rtoId } = body;

    if (!userId || !rtoId) {
      return NextResponse.json({
        success: false,
        error: 'User ID and RTO ID are required'
      }, { status: 400 });
    }

    // Create student record
    const studentRef = collections.students().doc();
    const newStudent = {
      userId,
      rtoId,
      studentId: studentData.studentId || `STU-${Date.now()}`,
      status: studentData.status || 'enrolled',
      courseId: studentData.courseId,
      courseName: studentData.courseName,
      cohort: studentData.cohort || 'Default',
      enrollmentDate: new Date().toISOString(),
      progress: 0,
      documentsComplete: false,
      backgroundCheck: false,
      medicalClearance: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await studentRef.set(newStudent);

    return NextResponse.json({
      success: true,
      studentId: studentRef.id,
      message: 'Student created successfully'
    });

  } catch (error) {
    console.error('Error creating RTO student:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create student',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating RTO student...');
    
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
      message: 'Student updated successfully'
    });

  } catch (error) {
    console.error('Error updating RTO student:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update student',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting RTO student...');
    
    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID is required'
      }, { status: 400 });
    }

    // Delete student record
    await collections.students().doc(studentId).delete();

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting RTO student:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete student',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}