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
  FileText, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  Building,
  Award,
  TrendingUp,
  Activity,
  Edit3,
  Save,
  X,
  Download,
  Upload
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DigitalLogbookEntry {
  id: string;
  logbookId: string;
  studentId: string;
  studentName: string;
  rtoName: string;
  placementTitle: string;
  providerName: string;
  entryDate: string;
  entryType: 'daily-reflection' | 'competency-observation' | 'skill-demonstration' | 'learning-milestone' | 'assessment-evidence' | 'workplace-feedback';
  unitCode?: string;
  unitTitle?: string;
  competencyElements: string[];
  description: string;
  skillsApplied: string[];
  learningOutcomes: string[];
  challengesEncountered: string[];
  supportReceived: string[];
  evidenceAttached: LogbookAttachment[];
  supervisorComments?: string;
  assessorComments?: string;
  verificationStatus: 'pending' | 'verified' | 'requires-clarification' | 'rejected';
  verifiedBy?: string;
  verificationDate?: string;
  auditTrail: AuditTrailEntry[];
  qualityScore: number;
  complianceFlags: ComplianceFlag[];
  workplaceContext: WorkplaceContext;
  reflectionQuestions: ReflectionResponse[];
  createdAt: string;
  updatedAt: string;
}

interface LogbookAttachment {
  id: string;
  name: string;
  type: string;
  category: 'photo' | 'document' | 'video' | 'audio' | 'work-sample';
  url: string;
  description: string;
  evidenceType: 'direct' | 'indirect' | 'supplementary';
  uploadedAt: string;
  size: number;
  verified: boolean;
}

interface AuditTrailEntry {
  id: string;
  action: 'created' | 'modified' | 'verified' | 'commented' | 'flagged' | 'approved';
  performedBy: string;
  performedAt: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}

interface ComplianceFlag {
  id: string;
  type: 'missing-evidence' | 'insufficient-detail' | 'safety-concern' | 'quality-issue' | 'timing-discrepancy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  identifiedBy: string;
  identifiedAt: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'escalated';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface WorkplaceContext {
  supervisor: string;
  department: string;
  workEnvironment: string;
  safetyRequirements: string[];
  toolsEquipmentUsed: string[];
  clientInteraction: boolean;
  teamCollaboration: string[];
  qualityStandards: string[];
}

interface ReflectionResponse {
  question: string;
  response: string;
  wordCount: number;
  assessorFeedback?: string;
}

export default function DigitalLogbookPage() {
  const [logbookEntries, setLogbookEntries] = useState<DigitalLogbookEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<DigitalLogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [studentFilter, setStudentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<DigitalLogbookEntry | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchLogbookEntries();
  }, []);

  useEffect(() => {
    filterEntries();
  }, [logbookEntries, searchTerm, statusFilter, typeFilter, studentFilter, dateFilter]);

