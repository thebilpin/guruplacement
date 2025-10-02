'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  Bell, 
  Clock, 
  CheckCircle, 
  XCircle,
  Calendar,
  FileText,
  User,
  AlertCircle,
  Info,
  BellRing,
  Settings,
  Filter,
  RotateCcw,
  Eye,
  EyeOff,
  Trash2,
  Archive
} from 'lucide-react';

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  type: 'Critical' | 'Warning' | 'Info' | 'Reminder';
  priority: 'High' | 'Medium' | 'Low';
  category: 'Documentation' | 'Training' | 'Assessment' | 'Health & Safety' | 'Legal' | 'System';
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  isRead: boolean;
  createdAt: string;
  dueDate?: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  relatedTask?: string;
  actionRequired: boolean;
  source: string;
  details: string;
}

interface AlertStats {
  totalAlerts: number;
  criticalAlerts: number;
  unreadAlerts: number;
  overdueAlerts: number;
}

export default function ComplianceAlertsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ComplianceAlert[]>([]);
  const [stats, setStats] = useState<AlertStats>({
    totalAlerts: 0,
    criticalAlerts: 0,
    unreadAlerts: 0,
    overdueAlerts: 0
  });
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchComplianceAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
    calculateStats();
  }, [alerts, typeFilter, statusFilter, categoryFilter]);

  const fetchComplianceAlerts = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: ComplianceAlert[] = [
        {
          id: '1',
          title: 'Working with Children Check Expiring Soon',
          description: 'Your WWCC expires in 30 days. Renewal required to continue placement activities.',
          type: 'Critical',
          priority: 'High',
          category: 'Legal',
          status: 'Active',
          isRead: false,
          createdAt: '2024-01-20T10:00:00Z',
          dueDate: '2024-02-20',
          actionRequired: true,
          source: 'Compliance System',
          details: 'Please initiate the WWCC renewal process immediately. Contact your placement coordinator for assistance. Processing time is typically 2-3 weeks.',
          relatedTask: 'WWCC Renewal'
        },
        {
          id: '2',
          title: 'Missing First Aid Training Certificate',
          description: 'First Aid training certificate not uploaded. Required for clinical placements.',
          type: 'Warning',
          priority: 'High',
          category: 'Training',
          status: 'Active',
          isRead: true,
          createdAt: '2024-01-18T14:30:00Z',
          dueDate: '2024-02-15',
          actionRequired: true,
          source: 'Training Department',
          details: 'Upload your current First Aid certificate to the compliance tracker. If you need to complete training, contact the training department for available courses.',
          relatedTask: 'First Aid Training'
        },
        {
          id: '3',
          title: 'Privacy Agreement Overdue',
          description: 'Privacy and confidentiality agreement submission is overdue.',
          type: 'Critical',
          priority: 'High',
          category: 'Documentation',
          status: 'Active',
          isRead: false,
          createdAt: '2024-01-15T09:00:00Z',
          dueDate: '2024-01-30',
          actionRequired: true,
          source: 'Legal Department',
          details: 'Immediate action required. Your placement may be suspended if this document is not submitted within 48 hours.',
          relatedTask: 'Privacy Agreement'
        },
        {
          id: '4',
          title: 'Placement Site Orientation Reminder',
          description: 'Reminder: Orientation session scheduled for tomorrow at City Hospital.',
          type: 'Reminder',
          priority: 'Medium',
          category: 'Training',
          status: 'Acknowledged',
          isRead: true,
          createdAt: '2024-01-19T16:00:00Z',
          acknowledgedAt: '2024-01-19T18:00:00Z',
          actionRequired: false,
          source: 'Placement Coordinator',
          details: 'Orientation session scheduled for January 21, 2024 at 9:00 AM. Please arrive 15 minutes early and bring valid ID.',
          relatedTask: 'Site Orientation'
        },
        {
          id: '5',
          title: 'System Maintenance Notification',
          description: 'Planned system maintenance will occur this weekend.',
          type: 'Info',
          priority: 'Low',
          category: 'System',
          status: 'Resolved',
          isRead: true,
          createdAt: '2024-01-17T12:00:00Z',
          resolvedAt: '2024-01-22T08:00:00Z',
          actionRequired: false,
          source: 'IT Department',
          details: 'System maintenance completed successfully. All services are now operational.'
        },
        {
          id: '6',
          title: 'Skills Assessment Deadline Approaching',
          description: 'Your clinical skills assessment is due in 5 days.',
          type: 'Warning',
          priority: 'Medium',
          category: 'Assessment',
          status: 'Active',
          isRead: true,
          createdAt: '2024-01-16T11:00:00Z',
          dueDate: '2024-01-25',
          actionRequired: true,
          source: 'Assessment Team',
          details: 'Complete your clinical skills assessment by January 25, 2024. Contact your supervisor to schedule if not already arranged.',
          relatedTask: 'Skills Assessment'
        }
      ];

      setAlerts(mockData);
    } catch (error) {
      console.error('Error fetching compliance alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance alerts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    // Filter by active tab
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(alert => alert.status === 'Active');
        break;
      case 'acknowledged':
        filtered = filtered.filter(alert => alert.status === 'Acknowledged');
        break;
      case 'resolved':
        filtered = filtered.filter(alert => alert.status === 'Resolved');
        break;
      case 'unread':
        filtered = filtered.filter(alert => !alert.isRead);
        break;
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(alert => alert.category === categoryFilter);
    }

    setFilteredAlerts(filtered);
  };

  const calculateStats = () => {
    const totalAlerts = alerts.length;
    const criticalAlerts = alerts.filter(alert => alert.type === 'Critical' && alert.status === 'Active').length;
    const unreadAlerts = alerts.filter(alert => !alert.isRead).length;
    const overdueAlerts = alerts.filter(alert => 
      alert.dueDate && new Date(alert.dueDate) < new Date() && alert.status === 'Active'
    ).length;

    setStats({
      totalAlerts,
      criticalAlerts,
      unreadAlerts,
      overdueAlerts
    });
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'Info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'Reminder':
        return <Bell className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'Info':
        return 'bg-blue-100 text-blue-800';
      case 'Reminder':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-orange-100 text-orange-800';
      case 'Acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      const updatedAlerts = alerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      );
      setAlerts(updatedAlerts);

      toast({
        title: 'Success',
        description: 'Alert marked as read.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const updatedAlerts = alerts.map(alert =>
        alert.id === alertId 
          ? { ...alert, status: 'Acknowledged' as const, acknowledgedAt: new Date().toISOString(), isRead: true }
          : alert
      );
      setAlerts(updatedAlerts);

      toast({
        title: 'Success',
        description: 'Alert acknowledged.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to acknowledge alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDismiss = async (alertId: string) => {
    try {
      const updatedAlerts = alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: 'Dismissed' as const } : alert
      );
      setAlerts(updatedAlerts);

      toast({
        title: 'Success',
        description: 'Alert dismissed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to dismiss alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
      setAlerts(updatedAlerts);

      toast({
        title: 'Success',
        description: 'All alerts marked as read.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alerts. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRefreshAlerts = () => {
    fetchComplianceAlerts();
    toast({
      title: 'Alerts Refreshed',
      description: 'Alert data has been updated.',
    });
  };

  const handleClearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const isOverdue = (alert: ComplianceAlert) => {
    return alert.dueDate && new Date(alert.dueDate) < new Date() && alert.status === 'Active';
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Alerts</h1>
          <p className="text-gray-600">Stay informed about important compliance notifications and deadlines</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshAlerts}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleMarkAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold">{stats.totalAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Alerts</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600">{stats.unreadAlerts}</p>
              </div>
              <BellRing className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-purple-600">{stats.overdueAlerts}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Warning">Warning</SelectItem>
                <SelectItem value="Info">Info</SelectItem>
                <SelectItem value="Reminder">Reminder</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Documentation">Documentation</SelectItem>
                <SelectItem value="Training">Training</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Health & Safety">Health & Safety</SelectItem>
                <SelectItem value="Legal">Legal</SelectItem>
                <SelectItem value="System">System</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">
            Active ({alerts.filter(a => a.status === 'Active').length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({alerts.filter(a => !a.isRead).length})
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            Acknowledged ({alerts.filter(a => a.status === 'Acknowledged').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({alerts.filter(a => a.status === 'Resolved').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
                  <p className="text-gray-600">No alerts match the current filter criteria.</p>
                </CardContent>
              </Card>
            ) : (
              filteredAlerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`hover:shadow-md transition-shadow ${
                    !alert.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                  } ${
                    isOverdue(alert) ? 'border-l-4 border-l-red-500 bg-red-50/30' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-3 flex-1">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-semibold ${!alert.isRead ? 'font-bold' : ''}`}>
                              {alert.title}
                            </h3>
                            {!alert.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <Badge className={getTypeColor(alert.type)}>
                              {alert.type}
                            </Badge>
                            <Badge className={getStatusColor(alert.status)}>
                              {alert.status}
                            </Badge>
                            <Badge variant="outline">{alert.category}</Badge>
                            {alert.priority === 'High' && (
                              <Badge className="bg-red-100 text-red-800">High Priority</Badge>
                            )}
                            {isOverdue(alert) && (
                              <Badge className="bg-red-100 text-red-800 animate-pulse">OVERDUE</Badge>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">{alert.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Created: {new Date(alert.createdAt).toLocaleDateString()}
                            </div>
                            {alert.dueDate && (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Due: {new Date(alert.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {alert.source}
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded mb-4">
                            <p className="text-sm text-gray-700">{alert.details}</p>
                          </div>

                          {alert.relatedTask && (
                            <div className="mb-4">
                              <div className="flex items-center text-sm text-blue-600">
                                <FileText className="h-4 w-4 mr-1" />
                                Related Task: {alert.relatedTask}
                              </div>
                            </div>
                          )}

                          {alert.acknowledgedAt && (
                            <div className="text-sm text-green-600 mb-2">
                              Acknowledged on {new Date(alert.acknowledgedAt).toLocaleDateString()}
                            </div>
                          )}

                          {alert.resolvedAt && (
                            <div className="text-sm text-blue-600 mb-2">
                              Resolved on {new Date(alert.resolvedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      {!alert.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(alert.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Mark as Read
                        </Button>
                      )}
                      
                      {alert.status === 'Active' && (
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      
                      {(alert.status === 'Active' || alert.status === 'Acknowledged') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Dismiss
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}