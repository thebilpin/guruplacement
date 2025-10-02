import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider contracts...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Execute query with filters
    let snapshot;
    if (status && status !== 'all') {
      snapshot = await collections.contracts()
        .where('providerId', '==', providerId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
    } else {
      snapshot = await collections.contracts()
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc')
        .get();
    }
    
    let contracts = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        rtoId: data.rtoId,
        rtoName: data.rtoName || 'Unknown RTO',
        contractType: data.contractType || data.type || 'standard',
        status: data.status || 'draft',
        startDate: data.startDate?.toDate?.()?.toISOString() || null,
        endDate: data.endDate?.toDate?.()?.toISOString() || null,
        maxStudents: data.maxStudents || null,
        terms: data.terms || '',
        conditions: data.conditions || [],
        signedByProvider: data.signedByProvider || false,
        signedByRto: data.signedByRto || false,
        providerSignedAt: data.providerSignedAt?.toDate?.()?.toISOString() || null,
        rtoSignedAt: data.rtoSignedAt?.toDate?.()?.toISOString() || null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        value: data.contractValue || data.value || null,
        currency: data.currency || 'AUD',
        paymentTerms: data.paymentTerms || 'Net 30',
        renewalDate: data.renewalDate?.toDate?.()?.toISOString() || null,
        isAutoRenew: data.isAutoRenew || false,
        notes: data.notes || '',
        attachments: data.attachments || []
      };
    });

    // Calculate statistics
    const stats = {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'active').length,
      pending: contracts.filter(c => c.status === 'pending').length,
      expired: contracts.filter(c => c.status === 'expired').length,
      draft: contracts.filter(c => c.status === 'draft').length,
      needsSigning: contracts.filter(c => !c.signedByProvider && ['pending', 'active'].includes(c.status)).length,
      pendingRtoSignature: contracts.filter(c => c.signedByProvider && !c.signedByRto).length
    };

    // Get contracts expiring soon (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoon = contracts
      .filter(c => c.endDate && new Date(c.endDate) <= thirtyDaysFromNow && new Date(c.endDate) > new Date())
      .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
      .slice(0, 5);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedContracts = contracts.slice(startIndex, endIndex);

    console.log(`✅ Fetched ${contracts.length} contracts, returning ${paginatedContracts.length}`);

    return NextResponse.json({
      success: true,
      contracts: paginatedContracts,
      stats,
      expiringSoon,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(contracts.length / limit),
        totalItems: contracts.length,
        hasMore: endIndex < contracts.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching provider contracts:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch contracts',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider contract action...');
    
    const body = await request.json();
    const { action, contractId, providerId, data } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'sign_contract':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        const contractRef = collections.contracts().doc(contractId);
        const contractDoc = await contractRef.get();

        if (!contractDoc.exists) {
          return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        const contractData = contractDoc.data();
        const updateData: any = {
          signedByProvider: true,
          providerSignedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        // If RTO has already signed, mark contract as active
        if (contractData?.signedByRto) {
          updateData.status = 'active';
          updateData.activatedAt = Timestamp.now();
        }

        await contractRef.update(updateData);

        // Create audit log
        await collections.auditLogs().add({
          providerId,
          action: 'Contract signed by provider',
          contractId,
          details: `Provider signed contract ${contractData?.contractNumber || contractId}`,
          timestamp: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Contract signed successfully'
        });

      case 'request_amendment':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        await collections.contracts().doc(contractId).update({
          status: 'amendment_requested',
          amendmentRequest: {
            requestedBy: 'provider',
            requestedAt: Timestamp.now(),
            reason: data?.reason || '',
            details: data?.details || '',
            providerComments: data?.comments || ''
          },
          updatedAt: Timestamp.now()
        });

        // Create notification for RTO
        await collections.notifications().add({
          type: 'contract_amendment_request',
          contractId,
          providerId,
          rtoId: (await collections.contracts().doc(contractId).get()).data()?.rtoId,
          message: `Provider has requested an amendment to contract`,
          createdAt: Timestamp.now(),
          read: false
        });

        return NextResponse.json({
          success: true,
          message: 'Amendment request submitted successfully'
        });

      case 'download_contract':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        // In a real implementation, this would generate a PDF or return the file URL
        return NextResponse.json({
          success: true,
          downloadUrl: `/api/contracts/${contractId}/download`,
          message: 'Contract download ready'
        });

      case 'add_note':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        const noteContractRef = collections.contracts().doc(contractId);
        const noteContractDoc = await noteContractRef.get();
        
        if (!noteContractDoc.exists) {
          return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
        }

        const currentNotes = noteContractDoc.data()?.notes || '';
        const newNote = `${new Date().toLocaleDateString('en-AU')}: ${data?.note || ''}\n${currentNotes}`;

        await noteContractRef.update({
          notes: newNote,
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Note added successfully'
        });

      case 'request_renewal':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        await collections.contracts().doc(contractId).update({
          renewalRequested: true,
          renewalRequestedAt: Timestamp.now(),
          renewalTerms: {
            requestedStartDate: data?.startDate ? new Date(data.startDate) : null,
            requestedEndDate: data?.endDate ? new Date(data.endDate) : null,
            requestedMaxStudents: data?.maxStudents || null,
            providerComments: data?.comments || ''
          },
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Renewal request submitted successfully'
        });

      case 'cancel_contract':
        if (!contractId) {
          return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
        }

        await collections.contracts().doc(contractId).update({
          status: 'cancelled',
          cancelledAt: Timestamp.now(),
          cancelledBy: 'provider',
          cancellationReason: data?.reason || '',
          updatedAt: Timestamp.now()
        });

        // Create notification for RTO
        await collections.notifications().add({
          type: 'contract_cancelled',
          contractId,
          providerId,
          rtoId: (await collections.contracts().doc(contractId).get()).data()?.rtoId,
          message: `Provider has cancelled contract`,
          createdAt: Timestamp.now(),
          read: false
        });

        return NextResponse.json({
          success: true,
          message: 'Contract cancelled successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing contract action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process contract action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}