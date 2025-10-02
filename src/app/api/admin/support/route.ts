// API endpoint for fetching support tickets and statistics
import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { SupportTicket, TicketStatsResponse, TicketFilters, CreateTicketRequest, UpdateTicketRequest } from '@/lib/schemas/support';
import { createTicketNotification, notifyTicketStatusChange } from '@/lib/ticket-notifications';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';
    
    console.log('🎫 Support API called with action:', action);

    if (action === 'stats') {
      return await getTicketStats();
    } else if (action === 'list') {
      return await getTickets(searchParams);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Support API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch support data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log('🎫 Support POST API called with action:', action);

    if (action === 'create') {
      return await createTicket(body);
    } else if (action === 'update') {
      return await updateTicket(body);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Support POST API error:', error);
    return NextResponse.json({ 
      error: 'Failed to process support request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function getTicketStats(): Promise<NextResponse> {
  try {
    const ticketsRef = adminDb.collection('supportTickets');
    const snapshot = await ticketsRef.get();
    
    const tickets = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as SupportTicket[];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate statistics
    const stats: TicketStatsResponse = {
      totalTickets: tickets.length,
      openTickets: tickets.filter(t => t.status === 'open').length,
      inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
      resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      closedTickets: tickets.filter(t => t.status === 'closed').length,
      avgResponseTime: calculateAvgResponseTime(tickets),
      avgResolutionTime: calculateAvgResolutionTime(tickets),
      slaMetPercentage: calculateSLAMetPercentage(tickets),
      satisfactionAverage: calculateSatisfactionAverage(tickets),
      ticketsByPriority: {
        low: tickets.filter(t => t.priority === 'low').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        high: tickets.filter(t => t.priority === 'high').length,
        urgent: tickets.filter(t => t.priority === 'urgent').length,
      },
      ticketsByCategory: {
        technical: tickets.filter(t => t.category === 'technical').length,
        billing: tickets.filter(t => t.category === 'billing').length,
        account: tickets.filter(t => t.category === 'account').length,
        feature_request: tickets.filter(t => t.category === 'feature_request').length,
        compliance: tickets.filter(t => t.category === 'compliance').length,
        other: tickets.filter(t => t.category === 'other').length,
      }
    };

    console.log('📊 Ticket stats calculated:', stats);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('❌ Error calculating ticket stats, using mock data:', error);
    
    // Return mock stats for development
    const mockStats: TicketStatsResponse = {
      totalTickets: 3,
      openTickets: 1,
      inProgressTickets: 1,
      resolvedTickets: 1,
      closedTickets: 0,
      avgResponseTime: 4,
      avgResolutionTime: 24,
      slaMetPercentage: 100,
      satisfactionAverage: 5.0,
      ticketsByPriority: {
        low: 0,
        medium: 1,
        high: 1,
        urgent: 1,
      },
      ticketsByCategory: {
        technical: 1,
        billing: 0,
        account: 0,
        feature_request: 0,
        compliance: 0,
        other: 2,
      }
    };
    
    console.log('📊 Using mock ticket stats');
    return NextResponse.json(mockStats);
  }
}

// Mock data for development when Firestore indexes aren't available
const getMockTickets = (userEmail?: string) => [
  {
    id: 'mock-1',
    ticketNumber: 'TKT-001234',
    subject: 'Login Issues',
    description: 'Having trouble logging into my account',
    priority: 'high' as const,
    status: 'open' as const,
    category: 'technical',
    userId: 'student-123',
    userEmail: userEmail || 'student@example.com',
    userName: 'John Student',
    userRole: 'student',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000),
    tags: ['login', 'authentication'],
    attachments: [],
    isEscalated: false,
  },
  {
    id: 'mock-2',
    ticketNumber: 'TKT-001235',
    subject: 'Certificate Request',
    description: 'Need help downloading my completion certificate',
    priority: 'medium' as const,
    status: 'in_progress' as const,
    category: 'certificates',
    userId: 'student-123',
    userEmail: userEmail || 'student@example.com',
    userName: 'John Student',
    userRole: 'student',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() + 43 * 60 * 60 * 1000),
    tags: ['certificate', 'download'],
    attachments: [],
    isEscalated: false,
    assignedTo: 'support@placementguru.com',
    assignedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'mock-3',
    ticketNumber: 'TKT-001236',
    subject: 'Course Access Problem',
    description: 'Cannot access my enrolled course materials',
    priority: 'urgent' as const,
    status: 'resolved' as const,
    category: 'access',
    userId: 'student-123',
    userEmail: userEmail || 'student@example.com',
    userName: 'John Student',
    userRole: 'student',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    resolvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    slaDeadline: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
    tags: ['course', 'access', 'materials'],
    attachments: [],
    isEscalated: false,
    assignedTo: 'support@placementguru.com',
    resolution: 'Access restored. The issue was due to expired enrollment.',
    satisfactionRating: 5,
  }
];

async function getTickets(searchParams: URLSearchParams): Promise<NextResponse> {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const assignedTo = searchParams.get('assignedTo');
  const search = searchParams.get('search');
  const userEmail = searchParams.get('userEmail'); // Filter by specific user

  try {
    let query: any = adminDb.collection('supportTickets');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    if (assignedTo) {
      query = query.where('assignedTo', '==', assignedTo);
    }
    if (userEmail) {
      query = query.where('userEmail', '==', userEmail);
    }

    // Order by created date (newest first)
    query = query.orderBy('createdAt', 'desc');

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const offsetSnapshot = await query.limit(offset).get();
      if (!offsetSnapshot.empty) {
        const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.limit(limit).get();
    
    let tickets = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
      resolvedAt: doc.data().resolvedAt?.toDate(),
      closedAt: doc.data().closedAt?.toDate(),
      slaDeadline: doc.data().slaDeadline?.toDate(),
    })) as SupportTicket[];

    // Apply search filter (client-side for now)
    if (search) {
      const searchTerm = search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.userName.toLowerCase().includes(searchTerm) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm)
      );
    }

    console.log(`🎫 Fetched ${tickets.length} tickets`);
    return NextResponse.json({ tickets, page, limit });
  } catch (error) {
    console.error('❌ Error fetching tickets, using mock data:', error);
    
    // Return mock data for development when Firestore indexes aren't available
    let tickets = getMockTickets(userEmail || undefined);
    
    // Apply filters to mock data
    if (status) {
      tickets = tickets.filter(t => t.status === status);
    }
    if (priority) {
      tickets = tickets.filter(t => t.priority === priority);
    }
    if (assignedTo) {
      tickets = tickets.filter(t => t.assignedTo === assignedTo);
    }
    if (search) {
      const searchTerm = search.toLowerCase();
      tickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm) ||
        ticket.description.toLowerCase().includes(searchTerm) ||
        ticket.userName.toLowerCase().includes(searchTerm) ||
        ticket.ticketNumber.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply pagination to mock data
    const startIndex = (page - 1) * limit;
    const paginatedTickets = tickets.slice(startIndex, startIndex + limit);
    
    console.log(`🎫 Using mock data: ${paginatedTickets.length} tickets`);
    return NextResponse.json({ tickets: paginatedTickets, page, limit });
  }
}

