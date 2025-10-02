import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { collections } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { alertId, action } = await request.json();

    if (!alertId || !action) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and action are required' },
        { status: 400 }
      );
    }

    console.log(`🚨 ${action} alert:`, alertId);

    // Update the alert status
    const alertRef = collections.activityLogs().doc(alertId);
    const alertDoc = await alertRef.get();

    if (!alertDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Alert not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (action === 'acknowledge') {
      updateData.status = 'acknowledged';
      updateData.acknowledgedAt = new Date();
      updateData.acknowledgedBy = 'admin@placementguru.com'; // TODO: Get from auth
    } else if (action === 'resolve') {
      updateData.status = 'resolved';
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = 'admin@placementguru.com'; // TODO: Get from auth
    } else if (action === 'dismiss') {
      updateData.status = 'dismissed';
    }

    await alertRef.update(updateData);

    // Log the action
    await collections.activityLogs().add({
      type: 'compliance_action',
      action: `alert_${action}`,
      alertId,
      performedBy: 'admin@placementguru.com', // TODO: Get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Alert ${action}d successfully`
    });

  } catch (error) {
    console.error(`❌ Error updating alert:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}