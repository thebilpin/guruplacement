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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Users,
  Building,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Download,
  RefreshCw,
  Search,
  Filter,
  MapPin,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SiteSuitability {
  id: string;
  siteName: string;
  siteAddress: string;
  siteContact: {
    name: string;
    phone: string;
    email: string;
  };
  assessmentDate: string;
  assessorName: string;
  overallRating: 'excellent' | 'good' | 'satisfactory' | 'needs-improvement' | 'unsatisfactory';
  overallScore: number;
  status: 'approved' | 'conditional' | 'rejected' | 'pending-review';
  expiryDate: string;
  lastReviewDate: string;
  categories: SuitabilityCategory[];
  whsAssessment: WHSAssessment;
  recommendations: string[];
  followUpActions: FollowUpAction[];
  certificationDocuments: Document[];
}

interface SuitabilityCategory {
  id: string;
  name: string;
  weight: number;
  score: number;
  maxScore: number;
  criteria: SuitabilityCriteria[];
  comments: string;
}

interface SuitabilityCriteria {
  id: string;
  description: string;
  status: 'met' | 'partially-met' | 'not-met' | 'not-applicable';
  evidence: string;
  recommendations: string;
}

interface WHSAssessment {
  id: string;
  hazardIdentification: HazardAssessment[];
  riskControlMeasures: RiskControl[];
  emergencyProcedures: EmergencyProcedure[];
  trainingRequirements: TrainingRequirement[];
  complianceStatus: 'compliant' | 'minor-issues' | 'major-issues' | 'non-compliant';
  lastAuditDate: string;
  nextAuditDate: string;
}

interface HazardAssessment {
  id: string;
  hazardType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  controlMeasures: string[];
  residualRisk: 'low' | 'medium' | 'high';
}

interface RiskControl {
  id: string;
  hazardId: string;
  controlType: 'elimination' | 'substitution' | 'engineering' | 'administrative' | 'ppe';
  description: string;
  implementation: string;
  effectiveness: number;
}

interface EmergencyProcedure {
  id: string;
  type: string;
  procedure: string;
  contactDetails: string;
  equipmentRequired: string[];
}

interface TrainingRequirement {
  id: string;
  topic: string;
  frequency: string;
  lastCompleted: string;
  nextDue: string;
  status: 'current' | 'due-soon' | 'overdue';
}

interface FollowUpAction {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completedDate?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'current' | 'expiring-soon' | 'expired';
}

