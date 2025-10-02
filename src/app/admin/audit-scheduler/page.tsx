'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  Shield,
  Target,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  dashboardType: string;
  entityId: string;
  entityName: string;
  dueDate: Date;
  status: string;
  category: string;
  escalationLevel: number;
  createdAt: Date;
}

interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  type: string;
  dashboardType: string;
  dueDate: Date;
  frequency: string;
  nextDueDate: Date;
  status: string;
  priority: string;
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

export default function AuditSchedulerPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [isSchedulerRunning, setIsSchedulerRunning] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterDashboard, setFilterDashboard] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    
    // Set up real-time updates every 30 seconds for scheduler
    const interval = setInterval(() => {
      if (isSchedulerRunning) {
        fetchData();
        setLastUpdate(new Date());
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isSchedulerRunning]);

  const fetchData = async () => {
    try {
      const [alertsResponse, tasksResponse, logsResponse] = await Promise.all([
        fetch('/api/admin/audit-scheduler?action=alerts'),
        fetch('/api/admin/audit-scheduler?action=tasks'),
        fetch('/api/admin/audit-scheduler?action=audit-logs')
      ]);

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        const alertsWithDates = alertsData.alerts.map((alert: any) => ({
          ...alert,
          dueDate: new Date(alert.dueDate),
          createdAt: new Date(alert.createdAt),
        }));
        setAlerts(alertsWithDates);
      }

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const tasksWithDates = tasksData.tasks.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate),
          nextDueDate: new Date(task.nextDueDate),
        }));
        setTasks(tasksWithDates);
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
      console.error('Error fetching scheduler data:', error);
      toast({
        title: "Error",
        description: "Failed to load scheduler data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateNewAlerts = async () => {
    try {
      const response = await fetch('/api/admin/audit-scheduler?action=generate-alerts');
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Generated ${data.generatedAlerts} new alerts`
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error generating alerts:', error);
      toast({
        title: "Error",
        description: "Failed to generate alerts",
        variant: "destructive"
      });
    }
  };

  const processEscalations = async () => {
    try {
      const response = await fetch('/api/admin/audit-scheduler?action=process-escalations');
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: `Processed ${data.escalatedAlerts} escalations`
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error processing escalations:', error);
      toast({
        title: "Error",
        description: "Failed to process escalations",
        variant: "destructive"
      });
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/admin/audit-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge-alert',
          alertId,
          userId: 'admin@placementguru.com',
          notes: 'Acknowledged via audit scheduler'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Alert acknowledged successfully"
        });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const toggleScheduler = () => {
    setIsSchedulerRunning(!isSchedulerRunning);
    toast({
      title: isSchedulerRunning ? "Scheduler Paused" : "Scheduler Started",
      description: isSchedulerRunning ? "Automatic updates paused" : "Automatic updates resumed"
    });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge variant="destructive">Active</Badge>;
      case 'ACKNOWLEDGED': return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>;
      case 'RESOLVED': return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'ESCALATED': return <Badge className="bg-purple-100 text-purple-800">Escalated</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
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

  const getTaskPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return <Badge variant="destructive">Critical</Badge>;
      case 'HIGH': return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'MEDIUM': return <Badge variant="secondary">Medium</Badge>;
      case 'LOW': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterDashboard !== 'all' && alert.dashboardType !== filterDashboard) return false;
    if (filterStatus !== 'all' && alert.status !== filterStatus) return false;
    return true;
  });

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
          <h1 className="text-3xl font-bold tracking-tight">🔔 Audit Scheduler & Alert Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive compliance monitoring and automated alert system
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button
            onClick={toggleScheduler}
            variant={isSchedulerRunning ? "default" : "outline"}
            size="sm"
          >
            {isSchedulerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isSchedulerRunning ? 'Pause' : 'Start'} Scheduler
          </Button>
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Alert className={isSchedulerRunning ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <Settings className="h-4 w-4" />
        <AlertTitle>Scheduler Status: {isSchedulerRunning ? 'Running' : 'Paused'}</AlertTitle>
        <AlertDescription>
          {isSchedulerRunning 
            ? 'Automatic alert generation and escalation processing is active. Updates every 30 seconds.'
            : 'Automatic processing is paused. Click "Start Scheduler" to resume monitoring.'
          }
        </AlertDescription>
      </Alert>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alerts.filter(a => a.severity === 'CRITICAL').length}
            </div>
            <p className="text-xs text-muted-foreground">Need immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{tasks.length}</div>
            <p className="text-xs text-muted-foreground">In scheduler queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="tasks">Scheduled Tasks</TabsTrigger>
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="settings">Scheduler Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alert Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div>
                <Label htmlFor="severity-filter">Severity</Label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="dashboard-filter">Dashboard</Label>
                <Select value={filterDashboard} onValueChange={setFilterDashboard}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dashboards</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TRAINER">Trainer</SelectItem>
                    <SelectItem value="PROVIDER">Provider</SelectItem>
                    <SelectItem value="RTO">RTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="ESCALATED">Escalated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button onClick={generateNewAlerts} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate Alerts
                </Button>
                <Button onClick={processEscalations} variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Process Escalations
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alerts Table */}
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts ({filteredAlerts.length})</CardTitle>
              <CardDescription>Real-time compliance alerts across all dashboards</CardDescription>
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
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.slice(0, 20).map((alert) => (
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
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)}>
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
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

        <TabsContent value="tasks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Scheduled Tasks ({tasks.length})
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CardTitle>
              <CardDescription>Automated compliance tasks and audit schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dashboard</TableHead>
                    <TableHead>Next Due</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.slice(0, 20).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{task.name}</p>
                          <p className="text-xs text-muted-foreground">{task.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{task.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDashboardIcon(task.dashboardType)}
                          <span className="text-sm">{task.dashboardType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{task.nextDueDate.toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{task.frequency}</TableCell>
                      <TableCell>{getTaskPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <Badge variant={task.status === 'COMPLETED' ? 'default' : task.status === 'OVERDUE' ? 'destructive' : 'secondary'}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-3 h-3" />
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

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs ({auditLogs.length})</CardTitle>
              <CardDescription>Detailed activity log for compliance tracking</CardDescription>
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
                  {auditLogs.slice(0, 50).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">{log.timestamp.toLocaleString()}</TableCell>
                      <TableCell className="text-sm">{log.userId}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.entityType} {log.entityId}</TableCell>
                      <TableCell className="text-sm max-w-xs truncate">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scheduler Configuration</CardTitle>
              <CardDescription>Configure alert generation and escalation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Alert Generation</h3>
                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">Reminder Days (comma-separated)</Label>
                    <Input id="reminder-days" defaultValue="90,60,30,7,1" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="escalation-days">Escalation After (days)</Label>
                    <Input id="escalation-days" type="number" defaultValue="14" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Settings</h3>
                  <div className="space-y-2">
                    <Label htmlFor="update-frequency">Update Frequency (seconds)</Label>
                    <Input id="update-frequency" type="number" defaultValue="30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-alerts">Max Alerts Per Page</Label>
                    <Input id="max-alerts" type="number" defaultValue="20" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button>Save Settings</Button>
                <Button variant="outline">Reset to Defaults</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor scheduler performance and system status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-green-600">99.8%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-blue-600">0.2s</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="text-center p-4 border rounded">
                  <div className="text-2xl font-bold text-purple-600">1,247</div>
                  <p className="text-sm text-muted-foreground">Alerts Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}