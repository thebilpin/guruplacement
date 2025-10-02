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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ComplianceDashboardData, ComplianceAlert, ExpiringDocument } from '@/lib/schemas/compliance';

export default function AdminCompliancePage() {
  const [dashboardData, setDashboardData] = useState<ComplianceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch compliance data
  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/compliance');
      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        console.error('Failed to fetch compliance data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
          <Button>
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
                  <Button className="w-full">Run AI Analysis</Button>
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

        {/* Active Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <AlertsSection alerts={activeAlerts} onRefresh={fetchDashboardData} />
        </TabsContent>

        {/* Document Management Tab */}
        <TabsContent value="documents" className="space-y-6">
          <DocumentsSection 
            expiringDocuments={expiringDocuments}
            stats={stats}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        {/* Audit Management Tab */}
        <TabsContent value="audits" className="space-y-6">
          <AuditsSection 
            recentAudits={recentAudits}
            upcomingAudits={upcomingAudits}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <ReportsSection stats={stats} />
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

// Alerts Section Component
function AlertsSection({ 
  alerts, 
  onRefresh 
}: { 
  alerts: ComplianceAlert[];
  onRefresh: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Compliance Alerts</CardTitle>
        <CardDescription>
          {alerts.length} active alerts requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className={`p-2 rounded-full ${
                alert.severity === 'critical' ? 'bg-red-100 text-red-600' :
                alert.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant={
                    alert.severity === 'critical' ? 'destructive' :
                    alert.severity === 'high' ? 'destructive' :
                    'secondary'
                  }>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {alert.organizationName} • {new Date(alert.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Acknowledge</Button>
                    <Button size="sm">Resolve</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Documents Section Component
function DocumentsSection({ 
  expiringDocuments, 
  stats, 
  onRefresh 
}: { 
  expiringDocuments: ExpiringDocument[];
  stats: any;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.validDocuments}</p>
              <p className="text-sm text-muted-foreground">Valid Documents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{stats.expiringDocuments}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.expiredDocuments}</p>
              <p className="text-sm text-muted-foreground">Expired</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents Expiring Soon</CardTitle>
          <CardDescription>
            Documents requiring renewal within the next 30 days
          </CardDescription>
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
                    <Button size="sm" variant="outline">
                      Notify
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Audits Section Component
function AuditsSection({ 
  recentAudits, 
  upcomingAudits, 
  onRefresh 
}: { 
  recentAudits: any[];
  upcomingAudits: any[];
  onRefresh: () => void;
}) {
  return (
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
                  <p className="font-medium">{audit.auditorName || 'System Audit'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(audit.auditDate).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={
                  audit.status === 'completed' ? 'default' :
                  audit.status === 'in_progress' ? 'secondary' :
                  'outline'
                }>
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
  );
}

// Reports Section Component
function ReportsSection({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Summary Report</CardTitle>
          <CardDescription>Key metrics and trends</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Organizations:</span>
              <span className="font-medium">{stats.totalOrganizations}</span>
            </div>
            <div className="flex justify-between">
              <span>Compliant:</span>
              <span className="font-medium text-green-600">{stats.compliantOrganizations}</span>
            </div>
            <div className="flex justify-between">
              <span>Non-Compliant:</span>
              <span className="font-medium text-red-600">{stats.nonCompliantOrganizations}</span>
            </div>
            <div className="flex justify-between">
              <span>Under Review:</span>
              <span className="font-medium text-orange-600">{stats.underReviewOrganizations}</span>
            </div>
          </div>
          <Button className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Download Full Report
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export Options</CardTitle>
          <CardDescription>Generate compliance reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <FileCheck className="mr-2 h-4 w-4" />
            Compliance Certificates
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Activity className="mr-2 h-4 w-4" />
            Audit Trail Report
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="mr-2 h-4 w-4" />
            Document Expiry Report
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="mr-2 h-4 w-4" />
            Organization Status Report
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}