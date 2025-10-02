// Firebase Cloud Messaging and Notification Service
import { getMessaging } from 'firebase-admin/messaging';
import { collections, db } from '@/lib/db';
import { 
  Announcement, 
  UserNotification, 
  FCMToken,
  NotificationPreferences,
  UserRole 
} from '@/lib/schemas/announcements';

// Initialize Firebase Messaging
let messaging: any = null;
try {
  messaging = getMessaging();
} catch (error) {
  console.warn('Firebase Messaging not initialized:', error);
}

// Send notifications to multiple users
export async function sendNotificationToUsers(
  announcement: Announcement, 
  users: any[]
) {
  console.log(`📱 Sending notifications for: ${announcement.title}`);
  
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  };

  // Process notifications in batches to avoid overwhelming the system
  const batchSize = 100;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    const batchPromises = batch.map(user => 
      sendNotificationToUser(announcement, user).catch(error => {
        results.failed++;
        results.errors.push(`User ${user.id}: ${error.message}`);
        return null;
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.sent += batchResults.filter(r => r.status === 'fulfilled' && r.value).length;
    
    // Small delay between batches
    if (i + batchSize < users.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  // Update announcement analytics
  await updateAnnouncementStats(announcement.id, results.sent, results.failed);

  console.log(`✅ Notification batch completed: ${results.sent} sent, ${results.failed} failed`);
  
  if (results.errors.length > 0) {
    console.error('Notification errors:', results.errors.slice(0, 5)); // Log first 5 errors
  }

  return results;
}

// Send notification to a single user
async function sendNotificationToUser(announcement: Announcement, user: any) {
  try {
    // Get user's notification preferences
    const preferences = await getUserNotificationPreferences(user.id);
    
    // Check if user wants to receive this type of notification
    if (!shouldSendNotification(announcement, preferences)) {
      return false;
    }

    // Send push notification
    if (preferences.pushNotifications && messaging) {
      await sendPushNotification(announcement, user);
    }

    // Send email notification (if configured)
    if (preferences.emailNotifications) {
      await sendEmailNotification(announcement, user);
    }

    // Update notification status
    await updateNotificationStatus(announcement.id, user.id, 'sent');

    return true;
  } catch (error) {
    console.error(`Failed to send notification to user ${user.id}:`, error);
    await updateNotificationStatus(announcement.id, user.id, 'failed');
    throw error;
  }
}

// Send push notification via FCM
async function sendPushNotification(announcement: Announcement, user: any) {
  if (!messaging) {
    console.warn('Firebase Messaging not available');
    return;
  }

  try {
    // Get user's FCM tokens
    const tokensSnapshot = await collections.fcmTokens()
      .where('userId', '==', user.id)
      .where('isActive', '==', true)
      .get();

    if (tokensSnapshot.empty) {
      console.log(`No active FCM tokens for user ${user.id}`);
      return;
    }

    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    // Prepare FCM message
    const message = {
      notification: {
        title: announcement.title,
        body: announcement.content.length > 100 
          ? announcement.content.substring(0, 100) + '...'
          : announcement.content,
        imageUrl: announcement.imageUrl
      },
      data: {
        announcementId: announcement.id,
        type: announcement.type,
        actionUrl: announcement.actionButton?.url || '',
        actionText: announcement.actionButton?.text || ''
      },
      tokens
    };

    // Send to all user's tokens
    const response = await messaging.sendEachForMulticast(message);
    
    console.log(`📱 Push notification sent to ${response.successCount} devices for user ${user.id}`);

    // Handle failed tokens (remove invalid ones)
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
        }
      });
      
      // Remove invalid tokens
      await removeInvalidTokens(failedTokens);
    }

  } catch (error) {
    console.error('Push notification error:', error);
    throw error;
  }
}

// Send email notification (placeholder - implement with actual email service)
async function sendEmailNotification(announcement: Announcement, user: any) {
  // TODO: Implement email service integration
  // This could use SendGrid, AWS SES, or another email service
  
  console.log(`📧 Email notification would be sent to ${user.email} for announcement: ${announcement.title}`);
  
  // For now, just log the email content
  const emailContent = {
    to: user.email,
    subject: `PlacementGuru: ${announcement.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-bottom: 16px;">${announcement.title}</h2>
          <div style="background: white; padding: 20px; border-radius: 4px; margin-bottom: 16px;">
            ${announcement.content.replace(/\n/g, '<br>')}
          </div>
          ${announcement.actionButton ? `
            <a href="${announcement.actionButton.url}" 
               style="background: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              ${announcement.actionButton.text}
            </a>
          ` : ''}
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            This notification was sent by PlacementGuru. 
            <a href="/settings/notifications">Manage your notification preferences</a>
          </p>
        </div>
      </div>
    `
  };

  // Here you would integrate with your email service
  // await emailService.send(emailContent);
}

