import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/db';

// GET /api/notifications - Get user notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status'); // 'unread', 'read', 'all'
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let query = collections.userNotifications()
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');

    // Apply status filter
    if (status === 'unread') {
      query = query.where('status', 'in', ['pending', 'sent', 'delivered']);
    } else if (status === 'read') {
      query = query.where('status', '==', 'read');
    }

    const snapshot = await query.limit(limit).get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Get unread count
    const unreadSnapshot = await collections.userNotifications()
      .where('userId', '==', userId)
      .where('status', 'in', ['pending', 'sent', 'delivered'])
      .get();

    return NextResponse.json({
      notifications,
      unreadCount: unreadSnapshot.size,
      total: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark notification as read
export async function POST(request: NextRequest) {
  try {
    const { notificationId, action } = await request.json();

    if (!notificationId || !action) {
      return NextResponse.json(
        { error: 'Notification ID and action are required' },
        { status: 400 }
      );
    }

    const notificationDoc = await collections.userNotifications().doc(notificationId).get();
    
    if (!notificationDoc.exists) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      updatedAt: new Date()
    };

    if (action === 'mark_read') {
      updateData.status = 'read';
      updateData.readAt = new Date();
    } else if (action === 'mark_clicked') {
      updateData.clickedAt = new Date();
      if (notificationDoc.data()?.status !== 'read') {
        updateData.status = 'read';
        updateData.readAt = new Date();
      }
    }

    await collections.userNotifications().doc(notificationId).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}