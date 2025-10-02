// Student Profile API - Manage student profile data and settings
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('👤 Fetching Student profile...');

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

    // Get user data
    const userDoc = await collections.users().doc(studentData.userId).get();
    const userData = userDoc.exists ? userDoc.data() : null;

    // Get RTO data
    let rtoData = null;
    if (studentData.rtoId) {
      const rtoDoc = await collections.rtos().doc(studentData.rtoId).get();
      rtoData = rtoDoc.exists ? rtoDoc.data() : null;
    }

    // Get course data
    let courseData = null;
    if (studentData.courseId) {
      const courseDoc = await collections.courses().doc(studentData.courseId).get();
      courseData = courseDoc.exists ? courseDoc.data() : null;
    }

    // Get placements history
    const placementsSnapshot = await collections.placements()
      .where('studentId', '==', studentDoc.id)
      .orderBy('createdAt', 'desc')
      .get();

    const placementsHistory = placementsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get certificates
    const certificatesSnapshot = await collections.certificates()
      .where('studentId', '==', studentDoc.id)
      .get();

    const certificates = certificatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Build profile data
    const profile = {
      success: true,
      student: {
        id: studentDoc.id,
        studentId: studentData.studentId,
        status: studentData.status || 'enrolled',
        enrollmentDate: studentData.enrollmentDate,
        graduationDate: studentData.graduationDate || null,
        progress: studentData.progress || 0
      },
      personal: {
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phone: userData?.phone || '',
        dateOfBirth: userData?.dateOfBirth || '',
        address: {
          street: userData?.address?.street || '',
          city: userData?.address?.city || '',
          state: userData?.address?.state || '',
          postcode: userData?.address?.postcode || '',
          country: userData?.address?.country || 'Australia'
        },
        emergencyContact: {
          name: userData?.emergencyContact?.name || '',
          relationship: userData?.emergencyContact?.relationship || '',
          phone: userData?.emergencyContact?.phone || '',
          email: userData?.emergencyContact?.email || ''
        }
      },
      academic: {
        rto: {
          id: studentData.rtoId,
          name: rtoData?.name || rtoData?.companyName || 'Unknown RTO',
          contact: rtoData?.email || ''
        },
        course: {
          id: studentData.courseId,
          name: studentData.courseName || courseData?.name || 'Unknown Course',
          code: courseData?.code || '',
          level: courseData?.level || '',
          duration: courseData?.duration || 0
        },
        cohort: studentData.cohort || 'Default',
        studentNumber: studentData.studentId,
        usi: studentData.usi || ''
      },
      placements: {
        current: placementsHistory.find((p: any) => p.status === 'in_progress' || p.status === 'active') || null,
        completed: placementsHistory.filter((p: any) => p.status === 'completed').length,
        totalHours: placementsHistory.reduce((total: number, p: any) => total + (p.hoursCompleted || 0), 0),
        history: placementsHistory.slice(0, 5) // Last 5 placements
      },
      compliance: {
        documents: {
          status: studentData.documentsComplete ? 'complete' : 'incomplete',
          items: [
            { name: 'Student ID', complete: !!studentData.studentId },
            { name: 'Enrollment Form', complete: !!studentData.enrollmentFormComplete },
            { name: 'Course Agreement', complete: !!studentData.courseAgreementComplete },
            { name: 'Privacy Consent', complete: !!studentData.privacyConsentComplete }
          ]
        },
        checks: {
          backgroundCheck: {
            status: studentData.backgroundCheck ? 'valid' : 'required',
            expiryDate: studentData.backgroundCheckExpiry,
            provider: studentData.backgroundCheckProvider
          },
          medicalClearance: {
            status: studentData.medicalClearance ? 'valid' : 'required',
            expiryDate: studentData.medicalClearanceExpiry,
            restrictions: studentData.medicalRestrictions || []
          },
          workingWithChildren: {
            status: studentData.workingWithChildrenCheck ? 'valid' : 'not_required',
            expiryDate: studentData.workingWithChildrenExpiry,
            number: studentData.workingWithChildrenNumber
          }
        },
        insurance: {
          professional: studentData.professionalInsurance || false,
          public: studentData.publicLiabilityInsurance || false
        }
      },
      certificates: certificates.map((cert: any) => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issuedDate: cert.issuedDate,
        expiryDate: cert.expiryDate,
        status: cert.expiryDate && new Date(cert.expiryDate) < new Date() ? 'expired' : 'valid',
        documentUrl: cert.documentUrl
      })),
      skills: studentData.skills || [],
      interests: studentData.interests || [],
      careerGoals: studentData.careerGoals || '',
      preferences: {
        placementLocations: studentData.preferredLocations || [],
        workSchedule: studentData.preferredSchedule || 'full-time',
        transportation: studentData.transportation || 'own_vehicle',
        specialRequirements: studentData.specialRequirements || ''
      },
      privacy: {
        profileVisibility: studentData.profileVisibility || 'rto_only',
        shareContactInfo: studentData.shareContactInfo || false,
        allowDirectContact: studentData.allowDirectContact || false
      }
    };

    console.log('✅ Student profile fetched successfully');
    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching Student profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating Student profile...');
    
    const body = await request.json();
    const { studentId, section, updates } = body;

    if (!studentId || !section) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and section are required'
      }, { status: 400 });
    }

    // Get student record
    const studentRef = collections.students().doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Update based on section
    let updateData: any = {
      updatedAt: new Date().toISOString()
    };

    switch (section) {
      case 'personal':
        // Update user record for personal info
        if (studentData?.userId) {
          const userRef = collections.users().doc(studentData.userId);
          await userRef.update({
            firstName: updates.firstName,
            lastName: updates.lastName,
            phone: updates.phone,
            dateOfBirth: updates.dateOfBirth,
            address: updates.address,
            emergencyContact: updates.emergencyContact,
            updatedAt: new Date().toISOString()
          });
        }
        break;

      case 'academic':
        updateData = {
          ...updateData,
          courseName: updates.course?.name,
          cohort: updates.cohort,
          usi: updates.usi
        };
        break;

      case 'skills':
        updateData = {
          ...updateData,
          skills: updates.skills,
          interests: updates.interests,
          careerGoals: updates.careerGoals
        };
        break;

      case 'preferences':
        updateData = {
          ...updateData,
          preferredLocations: updates.placementLocations,
          preferredSchedule: updates.workSchedule,
          transportation: updates.transportation,
          specialRequirements: updates.specialRequirements
        };
        break;

      case 'privacy':
        updateData = {
          ...updateData,
          profileVisibility: updates.profileVisibility,
          shareContactInfo: updates.shareContactInfo,
          allowDirectContact: updates.allowDirectContact
        };
        break;

      case 'compliance':
        updateData = {
          ...updateData,
          ...updates // Compliance updates can be various fields
        };
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid section specified'
        }, { status: 400 });
    }

    // Update student record
    await studentRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating Student profile:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}