// Helper functions
function calculateAvgResponseTime(tickets: SupportTicket[]): number {
  const ticketsWithResponseTime = tickets.filter(t => t.responseTime);
  if (ticketsWithResponseTime.length === 0) return 0;
  
  const total = ticketsWithResponseTime.reduce((sum, t) => sum + (t.responseTime || 0), 0);
  return Math.round(total / ticketsWithResponseTime.length);
}

function calculateAvgResolutionTime(tickets: SupportTicket[]): number {
  const resolvedTickets = tickets.filter(t => t.resolutionTime);
  if (resolvedTickets.length === 0) return 0;
  
  const total = resolvedTickets.reduce((sum, t) => sum + (t.resolutionTime || 0), 0);
  return Math.round(total / resolvedTickets.length);
}

function calculateSLAMetPercentage(tickets: SupportTicket[]): number {
  if (tickets.length === 0) return 100;
  
  const now = new Date();
  const slaMetTickets = tickets.filter(ticket => {
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      // For closed/resolved tickets, check if they were resolved before SLA deadline
      const resolvedDate = ticket.resolvedAt || ticket.closedAt;
      return resolvedDate && resolvedDate <= ticket.slaDeadline;
    } else {
      // For open tickets, check if they're still within SLA
      return now <= ticket.slaDeadline;
    }
  });
  
  return Math.round((slaMetTickets.length / tickets.length) * 100);
}

