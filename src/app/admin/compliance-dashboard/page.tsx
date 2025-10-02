'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  TrendingUp, 
  Download,
  Eye,
  Bell,
  Calendar,
  Target,
  BookOpen,
  Building,
  GraduationCap,
  BarChart3,
  Archive,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  student: any;
  trainer: any;
  provider: any;
  rto: any;
  admin: any;
}

interface TrafficLightStatus {
  student: { status: 'GREEN' | 'YELLOW' | 'RED'; critical: number; active: number };
  trainer: { status: 'GREEN' | 'YELLOW' | 'RED'; critical: number; active: number };
  provider: { status: 'GREEN' | 'YELLOW' | 'RED'; critical: number; active: number };
  rto: { status: 'GREEN' | 'YELLOW' | 'RED'; critical: number; active: number };
}

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  dashboardType: string;
  entityName: string;
  dueDate: Date;
  status: string;
  escalationLevel: number;
  createdAt: Date;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: Date;
  details: string;
}

export default function AdminComplianceDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trafficLight, setTrafficLight] = useState<TrafficLightStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDashboard, setSelectedDashboard] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 2 minutes for admin dashboard
    const interval = setInterval(fetchDashboardData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch comprehensive admin dashboard data
      const [statsResponse, trafficResponse, alertsResponse, logsResponse] = await Promise.all([
        fetch('/api/admin/audit-scheduler?action=dashboard'),
        fetch('/api/admin/audit-scheduler?action=traffic-light'),
        fetch('/api/admin/audit-scheduler?action=alerts'),
        fetch('/api/admin/audit-scheduler?action=audit-logs')
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats);
      }

      if (trafficResponse.ok) {
        const trafficData = await trafficResponse.json();
        setTrafficLight(trafficData.trafficLight);
      }

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        const alertsWithDates = alertsData.alerts.map((alert: any) => ({
          ...alert,
          dueDate: new Date(alert.dueDate),
          createdAt: new Date(alert.createdAt),
        }));
        setAlerts(alertsWithDates);
      }

      if (logsResponse.ok) {
        const logsData = await logsResponse.json();
        const logsWithDates = logsData.logs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
        setAuditLogs(logsWithDates);
      }

    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAuditPack = async () => {
    try {
      const response = await fetch('/api/admin/audit-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'export-audit-pack' })
      });

      if (response.ok) {
        const data = await response.json();
        // In a real app, this would trigger a file download
        toast({
          title: "Success",
          description: "Audit evidence pack generated successfully"
        });
      }
    } catch (error) {
      console.error('Error generating audit pack:', error);
      toast({
        title: "Error",
        description: "Failed to generate audit pack",
        variant: "destructive"
      });
    }
  };

  const processEscalations = async () => {
    try {
      const response = await fetch('/api/admin/audit-scheduler?action=process-escalations');
      if (response.ok) {
        toast({
          title: "Success",
          description: "Escalations processed successfully"
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error processing escalations:', error);
    }
  };

  const getTrafficLightColor = (status: 'GREEN' | 'YELLOW' | 'RED') => {
    switch (status) {
      case 'GREEN': return 'bg-green-500';
      case 'YELLOW': return 'bg-yellow-500';
      case 'RED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH': return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'MEDIUM': return <Badge variant="secondary">Medium</Badge>;
      case 'LOW': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'STUDENT': return <GraduationCap className="w-4 h-4" />;
      case 'TRAINER': return <Users className="w-4 h-4" />;
      case 'PROVIDER': return <Building className="w-4 h-4" />;
      case 'RTO': return <BookOpen className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
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
          <h1 className="text-3xl font-bold tracking-tight">⚙️ Admin / Compliance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Master compliance monitoring and audit management system
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={processEscalations} variant="outline">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Process Escalations
          </Button>
          <Button onClick={generateAuditPack}>
            <Download className="w-4 h-4 mr-2" />
            Generate Audit Evidence Pack
          </Button>
        </div>
      </div>

      {/* Global Traffic Light Compliance Board */}
      {trafficLight && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Global Traffic Light Compliance Board
            </CardTitle>
            <CardDescription>Real-time compliance status across all dashboard types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(trafficLight).map(([type, status]) => (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-3">
                    {getDashboardIcon(type.toUpperCase())}
                    <span className="ml-2 font-semibold capitalize">{type}</span>
                  </div>
                  <div className={`w-16 h-16 rounded-full ${getTrafficLightColor(status.status)} mx-auto mb-3 flex items-center justify-center`}>
                    <div className="w-12 h-12 rounded-full bg-white/30"></div>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Critical:</span>
                      <span className="font-semibold text-red-600">{status.critical}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-semibold">{status.active}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Master Alerts</TabsTrigger>
          <TabsTrigger value="audit-calendar">Audit Calendar</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Master Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Active Alerts</CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.student.activeAlerts + stats.trainer.activeAlerts + stats.provider.activeAlerts + stats.rto.activeAlerts}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all dashboards</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.student.criticalAlerts + stats.trainer.criticalAlerts + stats.provider.criticalAlerts + stats.rto.criticalAlerts}
                  </div>
                  <p className="text-xs text-muted-foreground">Require immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.student.overdueTasks + stats.trainer.overdueTasks + stats.provider.overdueTasks + stats.rto.overdueTasks}
                  </div>
                  <p className="text-xs text-muted-foreground">Past due date</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Escalated Alerts</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {alerts.filter(a => a.status === 'ESCALATED').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Unresolved &gt;14 days</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Dashboard-specific Statistics */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Compliance Overview</CardTitle>
                  <CardDescription>Alert distribution across dashboard types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stats).map(([type, data]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-2">
                          {getDashboardIcon(type.toUpperCase())}
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-red-600">Critical: {data.criticalAlerts}</span>
                          <span className="text-yellow-600">Active: {data.activeAlerts}</span>
                          <span className="text-gray-600">Total: {data.totalAlerts}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health Indicators</CardTitle>
                  <CardDescription>Key performance metrics for compliance system</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Compliance Rate</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Alert Resolution Rate</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>On-time Task Completion</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>System Audit Readiness</span>
                      <span>96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                Master Alert Management ({alerts.filter(a => a.status === 'ACTIVE').length} Active)
              </CardTitle>
              <CardDescription>Comprehensive view of all compliance alerts across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escalation</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.slice(0, 20).map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-xs text-muted-foreground">{alert.type}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDashboardIcon(alert.dashboardType)}
                          <span className="text-sm">{alert.dashboardType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{alert.entityName}</TableCell>
                      <TableCell>{getSeverityBadge(alert.severity)}</TableCell>
                      <TableCell className="text-sm">{alert.dueDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'ACTIVE' ? 'destructive' : alert.status === 'ESCALATED' ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.escalationLevel > 0 && (
                          <Badge variant="outline">Level {alert.escalationLevel}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            Resolve
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

        <TabsContent value="audit-calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Master Audit Calendar
              </CardTitle>
              <CardDescription>Comprehensive audit schedule and compliance timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertTitle>Upcoming Audit Events</AlertTitle>
                  <AlertDescription>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                        <span className="font-medium">Internal Audit - Q4 2025</span>
                        <Badge>Nov 1, 2025</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="font-medium">AVETMISS Reporting Deadline</span>
                        <Badge variant="secondary">Oct 31, 2025</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="font-medium">Training Product Validation</span>
                        <Badge variant="outline">Dec 15, 2025</Badge>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Student Audits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Placement Reviews</span>
                          <span className="text-blue-600">Monthly</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Compliance Checks</span>
                          <span className="text-green-600">Quarterly</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Document Verification</span>
                          <span className="text-orange-600">Ongoing</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Trainer Audits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Credential Reviews</span>
                          <span className="text-blue-600">6 Months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>PD Compliance</span>
                          <span className="text-green-600">12 Months</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Moderation Sessions</span>
                          <span className="text-orange-600">Quarterly</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">RTO Audits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Internal Audit</span>
                          <span className="text-blue-600">Annual</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ASQA External</span>
                          <span className="text-red-600">As Required</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Risk Assessment</span>
                          <span className="text-green-600">6 Months</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                System Audit Logs ({auditLogs.length} entries)
              </CardTitle>
              <CardDescription>Comprehensive system activity and compliance audit trail</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {log.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{log.userId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.entityType} {log.entityId}
                      </TableCell>
                      <TableCell className="text-sm max-w-xs truncate">
                        {log.details}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Audit Progress Timeline & Reports
              </CardTitle>
              <CardDescription>Generate comprehensive audit evidence and compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button className="h-20 flex flex-col gap-2" onClick={generateAuditPack}>
                  <Archive className="w-6 h-6" />
                  <span>Generate Audit Evidence Pack</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="w-6 h-6" />
                  <span>Compliance Summary Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Calendar className="w-6 h-6" />
                  <span>Audit Schedule Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <AlertTriangle className="w-6 h-6" />
                  <span>Risk Assessment Report</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Performance Analytics</span>
                </Button>
                
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Shield className="w-6 h-6" />
                  <span>ASQA Preparation Pack</span>
                </Button>
              </div>

              <Alert className="mt-6">
                <Settings className="h-4 w-4" />
                <AlertTitle>Export Options</AlertTitle>
                <AlertDescription>
                  All reports can be exported in PDF, Excel, or CSV formats. Audit evidence packs include all supporting documentation, logs, and compliance evidence required for external audits.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}