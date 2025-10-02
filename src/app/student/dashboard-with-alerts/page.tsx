'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  Syringe, 
  FileCheck, 
  Calendar,
  Target,
  BookOpen,
  Bell,
  TrendingUp,
  Award,
  Timer
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alert {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  dueDate: Date;
  status: string;
  category: string;
}

interface ComplianceItem {
  id: string;
  name: string;
  status: 'CURRENT' | 'EXPIRING' | 'EXPIRED' | 'MISSING';
  expiryDate?: Date;
  daysUntilExpiry?: number;
  category: 'SAFETY' | 'DOCUMENTATION' | 'ASSESSMENT' | 'PLACEMENT';
}

interface PlacementProgress {
  totalHours: number;
  completedHours: number;
  percentage: number;
  daysRemaining: number;
  status: 'ON_TRACK' | 'BEHIND' | 'CRITICAL';
}

interface CountdownTimer {
  id: string;
  title: string;
  dueDate: Date;
  type: 'ASSESSMENT' | 'PLACEMENT' | 'DOCUMENT';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export default function StudentDashboardWithAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [placementProgress, setPlacementProgress] = useState<PlacementProgress | null>(null);
  const [countdownTimers, setCountdownTimers] = useState<CountdownTimer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch alerts from audit scheduler
      const alertsResponse = await fetch('/api/admin/audit-scheduler?action=alerts&dashboardType=STUDENT');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        const alertsWithDates = alertsData.alerts.map((alert: any) => ({
          ...alert,
          dueDate: new Date(alert.dueDate),
        }));
        setAlerts(alertsWithDates);
      }

      // Initialize compliance checklist
      setComplianceItems([
        {
          id: 'police-check',
          name: 'Police Check',
          status: 'CURRENT',
          expiryDate: new Date('2025-11-15'),
          daysUntilExpiry: Math.ceil((new Date('2025-11-15').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          category: 'SAFETY'
        },
        {
          id: 'wwcc',
          name: 'Working with Children Check',
          status: 'EXPIRING',
          expiryDate: new Date('2025-10-20'),
          daysUntilExpiry: Math.ceil((new Date('2025-10-20').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          category: 'SAFETY'
        },
        {
          id: 'immunisation',
          name: 'Immunisation Records',
          status: 'EXPIRED',
          expiryDate: new Date('2025-09-15'),
          daysUntilExpiry: -Math.ceil((new Date().getTime() - new Date('2025-09-15').getTime()) / (1000 * 60 * 60 * 24)),
          category: 'SAFETY'
        },
        {
          id: 'usi',
          name: 'Unique Student Identifier (USI)',
          status: 'CURRENT',
          category: 'DOCUMENTATION'
        },
        {
          id: 'enrolment',
          name: 'Enrolment Documentation',
          status: 'CURRENT',
          category: 'DOCUMENTATION'
        },
        {
          id: 'placement-agreement',
          name: 'Placement Agreement',
          status: 'CURRENT',
          expiryDate: new Date('2026-02-28'),
          daysUntilExpiry: Math.ceil((new Date('2026-02-28').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          category: 'PLACEMENT'
        }
      ]);

      // Set placement progress
      setPlacementProgress({
        totalHours: 240,
        completedHours: 180,
        percentage: 75,
        daysRemaining: 45,
        status: 'ON_TRACK'
      });

      // Set countdown timers
      setCountdownTimers([
        {
          id: 'assessment-1',
          title: 'Portfolio Assessment Due',
          dueDate: new Date('2025-10-15'),
          type: 'ASSESSMENT',
          priority: 'HIGH'
        },
        {
          id: 'placement-complete',
          title: 'Placement Completion',
          dueDate: new Date('2025-11-30'),
          type: 'PLACEMENT',
          priority: 'MEDIUM'
        },
        {
          id: 'wwcc-renewal',
          title: 'WWCC Renewal Required',
          dueDate: new Date('2025-10-20'),
          type: 'DOCUMENT',
          priority: 'HIGH'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
          userId: 'student@placementguru.com',
          notes: 'Acknowledged by student'
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Alert acknowledged successfully"
        });
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CURRENT': return 'bg-green-100 text-green-800';
      case 'EXPIRING': return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'MISSING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CURRENT': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'EXPIRING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'EXPIRED': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'MISSING': return <FileCheck className="w-4 h-4 text-gray-600" />;
      default: return <FileCheck className="w-4 h-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SAFETY': return <Shield className="w-4 h-4" />;
      case 'DOCUMENTATION': return <FileCheck className="w-4 h-4" />;
      case 'ASSESSMENT': return <BookOpen className="w-4 h-4" />;
      case 'PLACEMENT': return <Target className="w-4 h-4" />;
      default: return <FileCheck className="w-4 h-4" />;
    }
  };

  const formatTimeRemaining = (dueDate: Date) => {
    const now = new Date();
    const diff = dueDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
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
          <h1 className="text-3xl font-bold tracking-tight">🎓 Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your compliance, placement progress, and upcoming deadlines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={alerts.filter(a => a.status === 'ACTIVE').length > 0 ? "destructive" : "default"}>
            <Bell className="w-3 h-3 mr-1" />
            {alerts.filter(a => a.status === 'ACTIVE').length} Active Alerts
          </Badge>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Urgent Action Required</AlertTitle>
          <AlertDescription className="text-red-700">
            You have {alerts.filter(a => a.severity === 'CRITICAL' || a.severity === 'HIGH').length} urgent compliance issues that need immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">6/8</div>
                <p className="text-xs text-muted-foreground">Items compliant</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Placement Progress</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">75%</div>
                <p className="text-xs text-muted-foreground">180/240 hours completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{alerts.filter(a => a.status === 'ACTIVE').length}</div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Deadline</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">18</div>
                <p className="text-xs text-muted-foreground">days until assessment</p>
              </CardContent>
            </Card>
          </div>

          {/* Countdown Timers Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-600" />
                Countdown Timers
              </CardTitle>
              <CardDescription>Important deadlines approaching</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {countdownTimers.map((timer) => (
                  <div key={timer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {timer.type === 'ASSESSMENT' && <BookOpen className="w-5 h-5 text-blue-600" />}
                      {timer.type === 'PLACEMENT' && <Target className="w-5 h-5 text-green-600" />}
                      {timer.type === 'DOCUMENT' && <FileCheck className="w-5 h-5 text-orange-600" />}
                      <div>
                        <p className="font-medium">{timer.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {timer.dueDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={timer.priority === 'HIGH' ? 'destructive' : timer.priority === 'MEDIUM' ? 'default' : 'secondary'}>
                        {formatTimeRemaining(timer.dueDate)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          {/* Compliance Checklist Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Compliance Checklist
              </CardTitle>
              <CardDescription>Track your compliance requirements with traffic-light status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(item.category)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          {getStatusIcon(item.status)}
                        </div>
                        {item.expiryDate && (
                          <p className="text-sm text-muted-foreground">
                            {item.status === 'EXPIRED' 
                              ? `Expired ${Math.abs(item.daysUntilExpiry!)} days ago`
                              : `Expires in ${item.daysUntilExpiry} days (${item.expiryDate.toLocaleDateString()})`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      {item.status === 'EXPIRED' || item.status === 'EXPIRING' ? (
                        <Button size="sm" variant="outline">
                          Update
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Compliance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {complianceItems.filter(i => i.status === 'CURRENT').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Current</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {complianceItems.filter(i => i.status === 'EXPIRING').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Expiring</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">
                    {complianceItems.filter(i => i.status === 'EXPIRED').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Expired</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <FileCheck className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-600">
                    {complianceItems.filter(i => i.status === 'MISSING').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Missing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placement" className="space-y-6">
          {/* Placement Progress Widget */}
          {placementProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Placement Progress
                </CardTitle>
                <CardDescription>Track your placement hours completion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Hours Completed</span>
                    <span>{placementProgress.completedHours}/{placementProgress.totalHours} hours</span>
                  </div>
                  <Progress value={placementProgress.percentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{placementProgress.percentage}% complete</span>
                    <span>{placementProgress.daysRemaining} days remaining</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{placementProgress.completedHours}</p>
                    <p className="text-sm text-muted-foreground">Hours Completed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{placementProgress.totalHours - placementProgress.completedHours}</p>
                    <p className="text-sm text-muted-foreground">Hours Remaining</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{placementProgress.daysRemaining}</p>
                    <p className="text-sm text-muted-foreground">Days Left</p>
                  </div>
                </div>

                <Alert className={placementProgress.status === 'ON_TRACK' ? 'border-green-200 bg-green-50' : placementProgress.status === 'BEHIND' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>
                    {placementProgress.status === 'ON_TRACK' ? 'On Track' : placementProgress.status === 'BEHIND' ? 'Behind Schedule' : 'Critical - Action Required'}
                  </AlertTitle>
                  <AlertDescription>
                    {placementProgress.status === 'ON_TRACK' && 'You are progressing well with your placement hours.'}
                    {placementProgress.status === 'BEHIND' && 'You need to increase your placement hours to stay on track.'}
                    {placementProgress.status === 'CRITICAL' && 'Urgent action required to complete placement on time.'}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-600" />
                Active Alerts ({alerts.filter(a => a.status === 'ACTIVE').length})
              </CardTitle>
              <CardDescription>Compliance alerts and reminders requiring your attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.filter(a => a.status === 'ACTIVE').map((alert) => (
                    <Alert key={alert.id} className={alert.severity === 'CRITICAL' ? 'border-red-200 bg-red-50' : alert.severity === 'HIGH' ? 'border-orange-200 bg-orange-50' : 'border-yellow-200 bg-yellow-50'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        {alert.title}
                        <Badge variant={alert.severity === 'CRITICAL' ? 'destructive' : alert.severity === 'HIGH' ? 'default' : 'secondary'}>
                          {alert.severity}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription className="mt-2">
                        <p>{alert.message}</p>
                        <p className="text-xs mt-1">Due: {alert.dueDate.toLocaleDateString()}</p>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => acknowledgeAlert(alert.id)}>
                            Acknowledge
                          </Button>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-green-600">All Clear!</p>
                  <p className="text-muted-foreground">No active alerts at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}