function calculateSatisfactionAverage(tickets: SupportTicket[]): number {
  const ratedTickets = tickets.filter(t => t.satisfactionRating);
  if (ratedTickets.length === 0) return 0;
  
  const total = ratedTickets.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0);
  return Math.round((total / ratedTickets.length) * 10) / 10; // Round to 1 decimal
}

async function createTicket(body: any): Promise<NextResponse> {
  try {
    const { ticketData, userData } = body;
    const request: CreateTicketRequest = ticketData;

    // Generate ticket number
    const timestamp = Date.now();
    const ticketNumber = `TKT-${timestamp.toString().slice(-6)}`;

    // Calculate SLA deadline based on priority
    const slaHours = getSLAHours(request.priority);
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket: Omit<SupportTicket, 'id'> = {
      ticketNumber,
      subject: request.subject,
      description: request.description,
      priority: request.priority,
      status: 'open',
      category: request.category,
      
      // User information
      userId: userData?.uid || 'anonymous',
      userEmail: userData?.email || 'anonymous@example.com',
      userName: userData?.name || userData?.displayName || 'Anonymous User',
      userRole: userData?.role || 'student',
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // SLA tracking
      slaDeadline,
      
      // Default values
      tags: request.tags || [],
      attachments: request.attachments || [],
      isEscalated: false,
    };

    const docRef = await adminDb.collection('supportTickets').add(ticket);
    
    // Send notification to user about ticket creation
    await createTicketNotification(
      ticket.userId,
      ticket.userEmail,
      docRef.id,
      ticketNumber,
      'created',
      `Your support ticket has been created successfully. We'll review it and get back to you soon.`,
      userData?.email || 'System'
    );
    
    console.log('✅ Ticket created:', ticketNumber);
    return NextResponse.json({ 
      success: true, 
      ticketId: docRef.id, 
      ticketNumber 
    });
  } catch (error) {
    console.error('❌ Error creating ticket:', error);
    throw error;
  }
}

async function updateTicket(body: any): Promise<NextResponse> {
  try {
    const { ticketId, updates, updatedBy } = body;
    const request: UpdateTicketRequest = updates;

    // Get current ticket data for comparison
    const ticketDoc = await adminDb.collection('supportTickets').doc(ticketId).get();
    const currentTicket = ticketDoc.data();
    
    if (!currentTicket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const updateData: any = {
      ...request,
      updatedAt: new Date(),
    };

    // Add status-specific timestamps
    if (request.status === 'resolved' && !updateData.resolvedAt) {
      updateData.resolvedAt = new Date();
    }
    if (request.status === 'closed' && !updateData.closedAt) {
      updateData.closedAt = new Date();
    }
    if (request.assignedTo && !updateData.assignedAt) {
      updateData.assignedAt = new Date();
    }

    await adminDb.collection('supportTickets').doc(ticketId).update(updateData);
    
    // Send notification if status changed
    if (request.status && request.status !== currentTicket.status) {
      await notifyTicketStatusChange(
        { id: ticketId, ...currentTicket },
        currentTicket.status,
        request.status,
        updatedBy || 'Admin'
      );
    }
    
    console.log('✅ Ticket updated:', ticketId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating ticket:', error);
    throw error;
  }
}

function getSLAHours(priority: string): number {
  switch (priority) {
    case 'urgent': return 4;   // 4 hours
    case 'high': return 24;    // 24 hours
    case 'medium': return 48;  // 48 hours
    case 'low': return 72;     // 72 hours
    default: return 48;
  }
}