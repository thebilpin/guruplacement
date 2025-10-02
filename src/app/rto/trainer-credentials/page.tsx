'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  Award, 
  Calendar, 
  User, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  Shield
} from 'lucide-react';

interface TrainerCredential {
  id: string;
  trainerId: string;
  trainerName: string;
  email: string;
  phone: string;
  role: 'Trainer' | 'Assessor' | 'Trainer/Assessor';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending Review';
  employmentType: 'Full-time' | 'Part-time' | 'Casual' | 'Contract';
  qualifications: Qualification[];
  certifications: Certification[];
  trainingPackages: string[];
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Expires Soon' | 'Expired';
  lastReview: string;
  nextReview: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface Qualification {
  id: string;
  title: string;
  level: string;
  institution: string;
  completionDate: string;
  expiryDate?: string;
  status: 'Valid' | 'Expired' | 'Pending Verification';
  documentUrl?: string;
}

interface Certification {
  id: string;
  title: string;
  issuingBody: string;
  issueDate: string;
  expiryDate: string;
  status: 'Valid' | 'Expired' | 'Expiring Soon';
  documentUrl?: string;
  renewalRequired: boolean;
}

export default function TrainerCredentialsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<TrainerCredential[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<TrainerCredential[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerCredential | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTrainerCredentials();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchTerm, statusFilter, roleFilter, complianceFilter]);

  const fetchTrainerCredentials = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: TrainerCredential[] = [
        {
          id: '1',
          trainerId: 'TR001',
          trainerName: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@rto.edu.au',
          phone: '+61 2 9876 5432',
          role: 'Trainer/Assessor',
          status: 'Active',
          employmentType: 'Full-time',
          qualifications: [
            {
              id: '1',
              title: 'Master of Education',
              level: 'Masters',
              institution: 'University of Sydney',
              completionDate: '2018-12-15',
              status: 'Valid'
            },
            {
              id: '2',
              title: 'Certificate IV in Training and Assessment',
              level: 'Certificate IV',
              institution: 'TAFE NSW',
              completionDate: '2019-06-30',
              status: 'Valid'
            }
          ],
          certifications: [
            {
              id: '1',
              title: 'First Aid Certificate',
              issuingBody: 'St John Ambulance',
              issueDate: '2023-01-15',
              expiryDate: '2026-01-15',
              status: 'Valid',
              renewalRequired: false
            },
            {
              id: '2',
              title: 'Working with Children Check',
              issuingBody: 'NSW Office of the Children\'s Guardian',
              issueDate: '2022-03-20',
              expiryDate: '2027-03-20',
              status: 'Valid',
              renewalRequired: false
            }
          ],
          trainingPackages: ['CHC Community Services', 'HLT Health', 'BSB Business Services'],
          complianceStatus: 'Compliant',
          lastReview: '2024-01-15',
          nextReview: '2025-01-15',
          riskLevel: 'Low'
        },
        {
          id: '2',
          trainerId: 'TR002',
          trainerName: 'Michael Chen',
          email: 'michael.chen@rto.edu.au',
          phone: '+61 3 8765 4321',
          role: 'Assessor',
          status: 'Active',
          employmentType: 'Part-time',
          qualifications: [
            {
              id: '3',
              title: 'Bachelor of Nursing',
              level: 'Bachelor',
              institution: 'Griffith University',
              completionDate: '2020-11-30',
              status: 'Valid'
            }
          ],
          certifications: [
            {
              id: '3',
              title: 'Nursing Registration',
              issuingBody: 'AHPRA',
              issueDate: '2021-01-01',
              expiryDate: '2024-03-31',
              status: 'Expiring Soon',
              renewalRequired: true
            }
          ],
          trainingPackages: ['HLT Health'],
          complianceStatus: 'Expires Soon',
          lastReview: '2023-12-10',
          nextReview: '2024-12-10',
          riskLevel: 'Medium'
        },
        {
          id: '3',
          trainerId: 'TR003',
          trainerName: 'Lisa Wang',
          email: 'lisa.wang@rto.edu.au',
          phone: '+61 7 7654 3210',
          role: 'Trainer',
          status: 'Pending Review',
          employmentType: 'Contract',
          qualifications: [
            {
              id: '4',
              title: 'Diploma of Community Services',
              level: 'Diploma',
              institution: 'TAFE QLD',
              completionDate: '2019-07-15',
              status: 'Valid'
            }
          ],
          certifications: [
            {
              id: '4',
              title: 'Police Check',
              issuingBody: 'Australian Federal Police',
              issueDate: '2021-08-10',
              expiryDate: '2024-08-10',
              status: 'Expired',
              renewalRequired: true
            }
          ],
          trainingPackages: ['CHC Community Services'],
          complianceStatus: 'Non-Compliant',
          lastReview: '2023-08-20',
          nextReview: '2024-08-20',
          riskLevel: 'High'
        }
      ];

