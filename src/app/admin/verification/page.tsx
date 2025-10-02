'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
import { CheckCircle2, XCircle, Clock, AlertCircle, Eye, Building2, GraduationCap, Search, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

interface UserVerification {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  verificationStatus?: 'pending' | 'under_review' | 'verified' | 'rejected' | 'suspended';
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  createdAt: Date;
  organization?: string;
}

interface VerificationStats {
  pending: number;
  underReview: number;
  verified: number;
  rejected: number;
  total: number;
}

export default function AdminVerificationPage() {
  const { userData } = useAuth();
  const [users, setUsers] = useState<{
    pendingVerification: UserVerification[];
    underReview: UserVerification[];
    verified: UserVerification[];
    rejected: UserVerification[];
    totals: VerificationStats;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserVerification | null>(null);
  const [verificationAction, setVerificationAction] = useState<'verify' | 'reject' | 'review' | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<{
    pendingVerification: UserVerification[];
    underReview: UserVerification[];
    verified: UserVerification[];
    rejected: UserVerification[];
  } | null>(null);

  useEffect(() => {
    fetchVerificationData();
  }, []);

  useEffect(() => {
    if (users && searchQuery) {
      const filterUsers = (userList: UserVerification[]) => 
        userList.filter(user => 
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.organization?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      setFilteredUsers({
        pendingVerification: filterUsers(users.pendingVerification),
        underReview: filterUsers(users.underReview),
        verified: filterUsers(users.verified),
        rejected: filterUsers(users.rejected)
      });
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchQuery]);

  const fetchVerificationData = async () => {
    try {
      const response = await fetch('/api/admin/verification');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch verification data');
      }
    } catch (error) {
      console.error('Error fetching verification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async () => {
    if (!selectedUser || !verificationAction || !userData) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          verificationStatus: verificationAction === 'verify' ? 'verified' : 
                             verificationAction === 'reject' ? 'rejected' : 'under_review',
          verificationNotes,
          adminId: userData.id,
        }),
      });

      if (response.ok) {
        // Refresh data
        await fetchVerificationData();
        
        // Close modal
        setSelectedUser(null);
        setVerificationAction(null);
        setVerificationNotes('');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
      alert('Failed to update verification status');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'rto_admin' ? (
      <GraduationCap className="h-4 w-4 text-blue-600" />
    ) : (
      <Building2 className="h-4 w-4 text-green-600" />
    );
  };

  const formatDate = (date: any) => {
    if (!date) return 'No Date';
    
    let dateObj;
    if (date && typeof date === 'object' && date.seconds) {
      // Firestore Timestamp
      dateObj = new Date(date.seconds * 1000);
    } else if (date && date.toDate && typeof date.toDate === 'function') {
      // Firestore Timestamp with toDate method
      dateObj = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!users) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Failed to Load Verification Data</h2>
          <p className="text-gray-600 mb-4">Unable to retrieve verification information.</p>
          <Button onClick={fetchVerificationData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">User Verification</h1>
        <p className="text-gray-600">Manage RTO and Provider verification requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.totals.pending}</p>
                <p className="text-gray-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.totals.underReview}</p>
                <p className="text-gray-600">Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.totals.verified}</p>
                <p className="text-gray-600">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{users.totals.rejected}</p>
                <p className="text-gray-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Search by email, name, or organization
              </Label>
              <Input
                id="search"
                placeholder="e.g. rto@placementhero.com.au"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={() => setSearchQuery('rto@placementhero.com.au')}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Find RTO User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Verification Queue</CardTitle>
            <div className="flex items-center gap-2">
            {searchQuery && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Filtered: {searchQuery}
              </Badge>
            )}
            {searchQuery === 'rto@placementhero.com.au' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <UserCheck className="h-3 w-3 mr-1" />
                RTO User Ready to Verify
              </Badge>
            )}
          </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({searchQuery ? filteredUsers?.pendingVerification.length || 0 : users.totals.pending})
              </TabsTrigger>
              <TabsTrigger value="under_review">
                Under Review ({searchQuery ? filteredUsers?.underReview.length || 0 : users.totals.underReview})
              </TabsTrigger>
              <TabsTrigger value="verified">
                Verified ({searchQuery ? filteredUsers?.verified.length || 0 : users.totals.verified})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({searchQuery ? filteredUsers?.rejected.length || 0 : users.totals.rejected})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              <UserVerificationTable 
                users={filteredUsers?.pendingVerification || []} 
                onSelectUser={setSelectedUser}
                onAction={setVerificationAction}
              />
            </TabsContent>

            <TabsContent value="under_review" className="mt-6">
              <UserVerificationTable 
                users={filteredUsers?.underReview || []} 
                onSelectUser={setSelectedUser}
                onAction={setVerificationAction}
              />
            </TabsContent>

            <TabsContent value="verified" className="mt-6">
              <UserVerificationTable 
                users={filteredUsers?.verified || []} 
                onSelectUser={setSelectedUser}
                onAction={setVerificationAction}
                readOnly
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <UserVerificationTable 
                users={filteredUsers?.rejected || []} 
                onSelectUser={setSelectedUser}
                onAction={setVerificationAction}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Verification Action Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {verificationAction === 'verify' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
              {verificationAction === 'reject' && <XCircle className="h-5 w-5 text-red-600" />}
              {verificationAction === 'review' && <AlertCircle className="h-5 w-5 text-blue-600" />}
              {verificationAction === 'verify' ? 'Verify User Account' :
               verificationAction === 'reject' ? 'Reject User Application' :
               'Review User Application'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedUser && (
                <>
                  {verificationAction === 'verify' && 'Approve this user to access their dashboard and begin using the platform.'}
                  {verificationAction === 'reject' && 'Reject this user\'s verification request with detailed feedback.'}
                  {verificationAction === 'review' && 'Mark this user as under review for further assessment.'}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Information Section */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                    <div className="p-2 bg-white border rounded text-sm font-medium">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                    <div className="p-2 bg-white border rounded text-sm">
                      {selectedUser.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Account Type</Label>
                    <div className="p-2 bg-white border rounded text-sm flex items-center">
                      {getRoleIcon(selectedUser.role)}
                      <span className="ml-2 font-medium">
                        {selectedUser.role === 'rto_admin' ? 'Registered Training Organisation (RTO) Administrator' : 'Workplace Training Provider Administrator'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Registration Date</Label>
                    <div className="p-2 bg-white border rounded text-sm">
                      {formatDate(selectedUser.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Details */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  Organization Details
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm font-medium text-gray-700">Organization Name</Label>
                    <div className="p-2 bg-white border rounded text-sm font-medium">
                      {selectedUser.organization || 'Not specified'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Current Status</Label>
                      <div className="p-2 bg-white border rounded text-sm">
                        {getStatusBadge(selectedUser.verificationStatus)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-gray-700">Account ID</Label>
                      <div className="p-2 bg-white border rounded text-sm font-mono">
                        {selectedUser.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previous Verification History */}
              {selectedUser.verificationNotes && (
                <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    Previous Verification Notes
                  </h3>
                  <div className="p-3 bg-white border rounded text-sm">
                    {selectedUser.verificationNotes}
                  </div>
                  {selectedUser.verifiedBy && (
                    <div className="mt-2 text-xs text-gray-600">
                      Last updated by: {selectedUser.verifiedBy} on {selectedUser.verifiedAt ? formatDate(selectedUser.verifiedAt) : 'Unknown date'}
                    </div>
                  )}
                </div>
              )}

              {/* Action Notes Section */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  {verificationAction === 'verify' ? 'Approval Notes' :
                   verificationAction === 'reject' ? 'Rejection Reason' :
                   'Review Notes'}
                  {verificationAction === 'reject' && <span className="text-red-600 text-sm font-normal">(Required)</span>}
                </h3>
                <Textarea
                  id="notes"
                  placeholder={
                    verificationAction === 'verify' ? 'Optional: Add any notes about the approval...' :
                    verificationAction === 'reject' ? 'Required: Please provide detailed reasons for rejection and guidance for resubmission...' :
                    'Add notes about what needs to be reviewed or additional information required...'
                  }
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="mt-2 min-h-[100px] border-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                />
                <div className="mt-2 text-xs text-gray-500">
                  {verificationAction === 'reject' 
                    ? 'Rejection notes will be sent to the user via email.'
                    : 'These notes will be recorded in the verification history.'
                  }
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedUser(null)}
              className="flex-1 sm:flex-none border-2 hover:bg-gray-50"
            >
              Cancel Changes
            </Button>
            <div className="flex gap-2 flex-1">
              <Button 
                onClick={handleVerificationAction}
                disabled={processing || (verificationAction === 'reject' && !verificationNotes.trim())}
                className={`flex-1 font-semibold text-white border-0 shadow-md transition-all duration-200 ${
                  verificationAction === 'verify' 
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-lg' :
                  verificationAction === 'reject' 
                    ? 'bg-red-600 hover:bg-red-700 hover:shadow-lg' :
                    'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {processing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {verificationAction === 'verify' && <CheckCircle2 className="h-4 w-4" />}
                    {verificationAction === 'reject' && <XCircle className="h-4 w-4" />}
                    {verificationAction === 'review' && <AlertCircle className="h-4 w-4" />}
                    {verificationAction === 'verify' ? 'Approve & Grant Access' :
                     verificationAction === 'reject' ? 'Reject Application' :
                     'Mark Under Review'}
                  </div>
                )}
              </Button>
            </div>
            {verificationAction === 'reject' && !verificationNotes.trim() && (
              <div className="text-xs text-red-600 mt-1">
                Please provide a reason for rejection before proceeding.
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// User Verification Table Component
function UserVerificationTable({ 
  users, 
  onSelectUser, 
  onAction, 
  readOnly = false 
}: { 
  users: UserVerification[];
  onSelectUser: (user: UserVerification) => void;
  onAction: (action: 'verify' | 'reject' | 'review') => void;
  readOnly?: boolean;
}) {
  const getRoleIcon = (role: string) => {
    return role === 'rto_admin' ? (
      <GraduationCap className="h-4 w-4 text-blue-600" />
    ) : (
      <Building2 className="h-4 w-4 text-green-600" />
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'No Date';
    
    let dateObj;
    if (date && typeof date === 'object' && date.seconds) {
      // Firestore Timestamp
      dateObj = new Date(date.seconds * 1000);
    } else if (date && date.toDate && typeof date.toDate === 'function') {
      // Firestore Timestamp with toDate method
      dateObj = date.toDate();
    } else if (typeof date === 'string' || typeof date === 'number') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
    
    return dateObj.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users in this category</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Registered</TableHead>
          {!readOnly && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const isRTOUser = user.email === 'rto@placementhero.com.au';
          return (
            <TableRow 
              key={user.id} 
              className={isRTOUser ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      {isRTOUser && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                          <UserCheck className="h-3 w-3 mr-1" />
                          Priority
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getRoleIcon(user.role)}
                  <span className="ml-2">
                    {user.role === 'rto_admin' ? 'RTO Admin' : 'Provider Admin'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(user.verificationStatus)}
              </TableCell>
              <TableCell>
                {formatDate(user.createdAt)}
              </TableCell>
              {!readOnly && (
                <TableCell>
                  <div className="flex space-x-2">
                    {(!user.verificationStatus || user.verificationStatus === 'pending') && (
                      <>
                        {isRTOUser && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              onSelectUser(user);
                              onAction('verify');
                            }}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Quick Verify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            onSelectUser(user);
                            onAction('review');
                          }}
                        >
                          Review
                        </Button>
                        {!isRTOUser && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                onSelectUser(user);
                                onAction('verify');
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                onSelectUser(user);
                                onAction('reject');
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </>
                    )}
                    
                    {user.verificationStatus === 'under_review' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => {
                            onSelectUser(user);
                            onAction('verify');
                          }}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            onSelectUser(user);
                            onAction('reject');
                          }}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {user.verificationStatus === 'rejected' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          onSelectUser(user);
                          onAction('verify');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Verify
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}