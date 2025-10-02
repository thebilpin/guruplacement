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
  MessageCircle, 
  Calendar, 
  Clock, 
  FileText, 
  Users,
  User,
  Building,
  Search,
  Filter,
  Eye,
  Edit3,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SupervisorLog {
  id: string;
  studentId: string;
  studentName: string;
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  placementId: string;
  placementTitle: string;
  logDate: string;
  logType: 'observation' | 'feedback' | 'assessment' | 'meeting' | 'incident' | 'progress-review';
  title: string;
  content: string;
  observations: string[];
  strengths: string[];
  areasForImprovement: string[];
  actionItems: ActionItem[];
  performanceRating?: number; // 1-5 scale
  attendanceRating?: number; // 1-5 scale
  skillDevelopmentNotes: string[];
  nextSteps: string[];
  studentResponse?: string;
  studentResponseDate?: string;
  isSharedWithStudent: boolean;
  isSharedWithRTO: boolean;
  confidentialNotes?: string;
  tags: string[];
  attachments: LogAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignedTo: 'student' | 'supervisor' | 'both';
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: string;
  notes?: string;
}

interface LogAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

interface SupervisorSummary {
  supervisorId: string;
  supervisorName: string;
  supervisorEmail: string;
  studentsSupervised: number;
  totalLogs: number;
  lastLogDate: string;
  averagePerformanceRating: number;
  pendingActionItems: number;
}

