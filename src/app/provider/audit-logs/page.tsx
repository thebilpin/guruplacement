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
  FileText, 
  Calendar, 
  Clock, 
  Users,
  User,
  Building,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  AlertCircle,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit3,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PlacementAuditLog {
  id: string;
  auditId: string;
  siteId: string;
  siteName: string;
  siteAddress: string;
  auditDate: string;
  auditType: 'routine' | 'compliance' | 'incident-response' | 'follow-up' | 'certification';
  auditorName: string;
  auditorOrganization: string;
  auditStatus: 'scheduled' | 'in-progress' | 'completed' | 'follow-up-required' | 'cancelled';
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement' | 'unsatisfactory';
  complianceScore: number;
  studentsAffected: StudentAffected[];
  auditAreas: AuditArea[];
  findings: AuditFinding[];
  recommendations: string[];
  correctiveActions: CorrectiveAction[];
  nextAuditDate?: string;
  certificationStatus: 'certified' | 'conditional' | 'suspended' | 'revoked';
  certificationExpiryDate?: string;
  attachments: AuditAttachment[];
  createdAt: string;
  updatedAt: string;
}

interface StudentAffected {
  id: string;
  name: string;
  placementTitle: string;
  rtoName: string;
  impactLevel: 'none' | 'minor' | 'moderate' | 'major';
  actionRequired: boolean;
}

interface AuditArea {
  id: string;
  name: string;
  category: 'safety' | 'facilities' | 'supervision' | 'training' | 'documentation' | 'compliance';
  score: number;
  maxScore: number;
  status: 'compliant' | 'minor-issues' | 'major-issues' | 'non-compliant';
  findings: string[];
  evidence: string[];
  recommendations: string[];
}

interface AuditFinding {
  id: string;
  type: 'positive' | 'minor-non-compliance' | 'major-non-compliance' | 'critical';
  area: string;
  description: string;
  evidence: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  immediateAction: boolean;
  correctiveActionRequired: boolean;
  timeframeToResolve?: string;
}

interface CorrectiveAction {
  id: string;
  findingId: string;
  description: string;
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: string;
  evidence?: string;
  verifiedBy?: string;
  verificationDate?: string;
}

