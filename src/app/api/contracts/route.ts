import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { ContractStatus } from '@/lib/schemas/verification';

// GET /api/contracts - Get contracts for current user/organization
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rtoId = searchParams.get('rtoId');
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status') as ContractStatus | null;

    if (!rtoId && !providerId) {
      return NextResponse.json(
        { error: 'Either rtoId or providerId is required' },
        { status: 400 }
      );
    }

    let query = collections.contracts();
    
    if (rtoId) {
      query = query.where('rtoId', '==', rtoId);
    }
    
    if (providerId) {
      query = query.where('providerId', '==', providerId);
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }

    const contractsSnapshot = await query.orderBy('createdAt', 'desc').get();

    const contracts = await Promise.all(
      contractsSnapshot.docs.map(async (doc: any) => {
        const contractData = doc.data() as any;
        
        // Get RTO and Provider details
        const [rtoDoc, providerDoc] = await Promise.all([
          collections.rtos().doc(contractData.rtoId).get(),
          collections.providers().doc(contractData.providerId).get(),
        ]);

        return {
          id: doc.id,
          ...contractData,
          rtoName: rtoDoc.exists ? rtoDoc.data()?.name : 'Unknown RTO',
          providerName: providerDoc.exists ? providerDoc.data()?.name : 'Unknown Provider',
        };
      })
    );

    return NextResponse.json({ contracts });

  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create new contract/MoU
export async function POST(request: NextRequest) {
  try {
    const {
      rtoId,
      providerId,
      title,
      description,
      contractType = 'mou',
      startDate,
      endDate,
      maxStudents,
      placementDuration,
      createdBy,
    } = await request.json();

    if (!rtoId || !providerId || !title || !startDate || !endDate || !createdBy) {
      return NextResponse.json(
        { error: 'Missing required fields: rtoId, providerId, title, startDate, endDate, createdBy' },
        { status: 400 }
      );
    }

    // Validate that both RTO and Provider exist and are verified
    const [rtoDoc, providerDoc] = await Promise.all([
      collections.rtos().doc(rtoId).get(),
      collections.providers().doc(providerId).get(),
    ]);

    if (!rtoDoc.exists) {
      return NextResponse.json(
        { error: 'RTO not found' },
        { status: 404 }
      );
    }

    if (!providerDoc.exists) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if RTO and Provider are verified (get their admin users)
    const [rtoAdminQuery, providerAdminQuery] = await Promise.all([
      collections.users().where('rtoId', '==', rtoId).where('role', '==', 'rto_admin').limit(1).get(),
      collections.users().where('providerId', '==', providerId).where('role', '==', 'provider_admin').limit(1).get(),
    ]);

    const rtoAdmin = rtoAdminQuery.docs[0]?.data() as any;
    const providerAdmin = providerAdminQuery.docs[0]?.data() as any;

    if (!rtoAdmin || rtoAdmin.verificationStatus !== 'verified') {
      return NextResponse.json(
        { error: 'RTO is not verified' },
        { status: 403 }
      );
    }

    if (!providerAdmin || providerAdmin.verificationStatus !== 'verified') {
      return NextResponse.json(
        { error: 'Provider is not verified' },
        { status: 403 }
      );
    }

    // Create contract
    const contractData = {
      rtoId,
      providerId,
      title,
      description: description || '',
      contractType,
      status: 'draft' as ContractStatus,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxStudents: maxStudents || null,
      placementDuration: placementDuration || null,
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const contractRef = await collections.contracts().add(contractData);

    return NextResponse.json({
      message: 'Contract created successfully',
      contractId: contractRef.id,
      contract: { id: contractRef.id, ...contractData },
    });

  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}