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
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User,
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  TrendingUp,
  Target,
  Users,
  BookOpen,
  Award,
  Upload
} from 'lucide-react';

interface StudentCompliance {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  course: string;
  placement: string;
  overallProgress: number;
  status: 'On Track' | 'At Risk' | 'Critical' | 'Complete';
  totalItems: number;
  completedItems: number;
  overdueItems: number;
  lastUpdate: string;
  complianceItems: ComplianceItem[];
}

interface ComplianceItem {
  id: string;
  title: string;
  category: 'Documentation' | 'Training' | 'Assessment' | 'Health & Safety' | 'Legal';
  status: 'Completed' | 'In Progress' | 'Overdue' | 'Not Started';
  dueDate: string;
  completedDate?: string;
  priority: 'High' | 'Medium' | 'Low';
}

export default function StudentCompliancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentCompliance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentCompliance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentCompliance | null>(null);

  useEffect(() => {
    fetchStudentCompliance();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter, courseFilter]);

  const fetchStudentCompliance = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: StudentCompliance[] = [
        {
          id: '1',
          studentId: 'ST001',
          studentName: 'Emma Wilson',
          email: 'emma.wilson@email.com',
          course: 'Certificate IV in Community Services',
          placement: 'City Community Center',
          overallProgress: 85,
          status: 'On Track',
          totalItems: 12,
          completedItems: 10,
          overdueItems: 0,
          lastUpdate: '2024-01-25T10:30:00Z',
          complianceItems: [
            {
              id: '1',
              title: 'Working with Children Check',
              category: 'Legal',
              status: 'Completed',
              dueDate: '2024-01-15',
              completedDate: '2024-01-10',
              priority: 'High'
            },
            {
              id: '2',
              title: 'First Aid Training',
              category: 'Training',
              status: 'In Progress',
              dueDate: '2024-02-20',
              priority: 'High'
            }
          ]
        },
        {
          id: '2',
          studentId: 'ST002',
          studentName: 'James Chen',
          email: 'james.chen@email.com',
          course: 'Diploma of Nursing',
          placement: 'General Hospital',
          overallProgress: 60,
          status: 'At Risk',
          totalItems: 15,
          completedItems: 9,
          overdueItems: 2,
          lastUpdate: '2024-01-24T14:20:00Z',
          complianceItems: [
            {
              id: '3',
              title: 'Privacy Agreement',
              category: 'Documentation',
              status: 'Overdue',
              dueDate: '2024-01-20',
              priority: 'High'
            },
            {
              id: '4',
              title: 'Clinical Skills Assessment',
              category: 'Assessment',
              status: 'In Progress',
              dueDate: '2024-02-15',
              priority: 'Medium'
            }
          ]
        },
        {
          id: '3',
          studentId: 'ST003',
          studentName: 'Sarah Rodriguez',
          email: 'sarah.rodriguez@email.com',
          course: 'Certificate III in Individual Support',
          placement: 'Aged Care Facility',
          overallProgress: 30,
          status: 'Critical',
          totalItems: 10,
          completedItems: 3,
          overdueItems: 4,
          lastUpdate: '2024-01-23T09:15:00Z',
          complianceItems: [
            {
              id: '5',
              title: 'Police Check',
              category: 'Legal',
              status: 'Overdue',
              dueDate: '2024-01-18',
              priority: 'High'
            },
            {
              id: '6',
              title: 'Mandatory Training',
              category: 'Training',
              status: 'Not Started',
              dueDate: '2024-02-10',
              priority: 'High'
            }
          ]
        }
      ];

      setStudents(mockData);
    } catch (error) {
      console.error('Error fetching student compliance:', error);
      toast({
        title: 'Error',
        description: 'Failed to load student compliance data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    if (courseFilter !== 'all') {
      filtered = filtered.filter(student => student.course === courseFilter);
    }

    setFilteredStudents(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'On Track':
        return 'bg-blue-100 text-blue-800';
      case 'At Risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (student: StudentCompliance) => {
    setSelectedStudent(student);
  };

  const handleExportReport = () => {
    toast({
      title: 'Export Report',
      description: 'Compliance report export functionality would be implemented here.',
    });
  };

  const handleSendReminder = (studentId: string) => {
    toast({
      title: 'Reminder Sent',
      description: 'Compliance reminder has been sent to the student.',
    });
  };

  const handleRefreshData = () => {
    fetchStudentCompliance();
    toast({
      title: 'Data Refreshed',
      description: 'Student compliance data has been updated.',
    });
  };

  const stats = {
    totalStudents: students.length,
    onTrack: students.filter(s => s.status === 'On Track').length,
    atRisk: students.filter(s => s.status === 'At Risk').length,
    critical: students.filter(s => s.status === 'Critical').length,
    avgCompletion: students.length > 0 
      ? Math.round(students.reduce((sum, s) => sum + s.overallProgress, 0) / students.length)
      : 0
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Compliance Tracker</h1>
          <p className="text-gray-600">Monitor and track student compliance across all placements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">On Track</p>
                <p className="text-2xl font-bold text-blue-600">{stats.onTrack}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.atRisk}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Completion</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgCompletion}%</p>
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
                placeholder="Search students..."
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
                <SelectItem value="On Track">On Track</SelectItem>
                <SelectItem value="At Risk">At Risk</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Complete">Complete</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="Certificate IV in Community Services">Cert IV Community Services</SelectItem>
                <SelectItem value="Diploma of Nursing">Diploma of Nursing</SelectItem>
                <SelectItem value="Certificate III in Individual Support">Cert III Individual Support</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCourseFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      <div className="space-y-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ClipboardCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">No students match the current filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{student.studentName}</h3>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                      <span className="text-sm text-gray-500">ID: {student.studentId}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <strong>Course:</strong> {student.course}
                      </div>
                      <div>
                        <strong>Placement:</strong> {student.placement}
                      </div>
                      <div>
                        <strong>Email:</strong> {student.email}
                      </div>
                    </div>
                    
                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Overall Progress</span>
                        <span className="text-sm font-medium">{student.overallProgress}%</span>
                      </div>
                      <Progress value={student.overallProgress} className="h-2" />
                    </div>

                    {/* Compliance Summary */}
                    <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-700">{student.completedItems}</div>
                        <div className="text-green-600">Completed</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-700">{student.totalItems - student.completedItems - student.overdueItems}</div>
                        <div className="text-blue-600">In Progress</div>
                      </div>
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="font-semibold text-red-700">{student.overdueItems}</div>
                        <div className="text-red-600">Overdue</div>
                      </div>
                    </div>

                    {/* Recent Items */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Compliance Items:</h4>
                      <div className="space-y-2">
                        {student.complianceItems.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{item.title}</span>
                              <Badge className={getItemStatusColor(item.status)} variant="secondary">
                                {item.status}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last updated: {new Date(student.lastUpdate).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(student)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendReminder(student.id)}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}