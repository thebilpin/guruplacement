// RTO Compliance API - Manage compliance tracking for RTO organizations
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('✅ Fetching RTO compliance data...');

    const url = new URL(request.url);
    const rtoId = url.searchParams.get('rtoId');
    const studentId = url.searchParams.get('studentId');
    const type = url.searchParams.get('type'); // documents, background_check, medical, safety, insurance
    const status = url.searchParams.get('status'); // complete, incomplete, pending, expired

    // Get students data for compliance tracking
    let studentsQuery = collections.students();
    if (rtoId) {
      studentsQuery = studentsQuery.where('rtoId', '==', rtoId);
    }
    if (studentId) {
      studentsQuery = studentsQuery.where('__name__', '==', studentId);
    }

    const studentsSnapshot = await studentsQuery.get();

    // Get detailed compliance data for each student
    const complianceData = await Promise.all(
      studentsSnapshot.docs.map(async (doc) => {
        const studentData = doc.data();
        
        try {
          // Get user data
          const userDoc = await collections.users().doc(studentData.userId).get();
          const userData = userDoc.exists ? userDoc.data() : null;
          
          // Get placements for additional compliance requirements
          const placementsSnapshot = await collections.placements()
            .where('studentId', '==', doc.id)
            .get();
          
          const placements = placementsSnapshot.docs.map(d => d.data());
          const activePlacement = placements.find(p => p.status === 'in_progress');
          
          // Build comprehensive compliance status
          const compliance = {
            documents: {
              status: studentData.documentsComplete ? 'complete' : 'incomplete',
              lastUpdated: studentData.documentsUpdatedAt || studentData.updatedAt,
              items: [
                { name: 'Student ID', complete: !!studentData.studentId },
                { name: 'Enrollment Form', complete: !!studentData.enrollmentFormComplete },
                { name: 'Course Agreement', complete: !!studentData.courseAgreementComplete },
                { name: 'Privacy Consent', complete: !!studentData.privacyConsentComplete }
              ]
            },
            backgroundCheck: {
              status: studentData.backgroundCheck ? 'complete' : 'incomplete',
              lastUpdated: studentData.backgroundCheckDate,
              expiryDate: studentData.backgroundCheckExpiry,
              provider: studentData.backgroundCheckProvider || 'Unknown'
            },
            medicalClearance: {
              status: studentData.medicalClearance ? 'complete' : 'incomplete',
              lastUpdated: studentData.medicalClearanceDate,
              expiryDate: studentData.medicalClearanceExpiry,
              restrictions: studentData.medicalRestrictions || []
            },
            safetyTraining: {
              status: placements.some(p => p.safetyTrainingComplete) ? 'complete' : 'incomplete',
              lastUpdated: placements.find(p => p.safetyTrainingComplete)?.safetyTrainingDate,
              modules: placements.map(p => ({
                providerId: p.providerId,
                providerName: p.providerName,
                complete: p.safetyTrainingComplete || false,
                completedDate: p.safetyTrainingDate
              }))
            },
            insurance: {
              status: placements.some(p => p.insuranceVerified) ? 'complete' : 'incomplete',
              lastUpdated: placements.find(p => p.insuranceVerified)?.insuranceVerifiedDate,
              policyNumber: studentData.insurancePolicyNumber,
              provider: studentData.insuranceProvider,
              expiryDate: studentData.insuranceExpiry
            }
          };
          
          // Calculate overall compliance score
          const totalItems = 5; // documents, background, medical, safety, insurance
          let completeItems = 0;
          
          if (compliance.documents.status === 'complete') completeItems++;
          if (compliance.backgroundCheck.status === 'complete') completeItems++;
          if (compliance.medicalClearance.status === 'complete') completeItems++;
          if (compliance.safetyTraining.status === 'complete') completeItems++;
          if (compliance.insurance.status === 'complete') completeItems++;
          
          const complianceScore = Math.round((completeItems / totalItems) * 100);
          
          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            student: {
              name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
              email: userData?.email || '',
              course: studentData.courseName || 'Unknown Course',
              cohort: studentData.cohort || 'Default',
              status: studentData.status || 'enrolled'
            },
            compliance,
            complianceScore,
            riskLevel: complianceScore >= 80 ? 'low' : complianceScore >= 60 ? 'medium' : 'high',
            activePlacement: activePlacement ? {
              providerId: activePlacement.providerId,
              providerName: activePlacement.providerName,
              position: activePlacement.position
            } : null,
            lastUpdated: studentData.updatedAt,
            alerts: []  // Will be populated based on compliance issues
          };
        } catch (error) {
          console.error(`Error processing compliance for student ${doc.id}:`, error);
          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            error: true
          };
        }
      })
    );

    // Filter out error records and apply filters
    let filteredData = complianceData.filter(item => !item.error);
    
    if (type) {
      filteredData = filteredData.filter(item => {
        const typeStatus = item.compliance[type as keyof typeof item.compliance]?.status;
        return typeStatus;
      });
    }
    
    if (status) {
      filteredData = filteredData.filter(item => {
        if (type) {
          const typeStatus = item.compliance[type as keyof typeof item.compliance]?.status;
          return typeStatus === status;
        }
        // For overall status filtering
        if (status === 'complete') return item.complianceScore === 100;
        if (status === 'incomplete') return item.complianceScore < 100;
        return true;
      });
    }

    // Generate summary statistics
    const stats = {
      totalStudents: filteredData.length,
      fullyCompliant: filteredData.filter(s => s.complianceScore === 100).length,
      partiallyCompliant: filteredData.filter(s => s.complianceScore > 0 && s.complianceScore < 100).length,
      nonCompliant: filteredData.filter(s => s.complianceScore === 0).length,
      averageCompliance: filteredData.length > 0 
        ? Math.round(filteredData.reduce((sum, s) => sum + s.complianceScore, 0) / filteredData.length)
        : 0,
      riskDistribution: {
        low: filteredData.filter(s => s.riskLevel === 'low').length,
        medium: filteredData.filter(s => s.riskLevel === 'medium').length,
        high: filteredData.filter(s => s.riskLevel === 'high').length
      },
      complianceByType: {
        documents: filteredData.filter(s => s.compliance.documents.status === 'complete').length,
        backgroundCheck: filteredData.filter(s => s.compliance.backgroundCheck.status === 'complete').length,
        medicalClearance: filteredData.filter(s => s.compliance.medicalClearance.status === 'complete').length,
        safetyTraining: filteredData.filter(s => s.compliance.safetyTraining.status === 'complete').length,
        insurance: filteredData.filter(s => s.compliance.insurance.status === 'complete').length
      }
    };

    return NextResponse.json({
      success: true,
      compliance: filteredData,
      stats,
      filters: { rtoId, studentId, type, status }
    });

  } catch (error) {
    console.error('Error fetching RTO compliance:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch compliance data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating RTO compliance...');
    
    const body = await request.json();
    const { studentId, complianceType, updates, rtoId } = body;

    if (!studentId || !complianceType) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and compliance type are required'
      }, { status: 400 });
    }

    // Get and verify student
    const studentRef = collections.students().doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Student not found'
      }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Verify RTO authorization
    if (rtoId && studentData?.rtoId !== rtoId) {
      return NextResponse.json({
        success: false,
        error: 'Not authorized to update this student\'s compliance'
      }, { status: 403 });
    }

    // Update compliance based on type
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    switch (complianceType) {
      case 'documents':
        updateData.documentsComplete = updates.complete || false;
        updateData.documentsUpdatedAt = new Date().toISOString();
        if (updates.enrollmentFormComplete !== undefined) {
          updateData.enrollmentFormComplete = updates.enrollmentFormComplete;
        }
        if (updates.courseAgreementComplete !== undefined) {
          updateData.courseAgreementComplete = updates.courseAgreementComplete;
        }
        if (updates.privacyConsentComplete !== undefined) {
          updateData.privacyConsentComplete = updates.privacyConsentComplete;
        }
        break;

      case 'backgroundCheck':
        updateData.backgroundCheck = updates.complete || false;
        updateData.backgroundCheckDate = updates.completedDate || new Date().toISOString();
        if (updates.expiryDate) updateData.backgroundCheckExpiry = updates.expiryDate;
        if (updates.provider) updateData.backgroundCheckProvider = updates.provider;
        break;

      case 'medicalClearance':
        updateData.medicalClearance = updates.complete || false;
        updateData.medicalClearanceDate = updates.completedDate || new Date().toISOString();
        if (updates.expiryDate) updateData.medicalClearanceExpiry = updates.expiryDate;
        if (updates.restrictions) updateData.medicalRestrictions = updates.restrictions;
        break;

      case 'insurance':
        if (updates.policyNumber) updateData.insurancePolicyNumber = updates.policyNumber;
        if (updates.provider) updateData.insuranceProvider = updates.provider;
        if (updates.expiryDate) updateData.insuranceExpiry = updates.expiryDate;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown compliance type: ${complianceType}`
        }, { status: 400 });
    }

    // Update student record
    await studentRef.update(updateData);

    // If updating safety training or insurance, also update placement records
    if (complianceType === 'safetyTraining' || complianceType === 'insurance') {
      const placementsSnapshot = await collections.placements()
        .where('studentId', '==', studentId)
        .where('status', '==', 'in_progress')
        .get();

      const updatePromises = placementsSnapshot.docs.map(doc => {
        const placementUpdateData: any = { updatedAt: new Date().toISOString() };
        
        if (complianceType === 'safetyTraining') {
          placementUpdateData.safetyTrainingComplete = updates.complete || false;
          placementUpdateData.safetyTrainingDate = updates.completedDate || new Date().toISOString();
        }
        
        if (complianceType === 'insurance') {
          placementUpdateData.insuranceVerified = updates.complete || false;
          placementUpdateData.insuranceVerifiedDate = updates.completedDate || new Date().toISOString();
        }
        
        return doc.ref.update(placementUpdateData);
      });

      await Promise.all(updatePromises);
    }

    return NextResponse.json({
      success: true,
      message: 'Compliance updated successfully'
    });

  } catch (error) {
    console.error('Error updating RTO compliance:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update compliance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}