      setTrainers(mockData);
    } catch (error) {
      console.error('Error fetching trainer credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load trainer credentials. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTrainers = () => {
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(trainer =>
        trainer.trainerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.trainerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.status === statusFilter);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.role === roleFilter);
    }

    if (complianceFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.complianceStatus === complianceFilter);
    }

    setFilteredTrainers(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      case 'Suspended':
        return 'bg-red-100 text-red-800';
      case 'Pending Review':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Expires Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Non-Compliant':
        return 'bg-red-100 text-red-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'Valid':
        return 'bg-green-100 text-green-800';
      case 'Expiring Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = (trainer: TrainerCredential) => {
    setSelectedTrainer(trainer);
    setIsDetailModalOpen(true);
  };

  const handleSendRenewalReminder = (trainerId: string) => {
    toast({
      title: 'Reminder Sent',
      description: 'Credential renewal reminder has been sent to the trainer.',
    });
  };

  const handleExportCredentials = () => {
    toast({
      title: 'Export Credentials',
      description: 'Trainer credentials export functionality would be implemented here.',
    });
  };

  const handleRefreshData = () => {
    fetchTrainerCredentials();
    toast({
      title: 'Data Refreshed',
      description: 'Trainer credentials data has been updated.',
    });
  };

  const stats = {
    totalTrainers: trainers.length,
    activeTrainers: trainers.filter(t => t.status === 'Active').length,
    compliantTrainers: trainers.filter(t => t.complianceStatus === 'Compliant').length,
    expiringCredentials: trainers.filter(t => t.complianceStatus === 'Expires Soon').length,
    highRiskTrainers: trainers.filter(t => t.riskLevel === 'High').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trainer/Assessor Credentials</h1>
          <p className="text-gray-600">Manage and monitor trainer and assessor qualifications and certifications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportCredentials}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Trainer
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Trainers</p>
                <p className="text-2xl font-bold">{stats.totalTrainers}</p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeTrainers}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-blue-600">{stats.compliantTrainers}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.expiringCredentials}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.highRiskTrainers}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search trainers..."
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
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Pending Review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Trainer">Trainer</SelectItem>
                <SelectItem value="Assessor">Assessor</SelectItem>
                <SelectItem value="Trainer/Assessor">Trainer/Assessor</SelectItem>
              </SelectContent>
            </Select>
            <Select value={complianceFilter} onValueChange={setComplianceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by compliance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Compliance</SelectItem>
                <SelectItem value="Compliant">Compliant</SelectItem>
                <SelectItem value="Expires Soon">Expires Soon</SelectItem>
                <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setRoleFilter('all');
                setComplianceFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trainer List */}
      <div className="space-y-4">
        {filteredTrainers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No trainers found</h3>
              <p className="text-gray-600">No trainers match the current filter criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTrainers.map((trainer) => (
            <Card key={trainer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{trainer.trainerName}</h3>
                      <Badge className={getStatusColor(trainer.status)}>
                        {trainer.status}
                      </Badge>
                      <Badge className={getComplianceColor(trainer.complianceStatus)}>
                        {trainer.complianceStatus}
                      </Badge>
                      <Badge className={getRiskColor(trainer.riskLevel)}>
                        {trainer.riskLevel} Risk
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <strong>ID:</strong> {trainer.trainerId}
                      </div>
                      <div>
                        <strong>Role:</strong> {trainer.role}
                      </div>
                      <div>
                        <strong>Employment:</strong> {trainer.employmentType}
                      </div>
                      <div>
                        <strong>Email:</strong> {trainer.email}
                      </div>
                      <div>
                        <strong>Phone:</strong> {trainer.phone}
                      </div>
                      <div>
                        <strong>Next Review:</strong> {new Date(trainer.nextReview).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Training Packages */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Training Packages:</h4>
                      <div className="flex flex-wrap gap-2">
                        {trainer.trainingPackages.map((pkg, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {pkg}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Quick Qualification Summary */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Qualifications ({trainer.qualifications.length}):</h4>
                      <div className="text-sm text-gray-600">
                        {trainer.qualifications.slice(0, 2).map((qual, index) => (
                          <div key={qual.id} className="flex items-center space-x-2 mb-1">
                            <GraduationCap className="h-4 w-4" />
                            <span>{qual.title} - {qual.institution}</span>
                          </div>
                        ))}
                        {trainer.qualifications.length > 2 && (
                          <div className="text-xs text-blue-600 mt-1">
                            +{trainer.qualifications.length - 2} more qualifications
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Certification Summary */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Certifications ({trainer.certifications.length}):</h4>
                      <div className="space-y-1">
                        {trainer.certifications.slice(0, 2).map((cert) => (
                          <div key={cert.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4" />
                              <span>{cert.title}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getCertificationStatusColor(cert.status)} variant="secondary">
                                {cert.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                        {trainer.certifications.length > 2 && (
                          <div className="text-xs text-blue-600">
                            +{trainer.certifications.length - 2} more certifications
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last reviewed: {new Date(trainer.lastReview).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    onClick={() => handleViewDetails(trainer)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  {trainer.complianceStatus !== 'Compliant' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendRenewalReminder(trainer.id)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          {selectedTrainer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>{selectedTrainer.trainerName} - Credential Details</span>
                </DialogTitle>
                <DialogDescription>
                  Complete credential information for {selectedTrainer.trainerName}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="qualifications" className="mt-4">
                <TabsList>
                  <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
                  <TabsTrigger value="certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="training-packages">Training Packages</TabsTrigger>
                </TabsList>

                <TabsContent value="qualifications" className="space-y-4">
                  {selectedTrainer.qualifications.map((qual) => (
                    <Card key={qual.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{qual.title}</h4>
                            <p className="text-sm text-gray-600">{qual.institution}</p>
                            <p className="text-sm text-gray-500">Level: {qual.level}</p>
                            <p className="text-sm text-gray-500">
                              Completed: {new Date(qual.completionDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className={qual.status === 'Valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {qual.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="certifications" className="space-y-4">
                  {selectedTrainer.certifications.map((cert) => (
                    <Card key={cert.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{cert.title}</h4>
                            <p className="text-sm text-gray-600">{cert.issuingBody}</p>
                            <p className="text-sm text-gray-500">
                              Issued: {new Date(cert.issueDate).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                            </p>
                            {cert.renewalRequired && (
                              <Badge variant="outline" className="mt-2">
                                Renewal Required
                              </Badge>
                            )}
                          </div>
                          <Badge className={getCertificationStatusColor(cert.status)}>
                            {cert.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="training-packages" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTrainer.trainingPackages.map((pkg, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                            <span className="font-medium">{pkg}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Credentials
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}