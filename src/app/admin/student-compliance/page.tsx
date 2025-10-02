'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Calendar,
  Download,
  Upload,
  Eye,
  Edit,
  Mail,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Shield,
  BookOpen,
  Heart,
  Database,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface StudentComplianceStats {
  totalStudents: number;
  compliantStudents: number;
  nonCompliantStudents: number;
  inProgressStudents: number;
  pendingReviewStudents: number;
  
  enrolmentEligibilityRate: number;
  workPlacementComplianceRate: number;
  attendanceProgressRate: number;
  healthSafetyRate: number;
  dataReportingRate: number;
  otherGovernanceRate: number;
  
  criticalAlerts: number;
  highPriorityAlerts: number;
  totalActiveAlerts: number;
  
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  expiringDocuments: number;
  missingDocuments: number;
  
  activePlacements: number;
  completedPlacements: number;
  suspendedPlacements: number;
  
  complianceScoreTrend: number;
  documentSubmissionTrend: number;
  placementCompletionTrend: number;
  
  lastUpdated: Date;
}

interface StudentComplianceAlert {
  id: string;
  studentName: string;
  alertType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: Date;
  dueDate?: Date;
}

interface StudentComplianceRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  rtoName: string;
  providerName?: string;
  courseName: string;
  overallComplianceStatus: 'compliant' | 'non_compliant' | 'in_progress' | 'pending_review';
  overallComplianceScore: number;
  lastUpdated: Date;
  currentPlacement?: {
    hoursRequired: number;
    hoursCompleted: number;
    status: string;
  };
}

interface DashboardData {
  stats: StudentComplianceStats;
  recentAlerts: StudentComplianceAlert[];
  expiringDocuments: any[];
  complianceBreaches: any[];
  upcomingDeadlines: any[];
  recentActivity: any[];
}

