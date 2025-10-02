'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { 
  AlertTriangle, 
  Clock, 
  Calendar, 
  FileText, 
  Bell,
  Users,
  Building,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  X,
  RefreshCw,
  Send,
  Eye
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ComplianceAlert {
  id: string;
  type: 'mou-expiry' | 'site-certification' | 'insurance' | 'whs-audit' | 'contract-renewal' | 'training-certification';
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  expiryDate: string;
  daysUntilExpiry: number;
  relatedEntity: {
    id: string;
    name: string;
    type: 'site' | 'mou' | 'contract' | 'certification';
  };
  assignedTo: string[];
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  actions: AlertAction[];
  notifications: NotificationLog[];
}

interface AlertAction {
  id: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueDate: string;
  completedAt?: string;
  completedBy?: string;
}

interface NotificationLog {
  id: string;
  type: 'email' | 'sms' | 'system';
  recipient: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  message: string;
}

interface AlertRule {
  id: string;
  name: string;
  type: 'mou-expiry' | 'site-certification' | 'insurance' | 'whs-audit' | 'contract-renewal' | 'training-certification';
  isActive: boolean;
  thresholds: {
    critical: number; // days before expiry
    high: number;
    medium: number;
    low: number;
  };
  notificationSettings: {
    email: boolean;
    sms: boolean;
    system: boolean;
    recipients: string[];
  };
  escalationRules: {
    escalateAfterDays: number;
    escalateTo: string[];
  };
}

