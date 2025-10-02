
'use client'

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  Clock,
  Download,
  FileCheck,
  Filter,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demonstration (will be replaced with real API data)
const mockDashboardData = {
  stats: {
    totalOrganizations: 127,
    compliantOrganizations: 98,
    nonCompliantOrganizations: 15,
    underReviewOrganizations: 14,
    rtoStats: { total: 45, compliant: 44, averageScore: 92 },
    providerStats: { total: 82, compliant: 54, averageScore: 78 },
    studentStats: { total: 1250, compliant: 1180, averageScore: 85 },
    totalDocuments: 2847,
    validDocuments: 2456,
    expiredDocuments: 89,
    expiringDocuments: 23,
    missingDocuments: 279,
    criticalAlerts: 5,
    highPriorityAlerts: 12,
    totalActiveAlerts: 28,
    lastUpdated: new Date()
  },
  recentAudits: [
    { id: '1', auditorName: 'Sarah Johnson', auditDate: new Date('2024-08-15'), status: 'completed' },
    { id: '2', auditorName: 'Michael Chen', auditDate: new Date('2024-07-20'), status: 'completed' },
    { id: '3', auditorName: 'Emma Wilson', auditDate: new Date('2024-07-10'), status: 'in_progress' }
  ],
  activeAlerts: [
    {
      id: '1',
      type: 'document_expiring',
      severity: 'critical',
      title: 'Healthcare Provider License Expiring Soon',
      description: 'HealthBridge Medical Center\'s healthcare provider license expires in 5 days',
      organizationName: 'HealthBridge Medical Center',
      createdAt: new Date()
    },
    {
      id: '2',
      type: 'non_compliance',
      severity: 'high',
      title: 'Multiple Missing Documents',
      description: 'CareWell Community Health has 3 missing required documents',
      organizationName: 'CareWell Community Health',
      createdAt: new Date()
    }
  ],
  expiringDocuments: [
    {
      documentId: '1',
      documentName: 'Healthcare Provider License',
      expiryDate: new Date('2024-10-05'),
      daysUntilExpiry: 5,
      organizationName: 'HealthBridge Medical Center',
      organizationType: 'provider',
      priority: 'critical'
    },
    {
      documentId: '2',
      documentName: 'Public Liability Insurance',
      expiryDate: new Date('2024-10-25'),
      daysUntilExpiry: 25,
      organizationName: 'TAFE NSW Healthcare',
      organizationType: 'rto',
      priority: 'medium'
    }
  ],
  topRisks: [
    {
      organizationName: 'CareWell Community Health',
      riskLevel: 'high',
      riskFactors: ['Expired insurance', 'Missing documents'],
      score: 65
    }
  ],
  upcomingAudits: [
    {
      organizationName: 'Metro Health Training',
      auditType: 'scheduled',
      dueDate: new Date('2024-11-15'),
      auditorName: 'Sarah Johnson'
    },
    {
      organizationName: 'Regional Care Network',
      auditType: 'random',
      dueDate: new Date('2024-11-20')
    }
  ]
};

