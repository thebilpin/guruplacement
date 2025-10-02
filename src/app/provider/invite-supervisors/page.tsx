'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; 
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserPlus, Mail, UserCheck, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface Invitation {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  invitationStatus: 'invited' | 'accepted' | 'declined' | 'expired';
  invitedAt: Date;
  acceptedAt?: Date;
}

interface InviteSupervisorFormData {
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  notes?: string;
}

export default function ProviderInviteSupervisorsPage() {
  const { userData } = useAuth();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [formData, setFormData] = useState<InviteSupervisorFormData>({
    email: '',
    firstName: '',
    lastName: '',
    department: '',
    jobTitle: '',
    notes: '',
  });

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      department: '',
      jobTitle: '',
      notes: '',
    });
  };

  const handleInviteSupervisor = async () => {
    if (!userData || !formData.email || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields');
      return;
    }

    setInviting(true);
    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'supervisor',
          invitedBy: userData.id,
          organizationId: (userData as any).providerId || 'temp-provider-id', // In real app, get from user data
          organizationType: 'provider',
          metadata: {
            department: formData.department,
            jobTitle: formData.jobTitle,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ Invitation sent successfully!\n\nTemporary Password: ${result.tempPassword}\n\nInvitation URL: ${window.location.origin}${result.invitationUrl}\n\nPlease share these details with the supervisor.`);
        
        // Reset form and close dialog
        resetForm();
        setInviteDialogOpen(false);
        
        // Refresh invitations list
        await fetchInvitations();
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to send invitation: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('❌ Failed to send invitation. Please try again.');
    } finally {
      setInviting(false);
    }
  };

  const fetchInvitations = async () => {
    if (!userData) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/invitations?invitedBy=${userData.id}&organizationType=provider`);
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invitations on component mount
  React.useEffect(() => {
    fetchInvitations();
  }, [userData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'invited':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Invited</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invite Supervisors</h1>
          <p className="text-gray-600">Invite workplace supervisors to join your organization on PlacementGuru</p>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Supervisor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Invite Workplace Supervisor</DialogTitle>
              <DialogDescription>
                Send an invitation to a workplace supervisor to join your organization on PlacementGuru.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    placeholder="e.g., Senior Manager"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Operations"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information for the supervisor..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleInviteSupervisor}
                disabled={inviting || !formData.email || !formData.firstName || !formData.lastName}
              >
                {inviting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Invitations List */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading invitations...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations sent yet</h3>
              <p className="text-gray-600 mb-4">Start by inviting workplace supervisors to join your organization.</p>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Accepted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center">
                          <UserCheck className="h-4 w-4 text-green-600 mr-2" />
                          <p className="font-medium">{invitation.firstName} {invitation.lastName}</p>
                        </div>
                        <p className="text-sm text-gray-600">{invitation.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">Operations</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invitation.invitationStatus)}
                    </TableCell>
                    <TableCell>
                      {new Date(invitation.invitedAt).toLocaleDateString('en-AU')}
                    </TableCell>
                    <TableCell>
                      {invitation.acceptedAt 
                        ? new Date(invitation.acceptedAt).toLocaleDateString('en-AU')
                        : '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}