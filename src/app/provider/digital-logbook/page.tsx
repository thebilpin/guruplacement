'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Users,
  Building,
  Search,
  Filter,
  Edit3,
  Eye,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  User,
  MapPin
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface LogbookEntry {
  id: string;
  studentId: string;
  studentName: string;
  placementId: string;
  placementTitle: string;
  rtoName: string;
  supervisorName: string;
  entryDate: string;
  entryType: 'daily-log' | 'task-completion' | 'reflection' | 'assessment' | 'incident' | 'learning-outcome';
  title: string;
  content: string;
  hoursWorked?: number;
  tasksCompleted: string[];
  competenciesAddressed: string[];
  learningOutcomes: string[];
  challenges: string[];
  supervisorFeedback?: string;
  supervisorApproval: 'pending' | 'approved' | 'requires-revision';
  attachments: LogbookAttachment[];
  tags: string[];
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface LogbookAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface StudentLogbookSummary {
  studentId: string;
  studentName: string;
  placementTitle: string;
  rtoName: string;
  totalEntries: number;
  totalHours: number;
  pendingApprovals: number;
  lastEntryDate: string;
  completionRate: number;
  supervisorName: string;
}

export default function DigitalLogbookPage() {
  const [logbookEntries, setLogbookEntries] = useState<LogbookEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LogbookEntry[]>([]);
  const [studentSummaries, setStudentSummaries] = useState<StudentLogbookSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilter, setStudentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<LogbookEntry | null>(null);
  const [activeView, setActiveView] = useState<'entries' | 'summaries'>('summaries');

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLogbookData();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [logbookEntries, searchTerm, studentFilter, typeFilter, approvalFilter]);

  const fetchLogbookData = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEntries: LogbookEntry[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          placementId: 'PLC001',
          placementTitle: 'Software Development Placement',
          rtoName: 'Tech Institute Australia',
          supervisorName: 'John Smith',
          entryDate: '2024-01-30',
          entryType: 'daily-log',
          title: 'Day 15 - React Component Development',
          content: `Today I focused on developing reusable React components for the user dashboard. I worked on creating a data visualization component using Chart.js and learned about proper state management with React hooks.

Key activities:
- Developed DataChart component with props for different chart types
- Implemented responsive design for mobile compatibility
- Added error handling for data loading states
- Participated in daily standup meeting

Challenges faced:
- Understanding complex data transformation for charts
- Managing component state effectively

What I learned:
- Better understanding of React component lifecycle
- Improved skills in JavaScript ES6 features
- Learned about accessibility considerations in UI development`,
          hoursWorked: 8,
          tasksCompleted: [
            'Create DataChart React component',
            'Implement responsive design',
            'Add error handling',
            'Attend daily standup'
          ],
          competenciesAddressed: [
            'ICTPRG506 - Develop complex web-based programs',
            'ICTPRG501 - Apply advanced object-oriented language skills'
          ],
          learningOutcomes: [
            'Demonstrated proficiency in React component development',
            'Applied responsive design principles',
            'Implemented error handling best practices'
          ],
          challenges: [
            'Complex data transformation logic',
            'State management in functional components'
          ],
          supervisorFeedback: 'Great progress on the component development. The error handling implementation shows good understanding of defensive programming practices.',
          supervisorApproval: 'approved',
          attachments: [
            {
              id: 'att1',
              name: 'component-screenshot.png',
              type: 'image/png',
              size: 245760,
              url: '/attachments/component-screenshot.png',
              uploadedAt: '2024-01-30T16:30:00Z'
            }
          ],
          tags: ['react', 'javascript', 'components', 'chart.js'],
          isVisible: true,
          createdAt: '2024-01-30T17:00:00Z',
          updatedAt: '2024-01-30T17:00:00Z'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Michael Chen',
          placementId: 'PLC002',
          placementTitle: 'Marketing Assistant Placement',
          rtoName: 'Business College Victoria',
          supervisorName: 'Sarah Johnson',
          entryDate: '2024-01-29',
          entryType: 'task-completion',
          title: 'Social Media Campaign Analysis Completed',
          content: `Completed comprehensive analysis of our Q1 social media campaign performance across Facebook, Instagram, and LinkedIn platforms.

Analysis highlights:
- Facebook engagement increased by 35% compared to Q4
- Instagram reach expanded by 42% with video content
- LinkedIn professional posts generated 28% more leads

Recommendations developed:
- Increase video content frequency on Instagram
- Focus on educational posts for LinkedIn
- Implement A/B testing for Facebook ad campaigns`,
          hoursWorked: 6,
          tasksCompleted: [
            'Analyze social media campaign metrics',
            'Create performance comparison charts',
            'Develop improvement recommendations',
            'Present findings to marketing team'
          ],
          competenciesAddressed: [
            'BSBMKG506 - Plan market research',
            'BSBMKG507 - Interpret market trends and developments'
          ],
          learningOutcomes: [
            'Applied data analysis skills to marketing metrics',
            'Developed presentation and communication skills',
            'Understood social media analytics tools'
          ],
          challenges: [
            'Interpreting complex analytics data',
            'Creating meaningful visualizations'
          ],
          supervisorApproval: 'pending',
          attachments: [
            {
              id: 'att2',
              name: 'campaign-analysis-report.pdf',
              type: 'application/pdf',
              size: 1024000,
              url: '/attachments/campaign-analysis-report.pdf',
              uploadedAt: '2024-01-29T15:45:00Z'
            }
          ],
          tags: ['marketing', 'social-media', 'analytics', 'campaign'],
          isVisible: true,
          createdAt: '2024-01-29T16:00:00Z',
          updatedAt: '2024-01-29T16:00:00Z'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Sarah Williams',
          placementId: 'PLC003',
          placementTitle: 'Data Analytics Placement',
          rtoName: 'Analytics Academy',
          supervisorName: 'Mike Chen',
          entryDate: '2024-01-28',
          entryType: 'reflection',
          title: 'Week 4 Reflection - Data Modeling Challenges',
          content: `This week has been particularly challenging as I dove deeper into advanced data modeling techniques. Working with large datasets has taught me the importance of efficient query design and data structure optimization.

Key learnings this week:
- Understanding the impact of data normalization on query performance
- Learning to balance storage efficiency with query speed
- Importance of proper indexing strategies

Areas for improvement:
- Need to strengthen SQL optimization skills
- Better understanding of database design patterns
- Time management when working with large datasets

Goals for next week:
- Complete the customer segmentation analysis project
- Practice advanced SQL queries
- Learn about machine learning model deployment`,
          hoursWorked: 35,
          tasksCompleted: [
            'Database normalization exercise',
            'Performance optimization analysis',
            'Weekly reflection documentation'
          ],
          competenciesAddressed: [
            'ICTDBS502 - Design a database',
            'ICTDBS501 - Monitor and administer a database system'
          ],
          learningOutcomes: [
            'Gained deeper understanding of database optimization',
            'Developed problem-solving skills for performance issues',
            'Improved self-reflection and goal-setting abilities'
          ],
          challenges: [
            'Complex data modeling decisions',
            'Performance optimization trade-offs',
            'Time management with large datasets'
          ],
          supervisorFeedback: 'Excellent self-reflection. The challenges you\'ve identified are common in data analytics roles. Your goal-setting shows good understanding of areas for development.',
          supervisorApproval: 'approved',
          attachments: [],
          tags: ['reflection', 'data-modeling', 'sql', 'database'],
          isVisible: true,
          createdAt: '2024-01-28T18:30:00Z',
          updatedAt: '2024-01-29T09:15:00Z'
        }
      ];

      const mockSummaries: StudentLogbookSummary[] = [
        {
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          placementTitle: 'Software Development Placement',
          rtoName: 'Tech Institute Australia',
          totalEntries: 28,
          totalHours: 196,
          pendingApprovals: 2,
          lastEntryDate: '2024-01-30',
          completionRate: 87,
          supervisorName: 'John Smith'
        },
        {
          studentId: 'STU002',
          studentName: 'Michael Chen',
          placementTitle: 'Marketing Assistant Placement',
          rtoName: 'Business College Victoria',
          totalEntries: 22,
          totalHours: 144,
          pendingApprovals: 5,
          lastEntryDate: '2024-01-29',
          completionRate: 73,
          supervisorName: 'Sarah Johnson'
        },
        {
          studentId: 'STU003',
          studentName: 'Sarah Williams',
          placementTitle: 'Data Analytics Placement',
          rtoName: 'Analytics Academy',
          totalEntries: 31,
          totalHours: 218,
          pendingApprovals: 1,
          lastEntryDate: '2024-01-28',
          completionRate: 91,
          supervisorName: 'Mike Chen'
        }
      ];

      setLogbookEntries(mockEntries);
      setStudentSummaries(mockSummaries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch logbook data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterEntries = () => {
    let filtered = logbookEntries;

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (studentFilter !== 'all') {
      filtered = filtered.filter(entry => entry.studentId === studentFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.entryType === typeFilter);
    }

    if (approvalFilter !== 'all') {
      filtered = filtered.filter(entry => entry.supervisorApproval === approvalFilter);
    }

    setFilteredEntries(filtered);
  };

  const getEntryTypeBadge = (type: string) => {
    const typeLabels = {
      'daily-log': 'Daily Log',
      'task-completion': 'Task Completion',
      'reflection': 'Reflection',
      'assessment': 'Assessment',
      'incident': 'Incident',
      'learning-outcome': 'Learning Outcome'
    };

    const typeColors = {
      'daily-log': 'bg-blue-100 text-blue-800',
      'task-completion': 'bg-green-100 text-green-800',
      'reflection': 'bg-purple-100 text-purple-800',
      'assessment': 'bg-orange-100 text-orange-800',
      'incident': 'bg-red-100 text-red-800',
      'learning-outcome': 'bg-yellow-100 text-yellow-800'
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  const getApprovalBadge = (approval: string) => {
    switch (approval) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'requires-revision':
        return <Badge className="bg-red-100 text-red-800">Needs Revision</Badge>;
      default:
        return <Badge variant="secondary">{approval}</Badge>;
    }
  };

  const handleExportLogbook = async (studentId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Student logbook exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export logbook. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLogbookStats = () => {
    const totalEntries = logbookEntries.length;
    const totalHours = logbookEntries.reduce((sum, entry) => sum + (entry.hoursWorked || 0), 0);
    const pendingApprovals = logbookEntries.filter(entry => entry.supervisorApproval === 'pending').length;
    const activeStudents = new Set(logbookEntries.map(entry => entry.studentId)).size;

    return { totalEntries, totalHours, pendingApprovals, activeStudents };
  };

  const stats = getLogbookStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading digital logbook data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Logbook (View)</h1>
          <p className="text-gray-600 mt-2">Monitor student placement progress and activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogbookData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalHours}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button 
                variant={activeView === 'summaries' ? 'default' : 'outline'} 
                onClick={() => setActiveView('summaries')}
              >
                Student Summaries
              </Button>
              <Button 
                variant={activeView === 'entries' ? 'default' : 'outline'} 
                onClick={() => setActiveView('entries')}
              >
                All Entries
              </Button>
            </div>
            
            {activeView === 'entries' && (
              <>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search entries by title, content, student, or tags"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={studentFilter} onValueChange={setStudentFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      {studentSummaries.map(student => (
                        <SelectItem key={student.studentId} value={student.studentId}>
                          {student.studentName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Entry Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="daily-log">Daily Log</SelectItem>
                      <SelectItem value="task-completion">Task Completion</SelectItem>
                      <SelectItem value="reflection">Reflection</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="learning-outcome">Learning Outcome</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={approvalFilter} onValueChange={setApprovalFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Approval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="requires-revision">Needs Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content based on active view */}
      {activeView === 'summaries' ? (
        <div className="grid gap-6">
          {studentSummaries.map((summary) => (
            <Card key={summary.studentId}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{summary.studentName}</h3>
                      <Badge className={`${
                        summary.completionRate >= 90 ? 'bg-green-100 text-green-800' :
                        summary.completionRate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {summary.completionRate}% Complete
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {summary.placementTitle}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {summary.rtoName}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        Supervisor: {summary.supervisorName}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="font-medium text-blue-900">{summary.totalEntries}</p>
                        <p className="text-blue-600">Total Entries</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="font-medium text-green-900">{summary.totalHours}</p>
                        <p className="text-green-600">Hours Logged</p>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="font-medium text-yellow-900">{summary.pendingApprovals}</p>
                        <p className="text-yellow-600">Pending Approvals</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="font-medium text-purple-900">{new Date(summary.lastEntryDate).toLocaleDateString()}</p>
                        <p className="text-purple-600">Last Entry</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleExportLogbook(summary.studentId)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      setStudentFilter(summary.studentId);
                      setActiveView('entries');
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Entries
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No entries found</h3>
                <p className="text-gray-600">
                  {searchTerm || studentFilter !== 'all' || typeFilter !== 'all' || approvalFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No logbook entries available.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{entry.title}</h3>
                        {getEntryTypeBadge(entry.entryType)}
                        {getApprovalBadge(entry.supervisorApproval)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {entry.studentName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(entry.entryDate).toLocaleDateString()}
                        </div>
                        {entry.hoursWorked && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {entry.hoursWorked} hours
                          </div>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {entry.content.substring(0, 200)}...
                      </p>
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {entry.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{entry.title}</DialogTitle>
                          <DialogDescription>
                            {entry.studentName} • {new Date(entry.entryDate).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="content" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="tasks">Tasks & Competencies</TabsTrigger>
                            <TabsTrigger value="learning">Learning Outcomes</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="content" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Entry Content</Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                  <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Entry Type</Label>
                                  <div className="mt-1">
                                    {getEntryTypeBadge(entry.entryType)}
                                  </div>
                                </div>
                                {entry.hoursWorked && (
                                  <div>
                                    <Label className="text-sm font-medium">Hours Worked</Label>
                                    <p className="text-sm text-gray-600 mt-1">{entry.hoursWorked} hours</p>
                                  </div>
                                )}
                              </div>
                              
                              {entry.tags.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Tags</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {entry.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="tasks" className="space-y-4">
                            <div className="space-y-4">
                              {entry.tasksCompleted.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Tasks Completed</Label>
                                  <ul className="mt-2 space-y-1">
                                    {entry.tasksCompleted.map((task, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{task}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {entry.competenciesAddressed.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Competencies Addressed</Label>
                                  <div className="mt-2 space-y-2">
                                    {entry.competenciesAddressed.map((competency, index) => (
                                      <div key={index} className="p-3 bg-blue-50 rounded border-l-4 border-blue-200">
                                        <p className="text-sm font-medium text-blue-900">{competency}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="learning" className="space-y-4">
                            <div className="space-y-4">
                              {entry.learningOutcomes.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Learning Outcomes</Label>
                                  <ul className="mt-2 space-y-2">
                                    {entry.learningOutcomes.map((outcome, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{outcome}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {entry.challenges.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Challenges Faced</Label>
                                  <ul className="mt-2 space-y-2">
                                    {entry.challenges.map((challenge, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{challenge}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="feedback" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Approval Status</Label>
                                <div className="mt-1">
                                  {getApprovalBadge(entry.supervisorApproval)}
                                </div>
                              </div>
                              
                              {entry.supervisorFeedback && (
                                <div>
                                  <Label className="text-sm font-medium">Supervisor Feedback</Label>
                                  <div className="mt-2 p-4 bg-green-50 rounded-lg border-l-4 border-green-200">
                                    <p className="text-sm text-green-800">{entry.supervisorFeedback}</p>
                                    <p className="text-xs text-green-600 mt-2">
                                      - {entry.supervisorName}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {entry.attachments.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Attachments</Label>
                                  <div className="mt-2 space-y-2">
                                    {entry.attachments.map((attachment) => (
                                      <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                                        <FileText className="w-4 h-4 text-gray-500" />
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {(attachment.size / 1024).toFixed(1)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                        <Button variant="outline" size="sm">
                                          <Download className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Created: {new Date(entry.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Updated: {new Date(entry.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {entry.supervisorFeedback && (
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">Supervisor Feedback</p>
                          <p className="text-sm text-gray-600 mt-1">{entry.supervisorFeedback}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}