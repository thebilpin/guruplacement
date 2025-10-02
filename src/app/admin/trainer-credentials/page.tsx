'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, AlertTriangle, XCircle, Users, FileText, Clock, Plus, Search, Filter, Download, Eye, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: string;
  position: string;
  department: string;
  startDate: Date;
  status: string;
  complianceStatus: string;
  lastReviewDate: Date;
  nextReviewDate: Date;
  issues?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface Credential {
  id: string;
  trainerId: string;
  category: string;
  type: string;
  name: string;
  issuer: string;
  issueDate: Date;
  expiryDate: Date | null;
  status: string;
  verificationStatus: string;
  documentUrl: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardData {
  complianceOverview: {
    totalTrainers: number;
    compliantTrainers: number;
    actionRequiredTrainers: number;
    nonCompliantTrainers: number;
    complianceRate: number;
  };
  credentialStats: {
    totalCredentials: number;
    verifiedCredentials: number;
    pendingVerification: number;
    expiringSoon: number;
    expired: number;
  };
  expiringCredentials: Credential[];
  recentActivity: any[];
  upcomingReviews: Trainer[];
  alerts: any[];
}

export default function TrainerCredentialsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [trainerCredentials, setTrainerCredentials] = useState<Credential[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchTrainers();
    fetchCredentials();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchTerm, statusFilter]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/trainer-credentials?action=dashboard');
      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const processedData = {
          ...data,
          expiringCredentials: data.expiringCredentials?.map((cred: any) => ({
            ...cred,
            issueDate: new Date(cred.issueDate),
            expiryDate: cred.expiryDate ? new Date(cred.expiryDate) : null,
            createdAt: new Date(cred.createdAt),
            updatedAt: new Date(cred.updatedAt),
          })) || [],
          upcomingReviews: data.upcomingReviews?.map((trainer: any) => ({
            ...trainer,
            startDate: new Date(trainer.startDate),
            lastReviewDate: new Date(trainer.lastReviewDate),
            nextReviewDate: new Date(trainer.nextReviewDate),
            createdAt: new Date(trainer.createdAt),
            updatedAt: new Date(trainer.updatedAt),
          })) || [],
          recentActivity: data.recentActivity?.map((activity: any) => ({
            ...activity,
            timestamp: new Date(activity.timestamp),
          })) || [],
          alerts: data.alerts?.map((alert: any) => ({
            ...alert,
            createdAt: new Date(alert.createdAt),
          })) || []
        };
        setDashboardData(processedData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    }
  };

  const fetchTrainers = async () => {
    try {
      const response = await fetch('/api/admin/trainer-credentials?action=trainers');
      if (response.ok) {
        const data = await response.json();
        const trainersWithDates = data.trainers.map((trainer: any) => ({
          ...trainer,
          startDate: new Date(trainer.startDate),
          lastReviewDate: new Date(trainer.lastReviewDate),
          nextReviewDate: new Date(trainer.nextReviewDate),
          createdAt: new Date(trainer.createdAt),
          updatedAt: new Date(trainer.updatedAt),
        }));
        setTrainers(trainersWithDates);
      }
    } catch (error) {
      console.error('Error fetching trainers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/admin/trainer-credentials?action=credentials');
      if (response.ok) {
        const data = await response.json();
        const credentialsWithDates = data.credentials.map((cred: any) => ({
          ...cred,
          issueDate: new Date(cred.issueDate),
          expiryDate: cred.expiryDate ? new Date(cred.expiryDate) : null,
          createdAt: new Date(cred.createdAt),
          updatedAt: new Date(cred.updatedAt),
        }));
        setCredentials(credentialsWithDates);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    }
  };

  const fetchTrainerCredentials = async (trainerId: string) => {
    try {
      const response = await fetch(`/api/admin/trainer-credentials?action=credentials&trainerId=${trainerId}`);
      if (response.ok) {
        const data = await response.json();
        const credentialsWithDates = data.credentials.map((cred: any) => ({
          ...cred,
          issueDate: new Date(cred.issueDate),
          expiryDate: cred.expiryDate ? new Date(cred.expiryDate) : null,
          createdAt: new Date(cred.createdAt),
          updatedAt: new Date(cred.updatedAt),
        }));
        setTrainerCredentials(credentialsWithDates);
      }
    } catch (error) {
      console.error('Error fetching trainer credentials:', error);
    }
  };

  const filterTrainers = () => {
    let filtered = trainers;

    if (searchTerm) {
      filtered = filtered.filter(trainer =>
        `${trainer.firstName} ${trainer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainer.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(trainer => trainer.complianceStatus === statusFilter);
    }

    setFilteredTrainers(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle className="w-3 h-3 mr-1" />Compliant</Badge>;
      case 'Action Required':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Action Required</Badge>;
      case 'Non-Compliant':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200"><XCircle className="w-3 h-3 mr-1" />Non-Compliant</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCredentialStatusBadge = (status: string) => {
    switch (status) {
      case 'Current':
        return <Badge className="bg-green-100 text-green-800">Current</Badge>;
      case 'Expiring Soon':
        return <Badge className="bg-yellow-100 text-yellow-800">Expiring Soon</Badge>;
      case 'Expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Core Credentials':
        return <FileText className="w-4 h-4" />;
      case 'Vocational Competency':
        return <Users className="w-4 h-4" />;
      case 'Current Industry Skills':
        return <CheckCircle className="w-4 h-4" />;
      case 'Current VET Knowledge & Skills':
        return <FileText className="w-4 h-4" />;
      case 'Additional Requirements':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const openTrainerDetails = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    fetchTrainerCredentials(trainer.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trainer & Assessor Credentials</h1>
          <p className="text-muted-foreground mt-1">
            Compliance tracking for Standards for RTOs 2015 - Clauses 1.13 to 1.16
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="trainers">Trainers</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              {/* Compliance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Trainers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.complianceOverview.totalTrainers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliant</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{dashboardData.complianceOverview.compliantTrainers}</div>
                    <p className="text-xs text-muted-foreground">
                      {dashboardData.complianceOverview.complianceRate}% compliance rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Action Required</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData.complianceOverview.actionRequiredTrainers}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{dashboardData.complianceOverview.nonCompliantTrainers}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Credential Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Credential Overview</CardTitle>
                  <CardDescription>Current status of all trainer credentials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{dashboardData.credentialStats.totalCredentials}</div>
                      <p className="text-sm text-muted-foreground">Total Credentials</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{dashboardData.credentialStats.verifiedCredentials}</div>
                      <p className="text-sm text-muted-foreground">Verified</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{dashboardData.credentialStats.pendingVerification}</div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{dashboardData.credentialStats.expiringSoon}</div>
                      <p className="text-sm text-muted-foreground">Expiring Soon</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{dashboardData.credentialStats.expired}</div>
                      <p className="text-sm text-muted-foreground">Expired</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alerts and Expiring Credentials */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      Active Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dashboardData.alerts.length > 0 ? (
                      dashboardData.alerts.slice(0, 5).map((alert, index) => (
                        <Alert key={index} className={alert.severity === 'error' ? 'border-red-200' : 'border-yellow-200'}>
                          <AlertTitle className="text-sm">{alert.type}</AlertTitle>
                          <AlertDescription className="text-xs">{alert.message}</AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No active alerts</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Expiring Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.expiringCredentials.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.expiringCredentials.map((credential) => (
                          <div key={credential.id} className="flex justify-between items-center p-2 border rounded">
                            <div>
                              <p className="text-sm font-medium">{credential.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Expires: {credential.expiryDate ? credential.expiryDate.toLocaleDateString() : 'No expiry'}
                              </p>
                            </div>
                            {getCredentialStatusBadge(credential.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No expiring credentials</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Upcoming Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData.upcomingReviews.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Trainer</TableHead>
                          <TableHead>Position</TableHead>
                          <TableHead>Review Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardData.upcomingReviews.map((trainer) => (
                          <TableRow key={trainer.id}>
                            <TableCell className="font-medium">{trainer.firstName} {trainer.lastName}</TableCell>
                            <TableCell>{trainer.position}</TableCell>
                            <TableCell>{trainer.nextReviewDate.toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(trainer.complianceStatus)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">No upcoming reviews</p>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="trainers" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle>Search & Filter Trainers</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, employee ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">Compliance Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Compliant">Compliant</SelectItem>
                    <SelectItem value="Action Required">Action Required</SelectItem>
                    <SelectItem value="Non-Compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Trainers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Trainers & Assessors ({filteredTrainers.length})</CardTitle>
              <CardDescription>Click on a trainer to view detailed credentials and compliance information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Compliance Status</TableHead>
                    <TableHead>Next Review</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrainers.map((trainer) => (
                    <TableRow key={trainer.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {trainer.firstName} {trainer.lastName}
                        <br />
                        <span className="text-xs text-muted-foreground">{trainer.email}</span>
                      </TableCell>
                      <TableCell>{trainer.employeeId}</TableCell>
                      <TableCell>{trainer.position}</TableCell>
                      <TableCell>{trainer.department}</TableCell>
                      <TableCell>{getStatusBadge(trainer.complianceStatus)}</TableCell>
                      <TableCell>{trainer.nextReviewDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openTrainerDetails(trainer)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Credentials</CardTitle>
              <CardDescription>Comprehensive view of all trainer and assessor credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Credential</TableHead>
                    <TableHead>Issuer</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {credentials.map((credential) => {
                    const trainer = trainers.find(t => t.id === credential.trainerId);
                    return (
                      <TableRow key={credential.id}>
                        <TableCell className="font-medium">
                          {trainer ? `${trainer.firstName} ${trainer.lastName}` : 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(credential.category)}
                            <span className="text-sm">{credential.category}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{credential.name}</p>
                            <p className="text-xs text-muted-foreground">{credential.type}</p>
                          </div>
                        </TableCell>
                        <TableCell>{credential.issuer}</TableCell>
                        <TableCell>{credential.issueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          {credential.expiryDate ? credential.expiryDate.toLocaleDateString() : 'No expiry'}
                        </TableCell>
                        <TableCell>{getCredentialStatusBadge(credential.status)}</TableCell>
                        <TableCell>
                          <Badge variant={credential.verificationStatus === 'Verified' ? 'default' : 'secondary'}>
                            {credential.verificationStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standards for RTOs 2015 Requirements</CardTitle>
                <CardDescription>Clauses 1.13 to 1.16 - Minimum Requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">Core Credentials</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• TAE40122 Certificate IV in Training and Assessment</li>
                    <li>• For assessors: TAEASS402 (or newer) plus vocational competency</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm mb-2">Vocational Competency</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Qualifications and/or industry experience at or above training level</li>
                    <li>• Evidence: certificates, CV, reference letters, industry log</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Current Industry Skills</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Ongoing industry engagement</li>
                    <li>• Evidence: work experience, PD logs, memberships</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2">Current VET Knowledge & Skills</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                    <li>• Regular professional development in training and assessment</li>
                    <li>• Evidence: PD register, workshop certificates</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Progress</CardTitle>
                <CardDescription>Overall compliance tracking across all requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Core Credentials</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Vocational Competency</span>
                    <span>100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Industry Currency</span>
                    <span>67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>VET Knowledge</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Additional Requirements</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate and view compliance reports for audit purposes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Button className="h-20 flex flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span>Quarterly Review</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>Annual Audit</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Clock className="w-6 h-6" />
                  <span>Expiry Report</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Non-Compliance</span>
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Q3 2024 Trainer Compliance Review</TableCell>
                      <TableCell>Quarterly Review</TableCell>
                      <TableCell>2024-Q3</TableCell>
                      <TableCell>30/09/2024</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">Completed</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trainer Details Modal */}
      <Dialog open={!!selectedTrainer} onOpenChange={() => setSelectedTrainer(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTrainer ? `${selectedTrainer.firstName} ${selectedTrainer.lastName}` : 'Trainer Details'}
            </DialogTitle>
            <DialogDescription>
              Detailed credentials and compliance information
            </DialogDescription>
          </DialogHeader>
          
          {selectedTrainer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Employee ID</Label>
                  <p className="text-sm">{selectedTrainer.employeeId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Position</Label>
                  <p className="text-sm">{selectedTrainer.position}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Department</Label>
                  <p className="text-sm">{selectedTrainer.department}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Compliance Status</Label>
                  {getStatusBadge(selectedTrainer.complianceStatus)}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Credentials</h3>
                {trainerCredentials.length > 0 ? (
                  <div className="space-y-4">
                    {['Core Credentials', 'Vocational Competency', 'Current Industry Skills', 'Current VET Knowledge & Skills', 'Additional Requirements'].map(category => {
                      const categoryCredentials = trainerCredentials.filter(c => c.category === category);
                      if (categoryCredentials.length === 0) return null;
                      
                      return (
                        <div key={category}>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            {getCategoryIcon(category)}
                            {category}
                          </h4>
                          <div className="space-y-2 ml-6">
                            {categoryCredentials.map(credential => (
                              <div key={credential.id} className="border rounded p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-sm">{credential.name}</p>
                                    <p className="text-xs text-muted-foreground">{credential.issuer}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Issued: {credential.issueDate.toLocaleDateString()}
                                      {credential.expiryDate && ` • Expires: ${credential.expiryDate.toLocaleDateString()}`}
                                    </p>
                                    {credential.notes && (
                                      <p className="text-xs text-muted-foreground mt-1">{credential.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    {getCredentialStatusBadge(credential.status)}
                                    <Badge variant={credential.verificationStatus === 'Verified' ? 'default' : 'secondary'} className="text-xs">
                                      {credential.verificationStatus}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No credentials found</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}