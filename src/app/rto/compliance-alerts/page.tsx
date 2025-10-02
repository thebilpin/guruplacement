'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Bell,
  BellOff,
  Eye,
  EyeOff,
  Filter,
  Search,
  Calendar,
  Users,
  FileText,
  Trash2,
  MoreHorizontal,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';

interface ComplianceAlert {
  id: string;
  title: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  category: 'Training' | 'Assessment' | 'Student' | 'Compliance' | 'Finance' | 'Quality';
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Dismissed';
  createdAt: string;
  dueDate: string;
  affectedStudents: number;
  responsible: string;
  actions: string[];
  isRead: boolean;
  source: string;
}

export default function ComplianceAlertsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ComplianceAlert[]>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alerts, searchTerm, severityFilter, statusFilter, categoryFilter, showUnreadOnly]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockAlerts: ComplianceAlert[] = [
        {
          id: '1',
          title: 'Student Enrollment Documents Missing',
          description: '15 students have incomplete enrollment documentation affecting USI verification.',
          severity: 'High',
          category: 'Student',
          status: 'Active',
          createdAt: '2024-01-25T10:30:00Z',
          dueDate: '2024-02-05T23:59:59Z',
          affectedStudents: 15,
          responsible: 'Student Services',
          actions: ['Contact students', 'Request documents', 'Update records'],
          isRead: false,
          source: 'Automated System Check'
        },
        {
          id: '2',
          title: 'Trainer Qualification Expiring Soon',
          description: 'TAE40116 qualification for 3 trainers expires within 30 days.',
          severity: 'Medium',
          category: 'Training',
          status: 'Acknowledged',
          createdAt: '2024-01-24T14:15:00Z',
          dueDate: '2024-02-24T23:59:59Z',
          affectedStudents: 45,
          responsible: 'HR Department',
          actions: ['Schedule renewal', 'Update qualifications', 'Notify trainers'],
          isRead: true,
          source: 'HR System'
        },
        {
          id: '3',
          title: 'Assessment Validation Overdue',
          description: 'Assessment materials for BSB50420 have not been validated within required timeframe.',
          severity: 'Critical',
          category: 'Assessment',
          status: 'Active',
          createdAt: '2024-01-23T09:45:00Z',
          dueDate: '2024-01-28T23:59:59Z',
          affectedStudents: 28,
          responsible: 'Quality Assurance',
          actions: ['Schedule validation', 'Review materials', 'Update processes'],
          isRead: false,
          source: 'Quality Management System'
        },
        {
          id: '4',
          title: 'AVETMISS Data Submission Due',
          description: 'Quarterly AVETMISS data submission deadline approaching in 5 days.',
          severity: 'High',
          category: 'Compliance',
          status: 'Active',
          createdAt: '2024-01-22T16:20:00Z',
          dueDate: '2024-01-30T23:59:59Z',
          affectedStudents: 0,
          responsible: 'Data Management',
          actions: ['Prepare data', 'Validate entries', 'Submit to NCVER'],
          isRead: true,
          source: 'Compliance Calendar'
        },
        {
          id: '5',
          title: 'Student Completion Rate Below Target',
          description: 'Certificate III completion rate has dropped to 68%, below the required 75%.',
          severity: 'Medium',
          category: 'Quality',
          status: 'Acknowledged',
          createdAt: '2024-01-21T11:10:00Z',
          dueDate: '2024-03-01T23:59:59Z',
          affectedStudents: 120,
          responsible: 'Academic Manager',
          actions: ['Analyze causes', 'Implement support', 'Monitor progress'],
          isRead: true,
          source: 'Analytics Dashboard'
        },
        {
          id: '6',
          title: 'Financial Audit Documentation Required',
          description: 'Additional documentation requested by auditor for funding compliance review.',
          severity: 'High',
          category: 'Finance',
          status: 'Active',
          createdAt: '2024-01-20T13:30:00Z',
          dueDate: '2024-02-10T23:59:59Z',
          affectedStudents: 0,
          responsible: 'Finance Team',
          actions: ['Gather documents', 'Prepare submission', 'Schedule meeting'],
          isRead: false,
          source: 'External Auditor'
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance alerts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = alerts;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.responsible.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(alert => alert.category === categoryFilter);
    }

    // Unread filter
    if (showUnreadOnly) {
      filtered = filtered.filter(alert => !alert.isRead);
    }

    // Sort by severity and creation date
    filtered.sort((a, b) => {
      const severityOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setFilteredAlerts(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-blue-100 text-blue-800';
      case 'Acknowledged':
        return 'bg-yellow-100 text-yellow-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAlertAction = (alertId: string, action: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;

    toast({
      title: 'Action Taken',
      description: `${action} initiated for: ${alert.title}`,
    });

    // Update alert status
    setAlerts(prev => prev.map(a => 
      a.id === alertId 
        ? { ...a, status: action === 'Acknowledge' ? 'Acknowledged' : a.status }
        : a
    ));
  };

  const handleMarkAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
  };

  const handleBulkAction = (action: string) => {
    if (selectedAlerts.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select alerts to perform bulk actions.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Bulk Action',
      description: `${action} applied to ${selectedAlerts.length} alert(s).`,
    });

    // Update selected alerts
    setAlerts(prev => prev.map(a => 
      selectedAlerts.includes(a.id) 
        ? { 
            ...a, 
            isRead: action === 'Mark as Read' ? true : a.isRead,
            status: action === 'Acknowledge' ? 'Acknowledged' : 
                    action === 'Resolve' ? 'Resolved' : a.status
          }
        : a
    ));

    setSelectedAlerts([]);
  };

  const toggleSelectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(a => a.id));
    }
  };

  const getDaysUntilDue = (dueDateStr: string) => {
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const stats = {
    total: alerts.length,
    unread: alerts.filter(a => !a.isRead).length,
    critical: alerts.filter(a => a.severity === 'Critical').length,
    overdue: alerts.filter(a => getDaysUntilDue(a.dueDate) < 0).length
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
          <p className="text-gray-600">Monitor and manage compliance alerts across your RTO</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
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
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
              </div>
              <BellOff className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overdue}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Severity</label>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Training">Training</SelectItem>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Quality">Quality</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox 
                  id="unread-only"
                  checked={showUnreadOnly}
                  onCheckedChange={(checked) => setShowUnreadOnly(checked === true)}
                />
                <label htmlFor="unread-only" className="text-sm">Unread only</label>
              </div>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSeverityFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
                setShowUnreadOnly(false);
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Checkbox 
                  checked={selectedAlerts.length === filteredAlerts.length}
                  onCheckedChange={(checked) => toggleSelectAll()}
                />
                <span className="text-sm">{selectedAlerts.length} selected</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Mark as Read')}>
                  <Eye className="h-4 w-4 mr-2" />
                  Mark as Read
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Acknowledge')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Acknowledge
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('Resolve')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Resolve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => {
          const daysUntilDue = getDaysUntilDue(alert.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0;

          return (
            <Card key={alert.id} className={`${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''} ${isOverdue ? 'bg-red-50' : isUrgent ? 'bg-yellow-50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Checkbox 
                    checked={selectedAlerts.includes(alert.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAlerts(prev => [...prev, alert.id]);
                      } else {
                        setSelectedAlerts(prev => prev.filter(id => id !== alert.id));
                      }
                    }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{alert.title}</h3>
                        {!alert.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(alert.severity)} variant="outline">
                          {alert.severity}
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                        <Badge variant="outline">{alert.category}</Badge>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{alert.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Source:</span>
                        <span className="ml-2 font-medium">{alert.source}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Responsible:</span>
                        <span className="ml-2 font-medium">{alert.responsible}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Affected Students:</span>
                        <span className="ml-2 font-medium">{alert.affectedStudents}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Due:</span>
                        <span className={`ml-2 font-medium ${isOverdue ? 'text-red-600' : isUrgent ? 'text-yellow-600' : ''}`}>
                          {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : 
                           daysUntilDue === 0 ? 'Due today' :
                           `${daysUntilDue} days remaining`}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-sm text-gray-500 mb-2 block">Recommended Actions:</span>
                      <div className="flex flex-wrap gap-2">
                        {alert.actions.map((action, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        Created: {new Date(alert.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex space-x-2">
                        {!alert.isRead && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleMarkAsRead(alert.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Mark as Read
                          </Button>
                        )}
                        {alert.status === 'Active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert.id, 'Acknowledge')}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAlerts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
            <p className="text-gray-600">
              {alerts.length === 0 
                ? "No compliance alerts at this time. Great job!"
                : "No alerts match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}