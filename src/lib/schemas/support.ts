// Support ticket schemas and types
export interface SupportTicket {
  id: string;
  ticketNumber: string; // e.g., TKT-001
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'on_hold' | 'resolved' | 'closed';
  category: 'technical' | 'billing' | 'account' | 'feature_request' | 'compliance' | 'other';
  
  // User information
  userId: string;
  userEmail: string;
  userName: string;
  userRole: 'student' | 'rto' | 'supervisor' | 'assessor' | 'admin';
  
  // Assignment
  assignedTo?: string; // Agent ID
  assignedToName?: string; // Agent name
  assignedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  
  // SLA tracking
  slaDeadline: Date;
  responseTime?: number; // in minutes
  resolutionTime?: number; // in minutes
  
  // Satisfaction
  satisfactionRating?: number; // 1-5
  satisfactionFeedback?: string;
  
  // Tags and metadata
  tags: string[];
  attachments: string[]; // URLs to uploaded files
  
  // Internal notes
  internalNotes?: string;
  
  // Escalation
  isEscalated: boolean;
  escalatedAt?: Date;
  escalatedBy?: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'user' | 'agent' | 'system';
  content: string;
  isInternal: boolean; // Internal comments not visible to users
  createdAt: Date;
  attachments: string[];
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: 'created' | 'status_changed' | 'assigned' | 'priority_changed' | 'commented' | 'resolved' | 'closed';
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  createdAt: Date;
  details?: string;
}

// API request/response types
export interface CreateTicketRequest {
  subject: string;
  description: string;
  priority: SupportTicket['priority'];
  category: SupportTicket['category'];
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTicketRequest {
  subject?: string;
  description?: string;
  priority?: SupportTicket['priority'];
  status?: SupportTicket['status'];
  assignedTo?: string;
  tags?: string[];
  internalNotes?: string;
}

export interface TicketStatsResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  avgResponseTime: number; // in minutes
  avgResolutionTime: number; // in minutes
  slaMetPercentage: number;
  satisfactionAverage: number;
  ticketsByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  ticketsByCategory: {
    technical: number;
    billing: number;
    account: number;
    feature_request: number;
    compliance: number;
    other: number;
  };
}

export interface TicketFilters {
  status?: SupportTicket['status'][];
  priority?: SupportTicket['priority'][];
  category?: SupportTicket['category'][];
  assignedTo?: string[];
  userRole?: SupportTicket['userRole'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
  search?: string;
}