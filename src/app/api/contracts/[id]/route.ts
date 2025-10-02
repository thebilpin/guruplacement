import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { ContractStatus } from '@/lib/schemas/verification';

// PUT /api/contracts/[id] - Update contract status or details
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const {
      status,
      signedBy,
      signatureType, // 'rto' or 'provider'
      notes,
    } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    // Get contract
    const contractDoc = await collections.contracts().doc(contractId).get();
    
    if (!contractDoc.exists) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const contractData = contractDoc.data() as any;
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Handle status changes
    if (status) {
      const validStatuses: ContractStatus[] = ['draft', 'pending', 'active', 'expired', 'terminated'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid contract status' },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Handle signatures
    if (signedBy && signatureType) {
      if (signatureType === 'rto') {
        updateData.rtoSignedBy = signedBy;
        updateData.rtoSignedAt = new Date();
      } else if (signatureType === 'provider') {
        updateData.providerSignedBy = signedBy;
        updateData.providerSignedAt = new Date();
      }

      // If both parties have signed, activate the contract
      const willBeBothSigned = (
        (contractData.rtoSignedBy || signatureType === 'rto') &&
        (contractData.providerSignedBy || signatureType === 'provider')
      );
      
      if (willBeBothSigned && contractData.status !== 'active') {
        updateData.status = 'active';
      }
    }

    if (notes) {
      updateData.notes = notes;
    }

    await collections.contracts().doc(contractId).update(updateData);

    // Return updated contract
    const updatedDoc = await collections.contracts().doc(contractId).get();
    const updatedContract = { id: updatedDoc.id, ...updatedDoc.data() };

    return NextResponse.json({
      message: 'Contract updated successfully',
      contract: updatedContract,
    });

  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/contracts/[id] - Get specific contract details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const contractDoc = await collections.contracts().doc(contractId).get();
    
    if (!contractDoc.exists) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    const contractData = contractDoc.data() as any;

    // Get RTO and Provider details
    const [rtoDoc, providerDoc] = await Promise.all([
      collections.rtos().doc(contractData.rtoId).get(),
      collections.providers().doc(contractData.providerId).get(),
    ]);

    const contract = {
      id: contractDoc.id,
      ...contractData,
      rtoName: rtoDoc.exists ? rtoDoc.data()?.name : 'Unknown RTO',
      providerName: providerDoc.exists ? providerDoc.data()?.name : 'Unknown Provider',
    };

    return NextResponse.json({ contract });

  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}