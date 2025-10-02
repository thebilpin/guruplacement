
'use client'

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ListFilter,
  FileDown,
} from 'lucide-react';
import { ADMIN_CONTENT, getContent } from '@/lib/content';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  status?: string;
  avatarUrl?: string;
  lastLogin?: any;
  createdAt: any;
}


export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [addUserLoading, setAddUserLoading] = useState(false);
  
  // User actions states
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showSuspendUserModal, setShowSuspendUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          // The API returns { users: [...], pagination: {...} }
          setUsers(Array.isArray(data.users) ? data.users : []);
        } else {
          console.error('Failed to fetch users');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users by role and search query
  const filteredUsers = users.filter(user => {
    const matchesRole = filter === 'all' || user.role === filter;
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user as any).organization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const formatRole = (role: string) => {
    return getContent.getRoleDisplayName(role);
  };

  const formatLastLogin = (lastLogin: any) => {
    return getContent.formatTimeAgo(lastLogin);
  };

  const handleAddUser = async (formData: FormData) => {
    setAddUserLoading(true);
    try {
      const userData = {
        // Personal Information
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        
        // Role & Organization
        role: formData.get('role') as string,
        status: formData.get('status') as string || 'active',
        organization: formData.get('organization') as string,
        position: formData.get('position') as string,
        
        // Address Information
        address: formData.get('address') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postcode: formData.get('postcode') as string,
        
        // Additional Information
        bio: formData.get('bio') as string,
        emergencyContact: formData.get('emergencyContact') as string,
        preferredLanguage: formData.get('preferredLanguage') as string || 'en',
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(prev => [...prev, result]);
        setShowAddUserModal(false);
        
        // Show success message with temporary password
        if (result.tempPassword) {
          alert(`✅ User created successfully!\n\nTemporary Password: ${result.tempPassword}\n\nPlease share this password with the user. They will be required to change it on first login.`);
        }
        
        // Refresh the user list to show the new user
        const refreshResponse = await fetch('/api/users');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUsers(Array.isArray(refreshData.users) ? refreshData.users : []);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to create user:', errorData);
        alert(`❌ Failed to create user: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('❌ Error creating user. Please check your connection and try again.');
    } finally {
      setAddUserLoading(false);
    }
  };

  // User action handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowViewDetailsModal(true);
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setShowEditRoleModal(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetPasswordResult(null);
    setShowResetPasswordModal(true);
  };

  const confirmResetPassword = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        setResetPasswordResult(result.tempPassword);
      } else {
        const errorData = await response.json();
        setResetPasswordResult(`Error: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setResetPasswordResult('Error: Failed to reset password. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = (user: User) => {
    setSelectedUser(user);
    setShowSuspendUserModal(true);
  };

  const confirmSuspendUser = async () => {
    if (!selectedUser) return;
    
    const action = selectedUser.status === 'active' ? 'suspend' : 'reactivate';
    const actionText = action === 'suspend' ? 'suspend' : 'reactivate';

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Update user in local state
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, status: action === 'suspend' ? 'inactive' : 'active' }
            : u
        ));
        setShowSuspendUserModal(false);
        // Success - could add a toast notification here
      } else {
        const errorData = await response.json();
        console.error(`Failed to ${actionText} user:`, errorData.error);
      }
    } catch (error) {
      console.error(`Error ${actionText}ing user:`, error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (formData: FormData) => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const newRole = formData.get('role') as string;
      
      const response = await fetch(`/api/admin/users/${selectedUser.id}/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Update user in local state
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, role: newRole }
            : u
        ));
        setShowEditRoleModal(false);
        alert('✅ User role updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to update role: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('❌ Error updating role. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncUsers = async () => {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      const response = await fetch('/api/sync-users', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setSyncResult(`✅ ${data.message}`);
        // Refresh users list
        const refreshResponse = await fetch('/api/users');
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setUsers(Array.isArray(refreshData.users) ? refreshData.users : []);
        }
      } else {
        setSyncResult(`❌ Sync failed: ${data.error}`);
      }
    } catch (error) {
      setSyncResult(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncLoading(false);
      // Clear result after 5 seconds
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all users, roles, and permissions across the platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={handleSyncUsers}
              disabled={syncLoading}
            >
              {syncLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2M15 9v5.581m0 0H9" />
                  </svg>
                  Sync Users
                </>
              )}
            </Button>
            <Button onClick={() => setShowAddUserModal(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add User
            </Button>
        </div>
      </div>

      {syncResult && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          syncResult.startsWith('✅') 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {syncResult}
        </div>
      )}

       <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="all">All ({Array.isArray(users) ? users.length : 0})</TabsTrigger>
                <TabsTrigger value="student">Students ({Array.isArray(users) ? users.filter(u => u.role === 'student').length : 0})</TabsTrigger>
                <TabsTrigger value="rto">RTOs ({Array.isArray(users) ? users.filter(u => u.role === 'rto').length : 0})</TabsTrigger>
                <TabsTrigger value="provider">Providers ({Array.isArray(users) ? users.filter(u => u.role === 'provider').length : 0})</TabsTrigger>
                <TabsTrigger value="supervisor">Supervisors ({Array.isArray(users) ? users.filter(u => u.role === 'supervisor').length : 0})</TabsTrigger>
                <TabsTrigger value="assessor">Assessors ({Array.isArray(users) ? users.filter(u => u.role === 'assessor').length : 0})</TabsTrigger>
                <TabsTrigger value="admin">Admins ({Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0})</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                </span>
                </Button>
            </div>
        </div>
        <div className="mt-6">
            <Card>
                <CardHeader>
                     <div className="relative flex-1 w-full md:grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Search users by name, email, or organization..." 
                          className="pl-9 w-full md:w-80" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            Loading users...
                          </TableCell>
                        </TableRow>
                      ) : filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                             <TableCell>
                              <div className="flex items-center gap-3">
                                  <Avatar>
                                      <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.email}/100/100`} />
                                      <AvatarFallback>
                                        {user.name ? user.name.split(' ').map(part => part.charAt(0)).slice(0, 2).join('') : 
                                         ((user.firstName && user.firstName.charAt(0)) || 'U') + 
                                         ((user.lastName && user.lastName.charAt(0)) || '')}
                                      </AvatarFallback>
                                  </Avatar>
                                  <div>
                                      <span className="font-medium">
                                        {user.name || `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`}
                                      </span>
                                      <p className="text-xs text-muted-foreground">{user.email}</p>
                                  </div>
                              </div>
                             </TableCell>
                            <TableCell>{formatRole(user.role)}</TableCell>
                            <TableCell>
                              <Badge
                                variant={(user.status || 'inactive') === 'active' ? 'default' : 'destructive'}
                                 className={(user.status || 'inactive') === 'active' ? 'bg-green-100 text-green-800' : ''}
                              >
                                {(user.status || 'inactive').charAt(0).toUpperCase() + (user.status || 'inactive').slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{formatLastLogin(user.lastLogin)}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditRole(user)}>
                                    Edit Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                    Reset Password
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleSuspendUser(user)}
                                    className={user.status === 'active' ? 'text-red-500' : 'text-green-500'}
                                  >
                                    {user.status === 'active' ? 'Suspend User' : 'Reactivate User'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </div>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-8">
          <DialogHeader className="pb-8 px-2">
            <DialogTitle className="text-2xl font-semibold">Add New User</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Create a new user account for the platform. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          
          <form action={handleAddUser} className="space-y-10 px-2">
            {/* Personal Information Section */}
            <div className="space-y-8 bg-gray-50 rounded-lg p-6 border">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600 mt-2">Basic details about the user</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Enter full name" 
                    className="h-11"
                    required 
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="user@example.com" 
                    className="h-11"
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="+61 4 1234 5678" 
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                  <Input 
                    id="dateOfBirth" 
                    name="dateOfBirth" 
                    type="date" 
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Role & Organization Section */}
            <div className="space-y-8 bg-blue-50 rounded-lg p-6 border">
              <div className="border-b border-blue-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Role & Organization</h3>
                <p className="text-sm text-gray-600 mt-2">Define user permissions and organizational details</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="role" className="text-sm font-medium">User Role *</Label>
                  <Select name="role" required>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin - Full system access</SelectItem>
                      <SelectItem value="student">Student - Learning participant</SelectItem>
                      <SelectItem value="rto">RTO - Registered Training Organization</SelectItem>
                      <SelectItem value="provider">Provider - Work placement provider</SelectItem>
                      <SelectItem value="supervisor">Supervisor - Workplace supervisor</SelectItem>
                      <SelectItem value="assessor">Assessor - Skills assessor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="status" className="text-sm font-medium">Account Status</Label>
                  <Select name="status" defaultValue="active">
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="organization" className="text-sm font-medium">Organization</Label>
                  <Input 
                    id="organization" 
                    name="organization" 
                    placeholder="Organization or company name" 
                    className="h-11"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="position" className="text-sm font-medium">Position/Title</Label>
                  <Input 
                    id="position" 
                    name="position" 
                    placeholder="Job title or position" 
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Address Information Section */}
            <div className="space-y-8 bg-green-50 rounded-lg p-6 border">
              <div className="border-b border-green-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Address Information</h3>
                <p className="text-sm text-gray-600 mt-2">Location and contact details</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-sm font-medium">Street Address</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="123 Main Street" 
                    className="h-11"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-sm font-medium">City</Label>
                    <Input 
                      id="city" 
                      name="city" 
                      placeholder="Sydney" 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="state" className="text-sm font-medium">State</Label>
                    <Select name="state">
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NSW">New South Wales</SelectItem>
                        <SelectItem value="VIC">Victoria</SelectItem>
                        <SelectItem value="QLD">Queensland</SelectItem>
                        <SelectItem value="WA">Western Australia</SelectItem>
                        <SelectItem value="SA">South Australia</SelectItem>
                        <SelectItem value="TAS">Tasmania</SelectItem>
                        <SelectItem value="ACT">Australian Capital Territory</SelectItem>
                        <SelectItem value="NT">Northern Territory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="postcode" className="text-sm font-medium">Postcode</Label>
                    <Input 
                      id="postcode" 
                      name="postcode" 
                      placeholder="2000" 
                      className="h-11"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="space-y-8 bg-purple-50 rounded-lg p-6 border">
              <div className="border-b border-purple-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
                <p className="text-sm text-gray-600 mt-2">Optional details and preferences</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio/Description</Label>
                  <textarea 
                    id="bio" 
                    name="bio" 
                    rows={3}
                    placeholder="Brief description about the user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="emergencyContact" className="text-sm font-medium">Emergency Contact</Label>
                    <Input 
                      id="emergencyContact" 
                      name="emergencyContact" 
                      placeholder="Contact name and phone" 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="preferredLanguage" className="text-sm font-medium">Preferred Language</Label>
                    <Select name="preferredLanguage" defaultValue="en">
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="zh">Chinese (Mandarin)</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-6 pt-8 border-t border-gray-200 bg-white rounded-lg p-6 -mx-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddUserModal(false)}
                className="px-8 py-3 text-base"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addUserLoading}
                className="px-8 py-3 text-base bg-blue-600 hover:bg-blue-700"
              >
                {addUserLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating User...
                  </>
                ) : (
                  'Create User Account'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showViewDetailsModal} onOpenChange={setShowViewDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3 pb-6">
            <DialogTitle className="text-2xl font-semibold text-gray-900">
              User Details
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600">
              Complete information for {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-8">
              {/* User Avatar and Basic Info */}
              <div className="flex items-center space-x-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="text-lg font-semibold bg-blue-500 text-white">
                    {((selectedUser.firstName && selectedUser.firstName.charAt(0)) || (selectedUser.name && selectedUser.name.charAt(0)) || 'U') + 
                     ((selectedUser.lastName && selectedUser.lastName.charAt(0)) || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedUser.name || `${selectedUser.firstName || 'Unknown'} ${selectedUser.lastName || 'User'}`}
                  </h3>
                  <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <Badge variant={selectedUser.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                      {formatRole(selectedUser.role)}
                    </Badge>
                    <Badge 
                      variant={selectedUser.status === 'active' ? 'default' : 'destructive'}
                      className={`text-sm ${selectedUser.status === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                    >
                      {selectedUser.status ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) : 'Unknown'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {(selectedUser as any).phone || <span className="text-gray-400 italic">Not provided</span>}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Organization</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {(selectedUser as any).organization || <span className="text-gray-400 italic">Not provided</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-lg border p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                  Account Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Last Login</Label>
                    <p className="text-base text-gray-900 font-medium">{formatLastLogin(selectedUser.lastLogin)}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Account Created</Label>
                    <p className="text-base text-gray-900 font-medium">
                      {selectedUser.createdAt 
                        ? new Date(selectedUser.createdAt).toLocaleDateString('en-AU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Unknown'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              {(selectedUser as any).bio && (
                <div className="bg-white rounded-lg border p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
                    Biography
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                    <p className="text-base text-gray-700 leading-relaxed">{(selectedUser as any).bio}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end pt-8 border-t border-gray-200 mt-8">
            <Button 
              onClick={() => setShowViewDetailsModal(false)}
              className="px-8 py-2.5 text-base"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Role Modal */}
      <Dialog open={showEditRoleModal} onOpenChange={setShowEditRoleModal}>
        <DialogContent className="sm:max-w-[550px] border-2 border-gray-200 shadow-2xl rounded-xl bg-white">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Edit User Role
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Change the role for {selectedUser?.name || selectedUser?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedUser && (
            <div className="mb-8">
              <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100 shadow-sm">
                <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-lg">
                    {((selectedUser.firstName && selectedUser.firstName.charAt(0)) || (selectedUser.name && selectedUser.name.charAt(0)) || 'U') + 
                     ((selectedUser.lastName && selectedUser.lastName.charAt(0)) || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedUser.name || `${selectedUser.firstName || 'Unknown'} ${selectedUser.lastName || 'User'}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200">
                      Current: {formatRole(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <form action={handleUpdateRole} className="space-y-8">
            <div className="space-y-6 bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
              <div className="border-b border-gray-200 pb-3">
                <Label htmlFor="role" className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Select New Role
                </Label>
              </div>
              <Select name="role" defaultValue={selectedUser?.role} required>
                <SelectTrigger className="h-14 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white rounded-lg shadow-sm">
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">Admin</span>
                      <span className="text-sm text-gray-500">Full system access and management</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="student" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">Student</span>
                      <span className="text-sm text-gray-500">Learning participant and trainee</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="rto" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">RTO</span>
                      <span className="text-sm text-gray-500">Registered Training Organization</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="provider" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">Provider</span>
                      <span className="text-sm text-gray-500">Work placement provider</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="supervisor" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">Supervisor</span>
                      <span className="text-sm text-gray-500">Workplace supervisor and mentor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="assessor" className="py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">Assessor</span>
                      <span className="text-sm text-gray-500">Skills assessor and evaluator</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Important Notice
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Role changes take effect immediately and will affect the user's access permissions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200 bg-white rounded-lg p-6 -mx-6 -mb-6 mt-8">
              <div className="flex items-center text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                Changes are applied instantly
              </div>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowEditRoleModal(false)}
                  className="px-6 py-2.5 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
              >
                Cancel
              </Button>
                <Button 
                  type="submit" 
                  disabled={actionLoading}
                  className="px-8 py-2.5 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                  {actionLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating Role...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Update Role</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="sm:max-w-[550px] border-2 border-gray-200 shadow-2xl rounded-xl bg-white">
          <DialogHeader className="space-y-4 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">
                  Reset User Password
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 mt-1">
                  Generate a new temporary password for {selectedUser?.name || selectedUser?.email}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedUser && (
            <div className="mb-8">
              <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-100 shadow-sm">
                <Avatar className="h-14 w-14 ring-2 ring-white shadow-md">
                  <AvatarImage src={selectedUser.avatarUrl} />
                  <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold text-lg">
                    {((selectedUser.firstName && selectedUser.firstName.charAt(0)) || (selectedUser.name && selectedUser.name.charAt(0)) || 'U') + 
                     ((selectedUser.lastName && selectedUser.lastName.charAt(0)) || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-lg">
                    {selectedUser.name || `${selectedUser.firstName || 'Unknown'} ${selectedUser.lastName || 'User'}`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 border border-orange-200">
                      {formatRole(selectedUser.role)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!resetPasswordResult ? (
            <div className="space-y-6">
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-3 text-lg">Important Information</h4>
                    <ul className="text-sm text-amber-700 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>A new temporary password will be generated</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>The user will need to change it on their next login</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>Make sure to securely share the new password with the user</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                        <span>The old password will be immediately invalidated</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t-2 border-gray-200 bg-white rounded-lg p-6 -mx-6 -mb-6 mt-8">
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>
                  Password reset is immediate
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-6 py-2.5 text-base border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={confirmResetPassword}
                    disabled={actionLoading}
                    className="px-8 py-2.5 text-base bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {actionLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Resetting Password...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Reset Password</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {resetPasswordResult.startsWith('Error:') ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✕</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 text-lg">Reset Failed</h4>
                      <p className="text-red-700 mt-2">{resetPasswordResult.replace('Error: ', '')}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-green-800 text-lg mb-3">Password Reset Successful!</h4>
                      <div className="bg-white border border-green-300 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">New temporary password:</p>
                        <div className="bg-gray-100 rounded-md p-3 font-mono text-lg font-bold text-center tracking-wider border-2 border-dashed border-green-400">
                          {resetPasswordResult}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Click to copy • Share securely with the user
                        </p>
                      </div>
                      <p className="text-sm text-green-700 mt-3">
                        ℹ️ The user must change this password on their next login.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => setShowResetPasswordModal(false)}
                  className="px-8 py-2.5 text-base"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Suspend/Reactivate User Modal */}
      <Dialog open={showSuspendUserModal} onOpenChange={setShowSuspendUserModal}>
        <DialogContent className="border-2 border-gray-200 shadow-2xl rounded-xl bg-white sm:max-w-[500px]">
          <DialogHeader className={`-m-6 mb-6 p-6 rounded-t-xl bg-gradient-to-r text-white ${
            selectedUser?.status === 'active' 
              ? 'from-red-500 to-red-600' 
              : 'from-green-500 to-green-600'
          }`}>
            <DialogTitle className="text-xl font-bold text-white flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                selectedUser?.status === 'active' 
                  ? 'bg-red-600/30 border border-red-400/50' 
                  : 'bg-green-600/30 border border-green-400/50'
              }`}>
                <span className="text-white text-sm font-bold">
                  {selectedUser?.status === 'active' ? '⏸' : '▶'}
                </span>
              </div>
              <span>{selectedUser?.status === 'active' ? 'Suspend User Account' : 'Reactivate User Account'}</span>
            </DialogTitle>
            <DialogDescription className="text-base text-white/90 mt-2">
              {selectedUser?.status === 'active' 
                ? `Temporarily disable access for ${selectedUser?.name || selectedUser?.email}`
                : `Restore access for ${selectedUser?.name || selectedUser?.email}`
              }
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="mb-6">
              <div className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-br ${
                selectedUser.status === 'active'
                  ? 'from-red-50 via-red-25 to-orange-50 border-red-200 shadow-red-100'
                  : 'from-green-50 via-green-25 to-emerald-50 border-green-200 shadow-green-100'
              } shadow-lg`}>
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
                <div className="relative p-5">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg">
                        <AvatarImage src={selectedUser.avatarUrl} />
                        <AvatarFallback className={`font-bold text-lg text-white bg-gradient-to-br ${
                          selectedUser.status === 'active' 
                            ? 'from-red-500 to-red-600' 
                            : 'from-green-500 to-green-600'
                        }`}>
                          {((selectedUser.firstName && selectedUser.firstName.charAt(0)) || (selectedUser.name && selectedUser.name.charAt(0)) || 'U') + 
                           ((selectedUser.lastName && selectedUser.lastName.charAt(0)) || '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-bold text-gray-900">
                        {selectedUser.name || `${selectedUser.firstName || 'Unknown'} ${selectedUser.lastName || 'User'}`}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mb-2">{selectedUser.email}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className={`text-xs font-semibold px-2.5 py-1 ${
                          selectedUser.status === 'active'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {formatRole(selectedUser.role)}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={`text-xs font-semibold px-2.5 py-1 ${
                            selectedUser.status === 'active' 
                              ? 'bg-green-50 text-green-700 border-green-300' 
                              : 'bg-red-50 text-red-700 border-red-300'
                          }`}
                        >
                          {selectedUser.status ? selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1) : 'Unknown'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={`relative overflow-hidden rounded-xl border-2 bg-gradient-to-br shadow-lg ${
            selectedUser?.status === 'active' 
              ? 'from-red-50 via-red-25 to-orange-50 border-red-200 shadow-red-100' 
              : 'from-green-50 via-green-25 to-emerald-50 border-green-200 shadow-green-100'
          }`}>
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
            <div className="relative p-5">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br ${
                  selectedUser?.status === 'active' 
                    ? 'from-red-500 to-red-600' 
                    : 'from-green-500 to-green-600'
                }`}>
                  <span className="text-white text-lg font-bold">
                    {selectedUser?.status === 'active' ? '⚠️' : '✅'}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-3 ${
                    selectedUser?.status === 'active' ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {selectedUser?.status === 'active' ? 'Account Suspension Effects' : 'Account Reactivation Benefits'}
                  </h4>
                  <div className={`space-y-2.5 ${
                    selectedUser?.status === 'active' ? 'text-red-700' : 'text-green-700'
                  }`}>
                    {selectedUser?.status === 'active' ? (
                      <>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">🚫</span>
                          <span className="text-sm font-medium">User will be unable to log in</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-red-500 mt-1">⏹️</span>
                          <span className="text-sm font-medium">All active sessions will be terminated</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">💾</span>
                          <span className="text-sm font-medium">Data and progress will be preserved</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">🔄</span>
                          <span className="text-sm font-medium">Account can be reactivated at any time</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">✅</span>
                          <span className="text-sm font-medium">User will regain full access to their account</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">🔓</span>
                          <span className="text-sm font-medium">All features and data will be available</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-green-500 mt-1">⚡</span>
                          <span className="text-sm font-medium">User can log in immediately</span>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-500 mt-1">📊</span>
                          <span className="text-sm font-medium">Previous activity and progress restored</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowSuspendUserModal(false)}
              className="px-8 py-3 text-base font-semibold border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmSuspendUser}
              disabled={actionLoading}
              className={`px-8 py-3 text-base font-bold text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r ${
                selectedUser?.status === 'active' 
                  ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                  : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              } ${actionLoading ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}`}
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                  <span>{selectedUser?.status === 'active' ? 'Suspending Account...' : 'Reactivating Account...'}</span>
                </>
              ) : (
                <>
                  <span className="mr-2">
                    {selectedUser?.status === 'active' ? '⏸️' : '▶️'}
                  </span>
                  <span>{selectedUser?.status === 'active' ? 'Suspend User' : 'Reactivate User'}</span>
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
