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
  Activity, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  Building,
  BookOpen,
  Award,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  XCircle,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface StudentComplianceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  rtoName: string;
  placementTitle: string;
  providerName: string;
  enrollmentDate: string;
  complianceStatus: 'compliant' | 'minor-issues' | 'major-issues' | 'non-compliant' | 'under-review';
  overallScore: number;
  lastReviewDate: string;
  nextReviewDate: string;
  reviewerName: string;
  complianceAreas: ComplianceArea[];
  issuesLog: ComplianceIssue[];
  documents: ComplianceDocument[];
  assessmentProgress: AssessmentProgress;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  actionItemsCount: number;
  escalationRequired: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ComplianceArea {
  id: string;
  name: string;
  category: 'academic' | 'workplace-safety' | 'attendance' | 'documentation' | 'competency' | 'conduct';
  status: 'compliant' | 'warning' | 'non-compliant' | 'not-assessed';
  score: number;
  maxScore: number;
  requirements: ComplianceRequirement[];
  lastAssessed: string;
  assessorNotes: string;
  evidenceRequired: boolean;
  evidenceSubmitted: boolean;
}

interface ComplianceRequirement {
  id: string;
  description: string;
  status: 'met' | 'partially-met' | 'not-met' | 'pending';
  evidence: string[];
  dueDate?: string;
  completionDate?: string;
  verifiedBy?: string;
}

interface ComplianceIssue {
  id: string;
  type: 'minor' | 'major' | 'critical';
  category: string;
  description: string;
  identifiedDate: string;
  status: 'open' | 'in-progress' | 'resolved' | 'escalated';
  assignedTo: string;
  dueDate: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  impactLevel: 'low' | 'medium' | 'high';
  preventiveMeasures: string[];
}

interface ComplianceDocument {
  id: string;
  name: string;
  type: 'assessment' | 'evidence' | 'certification' | 'agreement' | 'report';
  status: 'current' | 'expired' | 'pending' | 'rejected';
  uploadDate: string;
  expiryDate?: string;
  verifiedBy?: string;
  verificationDate?: string;
  url: string;
  size: number;
}

interface AssessmentProgress {
  totalUnits: number;
  completedUnits: number;
  inProgressUnits: number;
  notStartedUnits: number;
  competentUnits: number;
  notYetCompetentUnits: number;
  overallProgressPercentage: number;
  expectedCompletionDate: string;
  actualProgressVsExpected: 'ahead' | 'on-track' | 'behind' | 'at-risk';
  milestones: AssessmentMilestone[];
}

interface AssessmentMilestone {
  id: string;
  name: string;
  targetDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completionDate?: string;
  unitsInvolved: string[];
}

