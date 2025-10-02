'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, User, Clock, AlertTriangle } from 'lucide-react';
import { SupportTicket } from '@/lib/schemas/support';

interface TicketManagementModalProps {
  ticket: SupportTicket;
  onTicketUpdated?: () => void;
  trigger?: React.ReactNode;
}

export function TicketManagementModal({ ticket, onTicketUpdated, trigger }: TicketManagementModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: ticket.status,
    priority: ticket.priority,
    assignedTo: ticket.assignedTo || '',
    assignedToName: ticket.assignedToName || '',
    internalNotes: ticket.internalNotes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update',
          ticketId: ticket.id,
          updates: {
            status: formData.status,
            priority: formData.priority,
            assignedTo: formData.assignedTo || null,
            assignedToName: formData.assignedToName || null,
            internalNotes: formData.internalNotes || null,
          },
          updatedBy: 'Admin', // TODO: Get actual admin name
        }),
      });

      if (response.ok) {
        console.log('✅ Ticket updated:', ticket.ticketNumber);
        setOpen(false);
        onTicketUpdated?.();
      } else {
        const error = await response.json();
        console.error('❌ Error updating ticket:', error);
        alert('Failed to update ticket. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error updating ticket:', error);
      alert('Failed to update ticket. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-1" />
            Manage
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Manage Ticket: {ticket.ticketNumber}
            {isOverdue() && (
              <Badge className="bg-red-100 text-red-800">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Update ticket status, priority, assignment, and internal notes.
          </DialogDescription>
        </DialogHeader>

        {/* Ticket Overview */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Subject:</strong> {ticket.subject}
            </div>
            <div>
              <strong>User:</strong> {ticket.userName} ({ticket.userRole})
            </div>
            <div>
              <strong>Category:</strong> {ticket.category.replace('_', ' ')}
            </div>
            <div>
              <strong>Created:</strong> {ticket.createdAt.toLocaleDateString()}
            </div>
            <div>
              <strong>Current Priority:</strong>
              <Badge className={`ml-2 ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </Badge>
            </div>
            <div>
              <strong>Current Status:</strong>
              <Badge className={`ml-2 ${getStatusColor(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          {ticket.description && (
            <div className="mt-4">
              <strong>Description:</strong>
              <p className="text-gray-700 mt-1 text-sm bg-white p-2 rounded border">
                {ticket.description}
              </p>
            </div>
          )}
        </div>

        {/* 
         * ⚠️  FORM STYLING: Uses standardized classes for consistent appearance
         * 📖 Documentation: /docs/FORM_STYLING_STANDARDS.md
         * 🚫 DO NOT modify form styling without reading the documentation!
         */}
        <form onSubmit={handleSubmit} className="form-container">
          {/* Status and Priority */}
          <div className="form-section grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Open</Badge>
                      <span>Ready for work</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="in_progress">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">In Progress</Badge>
                      <span>Being worked on</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="on_hold">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-gray-100 text-gray-800">On Hold</Badge>
                      <span>Waiting for info</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                      <span>Solution provided</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-slate-100 text-slate-800">Closed</Badge>
                      <span>Completed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="form-input-bordered">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Low</Badge>
                      <span className="text-sm text-gray-600">72h SLA</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      <span className="text-sm text-gray-600">48h SLA</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-orange-100 text-orange-800">High</Badge>
                      <span className="text-sm text-gray-600">24h SLA</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-100 text-red-800">Urgent</Badge>
                      <span className="text-sm text-gray-600">4h SLA</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignment */}
          <div className="form-section grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To (ID)</Label>
              <Input
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                placeholder="Agent user ID (optional)"
                className="form-input-bordered"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedToName">Agent Name</Label>
              <Input
                id="assignedToName"
                value={formData.assignedToName}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedToName: e.target.value }))}
                placeholder="Agent display name"
                className="form-input-bordered"
              />
            </div>
          </div>

          {/* Internal Notes */}
          <div className="form-section">
            <Label htmlFor="internalNotes">Internal Notes</Label>
            <Textarea
              id="internalNotes"
              value={formData.internalNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
              placeholder="Add internal notes for team members (not visible to user)..."
              className="form-input-bordered"
              rows={4}
            />
          </div>

          {/* SLA Information */}
          <div className="form-info-section bg-blue-50">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <strong className="text-blue-900">SLA Information</strong>
            </div>
            <div className="text-sm text-blue-800">
              <p><strong>Deadline:</strong> {ticket.slaDeadline.toLocaleString()}</p>
              <p><strong>Status:</strong> {isOverdue() ? '⚠️ Overdue' : '✅ Within SLA'}</p>
              {ticket.responseTime && (
                <p><strong>Response Time:</strong> {Math.round(ticket.responseTime / 60)}h</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}