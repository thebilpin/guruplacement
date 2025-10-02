import { NextRequest, NextResponse } from 'next/server';
import { collections, db } from '@/lib/db';
import { 
  CreateAnnouncementSchema, 
  UpdateAnnouncementSchema, 
  Announcement, 
  UserNotification,
  AnnouncementStatus,
  UserRole
} from '@/lib/schemas/announcements';
import { sendNotificationToUsers } from '@/lib/services/notification-service';

// GET /api/admin/announcements - Get all announcements with filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as AnnouncementStatus | null;
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = collections.announcements().orderBy('createdAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (type) {
      query = query.where('type', '==', type);
    }

    // Apply pagination
    const snapshot = await query.limit(limit).offset(offset).get();
    const announcements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Announcement[];

    // Get total count for pagination
    const totalCountSnapshot = await collections.announcements().get();
    const totalCount = totalCountSnapshot.size;

    return NextResponse.json({
      announcements,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

// POST /api/admin/announcements - Create new announcement  
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request data
    const validatedData = CreateAnnouncementSchema.parse(body);
    
    // Get admin user ID (you'll need to implement auth check here)
    const adminId = body.adminId || 'admin-system'; // TODO: Get from auth

    // Create announcement document
    const announcementData: Omit<Announcement, 'id'> = {
      ...validatedData,
      status: validatedData.sendImmediately ? 'published' : 'scheduled',
      createdBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: validatedData.sendImmediately ? new Date() : undefined,
      totalRecipients: 0,
      deliveredCount: 0,
      readCount: 0,
      clickCount: 0
    };

    // Save to database
    const announcementRef = collections.announcements().doc();
    await announcementRef.set({
      id: announcementRef.id,
      ...announcementData
    });

    const createdAnnouncement = {
      id: announcementRef.id,
      ...announcementData
    };

    // If sending immediately, process notifications
    if (validatedData.sendImmediately) {
      await processAnnouncementNotifications(createdAnnouncement);
    }

    return NextResponse.json({
      success: true,
      announcement: createdAnnouncement,
      message: validatedData.sendImmediately 
        ? 'Announcement published and notifications are being sent'
        : 'Announcement scheduled successfully'
    });

  } catch (error) {
    console.error('Error creating announcement:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

// Helper function to process announcement notifications
async function processAnnouncementNotifications(announcement: Announcement) {
  try {
    // Get target users based on roles and targeting criteria
    const targetUsers = await getTargetUsers(announcement);
    
    // Create individual notification records
    const batch = db.batch();
    const notifications: Omit<UserNotification, 'id'>[] = [];
    
    for (const user of targetUsers) {
      const notificationData: Omit<UserNotification, 'id'> = {
        announcementId: announcement.id,
        userId: user.id,
        userRole: (user as any).role as UserRole,
        status: 'pending',
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        imageUrl: announcement.imageUrl,
        actionButton: announcement.actionButton,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const notificationRef = collections.userNotifications().doc();
      batch.set(notificationRef, {
        id: notificationRef.id,
        ...notificationData
      });
      
      notifications.push(notificationData);
    }

    // Update announcement with recipient count
    batch.update(collections.announcements().doc(announcement.id), {
      totalRecipients: targetUsers.length,
      updatedAt: new Date()
    });

    await batch.commit();

    // Send actual notifications (FCM, email, etc.)
    await sendNotificationToUsers(announcement, targetUsers);

    console.log(`✅ Processed ${targetUsers.length} notifications for announcement: ${announcement.title}`);

  } catch (error) {
    console.error('Error processing announcement notifications:', error);
    
    // Update announcement status to indicate error
    await collections.announcements().doc(announcement.id).update({
      status: 'published', // Keep as published but log the error
      updatedAt: new Date()
    });
  }
}

// Helper function to get target users based on announcement criteria
async function getTargetUsers(announcement: Announcement) {
  try {
    if (announcement.specificUserIds && announcement.specificUserIds.length > 0) {
      // Get specific users by ID
      const userDocs = await Promise.all(
        announcement.specificUserIds.map(id => collections.users().doc(id).get())
      );
      return userDocs
        .filter(doc => doc.exists)
        .map(doc => ({ id: doc.id, ...doc.data() }));
    }

    let snapshot;

    if (announcement.targetAllUsers) {
      // Get all active users
      snapshot = await collections.users()
        .where('status', '==', 'active')
        .get();
    } else {
      // Get users by roles
      snapshot = await collections.users()
        .where('role', 'in', announcement.targetRoles)
        .where('status', '==', 'active')
        .get();
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Error getting target users:', error);
    return [];
  }
}