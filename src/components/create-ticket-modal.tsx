'use client';

import { useState, useEffect } from 'react';
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
import { X, PlusCircle, Upload, Tag, Search, User, Check } from 'lucide-react';
import { CreateTicketRequest } from '@/lib/schemas/support';
import { useAuth } from '@/hooks/use-auth';

interface CreateTicketModalProps {
  onTicketCreated?: () => void;
  isAdminView?: boolean; // Whether this is being used by an admin
}

interface UserSearchResult {
  id: string;
  email: string;
  name: string;
  role: string;
  collection: string;
  verificationStatus: string;
}

export function CreateTicketModal({ onTicketCreated, isAdminView = false }: CreateTicketModalProps) {
  const { userData } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // User selection for admin
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  const [formData, setFormData] = useState<CreateTicketRequest>({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'technical',
    tags: [],
    attachments: [],
  });

  // User search functionality for admin
  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`/api/admin/users/lookup?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('❌ Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced user search
  useEffect(() => {
    if (!isAdminView) return;
    
    const timer = setTimeout(() => {
      searchUsers(userSearch);
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, isAdminView]);

  const selectUser = (user: UserSearchResult) => {
    setSelectedUser(user);
    setUserSearch(user.email);
    setShowUserDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // For admin view, require user selection
    if (isAdminView && !selectedUser) {
      alert('Please select a user for this ticket');
      return;
    }

    setLoading(true);
    
    try {
      // Use selected user data if admin, otherwise use current user
      const targetUser = isAdminView && selectedUser ? {
        uid: selectedUser.id,
        email: selectedUser.email,
        name: selectedUser.name,
        role: selectedUser.role
      } : userData;

      const response = await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create',
          ticketData: {
            ...formData,
            tags,
          },
          userData: targetUser,
          createdBy: isAdminView ? userData : undefined, // Track who created it
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Ticket created:', result.ticketNumber);
        
        // Reset form
        setFormData({
          subject: '',
          description: '',
          priority: 'medium',
          category: 'technical',
          tags: [],
          attachments: [],
        });
        setTags([]);
        setSelectedUser(null);
        setUserSearch('');
        setSearchResults([]);
        setOpen(false);
        
        // Callback to refresh the ticket list
        onTicketCreated?.();
        
        alert(`Ticket ${result.ticketNumber} created successfully!`);
      } else {
        const error = await response.json();
        console.error('❌ Error creating ticket:', error);
        alert('Failed to create ticket. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Ticket
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>
            Submit a new support request. Provide as much detail as possible to help us assist you quickly.
          </DialogDescription>
        </DialogHeader>
        
        {/* 
         * ⚠️  FORM STYLING: Uses standardized classes for consistent appearance
         * 📖 Documentation: /docs/FORM_STYLING_STANDARDS.md
         * 🚫 DO NOT modify form styling without reading the documentation!
         */}
        <form onSubmit={handleSubmit} className="form-container">
          {/* User Selection (Admin Only) */}
          {isAdminView && (
            <div className="form-section">
              <Label htmlFor="userSearch">Create Ticket For User *</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="userSearch"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setShowUserDropdown(true);
                      if (!e.target.value) setSelectedUser(null);
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    placeholder="Search by email or name..."
                    className="pl-10 form-input-bordered"
                  />
                </div>
                
                {/* User Dropdown */}
                {showUserDropdown && (userSearch.length >= 2 || searchResults.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-3 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        Searching users...
                      </div>
                    ) : searchResults.length === 0 && userSearch.length >= 2 ? (
                      <div className="p-3 text-center text-gray-500">
                        No users found matching "{userSearch}"
                      </div>
                    ) : (
                      searchResults.map((user) => (
                        <div
                          key={`${user.collection}-${user.id}`}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => selectUser(user)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs capitalize">
                                {user.role}
                              </Badge>
                              {user.verificationStatus === 'verified' && (
                                <Check className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Selected User Display */}
              {selectedUser && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-blue-900">Selected User:</div>
                      <div className="text-sm text-blue-700">
                        {selectedUser.name} ({selectedUser.email})
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 capitalize">
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subject */}
          <div className="form-section">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of the issue"
              className="form-input-bordered"
              required
            />
          </div>

          {/* Priority and Category */}
          <div className="form-section grid grid-cols-2 gap-4">
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

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="form-input-bordered">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account & Access</SelectItem>
                  <SelectItem value="billing">Billing & Payment</SelectItem>
                  <SelectItem value="compliance">Compliance & Documentation</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="form-section">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the issue, including steps to reproduce, error messages, and any relevant context..."
              className="form-input-bordered"
              rows={6}
              required
            />
          </div>

          {/* Tags */}
          <div className="form-section">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                className="form-input-bordered"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Tag className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* User Info Display */}
          {!isAdminView && userData && (
            <div className="form-info-section">
              <h4 className="font-medium mb-2">Ticket will be created for:</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Name:</strong> {(userData as any).displayName || (userData as any).name || 'Not provided'}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p><strong>Role:</strong> {(userData as any).role || 'User'}</p>
              </div>
            </div>
          )}

          {/* Admin Creation Info */}
          {isAdminView && userData && (
            <div className="form-success-section">
              <h4 className="font-medium mb-2">Creating as Admin:</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Admin:</strong> {(userData as any).displayName || (userData as any).name || userData.email}</p>
                <p><strong>Email:</strong> {userData.email}</p>
                <p className="text-green-700 mt-2">
                  <strong>Note:</strong> This ticket will be created on behalf of the selected user above.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}