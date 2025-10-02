// RTO Providers API - Manage placement providers for RTO organizations
import { NextRequest, NextResponse } from 'next/server'
import { collections } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Fetching RTO providers data...');

    const url = new URL(request.url);
    const rtoId = url.searchParams.get('rtoId');
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    const location = url.searchParams.get('location');
    const industry = url.searchParams.get('industry');

    // Get providers query
    let providersQuery = collections.providers();
    
    if (status) {
      providersQuery = providersQuery.where('status', '==', status);
    }

    const providersSnapshot = await providersQuery.limit(100).get();

    // Get detailed providers data with placement statistics
    const providersData = await Promise.all(
      providersSnapshot.docs.map(async (doc) => {
        const providerData = doc.data();
        
        try {
          // Get placement statistics for this provider
          const placementsSnapshot = await collections.placements()
            .where('providerId', '==', doc.id)
            .get();
            
          const placements = placementsSnapshot.docs.map(d => d.data());
          
          // Get active contracts with this provider
          const contractsSnapshot = await collections.contracts()
            .where('providerId', '==', doc.id)
            .where('status', '==', 'active')
            .get();
            
          const activeContracts = contractsSnapshot.docs.length;
          
          // Apply client-side filters
          const providerName = providerData.name || '';
          const providerLocation = providerData.location || '';
          const providerIndustry = providerData.industry || '';
          
          if (search) {
            const searchLower = search.toLowerCase();
            if (!providerName.toLowerCase().includes(searchLower) && 
                !providerLocation.toLowerCase().includes(searchLower) &&
                !providerData.description?.toLowerCase().includes(searchLower)) {
              return null;
            }
          }
          
          if (location && !providerLocation.toLowerCase().includes(location.toLowerCase())) {
            return null;
          }
          
          if (industry && providerIndustry !== industry) {
            return null;
          }
          
          // Calculate placement statistics
          const totalPlacements = placements.length;
          const activePlacements = placements.filter(p => p.status === 'in_progress').length;
          const completedPlacements = placements.filter(p => p.status === 'completed').length;
          const cancelledPlacements = placements.filter(p => p.status === 'cancelled').length;
          
          const successRate = totalPlacements > 0 
            ? Math.round((completedPlacements / totalPlacements) * 100) 
            : 0;
          
          return {
            id: doc.id,
            name: providerData.name || 'Unknown Provider',
            description: providerData.description || '',
            industry: providerData.industry || 'Unknown',
            location: providerData.location || 'Unknown',
            address: providerData.address || '',
            contactPerson: providerData.contactPerson || '',
            email: providerData.email || '',
            phone: providerData.phone || '',
            website: providerData.website || '',
            status: providerData.status || 'active',
            capacity: providerData.capacity || 0,
            currentPlacements: activePlacements,
            availableSlots: Math.max(0, (providerData.capacity || 0) - activePlacements),
            statistics: {
              totalPlacements,
              activePlacements,
              completedPlacements,
              cancelledPlacements,
              successRate,
              averageRating: providerData.averageRating || 0,
              activeContracts
            },
            preferences: {
              studentTypes: providerData.studentTypes || [],
              skills: providerData.skills || [],
              industries: providerData.industries || []
            },
            compliance: {
              backgroundChecksRequired: providerData.backgroundChecksRequired || false,
              insuranceVerified: providerData.insuranceVerified || false,
              safetyTrainingRequired: providerData.safetyTrainingRequired || false,
              lastAuditDate: providerData.lastAuditDate || null
            },
            createdAt: providerData.createdAt,
            updatedAt: providerData.updatedAt
          };
        } catch (error) {
          console.error(`Error processing provider ${doc.id}:`, error);
          return {
            id: doc.id,
            name: providerData.name || 'Error Loading',
            status: providerData.status || 'unknown',
            error: true
          };
        }
      })
    );

    // Filter out null results from search filtering
    const filteredProviders = providersData.filter(provider => provider !== null);

    // Get summary statistics
    const stats = {
      total: filteredProviders.length,
      active: filteredProviders.filter(p => p.status === 'active').length,
      inactive: filteredProviders.filter(p => p.status === 'inactive').length,
      pending: filteredProviders.filter(p => p.status === 'pending').length,
      totalCapacity: filteredProviders.reduce((sum, p) => sum + (p.capacity || 0), 0),
      totalAvailableSlots: filteredProviders.reduce((sum, p) => sum + (p.availableSlots || 0), 0),
      totalActivePlacements: filteredProviders.reduce((sum, p) => sum + (p.currentPlacements || 0), 0),
      averageSuccessRate: filteredProviders.length > 0 
        ? Math.round(filteredProviders.reduce((sum, p) => sum + (p.statistics?.successRate || 0), 0) / filteredProviders.length)
        : 0
    };

    return NextResponse.json({
      success: true,
      providers: filteredProviders,
      stats,
      filters: {
        search,
        status,
        location,
        industry,
        rtoId
      }
    });

  } catch (error) {
    console.error('Error fetching RTO providers:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch providers data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new RTO provider...');
    
    const body = await request.json();
    const { providerData, rtoId } = body;

    if (!providerData.name || !providerData.email) {
      return NextResponse.json({
        success: false,
        error: 'Provider name and email are required'
      }, { status: 400 });
    }

    // Create provider record
    const providerRef = collections.providers().doc();
    const newProvider = {
      name: providerData.name,
      description: providerData.description || '',
      industry: providerData.industry || 'General',
      location: providerData.location || '',
      address: providerData.address || '',
      contactPerson: providerData.contactPerson || '',
      email: providerData.email,
      phone: providerData.phone || '',
      website: providerData.website || '',
      status: 'pending', // New providers start as pending
      capacity: providerData.capacity || 0,
      studentTypes: providerData.studentTypes || [],
      skills: providerData.skills || [],
      industries: providerData.industries || [],
      backgroundChecksRequired: providerData.backgroundChecksRequired || false,
      insuranceVerified: false,
      safetyTrainingRequired: providerData.safetyTrainingRequired || false,
      averageRating: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: rtoId
    };

    await providerRef.set(newProvider);

    return NextResponse.json({
      success: true,
      providerId: providerRef.id,
      message: 'Provider created successfully'
    });

  } catch (error) {
    console.error('Error creating RTO provider:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('✏️ Updating RTO provider...');
    
    const body = await request.json();
    const { providerId, updates } = body;

    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required'
      }, { status: 400 });
    }

    // Update provider record
    const providerRef = collections.providers().doc(providerId);
    const providerDoc = await providerRef.get();

    if (!providerDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'Provider not found'
      }, { status: 404 });
    }

    await providerRef.update({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Provider updated successfully'
    });

  } catch (error) {
    console.error('Error updating RTO provider:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Deleting RTO provider...');
    
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json({
        success: false,
        error: 'Provider ID is required'
      }, { status: 400 });
    }

    // Check if provider has active placements
    const activePlacementsSnapshot = await collections.placements()
      .where('providerId', '==', providerId)
      .where('status', '==', 'in_progress')
      .get();

    if (!activePlacementsSnapshot.empty) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete provider with active placements'
      }, { status: 400 });
    }

    // Delete provider record
    await collections.providers().doc(providerId).delete();

    return NextResponse.json({
      success: true,
      message: 'Provider deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting RTO provider:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete provider',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}