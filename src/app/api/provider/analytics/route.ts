import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider analytics data...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const timeRange = searchParams.get('timeRange') || '12months';
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '12months':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '2years':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
      default:
        startDate.setFullYear(now.getFullYear() - 1);
    }

    // Fetch data in parallel
    const [
      placementsSnapshot,
      applicationsSnapshot,
      studentsSnapshot,
      evaluationsSnapshot,
      contractsSnapshot
    ] = await Promise.all([
      collections.placements()
        .where('providerId', '==', providerId)
        .where('createdAt', '>=', startDate)
        .get(),
      collections.applications()
        .where('providerId', '==', providerId)
        .where('submittedAt', '>=', startDate)
        .get(),
      collections.students()
        .where('currentPlacementProviderId', '==', providerId)
        .get(),
      collections.supervisorEvaluations()
        .where('providerId', '==', providerId)
        .where('createdAt', '>=', startDate)
        .get(),
      collections.contracts()
        .where('providerId', '==', providerId)
        .get()
    ]);

    // Process placements data
    const placements = placementsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      completedAt: doc.data().completedAt?.toDate?.() || null
    }));

    // Process applications data
    const applications = applicationsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt: doc.data().submittedAt?.toDate?.() || new Date()
    }));

    // Process students data
    const students = studentsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Process evaluations data
    const evaluations = evaluationsSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      rating: doc.data().overallRating || doc.data().rating || 0,
      createdAt: doc.data().createdAt?.toDate?.() || new Date()
    }));

    // Calculate success rate data over time
    const successRateData = [];
    const monthsToShow = timeRange === '3months' ? 3 : timeRange === '6months' ? 6 : 12;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthPlacements = placements.filter(p => 
        p.createdAt >= monthStart && p.createdAt <= monthEnd
      );
      
      const completedPlacements = monthPlacements.filter(p => p.status === 'completed').length;
      const totalPlacements = monthPlacements.length;
      const successRate = totalPlacements > 0 ? Math.round((completedPlacements / totalPlacements) * 100) : 0;
      
      successRateData.push({
        name: monthDate.toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }),
        'Success Rate': successRate,
        completed: completedPlacements,
        total: totalPlacements
      });
    }

    // Calculate student source data (from RTO partnerships)
    const studentSources: { [key: string]: number } = {};
    students.forEach((student: any) => {
      const rtoName = student.rtoName || student.institutionName || 'Unknown RTO';
      studentSources[rtoName] = (studentSources[rtoName] || 0) + 1;
    });

    const studentSourceData = Object.entries(studentSources)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 sources

    // Calculate KPI metrics
    const totalPlacements = placements.length;
    const completedPlacements = placements.filter(p => p.status === 'completed').length;
    const activePlacements = placements.filter(p => p.status === 'active').length;
    const overallSuccessRate = totalPlacements > 0 ? Math.round((completedPlacements / totalPlacements) * 100) : 0;

    const totalApplications = applications.length;
    const acceptedApplications = applications.filter(a => a.status === 'accepted').length;
    const applicationSuccessRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0;

    // Calculate average satisfaction from evaluations
    const ratingsSum = evaluations.reduce((sum: number, evaluation: any) => sum + (evaluation.rating || 0), 0);
    const averageSatisfaction = evaluations.length > 0 ? (ratingsSum / evaluations.length).toFixed(1) : '0.0';

    // Calculate placement duration statistics
    const placementDurations = placements
      .filter(p => p.status === 'completed' && p.completedAt && p.createdAt)
      .map(p => {
        const duration = (p.completedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
        return Math.round(duration);
      });

    const averageDuration = placementDurations.length > 0 
      ? Math.round(placementDurations.reduce((sum, duration) => sum + duration, 0) / placementDurations.length)
      : 0;

    // Monthly application trends
    const applicationTrends = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthApplications = applications.filter(a => 
        a.submittedAt >= monthStart && a.submittedAt <= monthEnd
      ).length;
      
      applicationTrends.push({
        month: monthDate.toLocaleDateString('en-AU', { month: 'short' }),
        applications: monthApplications
      });
    }

    // Placement status breakdown
    const placementStatusData = [
      { name: 'Completed', value: completedPlacements, fill: '#10b981' },
      { name: 'Active', value: activePlacements, fill: '#3b82f6' },
      { name: 'Pending', value: placements.filter(p => p.status === 'pending').length, fill: '#f59e0b' },
      { name: 'Cancelled', value: placements.filter(p => p.status === 'cancelled').length, fill: '#ef4444' }
    ].filter(item => item.value > 0);

    const analyticsData = {
      kpis: {
        overallSuccessRate,
        totalPlacements,
        studentsHosted: students.length,
        averageSatisfaction: parseFloat(averageSatisfaction),
        applicationSuccessRate,
        averageDuration
      },
      charts: {
        successRateData,
        studentSourceData,
        applicationTrends,
        placementStatusData
      },
      insights: {
        topPerformingRTO: studentSourceData[0]?.name || 'N/A',
        peakApplicationMonth: applicationTrends.reduce((max, current) => 
          current.applications > max.applications ? current : max, 
          applicationTrends[0] || { month: 'N/A', applications: 0 }
        ).month,
        retentionRate: activePlacements > 0 && students.length > 0 
          ? Math.round((activePlacements / students.length) * 100) 
          : 0,
        growthRate: applications.length > 0 
          ? Math.round(((applications.slice(-30).length - applications.slice(-60, -30).length) / Math.max(applications.slice(-60, -30).length, 1)) * 100)
          : 0
      },
      metadata: {
        timeRange,
        dataPoints: {
          placements: placements.length,
          applications: applications.length,
          students: students.length,
          evaluations: evaluations.length
        },
        lastUpdated: new Date().toISOString()
      }
    };

    console.log(`✅ Generated analytics for ${placements.length} placements and ${applications.length} applications`);

    return NextResponse.json({
      success: true,
      ...analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching provider analytics:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider analytics action...');
    
    const body = await request.json();
    const { action, providerId, data } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'export_report':
        // In a real implementation, this would generate and return a report file
        return NextResponse.json({
          success: true,
          downloadUrl: `/api/provider/analytics/export?providerId=${providerId}&format=${data?.format || 'pdf'}`,
          message: 'Report export initiated'
        });

      case 'save_dashboard_config':
        // Save user's dashboard configuration preferences
        await collections.userNotifications().add({
          userId: data.userId,
          type: 'dashboard_config',
          providerId,
          config: data.config,
          createdAt: new Date()
        });

        return NextResponse.json({
          success: true,
          message: 'Dashboard configuration saved'
        });

      case 'schedule_report':
        // Schedule recurring reports
        await collections.notifications().add({
          providerId,
          type: 'scheduled_report',
          frequency: data.frequency,
          recipients: data.recipients,
          reportType: data.reportType,
          createdAt: new Date(),
          nextRun: new Date(data.nextRun)
        });

        return NextResponse.json({
          success: true,
          message: 'Report scheduled successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing analytics action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process analytics action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}