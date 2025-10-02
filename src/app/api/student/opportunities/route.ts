// Student Opportunities API - Browse and apply for placements
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Student opportunities...');

    const url = new URL(request.url);
    const studentId = url.searchParams.get('studentId');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');
    const jobType = url.searchParams.get('jobType');
    const location = url.searchParams.get('location');
    const remoteOnly = url.searchParams.get('remoteOnly') === 'true';

    // Get student data for course matching
    let studentData = null;
    if (studentId) {
      const studentDoc = await collections.students().doc(studentId).get();
      studentData = studentDoc.exists ? studentDoc.data() : null;
    }

    // Get available placements/opportunities
    let opportunitiesQuery = collections.placements().where('status', '==', 'available');

    const opportunitiesSnapshot = await opportunitiesQuery.limit(50).get();

    // Process opportunities with provider data
    const opportunities = await Promise.all(
      opportunitiesSnapshot.docs.map(async (doc) => {
        const opportunityData = doc.data();
        
        try {
          // Get provider data
          const providerDoc = await collections.providers().doc(opportunityData.providerId).get();
          const providerData = providerDoc.exists ? providerDoc.data() : null;

          // Apply filters
          if (search) {
            const searchLower = search.toLowerCase();
            const matchesSearch = 
              opportunityData.position?.toLowerCase().includes(searchLower) ||
              providerData?.name?.toLowerCase().includes(searchLower) ||
              opportunityData.description?.toLowerCase().includes(searchLower);
            
            if (!matchesSearch) return null;
          }

          if (category && category !== 'all' && opportunityData.category !== category) {
            return null;
          }

          if (jobType && jobType !== 'all' && opportunityData.jobType !== jobType) {
            return null;
          }

          if (location && location !== 'all' && opportunityData.location !== location) {
            return null;
          }

          if (remoteOnly && !opportunityData.remoteAvailable) {
            return null;
          }

          return {
            id: doc.id,
            position: opportunityData.position || 'Unknown Position',
            description: opportunityData.description || '',
            provider: {
              id: opportunityData.providerId,
              name: providerData?.name || 'Unknown Provider',
              location: opportunityData.location || providerData?.location || '',
              industry: providerData?.industry || 'Healthcare',
              rating: providerData?.rating || 4.5,
              logo: providerData?.logo || 'https://picsum.photos/seed/provider/100/100'
            },
            placement: {
              duration: opportunityData.duration || 12,
              hours: opportunityData.weeklyHours || 35,
              schedule: opportunityData.schedule || 'Full-time',
              startDate: opportunityData.startDate,
              category: opportunityData.category || 'healthcare',
              jobType: opportunityData.jobType || 'full-time',
              remoteAvailable: opportunityData.remoteAvailable || false
            },
            requirements: {
              qualifications: opportunityData.qualifications || [],
              experience: opportunityData.experienceRequired || 'Entry level',
              skills: opportunityData.skills || [],
              certifications: opportunityData.certifications || []
            },
            benefits: opportunityData.benefits || [
              'Professional development',
              'Mentorship program',
              'Industry connections'
            ],
            applicationStatus: 'not_applied', // Would check against applications collection
            featured: opportunityData.featured || false,
            urgentHiring: opportunityData.urgentHiring || false,
            createdAt: opportunityData.createdAt,
            updatedAt: opportunityData.updatedAt
          };
        } catch (error) {
          console.error(`Error processing opportunity ${doc.id}:`, error);
          return null;
        }
      })
    );

    // Filter out null results and sort
    const filteredOpportunities = opportunities
      .filter(opp => opp !== null)
      .sort((a, b) => {
        // Sort by featured first, then by date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    // Get summary statistics
    const stats = {
      total: filteredOpportunities.length,
      featured: filteredOpportunities.filter(opp => opp.featured).length,
      urgent: filteredOpportunities.filter(opp => opp.urgentHiring).length,
      remote: filteredOpportunities.filter(opp => opp.placement.remoteAvailable).length,
      categories: {
        healthcare: filteredOpportunities.filter(opp => opp.placement.category === 'healthcare').length,
        technology: filteredOpportunities.filter(opp => opp.placement.category === 'technology').length,
        education: filteredOpportunities.filter(opp => opp.placement.category === 'education').length,
        business: filteredOpportunities.filter(opp => opp.placement.category === 'business').length
      }
    };

    console.log('✅ Student opportunities fetched successfully');
    return NextResponse.json({
      success: true,
      opportunities: filteredOpportunities,
      stats,
      filters: {
        search,
        category,
        jobType,
        location,
        remoteOnly
      }
    });

  } catch (error) {
    console.error('Error fetching Student opportunities:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch opportunities',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Creating Student opportunity application...');
    
    const body = await request.json();
    const { studentId, opportunityId, applicationData } = body;

    if (!studentId || !opportunityId) {
      return NextResponse.json({
        success: false,
        error: 'Student ID and Opportunity ID are required'
      }, { status: 400 });
    }

    // Verify opportunity exists and is available
    const opportunityDoc = await collections.placements().doc(opportunityId).get();
    if (!opportunityDoc.exists || opportunityDoc.data()?.status !== 'available') {
      return NextResponse.json({
        success: false,
        error: 'Opportunity not found or no longer available'
      }, { status: 404 });
    }

    // Check if student already applied
    const existingApplicationSnapshot = await collections.applications()
      .where('studentId', '==', studentId)
      .where('opportunityId', '==', opportunityId)
      .get();

    if (!existingApplicationSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'You have already applied for this opportunity'
      }, { status: 400 });
    }

    // Create application
    const applicationRef = collections.applications().doc();
    const application = {
      studentId,
      opportunityId,
      providerId: opportunityDoc.data()?.providerId,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      coverLetter: applicationData.coverLetter || '',
      availability: applicationData.availability || {},
      references: applicationData.references || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await applicationRef.set(application);

    return NextResponse.json({
      success: true,
      applicationId: applicationRef.id,
      message: 'Application submitted successfully'
    });

  } catch (error) {
    console.error('Error creating Student application:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit application',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}