// Get user's notification preferences
async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  try {
    const prefDoc = await collections.notificationPreferences().doc(userId).get();
    
    if (prefDoc.exists) {
      return prefDoc.data() as NotificationPreferences;
    }
    
    // Return default preferences if none exist
    return {
      id: userId,
      userId,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      smsNotifications: false,
      receiveInfo: true,
      receiveSuccess: true,
      receiveWarning: true,
      receiveCritical: true,
      quietHoursEnabled: false,
      timezone: 'Australia/Sydney',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    
    // Return default preferences on error
    return {
      id: userId,
      userId,
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      smsNotifications: false,
      receiveInfo: true,
      receiveSuccess: true,
      receiveWarning: true,
      receiveCritical: true,
      quietHoursEnabled: false,
      timezone: 'Australia/Sydney',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}

// Check if notification should be sent based on preferences
function shouldSendNotification(
  announcement: Announcement, 
  preferences: NotificationPreferences
): boolean {
  // Check type preferences
  switch (announcement.type) {
    case 'info':
      if (!preferences.receiveInfo) return false;
      break;
    case 'success':
      if (!preferences.receiveSuccess) return false;
      break;
    case 'warning':
      if (!preferences.receiveWarning) return false;
      break;
    case 'critical':
      if (!preferences.receiveCritical) return false;
      break;
  }

  // Check quiet hours (if enabled)
  if (preferences.quietHoursEnabled && preferences.quietHoursStart && preferences.quietHoursEnd) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = preferences.quietHoursStart.split(':').map(Number);
    const [endHour, endMinute] = preferences.quietHoursEnd.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Same day quiet hours
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    } else {
      // Overnight quiet hours
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }
  }

  return true;
}

// Update notification status in database
async function updateNotificationStatus(
  announcementId: string, 
  userId: string, 
  status: 'sent' | 'delivered' | 'failed' | 'read'
) {
  try {
    const notificationQuery = await collections.userNotifications()
      .where('announcementId', '==', announcementId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!notificationQuery.empty) {
      const notificationDoc = notificationQuery.docs[0];
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'sent') updateData.sentAt = new Date();
      if (status === 'delivered') updateData.deliveredAt = new Date();
      if (status === 'read') updateData.readAt = new Date();

      await notificationDoc.ref.update(updateData);
    }
  } catch (error) {
    console.error('Error updating notification status:', error);
  }
}

// Update announcement statistics
async function updateAnnouncementStats(
  announcementId: string, 
  sent: number, 
  failed: number
) {
  try {
    await collections.announcements().doc(announcementId).update({
      deliveredCount: sent,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating announcement stats:', error);
  }
}

// Remove invalid FCM tokens
async function removeInvalidTokens(tokens: string[]) {
  try {
    const batch = db.batch();
    
    for (const token of tokens) {
      const tokenQuery = await collections.fcmTokens()
        .where('token', '==', token)
        .limit(1)
        .get();
      
      if (!tokenQuery.empty) {
        batch.update(tokenQuery.docs[0].ref, { isActive: false });
      }
    }
    
    await batch.commit();
    console.log(`🧹 Removed ${tokens.length} invalid FCM tokens`);
  } catch (error) {
    console.error('Error removing invalid tokens:', error);
  }
}

// Register FCM token for a user
export async function registerFCMToken(
  userId: string, 
  token: string, 
  deviceType: 'web' | 'android' | 'ios' = 'web',
  deviceInfo?: string
) {
  try {
    // Check if token already exists
    const existingTokenQuery = await collections.fcmTokens()
      .where('token', '==', token)
      .limit(1)
      .get();

    if (!existingTokenQuery.empty) {
      // Update existing token
      await existingTokenQuery.docs[0].ref.update({
        isActive: true,
        lastUsed: new Date(),
        deviceInfo: deviceInfo || existingTokenQuery.docs[0].data().deviceInfo
      });
    } else {
      // Create new token record
      const tokenRef = collections.fcmTokens().doc();
      await tokenRef.set({
        id: tokenRef.id,
        userId,
        token,
        deviceType,
        deviceInfo: deviceInfo || `${deviceType} device`,
        isActive: true,
        lastUsed: new Date(),
        createdAt: new Date()
      });
    }

    console.log(`📱 FCM token registered for user ${userId}`);
  } catch (error) {
    console.error('Error registering FCM token:', error);
    throw error;
  }
}