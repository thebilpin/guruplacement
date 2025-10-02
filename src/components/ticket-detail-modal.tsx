'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Eye, 
  User, 
  Clock, 
  MessageCircle, 
  Send, 
  AlertTriangle,
  FileText,
  Tag,
  Calendar,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { SupportTicket, TicketComment } from '@/lib/schemas/support';
import { TicketManagementModal } from '@/components/ticket-management-modal';
import { useAuth } from '@/hooks/use-auth';

interface TicketDetailModalProps {
  ticket: SupportTicket;
  onTicketUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function TicketDetailModal({ ticket, onTicketUpdated, trigger }: TicketDetailModalProps) {
  const { userData } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  const fetchComments = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/support/comments?ticketId=${ticket.id}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
        console.log('💬 Comments loaded:', data.comments?.length || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [open]);

  const handleSendComment = async () => {
    if (!newComment.trim()) return;
    
    setSendingComment(true);
    try {
      // Use the userData from the useAuth hook
      
      const response = await fetch('/api/admin/support/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId: ticket.id,
          content: newComment,
          authorId: (userData as any)?.uid || 'anonymous',
          authorName: (userData as any)?.displayName || userData?.email || 'Anonymous',
          authorRole: (userData as any)?.role || 'user',
          isInternal: false
        })
      });
      
      if (response.ok) {
        setNewComment('');
        fetchComments();
        onTicketUpdated?.(); // Refresh ticket data
        console.log('✅ Comment sent successfully');
      } else {
        const error = await response.json();
        console.error('❌ Error response:', error);
        alert('Failed to send comment. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error sending comment:', error);
      alert('Failed to send comment. Please try again.');
    } finally {
      setSendingComment(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'on_hold': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    const now = new Date();
    return now > ticket.slaDeadline && !['resolved', 'closed'].includes(ticket.status);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const timeLeft = ticket.slaDeadline.getTime() - now.getTime();
    
    if (timeLeft <= 0) return 'Overdue';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    if (hours > 0) return `${hours}h remaining`;
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    return `${minutes}m remaining`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {ticket.ticketNumber}: {ticket.subject}
                {isOverdue() && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Created {formatDate(ticket.createdAt)} • Last updated {formatDate(ticket.updatedAt)}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <TicketManagementModal 
                ticket={ticket} 
                onTicketUpdated={onTicketUpdated}
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Ticket Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6 flex-shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {ticket.category.replace('_', ' ')}
                  </Badge>
                </div>
                
                {ticket.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="h-4 w-4 text-gray-500" />
                    {ticket.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-600 mb-2">
                  <div className="flex items-center justify-end gap-2">
                    <Clock className="h-4 w-4" />
                    <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                      {getTimeRemaining()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    SLA Deadline: {formatDate(ticket.slaDeadline)}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6 flex-shrink-0">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>

            {/* Comments Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Conversation ({comments.length})
                </h4>
              </div>
              
              <ScrollArea className="flex-1 mb-4 border rounded-lg p-4 min-h-0">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading conversation...</p>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No comments yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.authorName}</span>
                            <Badge variant="outline" className="text-xs">
                              {comment.authorRole}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* New Comment */}
              <div className="flex gap-2 flex-shrink-0">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="resize-none form-input-bordered"
                />
                <Button 
                  onClick={handleSendComment}
                  disabled={sendingComment || !newComment.trim()}
                  size="sm"
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {ticket.userName}
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3" />
                  <a href={`mailto:${ticket.userEmail}`} className="text-blue-600 hover:underline">
                    {ticket.userEmail}
                  </a>
                </div>
                <div>
                  <strong>Role:</strong> <Badge variant="outline" className="text-xs capitalize">{ticket.userRole}</Badge>
                </div>
                <div>
                  <strong>User ID:</strong> <code className="text-xs bg-gray-200 px-1 rounded">{ticket.userId}</code>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Assignment</h4>
              <div className="text-sm">
                {ticket.assignedToName ? (
                  <div>
                    <strong>Assigned to:</strong> {ticket.assignedToName}
                    {ticket.assignedAt && (
                      <div className="text-xs text-gray-500 mt-1">
                        Assigned {formatDate(ticket.assignedAt)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Unassigned
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{formatDate(ticket.updatedAt)}</span>
                </div>
                {ticket.resolvedAt && (
                  <div className="flex justify-between">
                    <span>Resolved:</span>
                    <span>{formatDate(ticket.resolvedAt)}</span>
                  </div>
                )}
                {ticket.closedAt && (
                  <div className="flex justify-between">
                    <span>Closed:</span>
                    <span>{formatDate(ticket.closedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            {ticket.internalNotes && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-medium mb-2 text-yellow-800">Internal Notes</h4>
                <p className="text-sm text-yellow-700">{ticket.internalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}