  const fetchLogbookEntries = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockEntries: DigitalLogbookEntry[] = [
        {
          id: '1',
          logbookId: 'LOG-2024-001',
          studentId: 'STU001',
          studentName: 'Emily Johnson',
          rtoName: 'Tech Institute Australia',
          placementTitle: 'Certificate IV in Information Technology',
          providerName: 'TechCorp Solutions',
          entryDate: '2024-01-25',
          entryType: 'competency-observation',
          unitCode: 'ICTICT308',
          unitTitle: 'Use advanced features of computer applications',
          competencyElements: [
            'Plan use of advanced features',
            'Use advanced features to complete tasks',
            'Customise software applications'
          ],
          description: 'Today I successfully implemented advanced Excel functions to automate a complex data analysis task for the sales team. I created custom macros to process monthly sales reports and generate automated charts and pivot tables.',
          skillsApplied: [
            'Advanced Excel functions (VLOOKUP, INDEX, MATCH)',
            'VBA macro programming',
            'Data visualization techniques',
            'Automation workflow design'
          ],
          learningOutcomes: [
            'Improved understanding of complex Excel functions',
            'Gained confidence in VBA programming',
            'Better appreciation for data automation benefits',
            'Enhanced problem-solving approach to data challenges'
          ],
          challengesEncountered: [
            'Initial difficulty with VBA syntax',
            'Complex nested function logic',
            'Data format inconsistencies'
          ],
          supportReceived: [
            'Supervisor provided VBA reference materials',
            'Peer assistance with debugging',
            'Online tutorial resources'
          ],
          evidenceAttached: [
            {
              id: 'att1',
              name: 'Excel_Macro_Screenshot.png',
              type: 'image/png',
              category: 'photo',
              url: '/evidence/excel-macro.png',
              description: 'Screenshot of custom macro interface and code',
              evidenceType: 'direct',
              uploadedAt: '2024-01-25T16:30:00Z',
              size: 256000,
              verified: true
            },
            {
              id: 'att2',
              name: 'Sales_Report_Output.xlsx',
              type: 'application/vnd.ms-excel',
              category: 'work-sample',
              url: '/evidence/sales-report.xlsx',
              description: 'Completed automated sales report generated by macro',
              evidenceType: 'direct',
              uploadedAt: '2024-01-25T17:00:00Z',
              size: 512000,
              verified: true
            }
          ],
          supervisorComments: 'Emily demonstrated excellent technical skills and problem-solving ability. The automated solution she created will save the sales team approximately 4 hours per week.',
          assessorComments: 'Strong evidence of competency in advanced application features. The macro implementation shows solid understanding of automation principles.',
          verificationStatus: 'verified',
          verifiedBy: 'Dr. Sarah Williams',
          verificationDate: '2024-01-26T10:00:00Z',
          auditTrail: [
            {
              id: 'audit1',
              action: 'created',
              performedBy: 'Emily Johnson',
              performedAt: '2024-01-25T15:00:00Z',
              details: 'Initial logbook entry created'
            },
            {
              id: 'audit2',
              action: 'commented',
              performedBy: 'Mark Thompson (Supervisor)',
              performedAt: '2024-01-25T18:00:00Z',
              details: 'Supervisor feedback added'
            },
            {
              id: 'audit3',
              action: 'verified',
              performedBy: 'Dr. Sarah Williams',
              performedAt: '2024-01-26T10:00:00Z',
              details: 'Entry verified for competency evidence'
            }
          ],
          qualityScore: 92,
          complianceFlags: [],
          workplaceContext: {
            supervisor: 'Mark Thompson',
            department: 'IT Operations',
            workEnvironment: 'Open office environment with dedicated workstations',
            safetyRequirements: ['Ergonomic workspace setup', 'Regular breaks for eye strain prevention'],
            toolsEquipmentUsed: ['Microsoft Excel 365', 'VBA Editor', 'Corporate laptop'],
            clientInteraction: false,
            teamCollaboration: ['Sales team consultation', 'IT peer review'],
            qualityStandards: ['Code documentation', 'Testing protocols', 'User acceptance criteria']
          },
          reflectionQuestions: [
            {
              question: 'How did this task contribute to your overall learning objectives?',
              response: 'This task directly addressed my learning objective of mastering advanced Excel features. It provided practical application of theoretical knowledge and demonstrated how automation can improve workplace efficiency.',
              wordCount: 156,
              assessorFeedback: 'Good reflection on learning outcomes and practical application'
            },
            {
              question: 'What would you do differently if faced with a similar challenge?',
              response: 'I would start by creating a detailed plan and pseudocode before beginning the VBA implementation. This would help identify potential issues earlier and create a more structured approach.',
              wordCount: 134,
              assessorFeedback: 'Excellent self-awareness and improvement planning'
            }
          ],
          createdAt: '2024-01-25T15:00:00Z',
          updatedAt: '2024-01-26T10:00:00Z'
        },
        {
          id: '2',
          logbookId: 'LOG-2024-002',
          studentId: 'STU002',
          studentName: 'James Wilson',
          rtoName: 'Business Excellence Institute',
          placementTitle: 'Diploma of Business Administration',
          providerName: 'Corporate Services Ltd',
          entryDate: '2024-01-24',
          entryType: 'daily-reflection',
          competencyElements: [
            'Communicate effectively with stakeholders',
            'Manage workplace relationships',
            'Coordinate team activities'
          ],
          description: 'Participated in quarterly team meeting where I took meeting minutes and coordinated follow-up actions. Practiced professional communication skills and learned about project management processes.',
          skillsApplied: [
            'Meeting facilitation support',
            'Minute taking and documentation',
            'Action item tracking',
            'Professional communication'
          ],
          learningOutcomes: [
            'Improved note-taking efficiency',
            'Better understanding of meeting structure',
            'Enhanced listening and summarization skills'
          ],
          challengesEncountered: [
            'Keeping up with fast-paced discussion',
            'Identifying key action items',
            'Technical terminology comprehension'
          ],
          supportReceived: [
            'Meeting chair provided agenda in advance',
            'Colleague explained technical terms',
            'Supervisor reviewed draft minutes'
          ],
          evidenceAttached: [
            {
              id: 'att3',
              name: 'Meeting_Minutes_Draft.docx',
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              category: 'document',
              url: '/evidence/meeting-minutes.docx',
              description: 'Draft meeting minutes with supervisor annotations',
              evidenceType: 'direct',
              uploadedAt: '2024-01-24T16:45:00Z',
              size: 128000,
              verified: false
            }
          ],
          supervisorComments: 'James showed good initiative in the meeting. His minutes were comprehensive but need some formatting improvements.',
          verificationStatus: 'requires-clarification',
          auditTrail: [
            {
              id: 'audit4',
              action: 'created',
              performedBy: 'James Wilson',
              performedAt: '2024-01-24T15:30:00Z',
              details: 'Daily reflection entry created'
            },
            {
              id: 'audit5',
              action: 'flagged',
              performedBy: 'System',
              performedAt: '2024-01-24T16:00:00Z',
              details: 'Flagged for insufficient evidence attachment'
            }
          ],
          qualityScore: 68,
          complianceFlags: [
            {
              id: 'flag1',
              type: 'insufficient-detail',
              severity: 'medium',
              description: 'Reflection lacks specific examples of communication techniques used',
              identifiedBy: 'Automated Quality Check',
              identifiedAt: '2024-01-24T16:00:00Z',
              status: 'open'
            }
          ],
          workplaceContext: {
            supervisor: 'Lisa Anderson',
            department: 'Business Operations',
            workEnvironment: 'Conference room meeting setting',
            safetyRequirements: ['COVID-19 protocols'],
            toolsEquipmentUsed: ['Laptop', 'Meeting room AV equipment', 'Microsoft Word'],
            clientInteraction: false,
            teamCollaboration: ['Cross-departmental team interaction'],
            qualityStandards: ['Professional communication standards', 'Document formatting requirements']
          },
          reflectionQuestions: [
            {
              question: 'What specific communication skills did you practice today?',
              response: 'I practiced active listening, professional note-taking, and asking clarifying questions when needed.',
              wordCount: 87,
              assessorFeedback: 'Please provide more specific examples and details about how these skills were applied'
            }
          ],
          createdAt: '2024-01-24T15:30:00Z',
          updatedAt: '2024-01-24T16:45:00Z'
        },
        {
          id: '3',
          logbookId: 'LOG-2024-003',
          studentId: 'STU003',
          studentName: 'Sarah Chen',
          rtoName: 'Health Sciences Academy',
          placementTitle: 'Certificate III in Individual Support',
          providerName: 'Community Care Services',
          entryDate: '2024-01-26',
          entryType: 'assessment-evidence',
          unitCode: 'CHCCOM005',
          unitTitle: 'Communicate and work in health or community services',
          competencyElements: [
            'Communicate effectively with people',
            'Communicate effectively in the workplace',
            'Complete workplace documentation'
          ],
          description: 'Conducted client interaction session focused on establishing rapport and gathering needs assessment information. Practiced therapeutic communication techniques and completed required documentation.',
          skillsApplied: [
            'Active listening techniques',
            'Empathetic communication',
            'Non-verbal communication awareness',
            'Professional documentation'
          ],
          learningOutcomes: [
            'Improved client rapport building',
            'Better understanding of therapeutic communication',
            'Enhanced documentation accuracy',
            'Increased confidence in client interactions'
          ],
          challengesEncountered: [
            'Client initial reluctance to share information',
            'Managing emotional responses',
            'Time management during assessment'
          ],
          supportReceived: [
            'Supervisor observation and coaching',
            'Post-session debriefing',
            'Documentation template guidance'
          ],
          evidenceAttached: [
            {
              id: 'att4',
              name: 'Client_Assessment_Form.pdf',
              type: 'application/pdf',
              category: 'document',
              url: '/evidence/assessment-form.pdf',
              description: 'Completed client needs assessment form (anonymized)',
              evidenceType: 'direct',
              uploadedAt: '2024-01-26T14:30:00Z',
              size: 196000,
              verified: false
            }
          ],
          supervisorComments: 'Sarah demonstrated excellent communication skills and showed genuine empathy. Her documentation was thorough and professional.',
          verificationStatus: 'pending',
          auditTrail: [
            {
              id: 'audit6',
              action: 'created',
              performedBy: 'Sarah Chen',
              performedAt: '2024-01-26T13:00:00Z',
              details: 'Assessment evidence entry created'
            },
            {
              id: 'audit7',
              action: 'commented',
              performedBy: 'Jennifer Brown (Supervisor)',
              performedAt: '2024-01-26T15:00:00Z',
              details: 'Supervisor feedback provided'
            }
          ],
          qualityScore: 85,
          complianceFlags: [
            {
              id: 'flag2',
              type: 'safety-concern',
              severity: 'low',
              description: 'Ensure client confidentiality protocols are clearly documented',
              identifiedBy: 'Jennifer Brown',
              identifiedAt: '2024-01-26T15:00:00Z',
              status: 'acknowledged'
            }
          ],
          workplaceContext: {
            supervisor: 'Jennifer Brown',
            department: 'Community Support Services',
            workEnvironment: 'Private consultation room with comfortable seating',
            safetyRequirements: [
              'Client confidentiality protocols',
              'Emergency contact procedures',
              'Infection control measures'
            ],
            toolsEquipmentUsed: ['Assessment forms', 'Secure computer terminal', 'Privacy screens'],
            clientInteraction: true,
            teamCollaboration: ['Multidisciplinary team consultation'],
            qualityStandards: [
              'Person-centered care approach',
              'Confidentiality compliance',
              'Professional boundary maintenance'
            ]
          },
          reflectionQuestions: [
            {
              question: 'How did you adapt your communication style to meet the client\'s needs?',
              response: 'I noticed the client was initially hesitant, so I slowed my pace, used more open-ended questions, and maintained comfortable eye contact. I also mirrored their communication style to build rapport.',
              wordCount: 198,
              assessorFeedback: 'Excellent awareness of adaptive communication techniques'
            },
            {
              question: 'What ethical considerations did you need to address during this interaction?',
              response: 'I ensured informed consent was obtained, maintained confidentiality throughout, respected client autonomy in decision-making, and was transparent about the limits of my role as a student.',
              wordCount: 165,
              assessorFeedback: 'Strong understanding of ethical practice requirements'
            }
          ],
          createdAt: '2024-01-26T13:00:00Z',
          updatedAt: '2024-01-26T15:00:00Z'
        }
      ];

