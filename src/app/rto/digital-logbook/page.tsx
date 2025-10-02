'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar,
  Users,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Star,
  MessageSquare,
  Filter,
  User
} from 'lucide-react';

interface LogbookEntry {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  unit: string;
  date: string;
  activity: string;
  description: string;
  duration: number;
  location: string;
  supervisor: string;
  supervisorFeedback?: string;
  studentReflection?: string;
  competencyLinks: string[];
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Needs Revision';
  rating?: 1 | 2 | 3 | 4 | 5;
  attachments: string[];
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
}

export default function DigitalLogbookPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<LogbookEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogbookEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  // Modal states
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchLogbookEntries();
  }, [dateRange]);

  useEffect(() => {
    applyFilters();
  }, [entries, searchTerm, statusFilter, courseFilter, supervisorFilter]);

  const fetchLogbookEntries = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockEntries: LogbookEntry[] = [
        {
          id: '1',
          studentId: 'S001',
          studentName: 'Sarah Wilson',
          course: 'Certificate III in Business',
          unit: 'BSBWHS311 - Assist with maintaining workplace safety',
          date: '2024-01-25',
          activity: 'Workplace Safety Assessment',
          description: 'Conducted a comprehensive workplace safety assessment of the main office area, identifying potential hazards and documenting safety procedures.',
          duration: 4,
          location: 'Main Office',
          supervisor: 'John Smith',
          supervisorFeedback: 'Excellent attention to detail in identifying hazards. Good understanding of safety protocols.',
          studentReflection: 'This activity helped me understand the importance of regular safety assessments and how to identify potential risks in the workplace.',
          competencyLinks: ['BSBWHS311', 'BSBLDR311'],
          status: 'Approved',
          rating: 4,
          attachments: ['safety_checklist.pdf', 'hazard_photos.zip'],
          createdAt: '2024-01-25T08:30:00Z',
          submittedAt: '2024-01-25T16:00:00Z',
          reviewedAt: '2024-01-26T10:15:00Z'
        },
        {
          id: '2',
          studentId: 'S002',
          studentName: 'Michael Chen',
          course: 'Certificate IV in Leadership and Management',
          unit: 'BSBLDR412 - Communicate effectively as a workplace leader',
          date: '2024-01-24',
          activity: 'Team Meeting Facilitation',
          description: 'Facilitated weekly team meeting focusing on project updates and resource allocation.',
          duration: 2,
          location: 'Conference Room A',
          supervisor: 'Emma Davis',
          supervisorFeedback: 'Good facilitation skills demonstrated. Consider allowing more time for team input.',
          studentReflection: 'I learned that effective communication requires active listening and creating space for all team members to contribute.',
          competencyLinks: ['BSBLDR412', 'BSBCMM411'],
          status: 'Reviewed',
          rating: 3,
          attachments: ['meeting_agenda.pdf'],
          createdAt: '2024-01-24T14:00:00Z',
          submittedAt: '2024-01-24T17:30:00Z',
          reviewedAt: '2024-01-25T09:00:00Z'
        },
        {
          id: '3',
          studentId: 'S003',
          studentName: 'Lisa Rodriguez',
          course: 'Diploma in Business Administration',
          unit: 'BSBADM502 - Manage meetings',
          date: '2024-01-23',
          activity: 'Board Meeting Preparation',
          description: 'Prepared comprehensive documentation and logistics for quarterly board meeting.',
          duration: 6,
          location: 'Head Office',
          supervisor: 'David Thompson',
          studentReflection: 'This task required excellent organizational skills and attention to detail. I learned about the complexity of coordinating high-level meetings.',
          competencyLinks: ['BSBADM502', 'BSBADM504'],
          status: 'Submitted',
          attachments: ['board_papers.pdf', 'logistics_checklist.xlsx'],
          createdAt: '2024-01-23T09:00:00Z',
          submittedAt: '2024-01-23T16:45:00Z'
        },
        {
          id: '4',
          studentId: 'S001',
          studentName: 'Sarah Wilson',
          course: 'Certificate III in Business',
          unit: 'BSBCUS301 - Deliver and monitor a service to customers',
          date: '2024-01-22',
          activity: 'Customer Service Training',
          description: 'Completed customer service training session and practiced handling difficult customer scenarios.',
          duration: 3,
          location: 'Training Room 2',
          supervisor: 'Alice Johnson',
          supervisorFeedback: 'Needs to work on de-escalation techniques. Good progress on active listening skills.',
          studentReflection: 'Customer service is more challenging than I expected. I need to practice staying calm under pressure.',
          competencyLinks: ['BSBCUS301'],
          status: 'Needs Revision',
          rating: 2,
          attachments: [],
          createdAt: '2024-01-22T10:30:00Z',
          submittedAt: '2024-01-22T15:00:00Z',
          reviewedAt: '2024-01-23T11:30:00Z'
        },
        {
          id: '5',
          studentId: 'S004',
          studentName: 'James Brown',
          course: 'Certificate III in Business',
          unit: 'BSBITU309 - Produce desktop published documents',
          date: '2024-01-21',
          activity: 'Marketing Brochure Design',
          description: 'Created marketing brochure for new product launch using desktop publishing software.',
          duration: 5,
          location: 'Design Lab',
          supervisor: 'Rachel Green',
          competencyLinks: ['BSBITU309', 'BSBMKG301'],
          status: 'Draft',
          attachments: ['brochure_draft.pdf'],
          createdAt: '2024-01-21T13:00:00Z'
        }
      ];

      setEntries(mockEntries);
    } catch (error) {
      console.error('Error fetching logbook entries:', error);
      toast({
        title: 'Error',
        description: 'Failed to load logbook entries. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = entries;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(entry => entry.course === courseFilter);
    }

    // Supervisor filter
    if (supervisorFilter !== 'all') {
      filtered = filtered.filter(entry => entry.supervisor === supervisorFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEntries(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Reviewed':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Needs Revision':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Edit className="h-4 w-4" />;
      case 'Submitted':
        return <Clock className="h-4 w-4" />;
      case 'Reviewed':
        return <Eye className="h-4 w-4" />;
      case 'Approved':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Needs Revision':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const handleViewEntry = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
    setIsEditing(false);
    setShowEntryModal(true);
  };

  const handleEditEntry = (entry: LogbookEntry) => {
    setSelectedEntry(entry);
    setIsEditing(true);
    setShowEntryModal(true);
  };

  const handleApproveEntry = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'Approved', reviewedAt: new Date().toISOString() }
        : entry
    ));
    toast({
      title: 'Entry Approved',
      description: 'Logbook entry has been approved successfully.',
    });
  };

  const handleRequestRevision = (entryId: string) => {
    setEntries(prev => prev.map(entry => 
      entry.id === entryId 
        ? { ...entry, status: 'Needs Revision', reviewedAt: new Date().toISOString() }
        : entry
    ));
    toast({
      title: 'Revision Requested',
      description: 'Student has been notified to revise their entry.',
    });
  };

  const uniqueCourses = [...new Set(entries.map(e => e.course))];
  const uniqueSupervisors = [...new Set(entries.map(e => e.supervisor))];

  const stats = {
    total: entries.length,
    pending: entries.filter(e => e.status === 'Submitted').length,
    approved: entries.filter(e => e.status === 'Approved').length,
    needsRevision: entries.filter(e => e.status === 'Needs Revision').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Digital Logbook Management</h1>
          <p className="text-gray-600">Review and manage student logbook entries</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchLogbookEntries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Needs Revision</p>
                <p className="text-2xl font-bold text-red-600">{stats.needsRevision}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Needs Revision">Needs Revision</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Course</label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Supervisor</label>
              <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Supervisors</SelectItem>
                  {uniqueSupervisors.map(supervisor => (
                    <SelectItem key={supervisor} value={supervisor}>{supervisor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCourseFilter('all');
                setSupervisorFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{entry.activity}</h3>
                    <Badge className={getStatusColor(entry.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(entry.status)}
                        <span>{entry.status}</span>
                      </div>
                    </Badge>
                    {entry.rating && getRatingStars(entry.rating)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                    <div><User className="inline h-4 w-4 mr-1" />{entry.studentName}</div>
                    <div><BookOpen className="inline h-4 w-4 mr-1" />{entry.course}</div>
                    <div><Calendar className="inline h-4 w-4 mr-1" />{new Date(entry.date).toLocaleDateString()}</div>
                    <div><Clock className="inline h-4 w-4 mr-1" />{entry.duration} hours</div>
                  </div>
                  <p className="text-gray-700 mb-2">{entry.description}</p>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Unit:</span> {entry.unit}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Supervisor:</span> {entry.supervisor}
                  </div>
                </div>
              </div>

              {entry.supervisorFeedback && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Supervisor Feedback</span>
                  </div>
                  <p className="text-blue-700">{entry.supervisorFeedback}</p>
                </div>
              )}

              {entry.studentReflection && (
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">Student Reflection</span>
                  </div>
                  <p className="text-green-700">{entry.studentReflection}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
                  {entry.submittedAt && (
                    <span>Submitted: {new Date(entry.submittedAt).toLocaleDateString()}</span>
                  )}
                  {entry.reviewedAt && (
                    <span>Reviewed: {new Date(entry.reviewedAt).toLocaleDateString()}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleViewEntry(entry)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  {entry.status === 'Submitted' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleRequestRevision(entry.id)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApproveEntry(entry.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Logbook Entries Found</h3>
            <p className="text-gray-600">
              {entries.length === 0 
                ? "No logbook entries have been submitted yet."
                : "No entries match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}