export default function SiteSuitabilityPage() {
  const [sites, setSites] = useState<SiteSuitability[]>([]);
  const [filteredSites, setFilteredSites] = useState<SiteSuitability[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedSite, setSelectedSite] = useState<SiteSuitability | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchSiteSuitability();
  }, []);

  useEffect(() => {
    filterSites();
  }, [sites, searchTerm, statusFilter]);

  const fetchSiteSuitability = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockSites: SiteSuitability[] = [
        {
          id: '1',
          siteName: 'TechCorp Head Office',
          siteAddress: '123 Collins Street, Melbourne VIC 3000',
          siteContact: {
            name: 'John Smith',
            phone: '+61 3 9123 4567',
            email: 'john.smith@techcorp.com'
          },
          assessmentDate: '2024-01-15',
          assessorName: 'Sarah Johnson (WHS Certified)',
          overallRating: 'excellent',
          overallScore: 92,
          status: 'approved',
          expiryDate: '2025-01-15',
          lastReviewDate: '2024-01-15',
          categories: [
            {
              id: 'cat1',
              name: 'Physical Environment',
              weight: 25,
              score: 23,
              maxScore: 25,
              criteria: [
                {
                  id: 'crit1',
                  description: 'Adequate workspace and facilities',
                  status: 'met',
                  evidence: 'Modern office with dedicated student workstations',
                  recommendations: 'None - exceeds requirements'
                }
              ],
              comments: 'Excellent modern facilities with dedicated student areas'
            }
          ],
          whsAssessment: {
            id: 'whs1',
            hazardIdentification: [
              {
                id: 'haz1',
                hazardType: 'Ergonomic',
                riskLevel: 'low',
                description: 'Repetitive computer work',
                controlMeasures: ['Ergonomic workstations', 'Regular breaks', 'Training provided'],
                residualRisk: 'low'
              }
            ],
            riskControlMeasures: [],
            emergencyProcedures: [],
            trainingRequirements: [],
            complianceStatus: 'compliant',
            lastAuditDate: '2024-01-15',
            nextAuditDate: '2024-07-15'
          },
          recommendations: [
            'Continue current safety practices',
            'Maintain regular WHS training schedule'
          ],
          followUpActions: [],
          certificationDocuments: [
            {
              id: 'doc1',
              name: 'Site Safety Certificate',
              type: 'WHS Certification',
              uploadDate: '2024-01-15',
              expiryDate: '2025-01-15',
              status: 'current'
            }
          ]
        },
        {
          id: '2',
          siteName: 'Manufacturing Solutions Ltd',
          siteAddress: '456 Industrial Drive, Sydney NSW 2000',
          siteContact: {
            name: 'Mike Chen',
            phone: '+61 2 9876 5432',
            email: 'mike.chen@manufacturing.com'
          },
          assessmentDate: '2024-01-20',
          assessorName: 'David Wilson (WHS Certified)',
          overallRating: 'satisfactory',
          overallScore: 75,
          status: 'conditional',
          expiryDate: '2024-07-20',
          lastReviewDate: '2024-01-20',
          categories: [
            {
              id: 'cat2',
              name: 'Safety Procedures',
              weight: 30,
              score: 20,
              maxScore: 30,
              criteria: [
                {
                  id: 'crit2',
                  description: 'Emergency evacuation procedures',
                  status: 'partially-met',
                  evidence: 'Procedures exist but need updating',
                  recommendations: 'Update emergency procedures and conduct drills'
                }
              ],
              comments: 'Safety procedures need improvement and regular review'
            }
          ],
          whsAssessment: {
            id: 'whs2',
            hazardIdentification: [
              {
                id: 'haz2',
                hazardType: 'Mechanical',
                riskLevel: 'medium',
                description: 'Operating machinery and equipment',
                controlMeasures: ['Safety guards', 'Training required', 'PPE mandatory'],
                residualRisk: 'low'
              }
            ],
            riskControlMeasures: [],
            emergencyProcedures: [],
            trainingRequirements: [],
            complianceStatus: 'minor-issues',
            lastAuditDate: '2024-01-20',
            nextAuditDate: '2024-04-20'
          },
          recommendations: [
            'Update emergency evacuation procedures',
            'Schedule regular safety training sessions',
            'Review and update safety signage'
          ],
          followUpActions: [
            {
              id: 'action1',
              description: 'Update emergency procedures documentation',
              priority: 'high',
              assignedTo: 'Site Manager',
              dueDate: '2024-02-15',
              status: 'in-progress'
            }
          ],
          certificationDocuments: [
            {
              id: 'doc2',
              name: 'WHS Compliance Certificate',
              type: 'Safety Certification',
              uploadDate: '2024-01-20',
              expiryDate: '2024-07-20',
              status: 'current'
            }
          ]
        }
      ];

      setSites(mockSites);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch site suitability data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSites = () => {
    let filtered = sites;

    if (searchTerm) {
      filtered = filtered.filter(site =>
        site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        site.siteContact.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(site => site.status === statusFilter);
    }

    setFilteredSites(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'conditional':
        return <Badge className="bg-yellow-100 text-yellow-800">Conditional</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending-review':
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
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

  const getWHSStatusBadge = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800">Compliant</Badge>;
      case 'minor-issues':
        return <Badge className="bg-yellow-100 text-yellow-800">Minor Issues</Badge>;
      case 'major-issues':
        return <Badge className="bg-orange-100 text-orange-800">Major Issues</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800">Non-Compliant</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleExportReport = async (siteId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Site suitability report exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScheduleReview = async (siteId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: "Review scheduled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSiteStats = () => {
    const total = sites.length;
    const approved = sites.filter(s => s.status === 'approved').length;
    const conditional = sites.filter(s => s.status === 'conditional').length;
    const pending = sites.filter(s => s.status === 'pending-review').length;
    const avgScore = sites.reduce((sum, s) => sum + s.overallScore, 0) / total || 0;

    return { total, approved, conditional, pending, avgScore };
  };

  const stats = getSiteStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading site suitability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Site Suitability & WHS</h1>
          <p className="text-gray-600 mt-2">Assess and monitor workplace health and safety compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchSiteSuitability}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Assessment
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Sites</p>
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
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conditional</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conditional}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
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
                  placeholder="Search sites by name, address, or contact"
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
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="pending-review">Pending Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sites List */}
      <div className="grid gap-6">
        {filteredSites.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sites found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'No site assessments available. Create your first assessment to get started.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Assessment
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredSites.map((site) => (
            <Card key={site.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{site.siteName}</h3>
                      {getStatusBadge(site.status)}
                      {getRatingBadge(site.overallRating)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {site.siteAddress}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Contact: {site.siteContact.name}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {site.siteContact.phone}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {site.siteContact.email}
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Overall Suitability Score</span>
                        <span>{site.overallScore}%</span>
                      </div>
                      <Progress value={site.overallScore} className="h-2" />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Assessed: {new Date(site.assessmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Expires: {new Date(site.expiryDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        WHS: {getWHSStatusBadge(site.whsAssessment.complianceStatus)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => handleExportReport(site.id)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSite(site)}>
                          <FileText className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{site.siteName} - Suitability Assessment</DialogTitle>
                          <DialogDescription>
                            Detailed site suitability and WHS assessment report
                          </DialogDescription>
                        </DialogHeader>
                        
                        <Tabs defaultValue="overview" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="assessment">Assessment</TabsTrigger>
                            <TabsTrigger value="whs">WHS Details</TabsTrigger>
                            <TabsTrigger value="actions">Actions</TabsTrigger>
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
                                    <p className="text-sm text-gray-600">{site.siteName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Address</Label>
                                    <p className="text-sm text-gray-600">{site.siteAddress}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Contact Person</Label>
                                    <p className="text-sm text-gray-600">{site.siteContact.name}</p>
                                    <p className="text-sm text-gray-600">{site.siteContact.phone}</p>
                                    <p className="text-sm text-gray-600">{site.siteContact.email}</p>
                                  </div>
                                </CardContent>
                              </Card>
                              
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Assessment Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Overall Rating</span>
                                    {getRatingBadge(site.overallRating)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Status</span>
                                    {getStatusBadge(site.status)}
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Score</span>
                                    <span className="text-sm font-semibold">{site.overallScore}%</span>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Assessor</Label>
                                    <p className="text-sm text-gray-600">{site.assessorName}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Assessment Date</Label>
                                    <p className="text-sm text-gray-600">{new Date(site.assessmentDate).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Expires</Label>
                                    <p className="text-sm text-gray-600">{new Date(site.expiryDate).toLocaleDateString()}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="assessment" className="space-y-4">
                            <div className="space-y-4">
                              {site.categories.map((category) => (
                                <Card key={category.id}>
                                  <CardHeader>
                                    <div className="flex justify-between items-center">
                                      <CardTitle className="text-lg">{category.name}</CardTitle>
                                      <div className="text-right">
                                        <p className="text-sm font-medium">Score: {category.score}/{category.maxScore}</p>
                                        <p className="text-xs text-gray-600">Weight: {category.weight}%</p>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {category.criteria.map((criteria) => (
                                        <div key={criteria.id} className="border-l-4 border-blue-200 pl-4">
                                          <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-medium">{criteria.description}</h4>
                                            <Badge variant={criteria.status === 'met' ? 'default' : 'secondary'}>
                                              {criteria.status.replace('-', ' ')}
                                            </Badge>
                                          </div>
                                          {criteria.evidence && (
                                            <p className="text-sm text-gray-600 mb-1">
                                              <span className="font-medium">Evidence:</span> {criteria.evidence}
                                            </p>
                                          )}
                                          {criteria.recommendations && (
                                            <p className="text-sm text-gray-600">
                                              <span className="font-medium">Recommendations:</span> {criteria.recommendations}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                      {category.comments && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded">
                                          <p className="text-sm"><span className="font-medium">Comments:</span> {category.comments}</p>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="whs" className="space-y-4">
                            <Card>
                              <CardHeader>
                                <div className="flex justify-between items-center">
                                  <CardTitle className="text-lg">WHS Compliance Status</CardTitle>
                                  {getWHSStatusBadge(site.whsAssessment.complianceStatus)}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                  <div>
                                    <Label className="text-sm font-medium">Last Audit</Label>
                                    <p className="text-sm text-gray-600">{new Date(site.whsAssessment.lastAuditDate).toLocaleDateString()}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium">Next Audit</Label>
                                    <p className="text-sm text-gray-600">{new Date(site.whsAssessment.nextAuditDate).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-3">Identified Hazards</h4>
                                    <div className="space-y-2">
                                      {site.whsAssessment.hazardIdentification.map((hazard) => (
                                        <Card key={hazard.id}>
                                          <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                              <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h5 className="font-medium">{hazard.hazardType}</h5>
                                                  <Badge variant={hazard.riskLevel === 'high' || hazard.riskLevel === 'critical' ? 'destructive' : 'default'}>
                                                    {hazard.riskLevel} risk
                                                  </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{hazard.description}</p>
                                                <div className="text-sm">
                                                  <p className="font-medium mb-1">Control Measures:</p>
                                                  <ul className="list-disc list-inside text-gray-600">
                                                    {hazard.controlMeasures.map((measure, index) => (
                                                      <li key={index}>{measure}</li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              </div>
                                              <Badge variant="outline">
                                                Residual: {hazard.residualRisk}
                                              </Badge>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TabsContent>
                          
                          <TabsContent value="actions" className="space-y-4">
                            <div className="grid gap-4">
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Recommendations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <ul className="space-y-2">
                                    {site.recommendations.map((rec, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                        <span className="text-sm">{rec}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </CardContent>
                              </Card>
                              
                              {site.followUpActions.length > 0 && (
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Follow-up Actions</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {site.followUpActions.map((action) => (
                                        <div key={action.id} className="flex items-start justify-between p-3 border rounded">
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                              <h5 className="font-medium">{action.description}</h5>
                                              <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}>
                                                {action.priority}
                                              </Badge>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              <p>Assigned to: {action.assignedTo}</p>
                                              <p>Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                                            </div>
                                          </div>
                                          <Badge variant={action.status === 'completed' ? 'default' : action.status === 'overdue' ? 'destructive' : 'secondary'}>
                                            {action.status}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between items-center pt-4 border-t">
                          <div className="text-sm text-gray-600">
                            Last reviewed: {new Date(site.lastReviewDate).toLocaleString()}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={() => handleExportReport(site.id)}>
                              <Download className="w-4 h-4 mr-2" />
                              Export Report
                            </Button>
                            <Button onClick={() => handleScheduleReview(site.id)}>
                              <Calendar className="w-4 h-4 mr-2" />
                              Schedule Review
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {site.followUpActions.filter(a => a.status !== 'completed').length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">
                        {site.followUpActions.filter(a => a.status !== 'completed').length} Pending Actions
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {site.followUpActions.filter(a => a.status !== 'completed').slice(0, 2).map((action) => (
                        <div key={action.id} className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                          {action.description}
                        </div>
                      ))}
                      {site.followUpActions.filter(a => a.status !== 'completed').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{site.followUpActions.filter(a => a.status !== 'completed').length - 2} more
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

      {/* Create Assessment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule New Site Assessment</DialogTitle>
            <DialogDescription>
              Create a new site suitability and WHS assessment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This feature would typically include a form to schedule new assessments,
              assign assessors, and set assessment criteria based on placement requirements.
            </p>
            <div className="flex justify-end">
              <Button onClick={() => {
                setIsCreateDialogOpen(false);
                toast({
                  title: "Assessment Scheduled",
                  description: "New site assessment has been scheduled successfully.",
                });
              }}>
                Schedule Assessment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}