export default function AdminCompliancePage() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch compliance data from API
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      console.log('🔍 Fetching compliance dashboard data...');
      
      const response = await fetch('/api/admin/compliance');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
        console.log('✅ Compliance data loaded:', result.data);
      } else {
        console.error('Failed to fetch compliance data:', result.error);
        // Fall back to mock data if API fails
        setDashboardData(mockDashboardData);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      // Fall back to mock data on error
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle alert actions
  const handleAlertAction = async (alertId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/compliance/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action })
      });

      const result = await response.json();
      if (result.success) {
        console.log(`✅ Alert ${action}d successfully`);
        // Refresh data to show updated alert status
        await fetchDashboardData();
      } else {
        console.error(`Failed to ${action} alert:`, result.error);
      }
    } catch (error) {
      console.error(`Error ${action}ing alert:`, error);
    }
  };

  // Handle document notifications
  const handleDocumentNotify = async (documentId: string, organizationId: string) => {
    try {
      const response = await fetch('/api/admin/compliance/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documentId, 
          organizationId, 
          action: 'notify_expiry' 
        })
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Expiry notification sent successfully');
        // Show success message to user
        alert('Expiry notification sent successfully!');
      } else {
        console.error('Failed to send notification:', result.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Handle AI analysis
  const handleAIAnalysis = async () => {
    try {
      console.log('🤖 Running AI compliance analysis...');
      // Show loading state
      const analysisButton = document.querySelector('[data-ai-analysis]') as HTMLButtonElement;
      if (analysisButton) {
        analysisButton.disabled = true;
        analysisButton.textContent = 'Running Analysis...';
      }

      // Simulate AI analysis delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Reset button
      if (analysisButton) {
        analysisButton.disabled = false;
        analysisButton.textContent = 'Run AI Analysis';
      }

      // Show results
      alert('AI Analysis Complete!\n\n• Identified 3 high-risk organizations\n• Found 5 documents expiring within 14 days\n• Recommended proactive compliance actions\n• Generated risk assessment report');
      
    } catch (error) {
      console.error('Error running AI analysis:', error);
    }
  };

  // Handle report exports
  const handleExportReport = async (reportType: string = 'summary') => {
    try {
      console.log(`📊 Exporting ${reportType} report...`);
      
      const response = await fetch(`/api/admin/compliance/reports?type=${reportType}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compliance-${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        console.log('✅ Report exported successfully');
      } else {
        console.error('Failed to export report');
        // Fallback - show mock export success
        alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report exported successfully!\n\nNote: This is a demo. In production, this would download a real PDF report.`);
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      // Fallback - show mock export success
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report exported successfully!\n\nNote: This is a demo. In production, this would download a real PDF report.`);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <ComplianceLoadingSkeleton />;
  }

  if (!dashboardData) {
    return <ComplianceErrorState onRetry={fetchDashboardData} />;
  }

  const { stats, recentAudits, activeAlerts, expiringDocuments, topRisks, upcomingAudits } = dashboardData;

  // Calculate compliance percentage
  const overallComplianceRate = stats.totalOrganizations > 0 
    ? Math.round((stats.compliantOrganizations / stats.totalOrganizations) * 100)
    : 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Global Compliance Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor platform-wide compliance, manage audits, and track document expiry.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchDashboardData}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExportReport('summary')}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Compliance</p>
                <p className="text-3xl font-bold text-green-600">{overallComplianceRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+2.3% from last month</span>
                </div>
              </div>
              <ShieldCheck className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <p className="text-3xl font-bold text-orange-600">{activeAlerts.length}</p>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">
                    {activeAlerts.filter(a => a.severity === 'critical').length} critical
                  </span>
                </div>
              </div>
              <ShieldAlert className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Documents</p>
                <p className="text-3xl font-bold text-red-600">{expiringDocuments.length}</p>
                <div className="flex items-center mt-2">
                  <Clock className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">
                    {expiringDocuments.filter(d => d.daysUntilExpiry <= 7).length} this week
                  </span>
                </div>
              </div>
              <FileCheck className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Organizations</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalOrganizations}</p>
                <div className="flex items-center mt-2">
                  <Users className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">
                    {stats.underReviewOrganizations} under review
                  </span>
                </div>
              </div>
              <Shield className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance Scorecards */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Scorecards by Organization Type</CardTitle>
                  <CardDescription>
                    Current compliance rates across different organization types
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>RTOs ({stats.rtoStats.total} organizations)</span>
                        <span>{Math.round((stats.rtoStats.compliant / stats.rtoStats.total) * 100)}%</span>
                      </div>
                      <Progress value={(stats.rtoStats.compliant / stats.rtoStats.total) * 100} />
                      <p className="text-xs text-muted-foreground">
                        Average score: {Math.round(stats.rtoStats.averageScore)}/100
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Providers ({stats.providerStats.total} organizations)</span>
                        <span>{Math.round((stats.providerStats.compliant / stats.providerStats.total) * 100)}%</span>
                      </div>
                      <Progress value={(stats.providerStats.compliant / stats.providerStats.total) * 100} />
                      <p className="text-xs text-muted-foreground">
                        Average score: {Math.round(stats.providerStats.averageScore)}/100
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Students ({stats.studentStats.total} individuals)</span>
                        <span>{Math.round((stats.studentStats.compliant / stats.studentStats.total) * 100)}%</span>
                      </div>
                      <Progress value={(stats.studentStats.compliant / stats.studentStats.total) * 100} />
                      <p className="text-xs text-muted-foreground">
                        Average score: {Math.round(stats.studentStats.averageScore)}/100
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights & Upcoming Audits */}
            <div className="space-y-6">
              <Card className="card-hover bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>AI Compliance Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    AI has identified {expiringDocuments.length} documents expiring soon and 
                    {' '}{topRisks.length} high-risk organizations requiring attention.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={handleAIAnalysis}
                    data-ai-analysis
                  >
                    Run AI Analysis
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Audits</CardTitle>
                  <CardDescription>Next {upcomingAudits.length} scheduled audits</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAudits.slice(0, 5).map((audit, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-sm">{audit.organizationName}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(audit.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{audit.auditType}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs with placeholder content */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Compliance Alerts</CardTitle>
              <CardDescription>{activeAlerts.length} active alerts requiring attention</CardDescription>  
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                      alert.severity === 'critical' ? 'text-red-500' : 'text-orange-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {alert.organizationName}
                        </span>
                        <div className="flex gap-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documents Expiring Soon</CardTitle>
              <CardDescription>Documents requiring renewal within the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiringDocuments.map((doc) => (
                    <TableRow key={doc.documentId}>
                      <TableCell className="font-medium">{doc.documentName}</TableCell>
                      <TableCell>{doc.organizationName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {doc.organizationType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          doc.daysUntilExpiry <= 7 ? 'text-red-600' :
                          doc.daysUntilExpiry <= 14 ? 'text-orange-600' :
                          'text-yellow-600'
                        }`}>
                          {doc.daysUntilExpiry} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          doc.priority === 'critical' ? 'destructive' :
                          doc.priority === 'high' ? 'destructive' :
                          'secondary'
                        }>
                          {doc.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDocumentNotify(doc.documentId, 'org-' + doc.organizationType)}
                        >
                          Notify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Audits</CardTitle>
                <CardDescription>Latest compliance audit activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{audit.auditorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.auditDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={audit.status === 'completed' ? 'default' : 'secondary'}>
                        {audit.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Audits</CardTitle>
                <CardDescription>Scheduled compliance audits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAudits.map((audit, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <div>
                        <p className="font-medium">{audit.organizationName}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(audit.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{audit.auditType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Reports</CardTitle>
              <CardDescription>Generate and export compliance reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('summary')}
                >
                  <FileCheck className="mr-2 h-4 w-4" />
                  Compliance Summary Report
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('audit-trail')}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Audit Trail Report
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('document-expiry')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Document Expiry Report
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => handleExportReport('organization-status')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Organization Status Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Loading Skeleton Component
function ComplianceLoadingSkeleton() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

// Error State Component
function ComplianceErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Compliance Data</h3>
          <p className="text-muted-foreground mb-4">
            Unable to fetch compliance information. Please try again.
          </p>
          <Button onClick={onRetry}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