interface AuditAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  category: 'report' | 'evidence' | 'certificate' | 'correspondence';
  url: string;
  uploadedAt: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<PlacementAuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<PlacementAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [siteFilter, setSiteFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedLog, setSelectedLog] = useState<PlacementAuditLog | null>(null);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [auditLogs, searchTerm, siteFilter, statusFilter, typeFilter, ratingFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockLogs: PlacementAuditLog[] = [
        {
          id: '1',
          auditId: 'AUD-2024-001',
          siteId: 'SITE001',
          siteName: 'TechCorp Head Office',
          siteAddress: '123 Collins Street, Melbourne VIC 3000',
          auditDate: '2024-01-25',
          auditType: 'routine',
          auditorName: 'Dr. Sarah Williams',
          auditorOrganization: 'Independent Audit Services',
          auditStatus: 'completed',
          overallRating: 'excellent',
          complianceScore: 94,
          studentsAffected: [
            {
              id: 'STU001',
              name: 'Emily Johnson',
              placementTitle: 'Software Development Placement',
              rtoName: 'Tech Institute Australia',
              impactLevel: 'none',
              actionRequired: false
            },
            {
              id: 'STU002',
              name: 'James Wilson',
              placementTitle: 'IT Support Placement',
              rtoName: 'Tech Institute Australia',
              impactLevel: 'none',
              actionRequired: false
            }
          ],
          auditAreas: [
            {
              id: 'area1',
              name: 'Workplace Safety',
              category: 'safety',
              score: 48,
              maxScore: 50,
              status: 'compliant',
              findings: [
                'Excellent safety protocols in place',
                'Regular safety training conducted',
                'Emergency procedures clearly documented'
              ],
              evidence: [
                'Safety training records reviewed',
                'Emergency evacuation plans verified',
                'Safety equipment inspection completed'
              ],
              recommendations: [
                'Continue current safety practices'
              ]
            },
            {
              id: 'area2',
              name: 'Student Supervision',
              category: 'supervision',
              score: 46,
              maxScore: 50,
              status: 'compliant',
              findings: [
                'Dedicated supervisors assigned to each student',
                'Regular feedback sessions documented',
                'Clear communication channels established'
              ],
              evidence: [
                'Supervision schedules reviewed',
                'Feedback logs examined',
                'Student interviews conducted'
              ],
              recommendations: [
                'Maintain current supervision standards'
              ]
            }
          ],
          findings: [
            {
              id: 'finding1',
              type: 'positive',
              area: 'Workplace Safety',
              description: 'Exemplary safety culture with proactive hazard identification and management',
              evidence: 'Comprehensive safety management system observed, regular safety meetings documented',
              riskLevel: 'low',
              immediateAction: false,
              correctiveActionRequired: false
            }
          ],
          recommendations: [
            'Continue current high standards of safety management',
            'Consider sharing best practices with other placement sites',
            'Maintain regular safety training schedule'
          ],
          correctiveActions: [],
          nextAuditDate: '2025-01-25',
          certificationStatus: 'certified',
          certificationExpiryDate: '2025-01-25',
          attachments: [
            {
              id: 'att1',
              name: 'TechCorp_Audit_Report_2024.pdf',
              type: 'application/pdf',
              size: 2048000,
              category: 'report',
              url: '/attachments/techcorp-audit-report.pdf',
              uploadedAt: '2024-01-25T17:00:00Z'
            },
            {
              id: 'att2',
              name: 'Site_Certification_2024.pdf',
              type: 'application/pdf',
              size: 1024000,
              category: 'certificate',
              url: '/attachments/site-certification.pdf',
              uploadedAt: '2024-01-25T17:30:00Z'
            }
          ],
          createdAt: '2024-01-25T18:00:00Z',
          updatedAt: '2024-01-25T18:00:00Z'
        },
        {
          id: '2',
          auditId: 'AUD-2024-002',
          siteId: 'SITE002',
          siteName: 'Manufacturing Solutions Ltd',
          siteAddress: '456 Industrial Drive, Sydney NSW 2000',
          auditDate: '2024-01-20',
          auditType: 'compliance',
          auditorName: 'Mark Thompson',
          auditorOrganization: 'Safety Compliance Associates',
          auditStatus: 'follow-up-required',
          overallRating: 'needs-improvement',
          complianceScore: 72,
          studentsAffected: [
            {
              id: 'STU003',
              name: 'David Lee',
              placementTitle: 'Manufacturing Technician Placement',
              rtoName: 'Industrial Training Institute',
              impactLevel: 'moderate',
              actionRequired: true
            }
          ],
          auditAreas: [
            {
              id: 'area3',
              name: 'Safety Equipment',
              category: 'safety',
              score: 30,
              maxScore: 50,
              status: 'major-issues',
              findings: [
                'Some safety equipment requires updating',
                'PPE availability needs improvement',
                'Safety signage partially outdated'
              ],
              evidence: [
                'Equipment inspection records reviewed',
                'PPE inventory checked',
                'Signage audit conducted'
              ],
              recommendations: [
                'Update safety equipment inventory',
                'Implement regular PPE checks',
                'Refresh safety signage'
              ]
            }
          ],
          findings: [
            {
              id: 'finding2',
              type: 'major-non-compliance',
              area: 'Safety Equipment',
              description: 'Safety equipment not meeting current standards, some PPE items expired',
              evidence: 'Inspection records show overdue equipment servicing, expired PPE found in storage',
              riskLevel: 'high',
              immediateAction: true,
              correctiveActionRequired: true,
              timeframeToResolve: '30 days'
            }
          ],
          recommendations: [
            'Immediate replacement of expired PPE',
            'Establish equipment maintenance schedule',
            'Implement PPE tracking system',
            'Conduct staff training on equipment use'
          ],
          correctiveActions: [
            {
              id: 'ca1',
              findingId: 'finding2',
              description: 'Replace all expired PPE and establish maintenance schedule',
              assignedTo: 'Site Safety Manager',
              dueDate: '2024-02-20',
              status: 'in-progress'
            }
          ],
          nextAuditDate: '2024-04-20',
          certificationStatus: 'conditional',
          certificationExpiryDate: '2024-07-20',
          attachments: [
            {
              id: 'att3',
              name: 'Manufacturing_Audit_Report_2024.pdf',
              type: 'application/pdf',
              size: 1536000,
              category: 'report',
              url: '/attachments/manufacturing-audit-report.pdf',
              uploadedAt: '2024-01-20T16:00:00Z'
            }
          ],
          createdAt: '2024-01-20T16:00:00Z',
          updatedAt: '2024-01-28T10:00:00Z'
        },
        {
          id: '3',
          auditId: 'AUD-2024-003',
          siteId: 'SITE003',
          siteName: 'Creative Marketing Agency',
          siteAddress: '789 Design Street, Brisbane QLD 4000',
          auditDate: '2024-01-30',
          auditType: 'routine',
          auditorName: 'Lisa Anderson',
          auditorOrganization: 'Education Quality Assurance',
          auditStatus: 'completed',
          overallRating: 'good',
          complianceScore: 86,
          studentsAffected: [
            {
              id: 'STU004',
              name: 'Sophie Brown',
              placementTitle: 'Digital Marketing Placement',
              rtoName: 'Creative Arts College',
              impactLevel: 'minor',
              actionRequired: false
            }
          ],
          auditAreas: [
            {
              id: 'area4',
              name: 'Learning Environment',
              category: 'facilities',
              score: 43,
              maxScore: 50,
              status: 'compliant',
              findings: [
                'Modern creative workspace available',
                'Access to industry-standard software',
                'Collaborative learning spaces provided'
              ],
              evidence: [
                'Facility tour conducted',
                'Software licenses verified',
                'Student workspace assessed'
              ],
              recommendations: [
                'Consider additional quiet study areas'
              ]
            }
          ],
          findings: [
            {
              id: 'finding3',
              type: 'minor-non-compliance',
              area: 'Documentation',
              description: 'Some student progress documentation not consistently updated',
              evidence: 'Review of student files showed gaps in progress tracking',
              riskLevel: 'low',
              immediateAction: false,
              correctiveActionRequired: true,
              timeframeToResolve: '60 days'
            }
          ],
          recommendations: [
            'Implement consistent documentation procedures',
            'Provide training on progress tracking systems',
            'Regular review of student files'
          ],
          correctiveActions: [
            {
              id: 'ca2',
              findingId: 'finding3',
              description: 'Standardize student progress documentation procedures',
              assignedTo: 'Placement Coordinator',
              dueDate: '2024-03-30',
              status: 'pending'
            }
          ],
          nextAuditDate: '2025-01-30',
          certificationStatus: 'certified',
          certificationExpiryDate: '2025-01-30',
          attachments: [
            {
              id: 'att4',
              name: 'Creative_Agency_Audit_2024.pdf',
              type: 'application/pdf',
              size: 1792000,
              category: 'report',
              url: '/attachments/creative-agency-audit.pdf',
              uploadedAt: '2024-01-30T15:00:00Z'
            }
          ],
          createdAt: '2024-01-30T15:00:00Z',
          updatedAt: '2024-01-30T15:00:00Z'
        }
      ];

      setAuditLogs(mockLogs);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch audit logs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = auditLogs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.auditId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.auditorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.studentsAffected.some(student => 
          student.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (siteFilter !== 'all') {
      filtered = filtered.filter(log => log.siteId === siteFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.auditStatus === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.auditType === typeFilter);
    }

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(log => log.overallRating === ratingFilter);
    }

    setFilteredLogs(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case 'follow-up-required':
        return <Badge className="bg-orange-100 text-orange-800">Follow-up Required</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
      case 'satisfactory':
        return <Badge className="bg-yellow-100 text-yellow-800">Satisfactory</Badge>;
      case 'needs-improvement':
        return <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>;
      case 'unsatisfactory':
        return <Badge className="bg-red-100 text-red-800">Unsatisfactory</Badge>;
      default:
        return <Badge variant="secondary">{rating}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      'routine': 'Routine',
      'compliance': 'Compliance',
      'incident-response': 'Incident Response',
      'follow-up': 'Follow-up',
      'certification': 'Certification'
    };

    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const getCertificationBadge = (status: string) => {
    switch (status) {
      case 'certified':
        return <Badge className="bg-green-100 text-green-800">Certified</Badge>;
      case 'conditional':
        return <Badge className="bg-yellow-100 text-yellow-800">Conditional</Badge>;
      case 'suspended':
        return <Badge className="bg-orange-100 text-orange-800">Suspended</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800">Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFindingTypeBadge = (type: string) => {
    switch (type) {
      case 'positive':
        return <Badge className="bg-green-100 text-green-800">Positive</Badge>;
      case 'minor-non-compliance':
        return <Badge className="bg-yellow-100 text-yellow-800">Minor Issue</Badge>;
      case 'major-non-compliance':
        return <Badge className="bg-orange-100 text-orange-800">Major Issue</Badge>;
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleExportAuditReport = async (auditId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Audit report exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export audit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAuditStats = () => {
    const total = auditLogs.length;
    const completed = auditLogs.filter(log => log.auditStatus === 'completed').length;
    const followUpRequired = auditLogs.filter(log => log.auditStatus === 'follow-up-required').length;
    const certified = auditLogs.filter(log => log.certificationStatus === 'certified').length;
    const avgScore = auditLogs.reduce((sum, log) => sum + log.complianceScore, 0) / total || 0;

    return { total, completed, followUpRequired, certified, avgScore };
  };

  const stats = getAuditStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Placement Site Audit Log</h1>
          <p className="text-gray-600 mt-2">Track and manage placement site audit activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAuditLogs}>
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
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Audits</p>
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
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Follow-up Required</p>
                <p className="text-2xl font-bold text-gray-900">{stats.followUpRequired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Certified Sites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.certified}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
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
                  placeholder="Search by site name, audit ID, auditor, or student"
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
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="follow-up-required">Follow-up Required</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="incident-response">Incident Response</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="certification">Certification</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="satisfactory">Satisfactory</SelectItem>
                  <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                  <SelectItem value="unsatisfactory">Unsatisfactory</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <div className="grid gap-6">
        {filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600">
                {searchTerm || siteFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all' || ratingFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No audit logs available.'
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
                      <h3 className="text-xl font-semibold text-gray-900">{log.siteName}</h3>
                      {getStatusBadge(log.auditStatus)}
                      {getRatingBadge(log.overallRating)}
                      {getTypeBadge(log.auditType)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        Audit ID: {log.auditId}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(log.auditDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {log.auditorName}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Compliance Score:</span>
                        <Badge variant="outline">{log.complianceScore}%</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Certification:</span>
                        {getCertificationBadge(log.certificationStatus)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Students Affected:</span>
                        <Badge variant="outline">{log.studentsAffected.length}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleExportAuditReport(log.auditId)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{log.siteName} - Audit Report</DialogTitle>
                          <DialogDescription>
                            {log.auditId} • {new Date(log.auditDate).toLocaleDateString()} • {log.auditorName}
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="areas">Audit Areas</TabsTrigger>
                            <TabsTrigger value="findings">Findings</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
                            <TabsTrigger value="students">Students</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-2 gap-6">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Site Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium">Site Name</Label>
                                    <p className="text-sm text-gray-600">{log.siteName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm text-gray-600">{log.siteAddress}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Audit ID</Label>
                                    <p className="text-sm text-gray-600">{log.auditId}</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Audit Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Overall Rating</span>
                                    {getRatingBadge(log.overallRating)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Status</span>
                                    {getStatusBadge(log.auditStatus)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Type</span>
                                    {getTypeBadge(log.auditType)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Compliance Score</span>
                                    <span className="text-sm font-semibold">{log.complianceScore}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Certification</span>
                                    {getCertificationBadge(log.certificationStatus)}
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-lg">Auditor Information</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">Auditor Name</Label>
                                    <p className="text-sm text-gray-600">{log.auditorName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Organization</Label>
                                    <p className="text-sm text-gray-600">{log.auditorOrganization}</p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="areas" className="space-y-4">
                            <div className="space-y-4">
                              {log.auditAreas.map((area) => (
                                <Card key={area.id}>
                                  <CardHeader>
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-lg">{area.name}</CardTitle>
                                      <div className="text-right">
                                        <p className="text-sm font-medium">Score: {area.score}/{area.maxScore}</p>
                                        <Badge variant={area.status === 'compliant' ? 'default' : 'destructive'}>
                                          {area.status.replace('-', ' ')}
                                        </Badge>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium">Findings</Label>
                                        <ul className="mt-2 space-y-1">
                                          {area.findings.map((finding, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                              {finding}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Evidence</Label>
                                        <ul className="mt-2 space-y-1">
                                          {area.evidence.map((evidence, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                              <FileText className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                              {evidence}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-sm font-medium">Recommendations</Label>
                                        <ul className="mt-2 space-y-1">
                                          {area.recommendations.map((recommendation, index) => (
                                            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                                              <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                                              {recommendation}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="findings" className="space-y-4">
                            <div className="space-y-4">
                              {log.findings.map((finding) => (
                                <Card key={finding.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                          <h4 className="font-medium">{finding.area}</h4>
                                          {getFindingTypeBadge(finding.type)}
                                          <Badge variant={finding.riskLevel === 'critical' || finding.riskLevel === 'high' ? 'destructive' : 'default'}>
                                            {finding.riskLevel} risk
                                          </Badge>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                                        <p className="text-sm text-gray-600">
                                          <span className="font-medium">Evidence:</span> {finding.evidence}
                                        </p>
                                        {finding.timeframeToResolve && (
                                          <p className="text-sm text-gray-600 mt-1">
                                            <span className="font-medium">Resolution Timeframe:</span> {finding.timeframeToResolve}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {finding.immediateAction && (
                                          <Badge variant="destructive">Immediate Action</Badge>
                                        )}
                                        {finding.correctiveActionRequired && (
                                          <Badge variant="outline">Action Required</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="actions" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Recommendations</Label>
                                <Card className="mt-2">
                                  <CardContent className="p-4">
                                    <ul className="space-y-2">
                                      {log.recommendations.map((recommendation, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                          <span className="text-sm">{recommendation}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </CardContent>
                                </Card>
                              </div>
                              
                              {log.correctiveActions.length > 0 && (
                                <div>
                                  <Label className="text-sm font-medium">Corrective Actions</Label>
                                  <div className="space-y-3 mt-2">
                                    {log.correctiveActions.map((action) => (
                                      <Card key={action.id}>
                                        <CardContent className="p-4">
                                          <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                              <h5 className="font-medium">{action.description}</h5>
                                              <div className="text-sm text-gray-600 mt-1">
                                                <p>Assigned to: {action.assignedTo}</p>
                                                <p>Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                                                {action.completedDate && (
                                                  <p>Completed: {new Date(action.completedDate).toLocaleDateString()}</p>
                                                )}
                                                {action.evidence && <p>Evidence: {action.evidence}</p>}
                                                {action.verifiedBy && (
                                                  <p>Verified by: {action.verifiedBy} on {action.verificationDate && new Date(action.verificationDate).toLocaleDateString()}</p>
                                                )}
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
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="students" className="space-y-4">
                            <div className="space-y-3">
                              {log.studentsAffected.map((student) => (
                                <Card key={student.id}>
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <h5 className="font-medium">{student.name}</h5>
                                        <div className="text-sm text-gray-600 mt-1">
                                          <p>Placement: {student.placementTitle}</p>
                                          <p>RTO: {student.rtoName}</p>
                                        </div>
                                      </div>
                                      <div className="flex flex-col gap-1 items-end">
                                        <Badge variant={
                                          student.impactLevel === 'none' ? 'default' :
                                          student.impactLevel === 'minor' ? 'secondary' :
                                          student.impactLevel === 'moderate' ? 'destructive' :
                                          'destructive'
                                        }>
                                          {student.impactLevel} impact
                                        </Badge>
                                        {student.actionRequired && (
                                          <Badge variant="outline">Action Required</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Next audit: {log.nextAuditDate ? new Date(log.nextAuditDate).toLocaleDateString() : 'Not scheduled'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Certification expires: {log.certificationExpiryDate ? new Date(log.certificationExpiryDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {log.correctiveActions.filter(action => action.status !== 'completed').length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {log.correctiveActions.filter(action => action.status !== 'completed').length} Pending Actions
                      </span>
                    </div>
                    <div className="space-y-1">
                      {log.correctiveActions.filter(action => action.status !== 'completed').slice(0, 2).map((action) => (
                        <div key={action.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {action.description} (Due: {new Date(action.dueDate).toLocaleDateString()})
                        </div>
                      ))}
                      {log.correctiveActions.filter(action => action.status !== 'completed').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{log.correctiveActions.filter(action => action.status !== 'completed').length - 2} more actions
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