      setLogbookEntries(mockEntries);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch logbook entries. Please try again.",
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
        entry.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.logbookId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.rtoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.unitCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.unitTitle?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(entry => entry.verificationStatus === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.entryType === typeFilter);
    }

    if (studentFilter !== 'all') {
      filtered = filtered.filter(entry => entry.studentId === studentFilter);
    }

    if (dateFilter !== 'all') {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(entry => entry.entryDate === todayStr);
          break;
        case 'week':
          filtered = filtered.filter(entry => entry.entryDate >= weekAgo);
          break;
        case 'month':
          filtered = filtered.filter(entry => entry.entryDate >= monthAgo);
          break;
      }
    }

    setFilteredEntries(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'requires-clarification':
        return <Badge className="bg-orange-100 text-orange-800">Needs Clarification</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      'daily-reflection': 'Daily Reflection',
      'competency-observation': 'Competency Observation',
      'skill-demonstration': 'Skill Demonstration',
      'learning-milestone': 'Learning Milestone',
      'assessment-evidence': 'Assessment Evidence',
      'workplace-feedback': 'Workplace Feedback'
    };

    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getFlagSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const handleVerifyEntry = async (entryId: string) => {
    try {
      // Simulate API call to verify entry
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setLogbookEntries(prev => prev.map(entry => 
        entry.id === entryId 
          ? { 
              ...entry, 
              verificationStatus: 'verified' as const,
              verifiedBy: user?.displayName || 'Assessor',
              verificationDate: new Date().toISOString(),
              auditTrail: [...entry.auditTrail, {
                id: `audit_${Date.now()}`,
                action: 'verified' as const,
                performedBy: user?.displayName || 'Assessor',
                performedAt: new Date().toISOString(),
                details: 'Entry verified by assessor'
              }]
            }
          : entry
      ));
      
      toast({
        title: "Success",
        description: "Logbook entry verified successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getLogbookStats = () => {
    const total = logbookEntries.length;
    const verified = logbookEntries.filter(entry => entry.verificationStatus === 'verified').length;
    const pending = logbookEntries.filter(entry => entry.verificationStatus === 'pending').length;
    const needsClarification = logbookEntries.filter(entry => entry.verificationStatus === 'requires-clarification').length;
    const flagged = logbookEntries.filter(entry => entry.complianceFlags.some(flag => flag.status === 'open')).length;
    const avgQuality = logbookEntries.reduce((sum, entry) => sum + entry.qualityScore, 0) / total || 0;

    return { total, verified, pending, needsClarification, flagged, avgQuality };
  };

  const stats = getLogbookStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading digital logbook entries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Logbook (Audit Evidence)</h1>
          <p className="text-gray-600 mt-2">Review and verify student logbook entries for audit compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogbookEntries}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entries</p>
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
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Clarification</p>
                <p className="text-2xl font-bold text-gray-900">{stats.needsClarification}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Flagged</p>
                <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Quality</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgQuality.toFixed(1)}%</p>
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
                  placeholder="Search by student, logbook ID, description, or unit code"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="requires-clarification">Needs Clarification</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily-reflection">Daily Reflection</SelectItem>
                  <SelectItem value="competency-observation">Competency Observation</SelectItem>
                  <SelectItem value="skill-demonstration">Skill Demonstration</SelectItem>
                  <SelectItem value="learning-milestone">Learning Milestone</SelectItem>
                  <SelectItem value="assessment-evidence">Assessment Evidence</SelectItem>
                  <SelectItem value="workplace-feedback">Workplace Feedback</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logbook Entries List */}
      <div className="grid gap-6">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No logbook entries found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No logbook entries available for review.'
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
                      <h3 className="text-xl font-semibold text-gray-900">{entry.studentName}</h3>
                      {getStatusBadge(entry.verificationStatus)}
                      {getTypeBadge(entry.entryType)}
                      {entry.complianceFlags.some(flag => flag.status === 'open') && (
                        <Badge variant="destructive">Flagged</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {entry.logbookId}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.entryDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {entry.providerName}
                      </div>
                    </div>
                    {entry.unitCode && (
                      <div className="mb-4">
                        <Badge variant="secondary">{entry.unitCode} - {entry.unitTitle}</Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Quality Score:</span>
                        <span className={`text-sm font-semibold ${getQualityScoreColor(entry.qualityScore)}`}>
                          {entry.qualityScore}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Evidence:</span>
                        <Badge variant="outline">{entry.evidenceAttached.length} items</Badge>
                      </div>
                      {entry.verifiedBy && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Verified by:</span>
                          <span className="text-sm">{entry.verifiedBy}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {entry.verificationStatus === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleVerifyEntry(entry.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Verify
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedEntry(entry)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{entry.studentName} - Logbook Entry</DialogTitle>
                          <DialogDescription>
                            {entry.logbookId} • {new Date(entry.entryDate).toLocaleDateString()} • Quality Score: {entry.qualityScore}%
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="content" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="content">Entry Content</TabsTrigger>
                            <TabsTrigger value="evidence">Evidence</TabsTrigger>
                            <TabsTrigger value="context">Workplace Context</TabsTrigger>
                            <TabsTrigger value="feedback">Feedback</TabsTrigger>
                            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="content" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg">Entry Details</CardTitle>
                                  <div className="flex gap-2">
                                    {getStatusBadge(entry.verificationStatus)}
                                    {getTypeBadge(entry.entryType)}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {entry.unitCode && (
                                  <div>
                                    <Label className="text-sm font-medium">Unit of Competency</Label>
                                    <p className="text-sm text-gray-600">{entry.unitCode} - {entry.unitTitle}</p>
                                  </div>
                                )}
                                
                                <div>
                                  <Label className="text-sm font-medium">Competency Elements</Label>
                                  <ul className="mt-2 space-y-1">
                                    {entry.competencyElements.map((element, index) => (
                                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        {element}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Description</Label>
                                  <p className="text-sm text-gray-700 mt-1">{entry.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium">Skills Applied</Label>
                                    <ul className="mt-2 space-y-1">
                                      {entry.skillsApplied.map((skill, index) => (
                                        <li key={index} className="text-sm text-gray-600">• {skill}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Learning Outcomes</Label>
                                    <ul className="mt-2 space-y-1">
                                      {entry.learningOutcomes.map((outcome, index) => (
                                        <li key={index} className="text-sm text-gray-600">• {outcome}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium">Challenges Encountered</Label>
                                    <ul className="mt-2 space-y-1">
                                      {entry.challengesEncountered.map((challenge, index) => (
                                        <li key={index} className="text-sm text-gray-600">• {challenge}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Support Received</Label>
                                    <ul className="mt-2 space-y-1">
                                      {entry.supportReceived.map((support, index) => (
                                        <li key={index} className="text-sm text-gray-600">• {support}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Reflection Questions</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-4">
                                  {entry.reflectionQuestions.map((reflection, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                      <Label className="text-sm font-medium">{reflection.question}</Label>
                                      <p className="text-sm text-gray-700 mt-2">{reflection.response}</p>
                                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                        <span>Word count: {reflection.wordCount}</span>
                                        {reflection.assessorFeedback && (
                                          <span className="text-blue-600">Feedback provided</span>
                                        )}
                                      </div>
                                      {reflection.assessorFeedback && (
                                        <div className="mt-2 p-2 bg-blue-50 rounded">
                                          <p className="text-sm text-blue-700">
                                            <span className="font-medium">Assessor Feedback:</span> {reflection.assessorFeedback}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="evidence" className="space-y-4">
                            <div className="space-y-3">
                              {entry.evidenceAttached.map((attachment) => (
                                <Card key={attachment.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h5 className="font-medium">{attachment.name}</h5>
                                          <Badge variant={attachment.verified ? 'default' : 'secondary'}>
                                            {attachment.verified ? 'Verified' : 'Unverified'}
                                          </Badge>
                                          <Badge variant="outline">{attachment.evidenceType}</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{attachment.description}</p>
                                        <div className="text-sm text-gray-500">
                                          <p>Category: {attachment.category}</p>
                                          <p>Size: {(attachment.size / 1024).toFixed(1)} KB</p>
                                          <p>Uploaded: {new Date(attachment.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                      </div>
                                      <div className="flex gap-2">
                                        <Button variant="outline" size="sm">
                                          <Eye className="w-4 h-4" />
                                        </Button>
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
                          
                          <TabsContent value="context" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Workplace Information</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <Label className="text-sm font-medium">Supervisor</Label>
                                    <p className="text-sm text-gray-600">{entry.workplaceContext.supervisor}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Department</Label>
                                    <p className="text-sm text-gray-600">{entry.workplaceContext.department}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Work Environment</Label>
                                  <p className="text-sm text-gray-600">{entry.workplaceContext.workEnvironment}</p>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Client Interaction</Label>
                                  <Badge variant={entry.workplaceContext.clientInteraction ? 'default' : 'secondary'}>
                                    {entry.workplaceContext.clientInteraction ? 'Yes' : 'No'}
                                  </Badge>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Safety Requirements</Label>
                                  <ul className="mt-2 space-y-1">
                                    {entry.workplaceContext.safetyRequirements.map((requirement, index) => (
                                      <li key={index} className="text-sm text-gray-600">• {requirement}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Tools & Equipment Used</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {entry.workplaceContext.toolsEquipmentUsed.map((tool, index) => (
                                      <Badge key={index} variant="outline">{tool}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Team Collaboration</Label>
                                  <ul className="mt-2 space-y-1">
                                    {entry.workplaceContext.teamCollaboration.map((collab, index) => (
                                      <li key={index} className="text-sm text-gray-600">• {collab}</li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <Label className="text-sm font-medium">Quality Standards</Label>
                                  <ul className="mt-2 space-y-1">
                                    {entry.workplaceContext.qualityStandards.map((standard, index) => (
                                      <li key={index} className="text-sm text-gray-600">• {standard}</li>
                                    ))}
                                  </ul>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="feedback" className="space-y-4">
                            {entry.supervisorComments && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Supervisor Comments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-700">{entry.supervisorComments}</p>
                                </CardContent>
                              </Card>
                            )}
                            
                            {entry.assessorComments && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Assessor Comments</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-gray-700">{entry.assessorComments}</p>
                                </CardContent>
                              </Card>
                            )}
                            
                            {entry.complianceFlags.length > 0 && (
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Compliance Flags</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    {entry.complianceFlags.map((flag) => (
                                      <div key={flag.id} className="border rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium">{flag.type.replace('-', ' ')}</span>
                                              {getFlagSeverityBadge(flag.severity)}
                                            </div>
                                            <p className="text-sm text-gray-700">{flag.description}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                              Identified by: {flag.identifiedBy} on {new Date(flag.identifiedAt).toLocaleDateString()}
                                            </div>
                                          </div>
                                          <Badge variant={
                                            flag.status === 'resolved' ? 'default' :
                                            flag.status === 'escalated' ? 'destructive' :
                                            flag.status === 'acknowledged' ? 'secondary' :
                                            'outline'
                                          }>
                                            {flag.status}
                                          </Badge>
                                        </div>
                                        {flag.resolutionNotes && (
                                          <div className="mt-2 p-2 bg-gray-50 rounded">
                                            <p className="text-sm">
                                              <span className="font-medium">Resolution:</span> {flag.resolutionNotes}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="audit" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Audit Trail</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  {entry.auditTrail.map((trail) => (
                                    <div key={trail.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium capitalize">{trail.action}</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(trail.performedAt).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">By: {trail.performedBy}</p>
                                      <p className="text-sm text-gray-700">{trail.details}</p>
                                      {trail.previousValue && trail.newValue && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          Changed from: "{trail.previousValue}" to: "{trail.newValue}"
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Quality Score: <span className={`font-semibold ${getQualityScoreColor(entry.qualityScore)}`}>
                              {entry.qualityScore}%
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {entry.verificationStatus === 'pending' && (
                              <Button 
                                onClick={() => handleVerifyEntry(entry.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Verify Entry
                              </Button>
                            )}
                            <Button variant="outline">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Add Comment
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {entry.complianceFlags.filter(flag => flag.status === 'open').length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        {entry.complianceFlags.filter(flag => flag.status === 'open').length} Open Compliance Issues
                      </span>
                    </div>
                    <div className="space-y-1">
                      {entry.complianceFlags.filter(flag => flag.status === 'open').slice(0, 2).map((flag) => (
                        <div key={flag.id} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          {flag.type.replace('-', ' ')}: {flag.description}
                        </div>
                      ))}
                      {entry.complianceFlags.filter(flag => flag.status === 'open').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{entry.complianceFlags.filter(flag => flag.status === 'open').length - 2} more issues
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