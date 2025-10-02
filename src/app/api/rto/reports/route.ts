// RTO Reports API - Generate and manage reports for RTO organizations
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching RTO reports data...');

    const url = new URL(request.url);
    const rtoId = url.searchParams.get('rtoId');
    const reportType = url.searchParams.get('type');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const cohort = url.searchParams.get('cohort');
    const providerId = url.searchParams.get('providerId');
    const action = url.searchParams.get('action');

    // Get date range for filtering
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const end = endDate ? new Date(endDate) : new Date();

    let reportsData: any = {};

    if (reportType === 'student-progress' || !reportType) {
      // Student Progress Report
      const studentsSnapshot = rtoId 
        ? await collections.students().where('rtoId', '==', rtoId).get()
        : await collections.students().get();

      const students = await Promise.all(
        studentsSnapshot.docs.map(async (doc) => {
          const studentData = doc.data();
          
          // Get user data
          const userDoc = await collections.users().doc(studentData.userId).get();
          const userData = userDoc.exists ? userDoc.data() : null;
          
          // Get placements
          const placementsSnapshot = await collections.placements()
            .where('studentId', '==', doc.id)
            .get();
          
          const placements = placementsSnapshot.docs.map(d => d.data());
          const activePlacement = placements.find(p => p.status === 'in_progress');
          const completedPlacements = placements.filter(p => p.status === 'completed');
          
          // Apply filters
          if (cohort && studentData.cohort !== cohort) return null;
          
          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
            email: userData?.email || '',
            cohort: studentData.cohort || 'Default',
            course: studentData.courseName || 'Unknown',
            status: studentData.status || 'enrolled',
            enrollmentDate: studentData.enrollmentDate,
            progress: studentData.progress || 0,
            totalPlacements: placements.length,
            completedPlacements: completedPlacements.length,
            activePlacement: activePlacement ? {
              providerName: activePlacement.providerName,
              position: activePlacement.position,
              hoursCompleted: activePlacement.hoursCompleted || 0,
              percentComplete: activePlacement.percentComplete || 0
            } : null
          };
        })
      );

      const filteredStudents = students.filter(s => s !== null);

      reportsData.studentProgress = {
        summary: {
          totalStudents: filteredStudents.length,
          enrolled: filteredStudents.filter(s => s.status === 'enrolled').length,
          active: filteredStudents.filter(s => s.status === 'active').length,
          completed: filteredStudents.filter(s => s.status === 'completed').length,
          at_risk: filteredStudents.filter(s => s.status === 'at_risk').length,
          in_placement: filteredStudents.filter(s => s.activePlacement).length,
          averageProgress: filteredStudents.length > 0 
            ? Math.round(filteredStudents.reduce((sum, s) => sum + s.progress, 0) / filteredStudents.length)
            : 0
        },
        students: filteredStudents,
        chartData: [
          { name: 'Enrolled', value: filteredStudents.filter(s => s.status === 'enrolled').length },
          { name: 'Active', value: filteredStudents.filter(s => s.status === 'active').length },
          { name: 'Completed', value: filteredStudents.filter(s => s.status === 'completed').length },
          { name: 'At Risk', value: filteredStudents.filter(s => s.status === 'at_risk').length }
        ]
      };
    }

    if (reportType === 'provider-performance' || !reportType) {
      // Provider Performance Report
      let providersQuery = collections.providers();
      if (providerId) {
        providersQuery = providersQuery.where('__name__', '==', providerId);
      }
      
      const providersSnapshot = await providersQuery.get();
      
      const providers = await Promise.all(
        providersSnapshot.docs.map(async (doc) => {
          const providerData = doc.data();
          
          // Get placements for this provider
          const placementsSnapshot = await collections.placements()
            .where('providerId', '==', doc.id)
            .get();
          
          const placements = placementsSnapshot.docs.map(d => d.data());
          
          // Filter by date range
          const filteredPlacements = placements.filter(p => {
            if (!p.startDate) return false;
            const placementDate = new Date(p.startDate);
            return placementDate >= start && placementDate <= end;
          });
          
          const totalPlacements = filteredPlacements.length;
          const completedPlacements = filteredPlacements.filter(p => p.status === 'completed').length;
          const activePlacements = filteredPlacements.filter(p => p.status === 'in_progress').length;
          const cancelledPlacements = filteredPlacements.filter(p => p.status === 'cancelled').length;
          
          const successRate = totalPlacements > 0 
            ? Math.round((completedPlacements / totalPlacements) * 100) 
            : 0;
          
          const averageRating = filteredPlacements.length > 0
            ? filteredPlacements.reduce((sum, p) => sum + (p.providerRating || 0), 0) / filteredPlacements.length
            : 0;
          
          return {
            id: doc.id,
            name: providerData.name || 'Unknown Provider',
            location: providerData.location || '',
            industry: providerData.industry || '',
            totalPlacements,
            activePlacements,
            completedPlacements,
            cancelledPlacements,
            successRate,
            averageRating: Math.round(averageRating * 10) / 10,
            capacity: providerData.capacity || 0,
            utilization: providerData.capacity > 0 
              ? Math.round((activePlacements / providerData.capacity) * 100)
              : 0
          };
        })
      );

      reportsData.providerPerformance = {
        summary: {
          totalProviders: providers.length,
          activeProviders: providers.filter(p => p.activePlacements > 0).length,
          averageSuccessRate: providers.length > 0 
            ? Math.round(providers.reduce((sum, p) => sum + p.successRate, 0) / providers.length)
            : 0,
          totalPlacements: providers.reduce((sum, p) => sum + p.totalPlacements, 0),
          averageRating: providers.length > 0
            ? Math.round((providers.reduce((sum, p) => sum + p.averageRating, 0) / providers.length) * 10) / 10
            : 0
        },
        providers,
        chartData: providers.map(p => ({
          name: p.name,
          successRate: p.successRate,
          totalPlacements: p.totalPlacements
        }))
      };
    }

    if (reportType === 'compliance-audits' || !reportType) {
      // Compliance Audits Report
      const studentsSnapshot = rtoId 
        ? await collections.students().where('rtoId', '==', rtoId).get()
        : await collections.students().get();

      const complianceData = await Promise.all(
        studentsSnapshot.docs.map(async (doc) => {
          const studentData = doc.data();
          
          // Get user data
          const userDoc = await collections.users().doc(studentData.userId).get();
          const userData = userDoc.exists ? userDoc.data() : null;
          
          // Get placements for compliance checking
          const placementsSnapshot = await collections.placements()
            .where('studentId', '==', doc.id)
            .get();
          
          const placements = placementsSnapshot.docs.map(d => d.data());
          
          return {
            id: doc.id,
            studentId: studentData.studentId || doc.id,
            name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
            cohort: studentData.cohort || 'Default',
            compliance: {
              documentsComplete: studentData.documentsComplete || false,
              backgroundCheck: studentData.backgroundCheck || false,
              medicalClearance: studentData.medicalClearance || false,
              safetyTrainingComplete: placements.some(p => p.safetyTrainingComplete),
              insuranceVerified: placements.some(p => p.insuranceVerified)
            }
          };
        })
      );

      const totalCompliance = complianceData.reduce((sum, student) => {
        const compliance = student.compliance;
        const compliantItems = Object.values(compliance).filter(Boolean).length;
        return sum + (compliantItems / Object.keys(compliance).length * 100);
      }, 0);

      reportsData.complianceAudits = {
        summary: {
          totalStudents: complianceData.length,
          averageCompliance: complianceData.length > 0 
            ? Math.round(totalCompliance / complianceData.length)
            : 0,
          documentsComplete: complianceData.filter(s => s.compliance.documentsComplete).length,
          backgroundChecksComplete: complianceData.filter(s => s.compliance.backgroundCheck).length,
          medicalClearanceComplete: complianceData.filter(s => s.compliance.medicalClearance).length,
          safetyTrainingComplete: complianceData.filter(s => s.compliance.safetyTrainingComplete).length,
          insuranceVerified: complianceData.filter(s => s.compliance.insuranceVerified).length
        },
        students: complianceData,
        chartData: [
          { name: 'Documents', value: complianceData.filter(s => s.compliance.documentsComplete).length },
          { name: 'Background Check', value: complianceData.filter(s => s.compliance.backgroundCheck).length },
          { name: 'Medical Clearance', value: complianceData.filter(s => s.compliance.medicalClearance).length },
          { name: 'Safety Training', value: complianceData.filter(s => s.compliance.safetyTrainingComplete).length },
          { name: 'Insurance', value: complianceData.filter(s => s.compliance.insuranceVerified).length }
        ]
      };
    }

    // Handle export action
    if (action === 'export') {
      const exportData = {
        reportType: reportType || 'all',
        generatedAt: new Date().toISOString(),
        dateRange: { start: start.toISOString(), end: end.toISOString() },
        filters: { rtoId, cohort, providerId },
        data: reportsData
      };

      return NextResponse.json({
        success: true,
        export: true,
        data: exportData
      });
    }

    return NextResponse.json({
      success: true,
      reportType: reportType || 'all',
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      data: reportsData
    });

  } catch (error) {
    console.error('Error fetching RTO reports:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch reports data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📊 Generating custom RTO report...');
    
    const body = await request.json();
    const { reportConfig, rtoId } = body;

    if (!reportConfig.type) {
      return NextResponse.json({
        success: false,
        error: 'Report type is required'
      }, { status: 400 });
    }

    // Store report configuration for later retrieval
    const reportRef = collections.reports().doc();
    const newReport = {
      type: reportConfig.type,
      title: reportConfig.title || `${reportConfig.type} Report`,
      description: reportConfig.description || '',
      config: reportConfig,
      rtoId,
      status: 'generating',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await reportRef.set(newReport);

    // In a real implementation, you might queue this for background processing
    // For now, we'll return the report ID for tracking
    return NextResponse.json({
      success: true,
      reportId: reportRef.id,
      message: 'Report generation started',
      estimatedCompletion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });

  } catch (error) {
    console.error('Error generating RTO report:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}