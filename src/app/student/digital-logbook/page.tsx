'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  User,
  FileText,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Save,
  Eye,
  TrendingUp,
  Target,
  Award,
  Users
} from 'lucide-react';

interface LogEntry {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  activity: string;
  description: string;
  location: string;
  supervisor: string;
  skills: string[];
  reflection: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface LogSummary {
  totalHours: number;
  totalEntries: number;
  averageHoursPerDay: number;
  mostCommonActivity: string;
  skillsDeveloped: string[];
}

export default function DigitalLogbookPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<LogSummary>({
    totalHours: 0,
    totalEntries: 0,
    averageHoursPerDay: 0,
    mostCommonActivity: '',
    skillsDeveloped: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntry, setEditingEntry] = useState<LogEntry | null>(null);
  const [newEntry, setNewEntry] = useState({
    date: '',
    startTime: '',
    endTime: '',
    activity: '',
    description: '',
    location: '',
    supervisor: '',
    skills: '',
    reflection: ''
  });

  useEffect(() => {
    fetchLogbookData();
  }, []);

  useEffect(() => {
    filterEntries();
    calculateSummary();
  }, [entries, searchTerm, statusFilter, dateFilter]);

  const fetchLogbookData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: LogEntry[] = [
        {
          id: '1',
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '17:00',
          totalHours: 8,
          activity: 'Clinical Practice',
          description: 'Participated in patient assessments and treatment planning sessions',
          location: 'City Hospital - Ward 3',
          supervisor: 'Dr. Sarah Johnson',
          skills: ['Patient Assessment', 'Communication', 'Treatment Planning'],
          reflection: 'Today I learned the importance of thorough patient assessment. The supervisor provided excellent guidance on treatment planning methodologies.',
          status: 'Approved',
          feedback: 'Excellent progress shown in patient interaction skills.',
          createdAt: '2024-01-15T18:00:00Z',
          updatedAt: '2024-01-16T10:00:00Z'
        },
        {
          id: '2',
          date: '2024-01-16',
          startTime: '08:30',
          endTime: '16:30',
          totalHours: 8,
          activity: 'Research Project',
          description: 'Conducted literature review for evidence-based practice project',
          location: 'University Library',
          supervisor: 'Prof. Michael Chen',
          skills: ['Research Skills', 'Critical Analysis', 'Literature Review'],
          reflection: 'Developed better understanding of evidence-based practice principles. Need to improve database search strategies.',
          status: 'Submitted',
          createdAt: '2024-01-16T17:00:00Z',
          updatedAt: '2024-01-16T17:00:00Z'
        },
        {
          id: '3',
          date: '2024-01-17',
          startTime: '10:00',
          endTime: '15:00',
          totalHours: 5,
          activity: 'Community Outreach',
          description: 'Assisted with community health screening program',
          location: 'Community Center',
          supervisor: 'Lisa Wang',
          skills: ['Public Health', 'Community Engagement', 'Health Screening'],
          reflection: 'Great experience working directly with community members. Learned about health disparities and prevention strategies.',
          status: 'Draft',
          createdAt: '2024-01-17T16:00:00Z',
          updatedAt: '2024-01-17T16:00:00Z'
        }
      ];

      setEntries(mockData);
    } catch (error) {
      console.error('Error fetching logbook data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load logbook entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = entries;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(entry => new Date(entry.date) >= filterDate);
      }
    }