export default function SupervisorLogsPage() {
  const [supervisorLogs, setSupervisorLogs] = useState<SupervisorLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SupervisorLog[]>([]);
  const [supervisorSummaries, setSupervisorSummaries] = useState<SupervisorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<SupervisorLog | null>(null);
  const [activeView, setActiveView] = useState<'logs' | 'summaries'>('summaries');
  const [isAddResponseDialogOpen, setIsAddResponseDialogOpen] = useState(false);
  const [responseText, setResponseText] = useState('');

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSupervisorLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [supervisorLogs, searchTerm, supervisorFilter, studentFilter, typeFilter]);

  const fetchSupervisorLogs = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLogs: SupervisorLog[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          supervisorId: 'SUP001',
          supervisorName: 'John Smith',
          supervisorEmail: 'john.smith@company.com',
          placementId: 'PLC001',
          placementTitle: 'Software Development Placement',
          logDate: '2024-01-30',
          logType: 'progress-review',
          title: 'Week 4 Progress Review - Excellent Development',
          content: `Emily has shown exceptional progress in her React development skills over the past week. Her understanding of component architecture and state management has improved significantly.

During our review session, we discussed:
- Her recent work on the user dashboard components
- Challenges she faced with data visualization
- Her proactive approach to learning new technologies

Emily demonstrates strong problem-solving skills and takes initiative in seeking help when needed. Her code quality has improved notably, and she's starting to consider performance optimization in her solutions.`,
          observations: [
            'Demonstrates strong technical problem-solving abilities',
            'Proactively seeks feedback and implements suggestions',
            'Shows good understanding of React best practices',
            'Collaborates well with the development team'
          ],
          strengths: [
            'Quick learner with strong technical foundation',
            'Excellent communication and questioning skills',
            'Takes ownership of assigned tasks',
            'Shows attention to code quality and documentation'
          ],
          areasForImprovement: [
            'Could benefit from more exposure to testing frameworks',
            'Time estimation for complex tasks needs refinement',
            'Would benefit from learning about CI/CD processes'
          ],
          actionItems: [
            {
              id: 'action1',
              description: 'Complete Jest testing tutorial and implement tests for current components',
              assignedTo: 'student',
              dueDate: '2024-02-05',
              status: 'in-progress'
            },
            {
              id: 'action2',
              description: 'Schedule pair programming session on performance optimization',
              assignedTo: 'supervisor',
              dueDate: '2024-02-02',
              status: 'pending'
            }
          ],
          performanceRating: 4,
          attendanceRating: 5,
          skillDevelopmentNotes: [
            'React component development: Advanced level achieved',
            'JavaScript ES6: Proficient, ready for advanced concepts',
            'Problem-solving: Excellent analytical approach'
          ],
          nextSteps: [
            'Introduce advanced React patterns (HOCs, render props)',
            'Begin backend integration with Node.js APIs',
            'Explore state management with Redux or Context API'
          ],
          studentResponse: 'Thank you for the detailed feedback! I really appreciate the specific areas for improvement. I\'ve already started the Jest tutorial and find it very helpful. Looking forward to the pair programming session on performance optimization.',
          studentResponseDate: '2024-01-30T18:00:00Z',
          isSharedWithStudent: true,
          isSharedWithRTO: true,
          tags: ['progress-review', 'react', 'javascript', 'technical-skills'],
          attachments: [],
          createdAt: '2024-01-30T16:00:00Z',
          updatedAt: '2024-01-30T18:00:00Z'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Michael Chen',
          supervisorId: 'SUP002',
          supervisorName: 'Sarah Johnson',
          supervisorEmail: 'sarah.johnson@company.com',
          placementId: 'PLC002',
          placementTitle: 'Marketing Assistant Placement',
          logDate: '2024-01-29',
          logType: 'feedback',
          title: 'Campaign Analysis Presentation Feedback',
          content: `Michael presented his Q1 social media campaign analysis today. The presentation was well-structured and showed good analytical thinking.

Presentation highlights:
- Clear data visualization using charts and graphs
- Logical flow from analysis to recommendations
- Good understanding of marketing metrics and KPIs
- Professional presentation style

Areas for development were also identified, particularly around advanced analytics interpretation and strategic thinking for future campaigns.`,
          observations: [
            'Prepared comprehensive analysis with supporting data',
            'Confident presentation delivery',
            'Asked thoughtful questions about metrics interpretation',
            'Showed enthusiasm for learning advanced analytics'
          ],
          strengths: [
            'Strong analytical skills and attention to detail',
            'Good presentation and communication abilities',
            'Understands basic marketing principles well',
            'Eager to learn and apply new concepts'
          ],
          areasForImprovement: [
            'Needs deeper understanding of customer segmentation',
            'Could improve strategic thinking for campaign optimization',
            'Would benefit from learning advanced analytics tools'
          ],
          actionItems: [
            {
              id: 'action3',
              description: 'Complete Google Analytics certification course',
              assignedTo: 'student',
              dueDate: '2024-02-15',
              status: 'pending'
            },
            {
              id: 'action4',
              description: 'Review customer personas and segmentation strategies',
              assignedTo: 'both',
              dueDate: '2024-02-05',
              status: 'pending'
            }
          ],
          performanceRating: 3,
          attendanceRating: 4,
          skillDevelopmentNotes: [
            'Data analysis: Good foundation, ready for advanced concepts',
            'Presentation skills: Strong, confident delivery',
            'Marketing knowledge: Solid basics, expanding to strategic level'
          ],
          nextSteps: [
            'Focus on advanced analytics and customer insights',
            'Work on strategic campaign planning',
            'Explore marketing automation tools'
          ],
          isSharedWithStudent: true,
          isSharedWithRTO: true,
          confidentialNotes: 'Michael shows good potential but may need additional support with strategic thinking. Consider assigning a senior marketing mentor.',
          tags: ['feedback', 'presentation', 'analytics', 'marketing'],
          attachments: [
            {
              id: 'att1',
              name: 'campaign-presentation-feedback.pdf',
              type: 'application/pdf',
              size: 524288,
              url: '/attachments/campaign-presentation-feedback.pdf',
              uploadedAt: '2024-01-29T17:30:00Z'
            }
          ],
          createdAt: '2024-01-29T17:00:00Z',
          updatedAt: '2024-01-29T17:30:00Z'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Sarah Williams',
          supervisorId: 'SUP003',
          supervisorName: 'Mike Chen',
          supervisorEmail: 'mike.chen@company.com',
          placementId: 'PLC003',
          placementTitle: 'Data Analytics Placement',
          logDate: '2024-01-28',
          logType: 'observation',
          title: 'Database Optimization Work Observation',
          content: `Observed Sarah working on database query optimization today. She demonstrated systematic approach to identifying performance bottlenecks and implementing solutions.

Key observations:
- Used proper profiling tools to identify slow queries
- Applied indexing strategies appropriately
- Documented changes and measured performance improvements
- Collaborated effectively with senior developers for complex optimization strategies

Sarah shows strong technical competence and professional work habits. Her approach to problem-solving is methodical and well-documented.`,
          observations: [
            'Systematic approach to performance analysis',
            'Good use of database profiling and monitoring tools',
            'Effective collaboration with senior team members',
            'Maintains detailed documentation of changes'
          ],
          strengths: [
            'Strong technical foundation in database systems',
            'Excellent problem-solving methodology',
            'Good attention to documentation and best practices',
            'Collaborative approach to learning'
          ],
          areasForImprovement: [
            'Could benefit from exposure to NoSQL databases',
            'Time management with complex analysis tasks',
            'Understanding of database design patterns'
          ],
          actionItems: [
            {
              id: 'action5',
              description: 'Complete MongoDB tutorial and comparison with SQL approaches',
              assignedTo: 'student',
              dueDate: '2024-02-10',
              status: 'pending'
            }
          ],
          performanceRating: 4,
          attendanceRating: 5,
          skillDevelopmentNotes: [
            'SQL optimization: Advanced level demonstrated',
            'Database design: Good understanding, expanding to advanced patterns',
            'Performance analysis: Excellent systematic approach'
          ],
          nextSteps: [
            'Explore NoSQL database technologies',
            'Learn about distributed database systems',
            'Study advanced indexing and partitioning strategies'
          ],
          isSharedWithStudent: true,
          isSharedWithRTO: false,
          tags: ['observation', 'database', 'optimization', 'sql'],
          attachments: [],
          createdAt: '2024-01-28T15:30:00Z',
          updatedAt: '2024-01-28T15:30:00Z'
        }
      ];

      const mockSummaries: SupervisorSummary[] = [
        {
          supervisorId: 'SUP001',
          supervisorName: 'John Smith',
          supervisorEmail: 'john.smith@company.com',
          studentsSupervised: 2,
          totalLogs: 8,
          lastLogDate: '2024-01-30',
          averagePerformanceRating: 4.2,
          pendingActionItems: 3
        },
        {
          supervisorId: 'SUP002',
          supervisorName: 'Sarah Johnson',
          supervisorEmail: 'sarah.johnson@company.com',
          studentsSupervised: 1,
          totalLogs: 5,
          lastLogDate: '2024-01-29',
          averagePerformanceRating: 3.4,
          pendingActionItems: 2
        },
        {
          supervisorId: 'SUP003',
          supervisorName: 'Mike Chen',
          supervisorEmail: 'mike.chen@company.com',
          studentsSupervised: 1,
          totalLogs: 6,
          lastLogDate: '2024-01-28',
          averagePerformanceRating: 4.1,
          pendingActionItems: 1
        }
      ];

      setSupervisorLogs(mockLogs);
      setSupervisorSummaries(mockSummaries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch supervisor logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = supervisorLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.supervisorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (supervisorFilter !== 'all') {
      filtered = filtered.filter(log => log.supervisorId === supervisorFilter);
    }

    if (studentFilter !== 'all') {
      filtered = filtered.filter(log => log.studentId === studentFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.logType === typeFilter);
    }

    setFilteredLogs(filtered);
  };

  const getLogTypeBadge = (type: string) => {
    const typeLabels = {
      'observation': 'Observation',
      'feedback': 'Feedback',
      'assessment': 'Assessment',
      'meeting': 'Meeting',
      'incident': 'Incident',
      'progress-review': 'Progress Review'
    };

    const typeColors = {
      'observation': 'bg-blue-100 text-blue-800',
      'feedback': 'bg-green-100 text-green-800',
      'assessment': 'bg-purple-100 text-purple-800',
      'meeting': 'bg-yellow-100 text-yellow-800',
      'incident': 'bg-red-100 text-red-800',
      'progress-review': 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {typeLabels[type as keyof typeof typeLabels] || type}
      </Badge>
    );
  };

  const getPerformanceStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAddStudentResponse = async (logId: string) => {
    try {
      if (!responseText.trim()) {
        toast({
          title: "Error",
          description: "Please enter a response message.",
          variant: "destructive",
        });
        return;
      }

      setSupervisorLogs(prev => prev.map(log => 
        log.id === logId 
          ? {
              ...log,
              studentResponse: responseText,
              studentResponseDate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : log
      ));

      setResponseText('');
      setIsAddResponseDialogOpen(false);

      toast({
        title: "Success",
        description: "Student response added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add response. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLogStats = () => {
    const totalLogs = supervisorLogs.length;
    const totalSupervisors = supervisorSummaries.length;
    const totalActionItems = supervisorLogs.reduce((sum, log) => sum + log.actionItems.length, 0);
    const pendingActionItems = supervisorLogs.reduce((sum, log) => 
      sum + log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length, 0
    );

    return { totalLogs, totalSupervisors, totalActionItems, pendingActionItems };
  };

  const stats = getLogStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading supervisor logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisor Logs</h1>
          <p className="text-gray-600 mt-2">Monitor supervisor feedback and student progress</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSupervisorLogs}>
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
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Supervisors</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSupervisors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Action Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalActionItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingActionItems}</p>
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
                Supervisor Summaries
              </Button>
              <Button 
                variant={activeView === 'logs' ? 'default' : 'outline'} 
                onClick={() => setActiveView('logs')}
              >
                All Logs
              </Button>
            </div>
            
            {activeView === 'logs' && (
              <>
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search logs by title, content, student, or supervisor"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={supervisorFilter} onValueChange={setSupervisorFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Supervisors</SelectItem>
                      {supervisorSummaries.map(supervisor => (
                        <SelectItem key={supervisor.supervisorId} value={supervisor.supervisorId}>
                          {supervisor.supervisorName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Log Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="incident">Incident</SelectItem>
                      <SelectItem value="progress-review">Progress Review</SelectItem>
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
          {supervisorSummaries.map((summary) => (
            <Card key={summary.supervisorId}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{summary.supervisorName}</h3>
                      <Badge variant="outline">{summary.supervisorEmail}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="font-medium text-blue-900">{summary.studentsSupervised}</p>
                        <p className="text-blue-600">Students Supervised</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="font-medium text-green-900">{summary.totalLogs}</p>
                        <p className="text-green-600">Total Logs</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <div className="flex items-center gap-1">
                          {getPerformanceStars(Math.round(summary.averagePerformanceRating))}
                        </div>
                        <p className="text-purple-600">Avg Performance</p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded">
                        <p className="font-medium text-orange-900">{summary.pendingActionItems}</p>
                        <p className="text-orange-600">Pending Actions</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last log: {new Date(summary.lastLogDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => {
                      setSupervisorFilter(summary.supervisorId);
                      setActiveView('logs');
                    }}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Logs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No logs found</h3>
                <p className="text-gray-600">
                  {searchTerm || supervisorFilter !== 'all' || studentFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'No supervisor logs available.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{log.title}</h3>
                        {getLogTypeBadge(log.logType)}
                        {log.isSharedWithStudent && (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Shared with Student
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Student: {log.studentName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Supervisor: {log.supervisorName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(log.logDate).toLocaleDateString()}
                        </div>
                      </div>
                      {(log.performanceRating || log.attendanceRating) && (
                        <div className="flex gap-6 mb-3">
                          {log.performanceRating && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Performance:</span>
                              <div className="flex">{getPerformanceStars(log.performanceRating)}</div>
                            </div>
                          )}
                          {log.attendanceRating && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">Attendance:</span>
                              <div className="flex">{getPerformanceStars(log.attendanceRating)}</div>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-gray-700 mb-3 line-clamp-3">
                        {log.content.substring(0, 200)}...
                      </p>
                      {log.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {log.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{log.title}</DialogTitle>
                          <DialogDescription>
                            {log.supervisorName} • {log.studentName} • {new Date(log.logDate).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="content" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="observations">Observations</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                            <TabsTrigger value="response">Student Response</TabsTrigger>
                            <TabsTrigger value="ratings">Ratings</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="content" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Log Content</Label>
                                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                                  <p className="text-gray-700 whitespace-pre-wrap">{log.content}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Log Type</Label>
                                  <div className="mt-1">
                                    {getLogTypeBadge(log.logType)}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Sharing Status</Label>
                                  <div className="flex gap-2 mt-1">
                                    {log.isSharedWithStudent && (
                                      <Badge variant="outline" className="text-green-600 border-green-200">
                                        Shared with Student
                                      </Badge>
                                    )}
                                    {log.isSharedWithRTO && (
                                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                                        Shared with RTO
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              {log.tags.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Tags</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {log.tags.map((tag, index) => (
                                      <Badge key={index} variant="outline">{tag}</Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="observations" className="space-y-4">
                            <div className="space-y-4">
                              {log.observations.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Key Observations</Label>
                                  <ul className="mt-2 space-y-2">
                                    {log.observations.map((observation, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Eye className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{observation}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {log.strengths.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Strengths</Label>
                                  <ul className="mt-2 space-y-2">
                                    {log.strengths.map((strength, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{strength}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {log.areasForImprovement.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Areas for Improvement</Label>
                                  <ul className="mt-2 space-y-2">
                                    {log.areasForImprovement.map((area, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{area}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {log.skillDevelopmentNotes.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Skill Development Notes</Label>
                                  <ul className="mt-2 space-y-2">
                                    {log.skillDevelopmentNotes.map((note, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Star className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{note}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="actions" className="space-y-4">
                            <div className="space-y-4">
                              {log.actionItems.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Action Items</Label>
                                  <div className="space-y-3 mt-2">
                                    {log.actionItems.map((action) => (
                                      <Card key={action.id}>
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <p className="font-medium">{action.description}</p>
                                              <div className="text-sm text-gray-600 mt-1">
                                                <p>Assigned to: {action.assignedTo}</p>
                                                <p>Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                                                {action.completedDate && (
                                                  <p>Completed: {new Date(action.completedDate).toLocaleDateString()}</p>
                                                )}
                                                {action.notes && <p>Notes: {action.notes}</p>}
                                              </div>
                                            </div>
                                            <Badge variant={
                                              action.status === 'completed' ? 'default' :
                                              action.status === 'in-progress' ? 'secondary' :
                                              action.status === 'overdue' ? 'destructive' :
                                              'outline'
                                            }>
                                              {action.status}
                                            </Badge>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {log.nextSteps.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Next Steps</Label>
                                  <ul className="mt-2 space-y-2">
                                    {log.nextSteps.map((step, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                        <span className="text-sm text-gray-700">{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="response" className="space-y-4">
                            <div className="space-y-4">
                              {log.studentResponse ? (
                                <div>
                                  <Label className="text-sm font-medium">Student Response</Label>
                                  <div className="mt-2 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-200">
                                    <p className="text-sm text-blue-800">{log.studentResponse}</p>
                                    <p className="text-xs text-blue-600 mt-2">
                                      Responded on: {log.studentResponseDate && new Date(log.studentResponseDate).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                  <p className="text-gray-600 mb-4">No student response yet</p>
                                  <Dialog open={isAddResponseDialogOpen} onOpenChange={setIsAddResponseDialogOpen}>
                                    <DialogTrigger asChild>
                                      <Button variant="outline">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Response
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Add Student Response</DialogTitle>
                                        <DialogDescription>
                                          Add a response from the student to this supervisor log
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="response">Response Message</Label>
                                          <Textarea
                                            id="response"
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            placeholder="Enter student's response to the supervisor feedback..."
                                            rows={4}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex justify-end space-x-2">
                                        <Button variant="outline" onClick={() => setIsAddResponseDialogOpen(false)}>
                                          Cancel
                                        </Button>
                                        <Button onClick={() => handleAddStudentResponse(log.id)}>
                                          <Send className="w-4 h-4 mr-2" />
                                          Add Response
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="ratings" className="space-y-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-6">
                                {log.performanceRating && (
                                  <div>
                                    <Label className="text-sm font-medium">Performance Rating</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="flex">{getPerformanceStars(log.performanceRating)}</div>
                                      <span className="text-sm text-gray-600">({log.performanceRating}/5)</span>
                                    </div>
                                  </div>
                                )}
                                
                                {log.attendanceRating && (
                                  <div>
                                    <Label className="text-sm font-medium">Attendance Rating</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      <div className="flex">{getPerformanceStars(log.attendanceRating)}</div>
                                      <span className="text-sm text-gray-600">({log.attendanceRating}/5)</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              {log.confidentialNotes && (
                                <div>
                                  <Label className="text-sm font-medium">Confidential Notes</Label>
                                  <div className="mt-2 p-4 bg-red-50 rounded-lg border-l-4 border-red-200">
                                    <p className="text-sm text-red-800">{log.confidentialNotes}</p>
                                    <p className="text-xs text-red-600 mt-2">
                                      Note: This information is not shared with the student
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Created: {new Date(log.createdAt).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">
                            Updated: {new Date(log.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">
                          {log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length} Active Action Items
                        </span>
                      </div>
                      <div className="space-y-1">
                        {log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').slice(0, 2).map((action) => (
                          <div key={action.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {action.description} (Due: {new Date(action.dueDate).toLocaleDateString()})
                          </div>
                        ))}
                        {log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length > 2 && (
                          <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                            +{log.actionItems.filter(item => item.status === 'pending' || item.status === 'in-progress').length - 2} more actions
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {log.studentResponse && (
                    <div className="border-t pt-4">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-700">Student has responded</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{log.studentResponse}</p>
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