export default function StudentCompliancePage() {
  const [complianceRecords, setComplianceRecords] = useState<StudentComplianceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<StudentComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [rtoFilter, setRtoFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<StudentComplianceRecord | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchComplianceRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [complianceRecords, searchTerm, statusFilter, riskFilter, rtoFilter]);

  const fetchComplianceRecords = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRecords: StudentComplianceRecord[] = [
        {
          id: '1',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          studentEmail: 'emily.johnson@email.com',
          rtoName: 'Tech Institute Australia',
          placementTitle: 'Certificate IV in Information Technology',
          providerName: 'TechCorp Solutions',
          enrollmentDate: '2024-01-15',
          complianceStatus: 'compliant',
          overallScore: 92,
          lastReviewDate: '2024-01-25',
          nextReviewDate: '2024-02-25',
          reviewerName: 'Dr. Sarah Williams',
          complianceAreas: [
            {
              id: 'area1',
              name: 'Academic Performance',
              category: 'academic',
              status: 'compliant',
              score: 95,
              maxScore: 100,
              requirements: [
                {
                  id: 'req1',
                  description: 'Maintain minimum GPA of 3.0',
                  status: 'met',
                  evidence: ['Transcript Q1 2024', 'Assessment results'],
                  completionDate: '2024-01-20',
                  verifiedBy: 'Academic Coordinator'
                },
                {
                  id: 'req2',
                  description: 'Submit all required assessments on time',
                  status: 'met',
                  evidence: ['Assessment submission logs'],
                  completionDate: '2024-01-25',
                  verifiedBy: 'Course Assessor'
                }
              ],
              lastAssessed: '2024-01-25',
              assessorNotes: 'Excellent academic performance, consistently meeting all requirements',
              evidenceRequired: true,
              evidenceSubmitted: true
            },
            {
              id: 'area2',
              name: 'Workplace Safety',
              category: 'workplace-safety',
              status: 'compliant',
              score: 88,
              maxScore: 100,
              requirements: [
                {
                  id: 'req3',
                  description: 'Complete workplace safety induction',
                  status: 'met',
                  evidence: ['Safety certificate', 'Induction completion form'],
                  completionDate: '2024-01-16',
                  verifiedBy: 'Safety Officer'
                },
                {
                  id: 'req4',
                  description: 'Maintain safety compliance throughout placement',
                  status: 'met',
                  evidence: ['Weekly safety reports', 'Supervisor observations'],
                  completionDate: '2024-01-25',
                  verifiedBy: 'Workplace Supervisor'
                }
              ],
              lastAssessed: '2024-01-25',
              assessorNotes: 'Strong safety awareness and compliance',
              evidenceRequired: true,
              evidenceSubmitted: true
            }
          ],
          issuesLog: [],
          documents: [
            {
              id: 'doc1',
              name: 'Enrollment Agreement',
              type: 'agreement',
              status: 'current',
              uploadDate: '2024-01-15',
              verifiedBy: 'Enrollment Officer',
              verificationDate: '2024-01-15',
              url: '/documents/enrollment-agreement.pdf',
              size: 512000
            },
            {
              id: 'doc2',
              name: 'Academic Transcript Q1',
              type: 'assessment',
              status: 'current',
              uploadDate: '2024-01-20',
              verifiedBy: 'Academic Coordinator',
              verificationDate: '2024-01-21',
              url: '/documents/transcript-q1.pdf',
              size: 256000
            }
          ],
          assessmentProgress: {
            totalUnits: 12,
            completedUnits: 8,
            inProgressUnits: 3,
            notStartedUnits: 1,
            competentUnits: 8,
            notYetCompetentUnits: 0,
            overallProgressPercentage: 75,
            expectedCompletionDate: '2024-06-30',
            actualProgressVsExpected: 'ahead',
            milestones: [
              {
                id: 'mile1',
                name: 'Foundation Units Complete',
                targetDate: '2024-02-28',
                status: 'completed',
                completionDate: '2024-02-15',
                unitsInvolved: ['ICTICT001', 'ICTICT002', 'ICTICT003']
              },
              {
                id: 'mile2',
                name: 'Core Units 50% Complete',
                targetDate: '2024-04-30',
                status: 'pending',
                unitsInvolved: ['ICTICT004', 'ICTICT005', 'ICTICT006']
              }
            ]
          },
          riskLevel: 'low',
          actionItemsCount: 0,
          escalationRequired: false,
          notes: 'Exemplary student with strong academic and workplace performance',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-25T15:30:00Z'
        },
        {
          id: '2',
          studentId: 'STU002',
          studentName: 'James Wilson',
          studentEmail: 'james.wilson@email.com',
          rtoName: 'Business Excellence Institute',
          placementTitle: 'Diploma of Business Administration',
          providerName: 'Corporate Services Ltd',
          enrollmentDate: '2024-01-10',
          complianceStatus: 'minor-issues',
          overallScore: 78,
          lastReviewDate: '2024-01-20',
          nextReviewDate: '2024-02-20',
          reviewerName: 'Mark Thompson',
          complianceAreas: [
            {
              id: 'area3',
              name: 'Attendance',
              category: 'attendance',
              status: 'warning',
              score: 75,
              maxScore: 100,
              requirements: [
                {
                  id: 'req5',
                  description: 'Maintain 90% attendance rate',
                  status: 'partially-met',
                  evidence: ['Attendance records', 'Leave applications'],
                  dueDate: '2024-02-20'
                },
                {
                  id: 'req6',
                  description: 'Notify absences within 24 hours',
                  status: 'not-met',
                  evidence: ['Communication logs'],
                  dueDate: '2024-02-15'
                }
              ],
              lastAssessed: '2024-01-20',
              assessorNotes: 'Attendance concerns identified, improvement plan initiated',
              evidenceRequired: true,
              evidenceSubmitted: false
            }
          ],
          issuesLog: [
            {
              id: 'issue1',
              type: 'minor',
              category: 'attendance',
              description: 'Attendance below required threshold (85% vs required 90%)',
              identifiedDate: '2024-01-18',
              status: 'in-progress',
              assignedTo: 'Student Support Officer',
              dueDate: '2024-02-15',
              impactLevel: 'medium',
              preventiveMeasures: [
                'Weekly check-ins with student support',
                'Flexible scheduling arrangements',
                'Personal support plan implementation'
              ]
            }
          ],
          documents: [
            {
              id: 'doc3',
              name: 'Attendance Improvement Plan',
              type: 'report',
              status: 'current',
              uploadDate: '2024-01-20',
              url: '/documents/attendance-plan.pdf',
              size: 128000
            }
          ],
          assessmentProgress: {
            totalUnits: 10,
            completedUnits: 4,
            inProgressUnits: 4,
            notStartedUnits: 2,
            competentUnits: 4,
            notYetCompetentUnits: 0,
            overallProgressPercentage: 50,
            expectedCompletionDate: '2024-08-30',
            actualProgressVsExpected: 'behind',
            milestones: [
              {
                id: 'mile3',
                name: 'Core Business Units',
                targetDate: '2024-03-31',
                status: 'pending',
                unitsInvolved: ['BSB001', 'BSB002', 'BSB003']
              }
            ]
          },
          riskLevel: 'medium',
          actionItemsCount: 2,
          escalationRequired: false,
          notes: 'Student experiencing attendance challenges, support measures in place',
          createdAt: '2024-01-10T09:00:00Z',
          updatedAt: '2024-01-20T14:00:00Z'
        },
        {
          id: '3',
          studentId: 'STU003',
          studentName: 'Sarah Chen',
          studentEmail: 'sarah.chen@email.com',
          rtoName: 'Health Sciences Academy',
          placementTitle: 'Certificate III in Individual Support',
          providerName: 'Community Care Services',
          enrollmentDate: '2024-01-08',
          complianceStatus: 'major-issues',
          overallScore: 65,
          lastReviewDate: '2024-01-22',
          nextReviewDate: '2024-02-05',
          reviewerName: 'Lisa Anderson',
          complianceAreas: [
            {
              id: 'area4',
              name: 'Competency Assessment',
              category: 'competency',
              status: 'non-compliant',
              score: 60,
              maxScore: 100,
              requirements: [
                {
                  id: 'req7',
                  description: 'Complete all practical assessments',
                  status: 'not-met',
                  evidence: [],
                  dueDate: '2024-02-05'
                },
                {
                  id: 'req8',
                  description: 'Demonstrate competency standards',
                  status: 'partially-met',
                  evidence: ['Partial assessment submissions'],
                  dueDate: '2024-02-10'
                }
              ],
              lastAssessed: '2024-01-22',
              assessorNotes: 'Significant gaps in competency demonstration, intensive support required',
              evidenceRequired: true,
              evidenceSubmitted: false
            }
          ],
          issuesLog: [
            {
              id: 'issue2',
              type: 'major',
              category: 'competency',
              description: 'Student not meeting competency requirements for core units',
              identifiedDate: '2024-01-20',
              status: 'escalated',
              assignedTo: 'Senior Assessor',
              dueDate: '2024-02-05',
              impactLevel: 'high',
              preventiveMeasures: [
                'Additional assessment opportunities',
                'One-on-one coaching sessions',
                'Skills gap analysis and targeted training'
              ]
            }
          ],
          documents: [
            {
              id: 'doc4',
              name: 'Competency Gap Analysis',
              type: 'assessment',
              status: 'current',
              uploadDate: '2024-01-22',
              url: '/documents/gap-analysis.pdf',
              size: 384000
            }
          ],
          assessmentProgress: {
            totalUnits: 8,
            completedUnits: 2,
            inProgressUnits: 3,
            notStartedUnits: 3,
            competentUnits: 2,
            notYetCompetentUnits: 1,
            overallProgressPercentage: 30,
            expectedCompletionDate: '2024-07-31',
            actualProgressVsExpected: 'at-risk',
            milestones: [
              {
                id: 'mile4',
                name: 'Foundation Competencies',
                targetDate: '2024-02-29',
                status: 'overdue',
                unitsInvolved: ['CHC001', 'CHC002']
              }
            ]
          },
          riskLevel: 'high',
          actionItemsCount: 4,
          escalationRequired: true,
          notes: 'Student requires intensive support and intervention to meet program requirements',
          createdAt: '2024-01-08T11:00:00Z',
          updatedAt: '2024-01-22T16:45:00Z'
        }
      ];

      setComplianceRecords(mockRecords);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch compliance records. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = complianceRecords;

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.placementTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.rtoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.providerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(record => record.complianceStatus === statusFilter);
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(record => record.riskLevel === riskFilter);
    }

    if (rtoFilter !== 'all') {
      filtered = filtered.filter(record => record.rtoName === rtoFilter);
    }

    setFilteredRecords(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'minor-issues':
        return <Badge className="bg-yellow-100 text-yellow-800">Minor Issues</Badge>;
      case 'major-issues':
        return <Badge className="bg-orange-100 text-orange-800">Major Issues</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      case 'under-review':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High Risk</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical Risk</Badge>;
      default:
        return <Badge variant="secondary">{risk}</Badge>;
    }
  };

  const getProgressIndicator = (progress: AssessmentProgress) => {
    const { actualProgressVsExpected } = progress;
    switch (actualProgressVsExpected) {
      case 'ahead':
        return <Badge className="bg-green-100 text-green-800">Ahead</Badge>;
      case 'on-track':
        return <Badge className="bg-blue-100 text-blue-800">On Track</Badge>;
      case 'behind':
        return <Badge className="bg-orange-100 text-orange-800">Behind</Badge>;
      case 'at-risk':
        return <Badge className="bg-red-100 text-red-800">At Risk</Badge>;
      default:
        return <Badge variant="secondary">{actualProgressVsExpected}</Badge>;
    }
  };

  const getComplianceStats = () => {
    const total = complianceRecords.length;
    const compliant = complianceRecords.filter(record => record.complianceStatus === 'compliant').length;
    const atRisk = complianceRecords.filter(record => record.riskLevel === 'high' || record.riskLevel === 'critical').length;
    const escalationRequired = complianceRecords.filter(record => record.escalationRequired).length;
    const avgScore = complianceRecords.reduce((sum, record) => sum + record.overallScore, 0) / total || 0;

    return { total, compliant, atRisk, escalationRequired, avgScore };
  };

  const stats = getComplianceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Compliance Review</h1>
          <p className="text-gray-600 mt-2">Monitor and assess student compliance across all placement programs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchComplianceRecords}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
                <p className="text-sm font-medium text-gray-600">Escalation Required</p>
                <p className="text-2xl font-bold text-gray-900">{stats.escalationRequired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search by student name, email, placement, or RTO"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="minor-issues">Minor Issues</SelectItem>
                  <SelectItem value="major-issues">Major Issues</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Records List */}
      <div className="grid gap-6">
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No compliance records found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || riskFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No compliance records available.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{record.studentName}</h3>
                      {getStatusBadge(record.complianceStatus)}
                      {getRiskBadge(record.riskLevel)}
                      {record.escalationRequired && (
                        <Badge variant="destructive">Escalation Required</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {record.studentEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {record.rtoName}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {record.placementTitle}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Overall Score:</span>
                        <Badge variant="outline">{record.overallScore}%</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Progress:</span>
                        {getProgressIndicator(record.assessmentProgress)}
                        <span className="text-xs text-gray-500">
                          ({record.assessmentProgress.overallProgressPercentage}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Action Items:</span>
                        <Badge variant={record.actionItemsCount > 0 ? "destructive" : "outline"}>
                          {record.actionItemsCount}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{record.studentName} - Compliance Review</DialogTitle>
                          <DialogDescription>
                            {record.placementTitle} • {record.rtoName} • Last reviewed: {new Date(record.lastReviewDate).toLocaleDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="compliance">Compliance Areas</TabsTrigger>
                            <TabsTrigger value="progress">Assessment Progress</TabsTrigger>
                            <TabsTrigger value="issues">Issues & Actions</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Student Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium">Name</Label>
                                    <p className="text-sm text-gray-600">{record.studentName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Email</Label>
                                    <p className="text-sm text-gray-600">{record.studentEmail}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Placement</Label>
                                    <p className="text-sm text-gray-600">{record.placementTitle}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Provider</Label>
                                    <p className="text-sm text-gray-600">{record.providerName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Enrollment Date</Label>
                                    <p className="text-sm text-gray-600">{new Date(record.enrollmentDate).toLocaleDateString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Compliance Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Status</span>
                                    {getStatusBadge(record.complianceStatus)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Risk Level</span>
                                    {getRiskBadge(record.riskLevel)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Overall Score</span>
                                    <span className="text-sm font-semibold">{record.overallScore}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Last Review</span>
                                    <span className="text-sm">{new Date(record.lastReviewDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Next Review</span>
                                    <span className="text-sm">{new Date(record.nextReviewDate).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Reviewer</span>
                                    <span className="text-sm">{record.reviewerName}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            {record.notes && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Assessor Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-700">{record.notes}</p>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="compliance" className="space-y-4">
                            <div className="space-y-4">
                              {record.complianceAreas.map((area) => (
                                <Card key={area.id}>
                                  <CardHeader>
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-lg">{area.name}</CardTitle>
                                      <div className="text-right">
                                        <p className="text-sm font-medium">Score: {area.score}/{area.maxScore}</p>
                                        <Badge variant={area.status === 'compliant' ? 'default' : 'destructive'}>
                                          {area.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Requirements</Label>
                                        <div className="mt-2 space-y-2">
                                          {area.requirements.map((req) => (
                                            <div key={req.id} className="border rounded-lg p-3">
                                              <div className="flex justify-between items-start mb-2">
                                                <p className="text-sm font-medium">{req.description}</p>
                                                <Badge variant={
                                                  req.status === 'met' ? 'default' :
                                                  req.status === 'partially-met' ? 'secondary' :
                                                  req.status === 'not-met' ? 'destructive' :
                                                  'outline'
                                                }>
                                                  {req.status.replace('-', ' ')}
                                                </Badge>
                                              </div>
                                              {req.evidence.length > 0 && (
                                                <div className="text-xs text-gray-600 mb-1">
                                                  <span className="font-medium">Evidence:</span> {req.evidence.join(', ')}
                                                </div>
                                              )}
                                              {req.completionDate && (
                                                <div className="text-xs text-gray-600">
                                                  <span className="font-medium">Completed:</span> {new Date(req.completionDate).toLocaleDateString()}
                                                  {req.verifiedBy && <span> by {req.verifiedBy}</span>}
                                                </div>
                                              )}
                                              {req.dueDate && !req.completionDate && (
                                                <div className="text-xs text-gray-600">
                                                  <span className="font-medium">Due:</span> {new Date(req.dueDate).toLocaleDateString()}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      {area.assessorNotes && (
                                        <div>
                                          <Label className="text-sm font-medium">Assessor Notes</Label>
                                          <p className="text-sm text-gray-600 mt-1">{area.assessorNotes}</p>
                                        </div>
                                      )}
                                      
                                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                        <div>
                                          <span className="font-medium">Last Assessed:</span> {new Date(area.lastAssessed).toLocaleDateString()}
                                        </div>
                                        <div>
                                          <span className="font-medium">Evidence Status:</span> {
                                            area.evidenceRequired ? 
                                            (area.evidenceSubmitted ? 'Submitted' : 'Required') : 
                                            'Not Required'
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="progress" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Assessment Progress Overview</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-6">
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Total Units:</span>
                                      <span className="text-sm">{record.assessmentProgress.totalUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Completed:</span>
                                      <span className="text-sm text-green-600 font-semibold">{record.assessmentProgress.completedUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">In Progress:</span>
                                      <span className="text-sm text-blue-600 font-semibold">{record.assessmentProgress.inProgressUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Not Started:</span>
                                      <span className="text-sm text-gray-600">{record.assessmentProgress.notStartedUnits}</span>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Competent:</span>
                                      <span className="text-sm text-green-600 font-semibold">{record.assessmentProgress.competentUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Not Yet Competent:</span>
                                      <span className="text-sm text-orange-600 font-semibold">{record.assessmentProgress.notYetCompetentUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Overall Progress:</span>
                                      <span className="text-sm font-semibold">{record.assessmentProgress.overallProgressPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm font-medium">Progress Status:</span>
                                      {getProgressIndicator(record.assessmentProgress)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="mt-4">
                                  <Label className="text-sm font-medium">Expected Completion</Label>
                                  <p className="text-sm text-gray-600">{new Date(record.assessmentProgress.expectedCompletionDate).toLocaleDateString()}</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Milestones</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {record.assessmentProgress.milestones.map((milestone) => (
                                    <div key={milestone.id} className="border rounded-lg p-3">
                                      <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium">{milestone.name}</h4>
                                        <Badge variant={
                                          milestone.status === 'completed' ? 'default' :
                                          milestone.status === 'overdue' ? 'destructive' :
                                          'outline'
                                        }>
                                          {milestone.status}
                                        </Badge>
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        <p>Target: {new Date(milestone.targetDate).toLocaleDateString()}</p>
                                        {milestone.completionDate && (
                                          <p>Completed: {new Date(milestone.completionDate).toLocaleDateString()}</p>
                                        )}
                                        <p>Units: {milestone.unitsInvolved.join(', ')}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="issues" className="space-y-4">
                            {record.issuesLog.length > 0 ? (
                              <div className="space-y-4">
                                {record.issuesLog.map((issue) => (
                                  <Card key={issue.id}>
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <h4 className="font-medium">{issue.category}</h4>
                                            <Badge variant={
                                              issue.type === 'critical' ? 'destructive' :
                                              issue.type === 'major' ? 'destructive' :
                                              'secondary'
                                            }>
                                              {issue.type}
                                            </Badge>
                                            <Badge variant={
                                              issue.impactLevel === 'high' ? 'destructive' :
                                              issue.impactLevel === 'medium' ? 'secondary' :
                                              'outline'
                                            }>
                                              {issue.impactLevel} impact
                                            </Badge>
                                          </div>
                                          <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                                          <div className="text-sm text-gray-600">
                                            <p>Identified: {new Date(issue.identifiedDate).toLocaleDateString()}</p>
                                            <p>Assigned to: {issue.assignedTo}</p>
                                            <p>Due: {new Date(issue.dueDate).toLocaleDateString()}</p>
                                            {issue.resolutionDate && (
                                              <p>Resolved: {new Date(issue.resolutionDate).toLocaleDateString()}</p>
                                            )}
                                          </div>
                                          {issue.preventiveMeasures.length > 0 && (
                                            <div className="mt-3">
                                              <Label className="text-sm font-medium">Preventive Measures</Label>
                                              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                                                {issue.preventiveMeasures.map((measure, index) => (
                                                  <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                    {measure}
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {issue.resolutionNotes && (
                                            <div className="mt-3">
                                              <Label className="text-sm font-medium">Resolution Notes</Label>
                                              <p className="text-sm text-gray-600 mt-1">{issue.resolutionNotes}</p>
                                            </div>
                                          )}
                                        </div>
                                        <Badge variant={
                                          issue.status === 'resolved' ? 'default' :
                                          issue.status === 'escalated' ? 'destructive' :
                                          issue.status === 'in-progress' ? 'secondary' :
                                          'outline'
                                        }>
                                          {issue.status}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <Card>
                                <CardContent className="p-8 text-center">
                                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Issues Identified</h3>
                                  <p className="text-gray-600">This student currently has no compliance issues on record.</p>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="documents" className="space-y-4">
                            <div className="space-y-3">
                              {record.documents.map((doc) => (
                                <Card key={doc.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium">{doc.name}</h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>Type: {doc.type}</p>
                                          <p>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                          <p>Size: {(doc.size / 1024).toFixed(1)} KB</p>
                                          {doc.expiryDate && (
                                            <p>Expires: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                                          )}
                                          {doc.verifiedBy && (
                                            <p>Verified by: {doc.verifiedBy} on {doc.verificationDate && new Date(doc.verificationDate).toLocaleDateString()}</p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-2 items-end">
                                        <Badge variant={
                                          doc.status === 'current' ? 'default' :
                                          doc.status === 'expired' ? 'destructive' :
                                          doc.status === 'rejected' ? 'destructive' :
                                          'secondary'
                                        }>
                                          {doc.status}
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {record.issuesLog.filter(issue => issue.status !== 'resolved').length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {record.issuesLog.filter(issue => issue.status !== 'resolved').length} Open Issues
                      </span>
                    </div>
                    <div className="space-y-1">
                      {record.issuesLog.filter(issue => issue.status !== 'resolved').slice(0, 2).map((issue) => (
                        <div key={issue.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {issue.description}
                        </div>
                      ))}
                      {record.issuesLog.filter(issue => issue.status !== 'resolved').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{record.issuesLog.filter(issue => issue.status !== 'resolved').length - 2} more issues
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