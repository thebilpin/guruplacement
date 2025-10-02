import { NextRequest, NextResponse } from 'next/server';
import { collections, db } from '@/lib/db';
import { UpdateAnnouncementSchema, Announcement } from '@/lib/schemas/announcements';

// GET /api/admin/announcements/[id] - Get specific announcement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcementDoc = await collections.announcements().doc(params.id).get();
    
    if (!announcementDoc.exists) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = {
      id: announcementDoc.id,
      ...announcementDoc.data()
    } as Announcement;

    // Get notification stats
    const notificationsSnapshot = await collections.userNotifications()
      .where('announcementId', '==', params.id)
      .get();

    const notifications = notificationsSnapshot.docs.map(doc => doc.data());
    const stats = {
      totalSent: notifications.length,
      delivered: notifications.filter(n => n.status === 'delivered' || n.status === 'read').length,
      read: notifications.filter(n => n.status === 'read').length,
      failed: notifications.filter(n => n.status === 'failed').length
    };

    return NextResponse.json({
      announcement,
      stats
    });

  } catch (error) {
    console.error('Error fetching announcement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcement' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = UpdateAnnouncementSchema.parse(body);

    // Check if announcement exists
    const announcementDoc = await collections.announcements().doc(params.id).get();
    
    if (!announcementDoc.exists) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const currentAnnouncement = announcementDoc.data() as Announcement;

    // Prevent editing published announcements (except for archiving)
    if (currentAnnouncement.status === 'published' && (validatedData as any).status !== 'archived') {
      return NextResponse.json(
        { error: 'Cannot edit published announcements' },
        { status: 400 }
      );
    }

    // Update the announcement
    const updateData = {
      ...validatedData,
      updatedAt: new Date()
    };

    await collections.announcements().doc(params.id).update(updateData);

    const updatedAnnouncement = {
      ...currentAnnouncement,
      ...updateData
    };

    return NextResponse.json({
      success: true,
      announcement: updatedAnnouncement,
      message: 'Announcement updated successfully'
    });

  } catch (error) {
    console.error('Error updating announcement:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update announcement' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if announcement exists
    const announcementDoc = await collections.announcements().doc(params.id).get();
    
    if (!announcementDoc.exists) {
      return NextResponse.json(
        { error: 'Announcement not found' },
        { status: 404 }
      );
    }

    const announcement = announcementDoc.data() as Announcement;

    // Only allow deletion of draft or scheduled announcements
    if (announcement.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published announcements. Archive them instead.' },
        { status: 400 }
      );
    }

    // Delete the announcement
    await collections.announcements().doc(params.id).delete();

    // Also delete associated user notifications
    const notificationsSnapshot = await collections.userNotifications()
      .where('announcementId', '==', params.id)
      .get();

    const batch = db.batch();
    notificationsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: 'Announcement deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting announcement:', error);
    return NextResponse.json(
      { error: 'Failed to delete announcement' },
      { status: 500 }
    );
  }
}