function StudentCompliancePage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [students, setStudents] = useState<StudentComplianceRecord[]>([]);
  const [alerts, setAlerts] = useState<StudentComplianceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentComplianceRecord | null>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchStudents();
    fetchAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching compliance dashboard data...');
      const response = await fetch('/api/admin/student-compliance?action=dashboard');
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Dashboard data received:', data);
      
      // Convert date strings to Date objects with error handling
      const processedData = {
        ...data,
        recentAlerts: data.recentAlerts?.map((alert: any) => {
          try {
            return {
              ...alert,
              createdAt: new Date(alert.createdAt),
              updatedAt: new Date(alert.updatedAt),
              acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
              resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
              dueDate: alert.dueDate ? new Date(alert.dueDate) : undefined,
            };
          } catch (dateError) {
            console.warn('Error processing alert dates:', dateError, alert);
            return alert;
          }
        }) || [],
        expiringDocuments: data.expiringDocuments?.map((doc: any) => {
          try {
            return {
              ...doc,
              expiryDate: doc.expiryDate ? new Date(doc.expiryDate) : undefined,
            };
          } catch (dateError) {
            console.warn('Error processing document dates:', dateError, doc);
            return doc;
          }
        }) || [],
        recentActivity: data.recentActivity?.map((activity: any) => {
          try {
            return {
              ...activity,
              date: new Date(activity.date),
            };
          } catch (dateError) {
            console.warn('Error processing activity dates:', dateError, activity);
            return activity;
          }
        }) || []
      };
      
      setDashboardData(processedData);
      console.log('Dashboard data processed successfully');
      
    } catch (error) {
      console.error('Failed to fetch compliance data:', error);
      // Don't show toast for now to avoid spam
      // toast({
      //   title: "Error",
      //   description: "Failed to load dashboard data",
      //   variant: "destructive"
      // });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/admin/student-compliance?action=students');
      if (response.ok) {
        const data = await response.json();
        const studentsWithDates = (data.students || []).map((student: any) => ({
          ...student,
          createdAt: new Date(student.createdAt),
          updatedAt: new Date(student.updatedAt),
          lastUpdated: new Date(student.lastUpdated),
        }));
        setStudents(studentsWithDates);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/student-compliance?action=alerts');
      if (response.ok) {
        const data = await response.json();
        const alertsWithDates = (data.alerts || []).map((alert: any) => ({
          ...alert,
          createdAt: new Date(alert.createdAt),
          updatedAt: new Date(alert.updatedAt),
          acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : undefined,
          dueDate: alert.dueDate ? new Date(alert.dueDate) : undefined,
        }));
        setAlerts(alertsWithDates);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchDashboardData(), fetchStudents(), fetchAlerts()]);
    setLoading(false);
    toast({
      title: "Refreshed",
      description: "Data has been refreshed successfully"
    });
  };

  const handleAlertAction = async (alertId: string, action: 'acknowledge' | 'resolve') => {
    try {
      const response = await fetch('/api/admin/student-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'acknowledge' ? 'acknowledge_alert' : 'resolve_alert',
          alertId,
          acknowledgedBy: 'Admin User',
          resolvedBy: 'Admin User'
        })
      });

      if (response.ok) {
        await fetchAlerts();
        await fetchDashboardData();
        toast({
          title: "Success",
          description: `Alert ${action}d successfully`
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} alert`,
        variant: "destructive"
      });
    }
  };

  const handleExportReport = (reportType: string) => {
    try {
      console.log('Exporting report:', reportType);
      
      // Mock export functionality - create a simple CSV or JSON download
      const exportData = {
        reportType,
        generatedAt: new Date().toISOString(),
        dashboardData: dashboardData,
        students: students.slice(0, 10), // Limit for demo
        totalStudents: students.length
      };
      
      // Create downloadable file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Completed",
        description: `${reportType} report has been downloaded successfully`
      });
      
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendReminder = async (studentId: string, category: string, item: string) => {
    try {
      const response = await fetch('/api/admin/student-compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_reminder',
          studentId,
          category,
          item
        })
      });

      if (response.ok) {
        toast({
          title: "Reminder Sent",
          description: "Compliance reminder has been sent to the student"
        });
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      compliant: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-300' },
      non_compliant: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-300' },
      in_progress: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800 border-blue-300' },
      pending_review: { variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      active: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 border-blue-300' },
      acknowledged: { variant: 'secondary' as const, className: 'bg-orange-100 text-orange-800 border-orange-300' },
      resolved: { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-300' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_review;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </Badge>
    );
  };

  const getSeverityBadge = (severity: 'critical' | 'high' | 'medium' | 'low') => {
    const severityConfig = {
      critical: 'bg-red-500 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-white',
      low: 'bg-green-500 text-white'
    };

    return (
      <Badge className={severityConfig[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || student.overallComplianceStatus === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading student compliance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Compliance Management</h1>
          <p className="text-gray-600 mt-2">Comprehensive tracking and management of student compliance requirements</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => handleExportReport('Student Compliance Summary')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            Students
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="enrolment">
            <BookOpen className="h-4 w-4 mr-2" />
            Enrolment
          </TabsTrigger>
          <TabsTrigger value="placements">
            <Shield className="h-4 w-4 mr-2" />
            Placements
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {dashboardData && (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">+{dashboardData.stats.complianceScoreTrend}%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Compliant Students</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{dashboardData.stats.compliantStudents}</div>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((dashboardData.stats.compliantStudents / dashboardData.stats.totalStudents) * 100)}% compliance rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{dashboardData.stats.totalActiveAlerts}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600">{dashboardData.stats.criticalAlerts} critical</span>, {dashboardData.stats.highPriorityAlerts} high priority
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Document Status</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{dashboardData.stats.validDocuments}/{dashboardData.stats.totalDocuments}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-red-600">{dashboardData.stats.expiredDocuments} expired</span>, {dashboardData.stats.expiringDocuments} expiring
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Categories */}
              <Card>
                <CardHeader>
                  <CardTitle>Compliance by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'Enrolment & Eligibility', rate: dashboardData.stats.enrolmentEligibilityRate, icon: BookOpen },
                      { name: 'Work Placement', rate: dashboardData.stats.workPlacementComplianceRate, icon: Shield },
                      { name: 'Attendance & Progress', rate: dashboardData.stats.attendanceProgressRate, icon: Clock },
                      { name: 'Health & Safety', rate: dashboardData.stats.healthSafetyRate, icon: Heart },
                      { name: 'Data & Reporting', rate: dashboardData.stats.dataReportingRate, icon: Database },
                      { name: 'Other Governance', rate: dashboardData.stats.otherGovernanceRate, icon: Settings }
                    ].map((category, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <category.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <span className="text-sm font-bold">{category.rate}%</span>
                        </div>
                        <Progress value={category.rate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Alerts and Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.recentAlerts.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.recentAlerts.map((alert) => (
                          <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="font-medium text-sm">{alert.studentName}</span>
                                {getSeverityBadge(alert.severity)}
                              </div>
                              <p className="text-sm text-gray-600">{alert.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{alert.description}</p>
                            </div>
                            <div className="flex space-x-1 ml-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAlertAction(alert.id, 'resolve')}
                              >
                                Resolve
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No recent alerts</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expiring Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {dashboardData.expiringDocuments.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.expiringDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                            <div>
                              <p className="font-medium text-sm">{doc.studentName}</p>
                              <p className="text-sm text-gray-600">{doc.documentName}</p>
                              <p className="text-xs text-orange-600">Expires in {doc.daysUntilExpiry} days</p>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSendReminder(doc.studentId, doc.category, doc.item)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Remind
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No expiring documents</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students List */}
          <div className="grid gap-4">
            {filteredStudents.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{student.studentName}</h3>
                        {getStatusBadge(student.overallComplianceStatus)}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <p><span className="font-medium">Email:</span> {student.studentEmail}</p>
                        <p><span className="font-medium">Course:</span> {student.courseName}</p>
                        <p><span className="font-medium">RTO:</span> {student.rtoName}</p>
                        <p><span className="font-medium">Provider:</span> {student.providerName || 'N/A'}</p>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Compliance Score</span>
                          <span className="text-sm font-bold">{student.overallComplianceScore}%</span>
                        </div>
                        <Progress value={student.overallComplianceScore} className="h-2" />
                      </div>
                      {student.currentPlacement && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Placement Progress</span>
                            <span className="text-sm">
                              {student.currentPlacement.hoursCompleted}/{student.currentPlacement.hoursRequired} hours
                            </span>
                          </div>
                          <Progress 
                            value={(student.currentPlacement.hoursCompleted / student.currentPlacement.hoursRequired) * 100} 
                            className="h-2" 
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Student Compliance Details - {student.studentName}</DialogTitle>
                          </DialogHeader>
                          {selectedStudent && (
                            <StudentComplianceDetails student={selectedStudent} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students found matching your criteria</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Compliance Alerts</CardTitle>
              <p className="text-gray-600">Monitor and manage compliance alerts for all students</p>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <h3 className="font-semibold">{alert.title}</h3>
                            {getSeverityBadge(alert.severity)}
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-gray-600 mb-2">{alert.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                            <p><span className="font-medium">Student:</span> {alert.studentName}</p>
                            <p><span className="font-medium">Type:</span> {alert.alertType.replace(/_/g, ' ')}</p>
                            <p><span className="font-medium">Created:</span> {alert.createdAt.toLocaleDateString()}</p>
                            {alert.dueDate && (
                              <p><span className="font-medium">Due:</span> {alert.dueDate.toLocaleDateString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          {alert.status === 'active' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAlertAction(alert.id, 'acknowledge')}
                              >
                                Acknowledge
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAlertAction(alert.id, 'resolve')}
                              >
                                Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active alerts</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would be implemented similarly */}
        <TabsContent value="enrolment">
          <Card>
            <CardHeader>
              <CardTitle>Enrolment & Eligibility Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detailed enrolment and eligibility compliance tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements">
          <Card>
            <CardHeader>
              <CardTitle>Work Placement Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Work placement compliance management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Student Compliance Summary', description: 'Overall compliance status for all students' },
                  { name: 'Document Expiry Report', description: 'List of expiring and expired documents' },
                  { name: 'Placement Progress Report', description: 'Work placement progress and compliance' },
                  { name: 'Compliance Trends Report', description: 'Historical compliance trends and analysis' },
                  { name: 'Alert Activity Report', description: 'Summary of compliance alerts and resolutions' },
                  { name: 'RTO Compliance Report', description: 'Compliance status by RTO organization' }
                ].map((report, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">{report.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleExportReport(report.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Student Compliance Details Component
function StudentComplianceDetails({ student }: { student: StudentComplianceRecord }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><span className="font-medium">Student ID:</span> {student.id}</p>
          <p><span className="font-medium">Email:</span> {student.studentEmail}</p>
          <p><span className="font-medium">RTO:</span> {student.rtoName}</p>
        </div>
        <div>
          <p><span className="font-medium">Course:</span> {student.courseName}</p>
          <p><span className="font-medium">Provider:</span> {student.providerName || 'N/A'}</p>
          <p><span className="font-medium">Last Updated:</span> {student.lastUpdated.toLocaleDateString()}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold">Compliance Categories</h4>
        
        {/* Mock compliance details - in real implementation would fetch detailed compliance data */}
        {[
          { name: 'Enrolment & Eligibility', items: ['RTO Enrolment', 'USI Validation', 'ID Checks', 'Training Plan', 'LLN Assessment'] },
          { name: 'Work Placement', items: ['Police Check', 'WWCC', 'Immunisation', 'First Aid', 'Placement Agreement'] },
          { name: 'Attendance & Progress', items: ['Timesheets', 'Minimum Hours', 'Assessment Evidence', 'Supervisor Sign-off'] },
          { name: 'Health & Safety', items: ['WHS Induction', 'Incident Reporting', 'Insurance', 'Emergency Contacts'] },
          { name: 'Data & Reporting', items: ['AVETMISS', 'Progress Records', 'Feedback', 'Competency Mapping'] },
          { name: 'Other Governance', items: ['Privacy Agreement', 'Code of Conduct', 'Appeals Process', 'Student Handbook'] }
        ].map((category, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{item}</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Compliant
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default StudentCompliancePage;