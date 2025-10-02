'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckSquare, 
  Clock, 
  AlertTriangle, 
  FileText,
  Calendar,
  User,
  BookOpen,
  Award,
  Upload,
  Download,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Send,
  Filter,
  Search,
  Target,
  TrendingUp
} from 'lucide-react';

interface AssessmentTask {
  id: string;
  title: string;
  description: string;
  type: 'Quiz' | 'Assignment' | 'Practical' | 'Portfolio' | 'Presentation' | 'Case Study';
  category: 'Knowledge' | 'Skills' | 'Application' | 'Analysis' | 'Evaluation';
  status: 'Not Started' | 'In Progress' | 'Submitted' | 'Graded' | 'Overdue';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  submittedDate?: string;
  gradedDate?: string;
  maxScore: number;
  currentScore?: number;
  passingScore: number;
  timeLimit?: number; // in minutes
  attempts: number;
  maxAttempts: number;
  instructions: string;
  resources: string[];
  supervisor: string;
  feedback?: string;
  rubric?: string;
}

interface TaskStats {
  totalTasks: number;
  completed: number;
  pending: number;
  overdue: number;
  averageScore: number;
}

export default function AssessmentTasksPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<AssessmentTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AssessmentTask[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    totalTasks: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    averageScore: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTask, setSelectedTask] = useState<AssessmentTask | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    fetchAssessmentTasks();
  }, []);

  useEffect(() => {
    filterTasks();
    calculateStats();
  }, [tasks, searchTerm, statusFilter, typeFilter]);

  const fetchAssessmentTasks = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: AssessmentTask[] = [
        {
          id: '1',
          title: 'Clinical Skills Assessment - Patient Care',
          description: 'Demonstrate competency in patient care procedures including vital signs monitoring and basic care tasks',
          type: 'Practical',
          category: 'Skills',
          status: 'Not Started',
          priority: 'High',
          dueDate: '2024-02-20',
          maxScore: 100,
          passingScore: 70,
          timeLimit: 120,
          attempts: 0,
          maxAttempts: 2,
          instructions: 'Complete the practical assessment under supervision. You will be evaluated on technique, safety protocols, and patient interaction.',
          resources: ['Clinical Skills Handbook', 'Safety Protocol Guide', 'Assessment Checklist'],
          supervisor: 'Dr. Sarah Johnson',
          rubric: 'Scoring based on: Technique (40%), Safety (30%), Communication (20%), Documentation (10%)'
        },
        {
          id: '2',
          title: 'Evidence-Based Practice Quiz',
          description: 'Multiple choice quiz covering research methodology, critical appraisal, and evidence application',
          type: 'Quiz',
          category: 'Knowledge',
          status: 'In Progress',
          priority: 'Medium',
          dueDate: '2024-02-15',
          maxScore: 50,
          currentScore: 35,
          passingScore: 35,
          timeLimit: 60,
          attempts: 1,
          maxAttempts: 3,
          instructions: 'Answer all 50 questions within the time limit. You can save and return to incomplete quiz.',
          resources: ['EBP Textbook Chapter 1-5', 'Research Methods Guide', 'Critical Appraisal Tools'],
          supervisor: 'Prof. Michael Chen'
        },
        {
          id: '3',
          title: 'Case Study Analysis - Complex Care',
          description: 'Analyze a complex patient case and develop a comprehensive care plan with evidence-based interventions',
          type: 'Case Study',
          category: 'Analysis',
          status: 'Submitted',
          priority: 'High',
          dueDate: '2024-02-10',
          submittedDate: '2024-02-09',
          maxScore: 100,
          currentScore: 85,
          passingScore: 70,
          attempts: 1,
          maxAttempts: 1,
          instructions: 'Read the case study carefully and provide a detailed analysis including assessment, diagnosis, and care plan.',
          resources: ['Case Study Template', 'Care Planning Guidelines', 'Assessment Tools'],
          supervisor: 'Lisa Wang',
          feedback: 'Excellent analysis and evidence-based recommendations. Strong understanding of complex care needs.'
        },
        {
          id: '4',
          title: 'Professional Portfolio Submission',
          description: 'Compile and submit comprehensive professional portfolio demonstrating learning outcomes',
          type: 'Portfolio',
          category: 'Evaluation',
          status: 'Overdue',
          priority: 'High',
          dueDate: '2024-01-30',
          maxScore: 100,
          passingScore: 70,
          attempts: 0,
          maxAttempts: 1,
          instructions: 'Submit complete portfolio including reflections, evidence of learning, and professional development plan.',
          resources: ['Portfolio Guidelines', 'Reflection Templates', 'Learning Outcome Checklist'],
          supervisor: 'Dr. Sarah Johnson'
        },
        {
          id: '5',
          title: 'Communication Skills Presentation',
          description: 'Present on effective communication strategies in healthcare settings',
          type: 'Presentation',
          category: 'Application',
          status: 'Graded',
          priority: 'Medium',
          dueDate: '2024-01-25',
          submittedDate: '2024-01-24',
          gradedDate: '2024-01-26',
          maxScore: 75,
          currentScore: 68,
          passingScore: 50,
          attempts: 1,
          maxAttempts: 1,
          instructions: '15-minute presentation followed by Q&A session. Use visual aids and provide handouts.',
          resources: ['Presentation Guidelines', 'Communication Theory Readings', 'Case Examples'],
          supervisor: 'Prof. Michael Chen',
          feedback: 'Good content and delivery. Could improve visual aids and audience engagement techniques.'
        }
      ];

      setTasks(mockData);
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

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(task => task.type === typeFilter);
    }

    setFilteredTasks(filtered);
  };

  const calculateStats = () => {
    const totalTasks = tasks.length;
    const completed = tasks.filter(task => task.status === 'Graded').length;
    const pending = tasks.filter(task => task.status === 'Not Started' || task.status === 'In Progress').length;
    const overdue = tasks.filter(task => task.status === 'Overdue').length;
    
    const gradedTasks = tasks.filter(task => task.currentScore !== undefined);
    const averageScore = gradedTasks.length > 0 
      ? Math.round(gradedTasks.reduce((sum, task) => sum + (task.currentScore || 0), 0) / gradedTasks.length)
      : 0;

    setStats({
      totalTasks,
      completed,
      pending,
      overdue,
      averageScore
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Graded':
        return <Award className="h-5 w-5 text-green-500" />;
      case 'Submitted':
        return <CheckSquare className="h-5 w-5 text-blue-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Graded':
        return 'bg-green-100 text-green-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId ? { ...task, status: 'In Progress' as const } : task
      );
      setTasks(updatedTasks);

      toast({
        title: 'Task Started',
        description: 'Assessment task has been started. Good luck!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map(task =>
        task.id === taskId 
          ? { ...task, status: 'Submitted' as const, submittedDate: new Date().toISOString().split('T')[0] }
          : task
      );
      setTasks(updatedTasks);

      toast({
        title: 'Task Submitted',
        description: 'Your assessment has been submitted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit task. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewTask = (task: AssessmentTask) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleUploadSubmission = (taskId: string) => {
    toast({
      title: 'Upload Submission',
      description: 'File upload functionality would be implemented here.',
    });
  };

  const handleDownloadResource = (resource: string) => {
    toast({
      title: 'Download Resource',
      description: `Downloading ${resource}...`,
    });
  };

  const getTasksByTab = () => {
    switch (activeTab) {
      case 'pending':
        return filteredTasks.filter(task => task.status === 'Not Started' || task.status === 'In Progress');
      case 'submitted':
        return filteredTasks.filter(task => task.status === 'Submitted');
      case 'completed':
        return filteredTasks.filter(task => task.status === 'Graded');
      case 'overdue':
        return filteredTasks.filter(task => task.status === 'Overdue');
      default:
        return filteredTasks;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Assessment Tasks</h1>
          <p className="text-gray-600">Complete your pending assessments and track your progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold">{stats.totalTasks}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <Award className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
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
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageScore}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
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
                placeholder="Search tasks..."
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
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Graded">Graded</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Assignment">Assignment</SelectItem>
                <SelectItem value="Practical">Practical</SelectItem>
                <SelectItem value="Portfolio">Portfolio</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
                <SelectItem value="Case Study">Case Study</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tasks Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Pending ({tasks.filter(t => t.status === 'Not Started' || t.status === 'In Progress').length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({tasks.filter(t => t.status === 'Submitted').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({tasks.filter(t => t.status === 'Graded').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({tasks.filter(t => t.status === 'Overdue').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {getTasksByTab().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600">No assessment tasks match the current filter criteria.</p>
                </CardContent>
              </Card>
            ) : (
              getTasksByTab().map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(task.status)}
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority} Priority
                          </Badge>
                          <Badge variant="outline">{task.type}</Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{task.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {task.supervisor}
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {task.category}
                          </div>
                          <div className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {task.attempts}/{task.maxAttempts} attempts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Score Progress */}
                    {task.currentScore !== undefined && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Score Progress</span>
                          <span className="text-sm font-medium">
                            {task.currentScore}/{task.maxScore} ({Math.round((task.currentScore/task.maxScore)*100)}%)
                          </span>
                        </div>
                        <Progress value={(task.currentScore/task.maxScore)*100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          Passing score: {task.passingScore}/{task.maxScore} ({Math.round((task.passingScore/task.maxScore)*100)}%)
                        </p>
                      </div>
                    )}

                    {/* Time Limit */}
                    {task.timeLimit && (
                      <div className="mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-1" />
                          Time limit: {task.timeLimit} minutes
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Resources:</h4>
                      <div className="flex flex-wrap gap-2">
                        {task.resources.map((resource, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResource(resource)}
                            className="text-xs"
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            {resource}
                            <Download className="h-3 w-3 ml-1" />
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    {task.feedback && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Feedback:</h4>
                        <p className="text-sm text-green-600 bg-green-50 p-3 rounded">{task.feedback}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTask(task)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      
                      {task.status === 'Not Started' && task.attempts < task.maxAttempts && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTask(task.id)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Task
                        </Button>
                      )}
                      
                      {(task.status === 'In Progress' || task.status === 'Not Started') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUploadSubmission(task.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Work
                        </Button>
                      )}
                      
                      {task.status === 'In Progress' && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitTask(task.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="max-w-3xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  {getStatusIcon(selectedTask.status)}
                  <span>{selectedTask.title}</span>
                </DialogTitle>
                <DialogDescription>{selectedTask.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Task Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>Type: {selectedTask.type}</div>
                      <div>Category: {selectedTask.category}</div>
                      <div>Priority: {selectedTask.priority}</div>
                      <div>Due Date: {new Date(selectedTask.dueDate).toLocaleDateString()}</div>
                      <div>Supervisor: {selectedTask.supervisor}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Assessment Info</h4>
                    <div className="space-y-2 text-sm">
                      <div>Max Score: {selectedTask.maxScore}</div>
                      <div>Passing Score: {selectedTask.passingScore}</div>
                      <div>Attempts: {selectedTask.attempts}/{selectedTask.maxAttempts}</div>
                      {selectedTask.timeLimit && <div>Time Limit: {selectedTask.timeLimit} minutes</div>}
                      {selectedTask.currentScore && <div>Current Score: {selectedTask.currentScore}</div>}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedTask.instructions}
                  </p>
                </div>

                {selectedTask.rubric && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Scoring Rubric</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      {selectedTask.rubric}
                    </p>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.resources.map((resource, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResource(resource)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {resource}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                  Close
                </Button>
                {selectedTask.status === 'Not Started' && selectedTask.attempts < selectedTask.maxAttempts && (
                  <Button onClick={() => {
                    handleStartTask(selectedTask.id);
                    setIsTaskModalOpen(false);
                  }}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Task
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}