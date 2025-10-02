// API endpoint for ticket comments and replies
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { TicketComment } from '@/lib/schemas/support';
import { notifyTicketReply } from '@/lib/ticket-notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticketId');
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID is required' }, { status: 400 });
    }

    console.log('💬 Fetching comments for ticket:', ticketId);

    const commentsRef = adminDb.collection('supportComments');
    const snapshot = await commentsRef
      .where('ticketId', '==', ticketId)
      .orderBy('createdAt', 'asc')
      .get();
    
    const comments = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as TicketComment[];

    console.log(`✅ Found ${comments.length} comments for ticket ${ticketId}`);
    
    return NextResponse.json({ comments });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch comments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ticketId, content, authorId, authorName, authorRole, isInternal, attachments } = body;

    if (!ticketId || !content || !authorId || !authorName || !authorRole) {
      return NextResponse.json({ 
        error: 'Missing required fields: ticketId, content, authorId, authorName, authorRole' 
      }, { status: 400 });
    }

    console.log('💬 Creating comment for ticket:', ticketId);

    const comment: Omit<TicketComment, 'id'> = {
      ticketId,
      authorId,
      authorName,
      authorRole: authorRole === 'admin' || authorRole === 'rto_admin' ? 'agent' : 'user',
      content,
      isInternal: isInternal || false,
      createdAt: new Date(),
      attachments: attachments || [],
    };

    const docRef = await adminDb.collection('supportComments').add(comment);
    
    // Update ticket's last updated timestamp and response time if this is first agent response
    const ticketRef = adminDb.collection('supportTickets').doc(ticketId);
    const ticketDoc = await ticketRef.get();
    
    if (ticketDoc.exists) {
      const ticketData = ticketDoc.data();
      const updateData: any = {
        updatedAt: new Date(),
      };

      // If this is first agent response, calculate response time
      if (comment.authorRole === 'agent' && !ticketData?.responseTime) {
        const createdAt = ticketData?.createdAt?.toDate() || new Date();
        const responseTimeMinutes = Math.floor((new Date().getTime() - createdAt.getTime()) / (1000 * 60));
        updateData.responseTime = responseTimeMinutes;
        console.log('⏱️ Setting response time:', responseTimeMinutes, 'minutes');
      }

      // If ticket is open and agent is responding, move to in_progress
      if (ticketData?.status === 'open' && comment.authorRole === 'agent') {
        updateData.status = 'in_progress';
        console.log('📝 Moving ticket to in_progress status');
      }

      await ticketRef.update(updateData);
      
      // Send notification for replies
      await notifyTicketReply(
        { id: ticketId, ...ticketData },
        authorName,
        comment.authorRole === 'agent'
      );
    }

    console.log('✅ Comment created with ID:', docRef.id);
    
    return NextResponse.json({ 
      success: true, 
      commentId: docRef.id,
      comment: {
        id: docRef.id,
        ...comment
      }
    });
  } catch (error) {
    console.error('❌ Error creating comment:', error);
    return NextResponse.json({ 
      error: 'Failed to create comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, content } = body;

    if (!commentId || !content) {
      return NextResponse.json({ 
        error: 'Comment ID and content are required' 
      }, { status: 400 });
    }

    console.log('📝 Updating comment:', commentId);

    await adminDb.collection('supportComments').doc(commentId).update({
      content,
      updatedAt: new Date(),
    });

    console.log('✅ Comment updated:', commentId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    return NextResponse.json({ 
      error: 'Failed to update comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    console.log('🗑️ Deleting comment:', commentId);

    await adminDb.collection('supportComments').doc(commentId).delete();

    console.log('✅ Comment deleted:', commentId);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    return NextResponse.json({ 
      error: 'Failed to delete comment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}