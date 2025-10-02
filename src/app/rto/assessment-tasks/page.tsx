'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  Target,
  TrendingUp,
  Filter,
  User,
  Award,
  Upload
} from 'lucide-react';

interface AssessmentTask {
  id: string;
  title: string;
  description: string;
  unit: string;
  course: string;
  assessmentType: 'Written' | 'Practical' | 'Project' | 'Oral' | 'Observation' | 'Portfolio';
  dueDate: string;
  status: 'Draft' | 'Published' | 'Active' | 'Completed' | 'Archived';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: number;
  maxAttempts: number;
  passingGrade: number;
  totalStudents: number;
  submitted: number;
  graded: number;
  avgScore?: number;
  competencies: string[];
  instructions: string;
  resources: string[];
  attachments: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  taskId: string;
  submittedAt: string;
  status: 'Submitted' | 'Graded' | 'Needs Resubmission';
  score?: number;
  feedback?: string;
  attempt: number;
  files: string[];
}

export default function AssessmentTasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AssessmentTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AssessmentTask[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState<AssessmentTask | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);

  useEffect(() => {
    fetchAssessmentTasks();
    fetchSubmissions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, searchTerm, statusFilter, typeFilter, courseFilter, showCompleted]);

  const fetchAssessmentTasks = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockTasks: AssessmentTask[] = [
        {
          id: '1',
          title: 'Workplace Communication Skills Assessment',
          description: 'Comprehensive assessment of verbal and written communication skills in workplace contexts.',
          unit: 'BSBCMM311 - Apply communication skills',
          course: 'Certificate III in Business',
          assessmentType: 'Portfolio',
          dueDate: '2024-02-15T23:59:59Z',
          status: 'Active',
          difficulty: 'Intermediate',
          estimatedDuration: 120,
          maxAttempts: 2,
          passingGrade: 65,
          totalStudents: 25,
          submitted: 18,
          graded: 12,
          avgScore: 78,
          competencies: ['BSBCMM311', 'BSBWHS311'],
          instructions: 'Create a portfolio demonstrating your communication skills through various workplace scenarios.',
          resources: ['Communication Guidelines.pdf', 'Sample Templates.docx'],
          attachments: ['assessment_brief.pdf', 'marking_rubric.xlsx'],
          createdBy: 'Sarah Johnson',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          title: 'Safety Management System Implementation',
          description: 'Practical assessment of implementing safety management systems in workplace environments.',
          unit: 'BSBWHS411 - Implement and monitor WHS policies',
          course: 'Certificate IV in Work Health and Safety',
          assessmentType: 'Project',
          dueDate: '2024-02-28T23:59:59Z',
          status: 'Published',
          difficulty: 'Advanced',
          estimatedDuration: 180,
          maxAttempts: 1,
          passingGrade: 70,
          totalStudents: 15,
          submitted: 8,
          graded: 5,
          avgScore: 82,
          competencies: ['BSBWHS411', 'BSBWHS412'],
          instructions: 'Design and implement a comprehensive safety management system for a simulated workplace.',
          resources: ['WHS Legislation Guide.pdf', 'Risk Assessment Templates.xlsx'],
          attachments: ['project_requirements.pdf'],
          createdBy: 'Michael Davis',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-25T16:15:00Z'
        },
        {
          id: '3',
          title: 'Customer Service Excellence Evaluation',
          description: 'Role-play based assessment of customer service skills and conflict resolution.',
          unit: 'BSBCUS301 - Deliver and monitor a service to customers',
          course: 'Certificate III in Business',
          assessmentType: 'Practical',
          dueDate: '2024-02-10T23:59:59Z',
          status: 'Active',
          difficulty: 'Beginner',
          estimatedDuration: 90,
          maxAttempts: 3,
          passingGrade: 60,
          totalStudents: 30,
          submitted: 22,
          graded: 20,
          avgScore: 73,
          competencies: ['BSBCUS301', 'BSBCMM311'],
          instructions: 'Demonstrate customer service skills through various role-play scenarios.',
          resources: ['Customer Service Standards.pdf', 'Scenario Scripts.docx'],
          attachments: ['practical_guidelines.pdf', 'observation_checklist.xlsx'],
          createdBy: 'Emma Wilson',
          createdAt: '2024-01-05T11:30:00Z',
          updatedAt: '2024-01-18T13:45:00Z'
        },
        {
          id: '4',
          title: 'Financial Report Analysis',
          description: 'Written assessment analyzing financial reports and making business recommendations.',
          unit: 'BSBFIN501 - Manage budgets and financial plans',
          course: 'Diploma of Business',
          assessmentType: 'Written',
          dueDate: '2024-03-05T23:59:59Z',
          status: 'Draft',
          difficulty: 'Advanced',
          estimatedDuration: 150,
          maxAttempts: 2,
          passingGrade: 75,
          totalStudents: 12,
          submitted: 0,
          graded: 0,
          competencies: ['BSBFIN501', 'BSBFIN502'],
          instructions: 'Analyze provided financial statements and prepare a comprehensive business report.',
          resources: ['Financial Analysis Guide.pdf', 'Sample Reports.zip'],
          attachments: ['draft_brief.pdf'],
          createdBy: 'David Brown',
          createdAt: '2024-01-28T14:20:00Z',
          updatedAt: '2024-01-28T14:20:00Z'
        },
        {
          id: '5',
          title: 'Leadership Style Assessment',
          description: 'Comprehensive evaluation of leadership approaches and team management skills.',
          unit: 'BSBLDR502 - Lead and manage effective workplace relationships',
          course: 'Diploma in Leadership and Management',
          assessmentType: 'Observation',
          dueDate: '2024-01-30T23:59:59Z',
          status: 'Completed',
          difficulty: 'Advanced',
          estimatedDuration: 240,
          maxAttempts: 1,
          passingGrade: 70,
          totalStudents: 8,
          submitted: 8,
          graded: 8,
          avgScore: 85,
          competencies: ['BSBLDR502', 'BSBLDR503'],
          instructions: 'Demonstrate leadership skills through team management scenarios.',
          resources: ['Leadership Theory Guide.pdf', 'Assessment Criteria.docx'],
          attachments: ['observation_form.pdf', 'final_results.xlsx'],
          createdBy: 'Lisa Rodriguez',
          createdAt: '2024-01-01T08:00:00Z',
          updatedAt: '2024-01-30T17:00:00Z'
        }
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching assessment tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assessment tasks. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      // Mock submissions data
      const mockSubmissions: StudentSubmission[] = [
        {
          id: '1',
          studentId: 'S001',
          studentName: 'Sarah Wilson',
          taskId: '1',
          submittedAt: '2024-01-25T16:30:00Z',
          status: 'Graded',
          score: 85,
          feedback: 'Excellent communication skills demonstrated. Good use of professional language.',
          attempt: 1,
          files: ['portfolio.pdf', 'communication_samples.docx']
        },
        {
          id: '2',
          studentId: 'S002',
          studentName: 'Michael Chen',
          taskId: '2',
          submittedAt: '2024-01-24T14:20:00Z',
          status: 'Submitted',
          attempt: 1,
          files: ['safety_project.pdf', 'implementation_plan.xlsx']
        }
      ];

      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const applyFilters = () => {
    let filtered = tasks;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.unit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.assessmentType === typeFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(task => task.course === courseFilter);
    }

    // Show/hide completed
    if (!showCompleted) {
      filtered = filtered.filter(task => task.status !== 'Completed');
    }

    // Sort by due date
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    setFilteredTasks(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Published':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompletionPercentage = (task: AssessmentTask) => {
    if (task.totalStudents === 0) return 0;
    return Math.round((task.submitted / task.totalStudents) * 100);
  };

  const getGradingPercentage = (task: AssessmentTask) => {
    if (task.submitted === 0) return 0;
    return Math.round((task.graded / task.submitted) * 100);
  };

  const getDaysUntilDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewTask = (task: AssessmentTask) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleViewSubmissions = (task: AssessmentTask) => {
    setSelectedTask(task);
    setShowSubmissionsModal(true);
  };

  const handleCreateTask = () => {
    toast({
      title: 'Create Task',
      description: 'Create new assessment task functionality would be implemented here.',
    });
  };

  const handleDuplicateTask = (taskId: string) => {
    toast({
      title: 'Task Duplicated',
      description: 'Assessment task has been duplicated successfully.',
    });
  };

  const uniqueCourses = [...new Set(tasks.map(t => t.course))];

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => t.status === 'Active').length,
    pending: tasks.filter(t => getDaysUntilDue(t.dueDate) <= 7 && t.status === 'Active').length,
    completed: tasks.filter(t => t.status === 'Completed').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Tasks</h1>
          <p className="text-gray-600">Manage and monitor student assessment tasks</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAssessmentTasks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateTask}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due Soon</p>
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
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
                  <SelectItem value="Published">Published</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Written">Written</SelectItem>
                  <SelectItem value="Practical">Practical</SelectItem>
                  <SelectItem value="Project">Project</SelectItem>
                  <SelectItem value="Oral">Oral</SelectItem>
                  <SelectItem value="Observation">Observation</SelectItem>
                  <SelectItem value="Portfolio">Portfolio</SelectItem>
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
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="show-completed"
                  checked={showCompleted}
                  onCheckedChange={(checked) => setShowCompleted(checked === true)}
                />
                <label htmlFor="show-completed" className="text-sm">Show completed</label>
              </div>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setCourseFilter('all');
                setShowCompleted(true);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTasks.map((task) => {
          const daysUntilDue = getDaysUntilDue(task.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;
          const completionPercentage = getCompletionPercentage(task);
          const gradingPercentage = getGradingPercentage(task);

          return (
            <Card key={task.id} className={`${isOverdue ? 'border-red-300 bg-red-50' : isUrgent ? 'border-yellow-300 bg-yellow-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge variant="outline">{task.assessmentType}</Badge>
                      <Badge className={getDifficultyColor(task.difficulty)} variant="outline">
                        {task.difficulty}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><BookOpen className="inline h-4 w-4 mr-1" />{task.course}</div>
                      <div><Award className="inline h-4 w-4 mr-1" />{task.unit}</div>
                      <div>
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                        {isOverdue && (
                          <span className="ml-2 text-red-600 font-medium">
                            ({Math.abs(daysUntilDue)} days overdue)
                          </span>
                        )}
                        {isUrgent && (
                          <span className="ml-2 text-yellow-600 font-medium">
                            ({daysUntilDue} days remaining)
                          </span>
                        )}
                      </div>
                      <div><Clock className="inline h-4 w-4 mr-1" />{task.estimatedDuration} minutes</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bars */}
                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600">Submissions</span>
                      <span className="text-sm font-medium">{task.submitted}/{task.totalStudents} ({completionPercentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {task.submitted > 0 && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Graded</span>
                        <span className="text-sm font-medium">{task.graded}/{task.submitted} ({gradingPercentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${gradingPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-blue-600">{task.totalStudents}</div>
                    <div className="text-xs text-gray-600">Students</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-green-600">{task.passingGrade}%</div>
                    <div className="text-xs text-gray-600">Pass Grade</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-lg font-bold text-purple-600">
                      {task.avgScore ? `${task.avgScore}%` : '--'}
                    </div>
                    <div className="text-xs text-gray-600">Avg Score</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-gray-500">
                    Created by {task.createdBy} • {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewTask(task)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {task.submitted > 0 && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewSubmissions(task)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Submissions
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDuplicateTask(task.id)}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Assessment Tasks Found</h3>
            <p className="text-gray-600">
              {tasks.length === 0 
                ? "No assessment tasks have been created yet."
                : "No tasks match your current filters."
              }
            </p>
            {tasks.length === 0 && (
              <Button className="mt-4" onClick={handleCreateTask}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}