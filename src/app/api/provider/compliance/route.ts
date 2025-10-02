import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching Provider compliance data...');

    const { searchParams } = new URL(request.url);
    const providerId = searchParams.get('providerId');
    const status = searchParams.get('status');
    
    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    // Fetch compliance documents
    let snapshot;
    if (status && status !== 'all') {
      snapshot = await collections.complianceRecords()
        .where('providerId', '==', providerId)
        .where('status', '==', status)
        .orderBy('createdAt', 'desc')
        .get();
    } else {
      snapshot = await collections.complianceRecords()
        .where('providerId', '==', providerId)
        .orderBy('createdAt', 'desc')
        .get();
    }

    // Process compliance documents
    const documents = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      const expiryDate = data.expiryDate?.toDate?.();
      const now = new Date();
      
      let docStatus = data.status || 'pending';
      if (expiryDate) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (expiryDate < now) {
          docStatus = 'expired';
        } else if (daysUntilExpiry <= 30) {
          docStatus = 'expiring_soon';
        }
      }

      return {
        id: doc.id,
        name: data.documentName || data.name || 'Unnamed Document',
        type: data.documentType || 'general',
        status: docStatus,
        expiryDate: expiryDate?.toISOString() || null,
        uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || data.createdAt?.toDate?.()?.toISOString(),
        uploadedBy: data.uploadedBy || 'System',
        fileUrl: data.fileUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        verifiedAt: data.verifiedAt?.toDate?.()?.toISOString() || null,
        verifiedBy: data.verifiedBy || null,
        notes: data.notes || '',
        isRequired: data.isRequired || false,
        category: data.category || 'general'
      };
    });

    // Get audit logs
    const auditSnapshot = await collections.auditLogs()
      .where('providerId', '==', providerId)
      .where('category', '==', 'compliance')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    const auditLogs = auditSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        action: data.action || 'Unknown action',
        user: data.userEmail || data.userName || 'System',
        timestamp: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        details: data.details || '',
        documentId: data.documentId || null,
        documentName: data.documentName || null
      };
    });

    // Calculate statistics
    const stats = {
      total: documents.length,
      verified: documents.filter((d: any) => d.status === 'verified').length,
      pending: documents.filter((d: any) => d.status === 'pending').length,
      expiringSoon: documents.filter((d: any) => d.status === 'expiring_soon').length,
      expired: documents.filter((d: any) => d.status === 'expired').length,
      missing: documents.filter((d: any) => d.status === 'missing').length,
      rejected: documents.filter((d: any) => d.status === 'rejected').length
    };

    // Get upcoming deadlines
    const upcomingDeadlines = documents
      .filter((d: any) => d.expiryDate && new Date(d.expiryDate) > new Date())
      .sort((a: any, b: any) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
      .slice(0, 5)
      .map((d: any) => ({
        id: d.id,
        name: d.name,
        expiryDate: d.expiryDate,
        daysUntilExpiry: Math.ceil((new Date(d.expiryDate!).getTime() - new Date().getTime()) / (1000 * 3600 * 24)),
        priority: new Date(d.expiryDate!).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 ? 'high' : 'medium'
      }));

    console.log(`✅ Fetched ${documents.length} compliance documents and ${auditLogs.length} audit logs`);

    return NextResponse.json({
      success: true,
      documents,
      auditLogs,
      stats,
      upcomingDeadlines
    });

  } catch (error) {
    console.error('❌ Error fetching provider compliance data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch compliance data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Processing provider compliance action...');
    
    const body = await request.json();
    const { action, documentId, providerId, data } = body;

    if (!providerId) {
      return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
    }

    switch (action) {
      case 'upload_document':
        const newDocument = {
          providerId,
          documentName: data.name,
          documentType: data.type || 'general',
          category: data.category || 'general',
          status: 'pending',
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          fileSize: data.fileSize,
          expiryDate: data.expiryDate ? Timestamp.fromDate(new Date(data.expiryDate)) : null,
          isRequired: data.isRequired || false,
          uploadedBy: data.uploadedBy || 'Provider',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        const docRef = await collections.complianceRecords().add(newDocument);

        // Create audit log
        await collections.auditLogs().add({
          providerId,
          category: 'compliance',
          action: 'Document uploaded',
          details: `Uploaded ${data.name}`,
          documentId: docRef.id,
          documentName: data.name,
          timestamp: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          documentId: docRef.id,
          message: 'Document uploaded successfully'
        });

      case 'update_document':
        if (!documentId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        const docToUpdate = collections.complianceRecords().doc(documentId);
        const docSnapshot = await docToUpdate.get();

        if (!docSnapshot.exists) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        const updateData: any = {
          ...data,
          updatedAt: Timestamp.now()
        };

        if (data.expiryDate) {
          updateData.expiryDate = Timestamp.fromDate(new Date(data.expiryDate));
        }

        await docToUpdate.update(updateData);

        // Create audit log
        await collections.auditLogs().add({
          providerId,
          category: 'compliance',
          action: 'Document updated',
          details: `Updated ${docSnapshot.data()?.documentName || 'document'}`,
          documentId,
          documentName: docSnapshot.data()?.documentName,
          timestamp: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Document updated successfully'
        });

      case 'delete_document':
        if (!documentId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        const docToDelete = collections.complianceRecords().doc(documentId);
        const deleteSnapshot = await docToDelete.get();

        if (!deleteSnapshot.exists) {
          return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        await docToDelete.delete();

        // Create audit log
        await collections.auditLogs().add({
          providerId,
          category: 'compliance',
          action: 'Document deleted',
          details: `Deleted ${deleteSnapshot.data()?.documentName || 'document'}`,
          documentId,
          documentName: deleteSnapshot.data()?.documentName,
          timestamp: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Document deleted successfully'
        });

      case 'request_verification':
        if (!documentId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        await collections.complianceRecords().doc(documentId).update({
          status: 'pending_verification',
          verificationRequestedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        return NextResponse.json({
          success: true,
          message: 'Verification requested successfully'
        });

      case 'renew_document':
        if (!documentId) {
          return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        const renewData: any = {
          status: 'pending',
          renewedAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };

        if (data.newExpiryDate) {
          renewData.expiryDate = Timestamp.fromDate(new Date(data.newExpiryDate));
        }

        if (data.newFileUrl) {
          renewData.fileUrl = data.newFileUrl;
          renewData.fileName = data.newFileName;
          renewData.fileSize = data.newFileSize;
        }

        await collections.complianceRecords().doc(documentId).update(renewData);

        return NextResponse.json({
          success: true,
          message: 'Document renewed successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Error processing compliance action:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process compliance action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}