export default function ComplianceAlertsPage() {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<ComplianceAlert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [isRulesDialogOpen, setIsRulesDialogOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchComplianceAlerts();
    fetchAlertRules();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, severityFilter, statusFilter, typeFilter]);

  const fetchComplianceAlerts = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAlerts: ComplianceAlert[] = [
        {
          id: '1',
          type: 'mou-expiry',
          title: 'MoU with Tech Institute Australia Expiring Soon',
          description: 'The Memorandum of Understanding with Tech Institute Australia is set to expire in 15 days',
          severity: 'high',
          status: 'active',
          expiryDate: '2024-02-15',
          daysUntilExpiry: 15,
          relatedEntity: {
            id: 'mou-001',
            name: 'Tech Institute Australia MoU',
            type: 'mou'
          },
          assignedTo: ['provider-admin', 'compliance-officer'],
          createdAt: '2024-01-31T09:00:00Z',
          updatedAt: '2024-01-31T09:00:00Z',
          actions: [
            {
              id: 'action1',
              description: 'Contact RTO to initiate renewal process',
              status: 'pending',
              assignedTo: 'provider-admin',
              dueDate: '2024-02-05'
            },
            {
              id: 'action2',
              description: 'Review and update MoU terms',
              status: 'pending',
              assignedTo: 'compliance-officer',
              dueDate: '2024-02-10'
            }
          ],
          notifications: [
            {
              id: 'notif1',
              type: 'email',
              recipient: 'admin@provider.com',
              sentAt: '2024-01-31T09:00:00Z',
              status: 'delivered',
              message: 'MoU expiry alert notification sent'
            }
          ]
        },
        {
          id: '2',
          type: 'site-certification',
          title: 'WHS Certification for Manufacturing Site Expired',
          description: 'The Workplace Health and Safety certification for Manufacturing Solutions Ltd has expired',
          severity: 'critical',
          status: 'active',
          expiryDate: '2024-01-25',
          daysUntilExpiry: -5,
          relatedEntity: {
            id: 'site-002',
            name: 'Manufacturing Solutions Ltd',
            type: 'site'
          },
          assignedTo: ['site-manager', 'whs-officer'],
          createdAt: '2024-01-26T08:00:00Z',
          updatedAt: '2024-01-30T14:30:00Z',
          actions: [
            {
              id: 'action3',
              description: 'Schedule urgent WHS recertification audit',
              status: 'in-progress',
              assignedTo: 'whs-officer',
              dueDate: '2024-02-01'
            },
            {
              id: 'action4',
              description: 'Suspend new placements until certification renewed',
              status: 'completed',
              assignedTo: 'site-manager',
              dueDate: '2024-01-26',
              completedAt: '2024-01-26T10:00:00Z',
              completedBy: 'site-manager'
            }
          ],
          notifications: [
            {
              id: 'notif2',
              type: 'email',
              recipient: 'whs@provider.com',
              sentAt: '2024-01-26T08:00:00Z',
              status: 'delivered',
              message: 'Critical WHS certification expiry alert'
            },
            {
              id: 'notif3',
              type: 'sms',
              recipient: '+61400123456',
              sentAt: '2024-01-26T08:05:00Z',
              status: 'delivered',
              message: 'URGENT: WHS cert expired - immediate action required'
            }
          ]
        },
        {
          id: '3',
          type: 'insurance',
          title: 'Public Liability Insurance Renewal Due',
          description: 'Public liability insurance coverage is due for renewal in 30 days',
          severity: 'medium',
          status: 'acknowledged',
          expiryDate: '2024-03-01',
          daysUntilExpiry: 30,
          relatedEntity: {
            id: 'ins-001',
            name: 'Public Liability Policy #PL2024001',
            type: 'certification'
          },
          assignedTo: ['finance-manager', 'risk-manager'],
          createdAt: '2024-01-30T10:00:00Z',
          updatedAt: '2024-01-31T16:00:00Z',
          acknowledgedBy: 'finance-manager',
          acknowledgedAt: '2024-01-31T16:00:00Z',
          actions: [
            {
              id: 'action5',
              description: 'Request renewal quotes from insurance providers',
              status: 'pending',
              assignedTo: 'finance-manager',
              dueDate: '2024-02-15'
            }
          ],
          notifications: [
            {
              id: 'notif4',
              type: 'email',
              recipient: 'finance@provider.com',
              sentAt: '2024-01-30T10:00:00Z',
              status: 'delivered',
              message: 'Insurance renewal reminder notification'
            }
          ]
        }
      ];

      setAlerts(mockAlerts);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch compliance alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertRules = async () => {
    try {
      const mockRules: AlertRule[] = [
        {
          id: 'rule1',
          name: 'MoU Expiry Alerts',
          type: 'mou-expiry',
          isActive: true,
          thresholds: {
            critical: 7,
            high: 14,
            medium: 30,
            low: 60
          },
          notificationSettings: {
            email: true,
            sms: true,
            system: true,
            recipients: ['admin@provider.com', 'compliance@provider.com']
          },
          escalationRules: {
            escalateAfterDays: 3,
            escalateTo: ['manager@provider.com']
          }
        }
      ];

      setAlertRules(mockRules);
    } catch (error) {
      console.error('Failed to fetch alert rules:', error);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.relatedEntity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-red-100 text-red-800">Active</Badge>;
      case 'acknowledged':
        return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'dismissed':
        return <Badge variant="secondary">Dismissed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      'mou-expiry': 'MoU Expiry',
      'site-certification': 'Site Certification',
      'insurance': 'Insurance',
      'whs-audit': 'WHS Audit',
      'contract-renewal': 'Contract Renewal',
      'training-certification': 'Training Certification'
    };

    return <Badge variant="outline">{typeLabels[type as keyof typeof typeLabels] || type}</Badge>;
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? {
              ...alert,
              status: 'acknowledged' as const,
              acknowledgedBy: user?.email || 'current-user',
              acknowledgedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : alert
      ));

      toast({
        title: "Success",
        description: "Alert acknowledged successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? {
              ...alert,
              status: 'resolved' as const,
              resolvedBy: user?.email || 'current-user',
              resolvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : alert
      ));

      toast({
        title: "Success",
        description: "Alert resolved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? {
              ...alert,
              status: 'dismissed' as const,
              updatedAt: new Date().toISOString()
            }
          : alert
      ));

      toast({
        title: "Success",
        description: "Alert dismissed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = async (alertId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: "Reminder notification sent successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reminder. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getAlertStats = () => {
    const total = alerts.length;
    const critical = alerts.filter(a => a.severity === 'critical').length;
    const high = alerts.filter(a => a.severity === 'high').length;
    const active = alerts.filter(a => a.status === 'active').length;
    const overdue = alerts.filter(a => a.daysUntilExpiry < 0).length;

    return { total, critical, high, active, overdue };
  };

  const stats = getAlertStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading compliance alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MoU/Site Expiry Alerts</h1>
          <p className="text-gray-600 mt-2">Monitor and manage compliance expiration alerts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchComplianceAlerts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => setIsRulesDialogOpen(true)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Alert Rules
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-gray-900">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.high}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search alerts by title, description, or entity"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="mou-expiry">MoU Expiry</SelectItem>
                  <SelectItem value="site-certification">Site Certification</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="whs-audit">WHS Audit</SelectItem>
                  <SelectItem value="contract-renewal">Contract Renewal</SelectItem>
                  <SelectItem value="training-certification">Training Certification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <div className="grid gap-6">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
              <p className="text-gray-600">
                {searchTerm || severityFilter !== 'all' || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'No compliance alerts at this time.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === 'critical' ? 'border-l-red-500' :
              alert.severity === 'high' ? 'border-l-orange-500' :
              alert.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-green-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{alert.title}</h3>
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                      {getTypeBadge(alert.type)}
                    </div>
                    <p className="text-gray-600 mb-3">{alert.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {alert.relatedEntity.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Expires: {new Date(alert.expiryDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {alert.daysUntilExpiry >= 0 
                          ? `${alert.daysUntilExpiry} days remaining`
                          : `${Math.abs(alert.daysUntilExpiry)} days overdue`
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {alert.status === 'active' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleSendReminder(alert.id)}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button variant="outline" size="sm" onClick={() => handleResolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{alert.title}</DialogTitle>
                          <DialogDescription>
                            Detailed information and actions for this compliance alert
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div>
                              <Label className="text-sm font-medium">Alert Information</Label>
                              <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Type:</span>
                                  {getTypeBadge(alert.type)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Severity:</span>
                                  {getSeverityBadge(alert.severity)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Status:</span>
                                  {getStatusBadge(alert.status)}
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Description:</span>
                                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Timeline</Label>
                              <div className="space-y-2 mt-2">
                                <div>
                                  <span className="text-sm font-medium">Expiry Date:</span>
                                  <p className="text-sm text-gray-600">{new Date(alert.expiryDate).toLocaleDateString()}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Days Until Expiry:</span>
                                  <p className={`text-sm font-semibold ${
                                    alert.daysUntilExpiry < 0 ? 'text-red-600' : 
                                    alert.daysUntilExpiry < 7 ? 'text-orange-600' : 
                                    'text-green-600'
                                  }`}>
                                    {alert.daysUntilExpiry >= 0 
                                      ? `${alert.daysUntilExpiry} days remaining`
                                      : `${Math.abs(alert.daysUntilExpiry)} days overdue`
                                    }
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Created:</span>
                                  <p className="text-sm text-gray-600">{new Date(alert.createdAt).toLocaleString()}</p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium">Last Updated:</span>
                                  <p className="text-sm text-gray-600">{new Date(alert.updatedAt).toLocaleString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Related Entity</Label>
                            <Card className="mt-2">
                              <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4" />
                                  <span className="font-medium">{alert.relatedEntity.name}</span>
                                  <Badge variant="outline">{alert.relatedEntity.type}</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          {alert.actions.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Actions Required</Label>
                              <div className="space-y-2 mt-2">
                                {alert.actions.map((action) => (
                                  <Card key={action.id}>
                                    <CardContent className="p-4">
                                      <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                          <h5 className="font-medium">{action.description}</h5>
                                          <div className="text-sm text-gray-600 mt-1">
                                            <p>Assigned to: {action.assignedTo}</p>
                                            <p>Due: {new Date(action.dueDate).toLocaleDateString()}</p>
                                            {action.completedAt && (
                                              <p>Completed: {new Date(action.completedAt).toLocaleDateString()} by {action.completedBy}</p>
                                            )}
                                          </div>
                                        </div>
                                        <Badge variant={
                                          action.status === 'completed' ? 'default' :
                                          action.status === 'in-progress' ? 'secondary' :
                                          'outline'
                                        }>
                                          {action.status}
                                        </Badge>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {alert.notifications.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium">Notification History</Label>
                              <div className="space-y-2 mt-2">
                                {alert.notifications.map((notification) => (
                                  <div key={notification.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline">{notification.type}</Badge>
                                        <span className="text-sm">{notification.recipient}</span>
                                      </div>
                                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                                    </div>
                                    <div className="text-right">
                                      <Badge variant={notification.status === 'delivered' ? 'default' : notification.status === 'failed' ? 'destructive' : 'secondary'}>
                                        {notification.status}
                                      </Badge>
                                      <p className="text-xs text-gray-600 mt-1">{new Date(notification.sentAt).toLocaleString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between pt-4 border-t">
                          <div className="flex gap-2">
                            {alert.status === 'active' && (
                              <Button variant="outline" onClick={() => handleAcknowledgeAlert(alert.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Acknowledge
                              </Button>
                            )}
                            {alert.status === 'acknowledged' && (
                              <Button onClick={() => handleResolveAlert(alert.id)}>
                                Resolve Alert
                              </Button>
                            )}
                            <Button variant="outline" onClick={() => handleSendReminder(alert.id)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send Reminder
                            </Button>
                          </div>
                          {alert.status !== 'resolved' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                  <X className="w-4 h-4 mr-2" />
                                  Dismiss
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Dismiss Alert</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to dismiss this alert? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDismissAlert(alert.id)}>
                                    Dismiss
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                
                {alert.actions.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-blue-700">
                        {alert.actions.filter(a => a.status !== 'completed').length} Pending Actions
                      </span>
                    </div>
                    <div className="space-y-1">
                      {alert.actions.filter(a => a.status !== 'completed').slice(0, 2).map((action) => (
                        <div key={action.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {action.description} (Due: {new Date(action.dueDate).toLocaleDateString()})
                        </div>
                      ))}
                      {alert.actions.filter(a => a.status !== 'completed').length > 2 && (
                        <div className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded">
                          +{alert.actions.filter(a => a.status !== 'completed').length - 2} more actions
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Alert Rules Dialog */}
      <Dialog open={isRulesDialogOpen} onOpenChange={setIsRulesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Alert Configuration Rules</DialogTitle>
            <DialogDescription>
              Configure alert thresholds and notification settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This feature would typically include configuration options for:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>Alert threshold settings (days before expiry)</li>
              <li>Notification preferences (email, SMS, system)</li>
              <li>Escalation rules and recipients</li>
              <li>Alert frequency and reminder schedules</li>
              <li>Custom alert types and categories</li>
            </ul>
            <div className="flex justify-end">
              <Button onClick={() => {
                setIsRulesDialogOpen(false);
                toast({
                  title: "Configuration Saved",
                  description: "Alert rules have been updated successfully.",
                });
              }}>
                Save Configuration
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}