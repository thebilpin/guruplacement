'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Users, 
  Filter,
  Search,
  CalendarDays,
  Building2,
  AlertCircle
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PlacementSlot {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  capacity: number;
  filledSlots: number;
  startDate: string;
  endDate: string;
  requirements: string[];
  isActive: boolean;
  supervisorName: string;
  supervisorEmail: string;
  createdAt: string;
  updatedAt: string;
}

export default function PlacementSlotsPage() {
  const [slots, setSlots] = useState<PlacementSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<PlacementSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<PlacementSlot | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    department: '',
    capacity: '',
    startDate: '',
    endDate: '',
    requirements: '',
    supervisorName: '',
    supervisorEmail: '',
    isActive: true
  });

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchPlacementSlots();
  }, []);

  useEffect(() => {
    filterSlots();
  }, [slots, searchTerm, statusFilter]);

  const fetchPlacementSlots = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSlots: PlacementSlot[] = [
        {
          id: '1',
          title: 'Software Development Placement',
          description: 'Full-stack development role focusing on React and Node.js',
          location: 'Melbourne CBD',
          department: 'Information Technology',
          capacity: 5,
          filledSlots: 3,
          startDate: '2024-02-01',
          endDate: '2024-05-31',
          requirements: ['JavaScript', 'React', 'Node.js', 'Database knowledge'],
          isActive: true,
          supervisorName: 'John Smith',
          supervisorEmail: 'john.smith@company.com',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          title: 'Marketing Assistant Placement',
          description: 'Digital marketing and content creation role',
          location: 'Sydney Office',
          department: 'Marketing',
          capacity: 3,
          filledSlots: 3,
          startDate: '2024-03-01',
          endDate: '2024-06-30',
          requirements: ['Digital Marketing', 'Content Creation', 'Social Media'],
          isActive: true,
          supervisorName: 'Sarah Johnson',
          supervisorEmail: 'sarah.johnson@company.com',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-25T16:45:00Z'
        },
        {
          id: '3',
          title: 'Data Analytics Placement',
          description: 'Business intelligence and data visualization',
          location: 'Brisbane Office',
          department: 'Data Science',
          capacity: 2,
          filledSlots: 1,
          startDate: '2024-04-01',
          endDate: '2024-07-31',
          requirements: ['Python', 'SQL', 'Tableau', 'Statistics'],
          isActive: false,
          supervisorName: 'Mike Chen',
          supervisorEmail: 'mike.chen@company.com',
          createdAt: '2024-01-05T11:30:00Z',
          updatedAt: '2024-01-28T13:15:00Z'
        }
      ];

      setSlots(mockSlots);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch placement slots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSlots = () => {
    let filtered = slots;

    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(slot => {
        if (statusFilter === 'active') return slot.isActive;
        if (statusFilter === 'inactive') return !slot.isActive;
        if (statusFilter === 'full') return slot.filledSlots >= slot.capacity;
        if (statusFilter === 'available') return slot.filledSlots < slot.capacity;
        return true;
      });
    }

    setFilteredSlots(filtered);
  };

  const handleCreateSlot = async () => {
    try {
      if (!formData.title || !formData.department || !formData.capacity) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const newSlot: PlacementSlot = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        description: formData.description,
        location: formData.location,
        department: formData.department,
        capacity: parseInt(formData.capacity),
        filledSlots: 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        isActive: formData.isActive,
        supervisorName: formData.supervisorName,
        supervisorEmail: formData.supervisorEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setSlots(prev => [newSlot, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Placement slot created successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create placement slot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSlot = async () => {
    try {
      if (!editingSlot || !formData.title || !formData.department || !formData.capacity) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const updatedSlot: PlacementSlot = {
        ...editingSlot,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        department: formData.department,
        capacity: parseInt(formData.capacity),
        startDate: formData.startDate,
        endDate: formData.endDate,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        isActive: formData.isActive,
        supervisorName: formData.supervisorName,
        supervisorEmail: formData.supervisorEmail,
        updatedAt: new Date().toISOString()
      };

      setSlots(prev => prev.map(slot => slot.id === editingSlot.id ? updatedSlot : slot));
      setEditingSlot(null);
      resetForm();

      toast({
        title: "Success",
        description: "Placement slot updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update placement slot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      setSlots(prev => prev.filter(slot => slot.id !== slotId));

      toast({
        title: "Success",
        description: "Placement slot deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete placement slot. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (slotId: string) => {
    try {
      setSlots(prev => prev.map(slot => 
        slot.id === slotId 
          ? { ...slot, isActive: !slot.isActive, updatedAt: new Date().toISOString() }
          : slot
      ));

      toast({
        title: "Success",
        description: "Slot status updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update slot status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      department: '',
      capacity: '',
      startDate: '',
      endDate: '',
      requirements: '',
      supervisorName: '',
      supervisorEmail: '',
      isActive: true
    });
  };

  const openEditDialog = (slot: PlacementSlot) => {
    setEditingSlot(slot);
    setFormData({
      title: slot.title,
      description: slot.description,
      location: slot.location,
      department: slot.department,
      capacity: slot.capacity.toString(),
      startDate: slot.startDate,
      endDate: slot.endDate,
      requirements: slot.requirements.join(', '),
      supervisorName: slot.supervisorName,
      supervisorEmail: slot.supervisorEmail,
      isActive: slot.isActive
    });
  };

  const getStatusBadge = (slot: PlacementSlot) => {
    if (!slot.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (slot.filledSlots >= slot.capacity) {
      return <Badge variant="destructive">Full</Badge>;
    }
    return <Badge variant="default">Available</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading placement slots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Placement Slots Manager</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your placement opportunities</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingSlot(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Placement Slot</DialogTitle>
              <DialogDescription>
                Add a new placement opportunity for students to apply to.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g. Software Development Placement"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Human Resources">Human Resources</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the placement role and responsibilities"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g. Melbourne CBD"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="Number of students"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (comma separated)</Label>
                <Input
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="e.g. JavaScript, React, Node.js"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisorName">Supervisor Name</Label>
                  <Input
                    id="supervisorName"
                    value={formData.supervisorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisorName: e.target.value }))}
                    placeholder="e.g. John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supervisorEmail">Supervisor Email</Label>
                  <Input
                    id="supervisorEmail"
                    type="email"
                    value={formData.supervisorEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, supervisorEmail: e.target.value }))}
                    placeholder="supervisor@company.com"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active slot (students can apply)</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSlot}>
                Create Slot
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Slots</p>
                <p className="text-2xl font-bold text-gray-900">{slots.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Slots</p>
                <p className="text-2xl font-bold text-gray-900">{slots.filter(s => s.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{slots.reduce((sum, slot) => sum + slot.capacity, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Filled Positions</p>
                <p className="text-2xl font-bold text-gray-900">{slots.reduce((sum, slot) => sum + slot.filledSlots, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search slots by title, department, or location"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Slots</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placement Slots List */}
      <div className="grid gap-6">
        {filteredSlots.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No placement slots found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first placement slot to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Slot
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSlots.map((slot) => (
            <Card key={slot.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{slot.title}</h3>
                      {getStatusBadge(slot)}
                    </div>
                    <p className="text-gray-600 mb-3">{slot.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {slot.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {slot.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {slot.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {slot.filledSlots}/{slot.capacity} filled
                      </div>
                      {slot.startDate && slot.endDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(slot.startDate).toLocaleDateString()} - {new Date(slot.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={slot.isActive}
                      onCheckedChange={() => handleToggleStatus(slot.id)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(slot)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the placement slot
                            and remove all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteSlot(slot.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                {slot.requirements && slot.requirements.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Requirements:</p>
                    <div className="flex flex-wrap gap-2">
                      {slot.requirements.map((req, index) => (
                        <Badge key={index} variant="outline">{req}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {slot.supervisorName && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Supervisor:</span> {slot.supervisorName}
                      {slot.supervisorEmail && (
                        <span className="ml-2">({slot.supervisorEmail})</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingSlot} onOpenChange={(open) => !open && setEditingSlot(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Placement Slot</DialogTitle>
            <DialogDescription>
              Update the placement slot details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Software Development Placement"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department *</Label>
                <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Data Science">Data Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the placement role and responsibilities"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. Melbourne CBD"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-capacity">Capacity *</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Number of students"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">End Date</Label>
                <Input
                  id="edit-endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-requirements">Requirements (comma separated)</Label>
              <Input
                id="edit-requirements"
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
                placeholder="e.g. JavaScript, React, Node.js"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-supervisorName">Supervisor Name</Label>
                <Input
                  id="edit-supervisorName"
                  value={formData.supervisorName}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisorName: e.target.value }))}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supervisorEmail">Supervisor Email</Label>
                <Input
                  id="edit-supervisorEmail"
                  type="email"
                  value={formData.supervisorEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisorEmail: e.target.value }))}
                  placeholder="supervisor@company.com"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active slot (students can apply)</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setEditingSlot(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSlot}>
              Update Slot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}