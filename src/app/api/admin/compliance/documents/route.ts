import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { documentId, organizationId, action } = await request.json();

    if (!documentId || !organizationId || !action) {
      return NextResponse.json(
        { success: false, error: 'Document ID, organization ID, and action are required' },
        { status: 400 }
      );
    }

    console.log(`📄 ${action} document:`, documentId);

    if (action === 'notify_expiry') {
      // Send notification about expiring document
      await collections.activityLogs().add({
        type: 'compliance_notification',
        action: 'document_expiry_notification',
        documentId,
        organizationId,
        message: 'Document expiry notification sent',
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // TODO: Implement actual notification sending (email, SMS, etc.)
      
      return NextResponse.json({
        success: true,
        message: 'Expiry notification sent successfully'
      });
    }

    if (action === 'request_renewal') {
      // Request document renewal
      await collections.activityLogs().add({
        type: 'compliance_action',
        action: 'document_renewal_request',
        documentId,
        organizationId,
        message: 'Document renewal request sent',
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // TODO: Create a formal renewal request ticket/task
      
      return NextResponse.json({
        success: true,
        message: 'Renewal request sent successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error(`❌ Error managing document:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage document' },
      { status: 500 }
    );
  }
}