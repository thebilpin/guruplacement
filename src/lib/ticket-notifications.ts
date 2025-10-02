// Simple notification system for ticket updates
import { adminDb } from '@/lib/firebase';

export async function createTicketNotification(
  userId: string,
  userEmail: string,
  ticketId: string,
  ticketNumber: string,
  type: 'created' | 'updated' | 'replied' | 'resolved' | 'closed',
  message: string,
  actionBy?: string
) {
  try {
    const notification = {
      id: `ticket_${ticketId}_${Date.now()}`,
      userId,
      userEmail,
      type: 'ticket_update',
      subType: type,
      title: `Ticket ${ticketNumber} ${type}`,
      message,
      ticketId,
      ticketNumber,
      actionBy: actionBy || 'System',
      isRead: false,
      createdAt: new Date(),
      metadata: {
        ticketId,
        ticketNumber,
        type
      }
    };

    await adminDb.collection('userNotifications').add(notification);
    console.log('🔔 Notification created:', notification.title);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return false;
  }
}

export async function notifyTicketStatusChange(
  ticketData: any,
  oldStatus: string,
  newStatus: string,
  changedBy: string
) {
  const statusMessages = {
    'open': 'is now open and awaiting review',
    'in_progress': 'is being worked on by our support team',
    'on_hold': 'has been put on hold pending additional information',
    'resolved': 'has been resolved! Please review the solution.',
    'closed': 'has been closed'
  };

  const message = `Your support ticket ${statusMessages[newStatus as keyof typeof statusMessages] || 'has been updated'}.`;
  
  await createTicketNotification(
    ticketData.userId,
    ticketData.userEmail,
    ticketData.id,
    ticketData.ticketNumber,
    newStatus === 'resolved' ? 'resolved' : newStatus === 'closed' ? 'closed' : 'updated',
    message,
    changedBy
  );
}

export async function notifyTicketReply(
  ticketData: any,
  replyBy: string,
  isFromAgent: boolean
) {
  if (isFromAgent) {
    // Notify the user that an agent replied
    await createTicketNotification(
      ticketData.userId,
      ticketData.userEmail,
      ticketData.id,
      ticketData.ticketNumber,
      'replied',
      `${replyBy} has replied to your support ticket. Check your ticket for the latest update.`,
      replyBy
    );
  } else {
    // Could notify agents that user replied (implement if needed)
    console.log('💬 User replied to ticket:', ticketData.ticketNumber);
  }
}