    setFilteredEntries(filtered);
  };

  const calculateSummary = () => {
    const totalHours = entries.reduce((sum, entry) => sum + entry.totalHours, 0);
    const totalEntries = entries.length;
    const averageHoursPerDay = totalEntries > 0 ? Math.round((totalHours / totalEntries) * 10) / 10 : 0;
    
    // Find most common activity
    const activities = entries.map(entry => entry.activity);
    const activityCounts = activities.reduce((acc, activity) => {
      acc[activity] = (acc[activity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonActivity = Object.keys(activityCounts).reduce((a, b) => 
      activityCounts[a] > activityCounts[b] ? a : b, '');

    // Collect all skills
    const allSkills = entries.flatMap(entry => entry.skills);
    const uniqueSkills = [...new Set(allSkills)];

    setSummary({
      totalHours,
      totalEntries,
      averageHoursPerDay,
      mostCommonActivity,
      skillsDeveloped: uniqueSkills
    });
  };

  const calculateHours = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  };

  const handleAddEntry = async () => {
    try {
      const totalHours = calculateHours(newEntry.startTime, newEntry.endTime);
      const skills = newEntry.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const entry: LogEntry = {
        id: Date.now().toString(),
        date: newEntry.date,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        totalHours,
        activity: newEntry.activity,
        description: newEntry.description,
        location: newEntry.location,
        supervisor: newEntry.supervisor,
        skills,
        reflection: newEntry.reflection,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setEntries([entry, ...entries]);
      setIsAddingEntry(false);
      setNewEntry({
        date: '',
        startTime: '',
        endTime: '',
        activity: '',
        description: '',
        location: '',
        supervisor: '',
        skills: '',
        reflection: ''
      });

      toast({
        title: 'Success',
        description: 'Log entry added successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add log entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditEntry = (entry: LogEntry) => {
    setEditingEntry(entry);
    setNewEntry({
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      activity: entry.activity,
      description: entry.description,
      location: entry.location,
      supervisor: entry.supervisor,
      skills: entry.skills.join(', '),
      reflection: entry.reflection
    });
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      const totalHours = calculateHours(newEntry.startTime, newEntry.endTime);
      const skills = newEntry.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const updatedEntry: LogEntry = {
        ...editingEntry,
        date: newEntry.date,
        startTime: newEntry.startTime,
        endTime: newEntry.endTime,
        totalHours,
        activity: newEntry.activity,
        description: newEntry.description,
        location: newEntry.location,
        supervisor: newEntry.supervisor,
        skills,
        reflection: newEntry.reflection,
        updatedAt: new Date().toISOString()
      };

      const updatedEntries = entries.map(entry =>
        entry.id === editingEntry.id ? updatedEntry : entry
      );
      setEntries(updatedEntries);
      setEditingEntry(null);
      setNewEntry({
        date: '',
        startTime: '',
        endTime: '',
        activity: '',
        description: '',
        location: '',
        supervisor: '',
        skills: '',
        reflection: ''
      });

      toast({
        title: 'Success',
        description: 'Log entry updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update log entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);

      toast({
        title: 'Success',
        description: 'Log entry deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete log entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitEntry = async (entryId: string) => {
    try {
      const updatedEntries = entries.map(entry =>
        entry.id === entryId ? { ...entry, status: 'Submitted' as const } : entry
      );
      setEntries(updatedEntries);

      toast({
        title: 'Success',
        description: 'Log entry submitted for review.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit log entry. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportLogbook = () => {
    toast({
      title: 'Export Logbook',
      description: 'Logbook export functionality would be implemented here.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Logbook</h1>
          <p className="text-gray-600">Track your placement activities and reflections</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleExportLogbook} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Log Entry</DialogTitle>
                <DialogDescription>
                  Record your placement activities and reflections
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="activity">Activity</Label>
                  <Select value={newEntry.activity} onValueChange={(value) => setNewEntry({ ...newEntry, activity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Clinical Practice">Clinical Practice</SelectItem>
                      <SelectItem value="Research Project">Research Project</SelectItem>
                      <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                      <SelectItem value="Professional Development">Professional Development</SelectItem>
                      <SelectItem value="Administrative Tasks">Administrative Tasks</SelectItem>
                      <SelectItem value="Training Session">Training Session</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the activities you performed..."
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Hospital Ward, Community Center"
                    value={newEntry.location}
                    onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Input
                    id="supervisor"
                    placeholder="Supervisor name"
                    value={newEntry.supervisor}
                    onChange={(e) => setNewEntry({ ...newEntry, supervisor: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="skills">Skills Developed</Label>
                  <Input
                    id="skills"
                    placeholder="e.g., Communication, Problem Solving, Technical Skills (comma separated)"
                    value={newEntry.skills}
                    onChange={(e) => setNewEntry({ ...newEntry, skills: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="reflection">Reflection</Label>
                  <Textarea
                    id="reflection"
                    placeholder="Reflect on what you learned, challenges faced, and areas for improvement..."
                    value={newEntry.reflection}
                    onChange={(e) => setNewEntry({ ...newEntry, reflection: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingEntry(false)}>
                  Cancel
                </Button>
                <Button onClick={editingEntry ? handleUpdateEntry : handleAddEntry}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{summary.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{summary.totalEntries}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Hours/Day</p>
                <p className="text-2xl font-bold">{summary.averageHoursPerDay}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Skills Developed</p>
                <p className="text-2xl font-bold">{summary.skillsDeveloped.length}</p>
              </div>
              <Award className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No log entries found</h3>
              <p className="text-gray-600">Start by adding your first log entry to track your placement activities.</p>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{entry.activity}</h3>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        {entry.startTime} - {entry.endTime} ({entry.totalHours}h)
                      </div>
                    </div>
                    <p className="text-gray-600 mb-2">{entry.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {entry.location}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {entry.supervisor}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Developed:</h4>
                  <div className="flex flex-wrap gap-2">
                    {entry.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Reflection */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Reflection:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{entry.reflection}</p>
                </div>

                {/* Feedback */}
                {entry.feedback && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Supervisor Feedback:</h4>
                    <p className="text-sm text-green-600 bg-green-50 p-3 rounded">{entry.feedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Created: {new Date(entry.createdAt).toLocaleDateString()} | 
                    Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                  </div>
                  {entry.status === 'Draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSubmitEntry(entry.id)}
                    >
                      Submit for Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Entry Dialog */}
      <Dialog open={!!editingEntry} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Log Entry</DialogTitle>
            <DialogDescription>
              Update your placement activity record
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={newEntry.date}
                onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-activity">Activity</Label>
              <Select value={newEntry.activity} onValueChange={(value) => setNewEntry({ ...newEntry, activity: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clinical Practice">Clinical Practice</SelectItem>
                  <SelectItem value="Research Project">Research Project</SelectItem>
                  <SelectItem value="Community Outreach">Community Outreach</SelectItem>
                  <SelectItem value="Professional Development">Professional Development</SelectItem>
                  <SelectItem value="Administrative Tasks">Administrative Tasks</SelectItem>
                  <SelectItem value="Training Session">Training Session</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-startTime">Start Time</Label>
              <Input
                id="edit-startTime"
                type="time"
                value={newEntry.startTime}
                onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-endTime">End Time</Label>
              <Input
                id="edit-endTime"
                type="time"
                value={newEntry.endTime}
                onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the activities you performed..."
                value={newEntry.description}
                onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="e.g., Hospital Ward, Community Center"
                value={newEntry.location}
                onChange={(e) => setNewEntry({ ...newEntry, location: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-supervisor">Supervisor</Label>
              <Input
                id="edit-supervisor"
                placeholder="Supervisor name"
                value={newEntry.supervisor}
                onChange={(e) => setNewEntry({ ...newEntry, supervisor: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-skills">Skills Developed</Label>
              <Input
                id="edit-skills"
                placeholder="e.g., Communication, Problem Solving, Technical Skills (comma separated)"
                value={newEntry.skills}
                onChange={(e) => setNewEntry({ ...newEntry, skills: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-reflection">Reflection</Label>
              <Textarea
                id="edit-reflection"
                placeholder="Reflect on what you learned, challenges faced, and areas for improvement..."
                value={newEntry.reflection}
                onChange={(e) => setNewEntry({ ...newEntry, reflection: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingEntry(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEntry}>
              <Save className="h-4 w-4 mr-2" />
              Update Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}