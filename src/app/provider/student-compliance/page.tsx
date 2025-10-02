'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Filter,
  Search,
  FileText,
  Calendar,
  User,
  Building,
  Shield,
  TrendingUp,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StudentCompliance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  placementId: string;
  placementTitle: string;
  rtoName: string;
  overallStatus: 'compliant' | 'non-compliant' | 'at-risk' | 'pending';
  complianceScore: number;
  lastUpdated: string;
  requirements: ComplianceRequirement[];
  issues: ComplianceIssue[];
  nextReviewDate: string;
  supervisorName: string;
  supervisorEmail: string;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  category: 'safety' | 'documentation' | 'training' | 'assessment';
  status: 'completed' | 'pending' | 'overdue' | 'not-applicable';
  dueDate?: string;
  completedDate?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface ComplianceIssue {
  id: string;
  type: 'missing-document' | 'overdue-assessment' | 'safety-concern' | 'training-gap';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  resolvedAt?: string;
  assignedTo?: string;
}

export default function StudentCompliancePage() {
  const [students, setStudents] = useState<StudentCompliance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentCompliance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentCompliance | null>(null);
  const [issueFilter, setIssueFilter] = useState('all');

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchStudentCompliance();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const fetchStudentCompliance = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStudents: StudentCompliance[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          studentEmail: 'emily.johnson@email.com',
          placementId: 'PLC001',
          placementTitle: 'Software Development Placement',
          rtoName: 'Tech Institute Australia',
          overallStatus: 'compliant',
          complianceScore: 95,
          lastUpdated: '2024-01-28T10:00:00Z',
          nextReviewDate: '2024-02-15',
          supervisorName: 'John Smith',
          supervisorEmail: 'john.smith@company.com',
          requirements: [
            {
              id: 'req1',
              name: 'Work Health & Safety Induction',
              category: 'safety',
              status: 'completed',
              completedDate: '2024-01-15',
              description: 'Completed workplace safety training and assessment',
              priority: 'high'
            },
            {
              id: 'req2',
              name: 'Digital Portfolio Setup',
              category: 'documentation',
              status: 'completed',
              completedDate: '2024-01-20',
              description: 'Digital logbook and portfolio configuration',
              priority: 'medium'
            },
            {
              id: 'req3',
              name: 'Mid-placement Assessment',
              category: 'assessment',
              status: 'pending',
              dueDate: '2024-03-15',
              description: 'Mid-term competency assessment',
              priority: 'high'
            }
          ],
          issues: []
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'Michael Chen',
          studentEmail: 'michael.chen@email.com',
          placementId: 'PLC002',
          placementTitle: 'Marketing Assistant Placement',
          rtoName: 'Business College Victoria',
          overallStatus: 'at-risk',
          complianceScore: 72,
          lastUpdated: '2024-01-27T14:30:00Z',
          nextReviewDate: '2024-02-05',
          supervisorName: 'Sarah Johnson',
          supervisorEmail: 'sarah.johnson@company.com',
          requirements: [
            {
              id: 'req4',
              name: 'Work Health & Safety Induction',
              category: 'safety',
              status: 'completed',
              completedDate: '2024-01-10',
              description: 'Completed workplace safety training and assessment',
              priority: 'high'
            },
            {
              id: 'req5',
              name: 'Marketing Software Training',
              category: 'training',
              status: 'overdue',
              dueDate: '2024-01-25',
              description: 'Adobe Creative Suite and marketing tools training',
              priority: 'medium'
            },
            {
              id: 'req6',
              name: 'Weekly Progress Reports',
              category: 'documentation',
              status: 'pending',
              dueDate: '2024-02-02',
              description: 'Weekly placement progress documentation',
              priority: 'low'
            }
          ],
          issues: [
            {
              id: 'iss1',
              type: 'overdue-assessment',
              title: 'Overdue Software Training',
              description: 'Marketing software training was due on 25th January but not completed',
              severity: 'medium',
              createdAt: '2024-01-26T09:00:00Z',
              assignedTo: 'supervisor'
            }
          ]
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Sarah Williams',
          studentEmail: 'sarah.williams@email.com',
          placementId: 'PLC003',
          placementTitle: 'Data Analytics Placement',
          rtoName: 'Analytics Academy',
          overallStatus: 'non-compliant',
          complianceScore: 45,
          lastUpdated: '2024-01-25T16:00:00Z',
          nextReviewDate: '2024-01-30',
          supervisorName: 'Mike Chen',
          supervisorEmail: 'mike.chen@company.com',
          requirements: [
            {
              id: 'req7',
              name: 'Work Health & Safety Induction',
              category: 'safety',
              status: 'overdue',
              dueDate: '2024-01-20',
              description: 'Completed workplace safety training and assessment',
              priority: 'high'
            },
            {
              id: 'req8',
              name: 'Data Privacy Certification',
              category: 'training',
              status: 'overdue',
              dueDate: '2024-01-22',
              description: 'Data handling and privacy compliance training',
              priority: 'high'
            },
            {
              id: 'req9',
              name: 'Technical Skills Assessment',
              category: 'assessment',
              status: 'pending',
              dueDate: '2024-02-10',
              description: 'Python and SQL competency assessment',
              priority: 'medium'
            }
          ],
          issues: [
            {
              id: 'iss2',
              type: 'safety-concern',
              title: 'Missing Safety Induction',
              description: 'Student has not completed mandatory safety induction training',
              severity: 'critical',
              createdAt: '2024-01-21T08:00:00Z',
              assignedTo: 'provider'
            },
            {
              id: 'iss3',
              type: 'training-gap',
              title: 'Data Privacy Training Overdue',
              description: 'Critical data privacy certification is overdue',
              severity: 'high',
              createdAt: '2024-01-23T12:00:00Z',
              assignedTo: 'rto'
            }
          ]
        }
      ];

      setStudents(mockStudents);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch student compliance data. Please try again.",
        variant: "destructive",
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
        student.placementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rtoName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.overallStatus === statusFilter);
    }

    setFilteredStudents(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'at-risk':
        return <Badge className="bg-yellow-100 text-yellow-800">At Risk</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRequirementStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'not-applicable':
        return <Badge variant="secondary">N/A</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getIssueSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const handleResolveIssue = async (studentId: string, issueId: string) => {
    try {
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? {
              ...student,
              issues: student.issues.map(issue =>
                issue.id === issueId
                  ? { ...issue, resolvedAt: new Date().toISOString() }
                  : issue
              ),
              lastUpdated: new Date().toISOString()
            }
          : student
      ));

      toast({
        title: "Success",
        description: "Issue marked as resolved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve issue. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportReport = async () => {
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Compliance report exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getComplianceStats = () => {
    const total = students.length;
    const compliant = students.filter(s => s.overallStatus === 'compliant').length;
    const atRisk = students.filter(s => s.overallStatus === 'at-risk').length;
    const nonCompliant = students.filter(s => s.overallStatus === 'non-compliant').length;
    const avgScore = students.reduce((sum, s) => sum + s.complianceScore, 0) / total || 0;

    return { total, compliant, atRisk, nonCompliant, avgScore };
  };

  const stats = getComplianceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Compliance Tracker</h1>
          <p className="text-gray-600 mt-2">Monitor and manage student compliance across all placements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchStudentCompliance}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-gray-900">{stats.compliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-gray-900">{stats.atRisk}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nonCompliant}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgScore.toFixed(1)}%</p>
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
                  placeholder="Search students by name, placement, or RTO"
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
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid gap-6">
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No student compliance data available.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{student.studentName}</h3>
                      {getStatusBadge(student.overallStatus)}
                      <div className="ml-2">
                        <span className="text-sm text-gray-600">Score: </span>
                        <span className="font-semibold">{student.complianceScore}%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {student.placementTitle}
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4" />
                        {student.rtoName}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {student.supervisorName}
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Compliance Progress</span>
                        <span>{student.complianceScore}%</span>
                      </div>
                      <Progress value={student.complianceScore} className="h-2" />
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setSelectedStudent(student)}>
                        <FileText className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{student.studentName} - Compliance Details</DialogTitle>
                        <DialogDescription>
                          Detailed compliance status and requirements for this student's placement
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Tabs defaultValue="requirements" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="requirements">Requirements</TabsTrigger>
                          <TabsTrigger value="issues">Issues ({student.issues.length})</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="requirements" className="space-y-4">
                          <div className="space-y-3">
                            {student.requirements.map((req) => (
                              <Card key={req.id}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium">{req.name}</h4>
                                        {getRequirementStatusBadge(req.status)}
                                        <Badge variant="outline" className="text-xs">
                                          {req.category}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                                      <div className="flex gap-4 text-xs text-gray-500">
                                        {req.dueDate && (
                                          <span>Due: {new Date(req.dueDate).toLocaleDateString()}</span>
                                        )}
                                        {req.completedDate && (
                                          <span>Completed: {new Date(req.completedDate).toLocaleDateString()}</span>
                                        )}
                                        <span>Priority: {req.priority}</span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="issues" className="space-y-4">
                          {student.issues.length === 0 ? (
                            <div className="text-center py-8">
                              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                              <p className="text-gray-600">No compliance issues found</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {student.issues.map((issue) => (
                                <Card key={issue.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <h4 className="font-medium">{issue.title}</h4>
                                          {getIssueSeverityBadge(issue.severity)}
                                          {issue.resolvedAt && (
                                            <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                        <div className="flex gap-4 text-xs text-gray-500">
                                          <span>Created: {new Date(issue.createdAt).toLocaleDateString()}</span>
                                          {issue.assignedTo && <span>Assigned to: {issue.assignedTo}</span>}
                                          {issue.resolvedAt && (
                                            <span>Resolved: {new Date(issue.resolvedAt).toLocaleDateString()}</span>
                                          )}
                                        </div>
                                      </div>
                                      {!issue.resolvedAt && (
                                        <Button 
                                          size="sm" 
                                          onClick={() => handleResolveIssue(student.id, issue.id)}
                                        >
                                          Resolve
                                        </Button>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                      
                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          Last updated: {new Date(student.lastUpdated).toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">
                          Next review: {new Date(student.nextReviewDate).toLocaleDateString()}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {student.issues.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {student.issues.filter(i => !i.resolvedAt).length} Active Issues
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {student.issues.filter(i => !i.resolvedAt).slice(0, 2).map((issue) => (
                        <div key={issue.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {issue.title}
                        </div>
                      ))}
                      {student.issues.filter(i => !i.resolvedAt).length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{student.issues.filter(i => !i.resolvedAt).length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}