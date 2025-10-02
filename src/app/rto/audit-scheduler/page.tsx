'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Bell,
  User,
  FileText,
  Building,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  Send,
  Settings,
  Target,
  TrendingUp
} from 'lucide-react';

interface AuditSchedule {
  id: string;
  title: string;
  type: 'Internal' | 'External' | 'Compliance Review' | 'Training Package Update' | 'System Audit';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
  priority: 'High' | 'Medium' | 'Low';
  scheduledDate: string;
  completionDate?: string;
  auditor: string;
  department: string;
  scope: string[];
  description: string;
  remindersSent: number;
  nextReminderDate?: string;
  checklist: ChecklistItem[];
  findings?: AuditFinding[];
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

interface ChecklistItem {
  id: string;
  item: string;
  completed: boolean;
  notes?: string;
  evidence?: string;
}

interface AuditFinding {
  id: string;
  finding: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  responsiblePerson: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
}

interface AuditAlert {
  id: string;
  title: string;
  type: 'Reminder' | 'Overdue' | 'Risk Alert' | 'System Alert';
  priority: 'High' | 'Medium' | 'Low';
  message: string;
  relatedAuditId?: string;
  createdAt: string;
  acknowledged: boolean;
}

export default function AuditSchedulerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [audits, setAudits] = useState<AuditSchedule[]>([]);
  const [alerts, setAlerts] = useState<AuditAlert[]>([]);
  const [filteredAudits, setFilteredAudits] = useState<AuditSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedAudit, setSelectedAudit] = useState<AuditSchedule | null>(null);
  const [isNewAuditModalOpen, setIsNewAuditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled');

  const [newAudit, setNewAudit] = useState({
    title: '',
    type: 'Internal' as const,
    scheduledDate: '',
    auditor: '',
    department: '',
    description: '',
    scope: [] as string[],
    priority: 'Medium' as const
  });

  useEffect(() => {
    fetchAuditData();
  }, []);

  useEffect(() => {
    filterAudits();
  }, [audits, searchTerm, statusFilter, typeFilter]);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockAudits: AuditSchedule[] = [
        {
          id: '1',
          title: 'Annual RTO Compliance Review',
          type: 'External',
          status: 'Scheduled',
          priority: 'High',
          scheduledDate: '2024-03-15',
          auditor: 'ASQA Auditor Team',
          department: 'Quality Assurance',
          scope: ['Training Delivery', 'Assessment Practices', 'Student Records', 'Trainer Qualifications'],
          description: 'Comprehensive external audit by ASQA to review RTO compliance with VET standards',
          remindersSent: 0,
          nextReminderDate: '2024-02-15',
          checklist: [
            { id: '1', item: 'Prepare training and assessment strategies', completed: false },
            { id: '2', item: 'Update trainer qualification records', completed: true },
            { id: '3', item: 'Review student enrollment and completion data', completed: false },
            { id: '4', item: 'Prepare evidence of continuous improvement', completed: false }
          ],
          riskLevel: 'High'
        },
        {
          id: '2',
          title: 'Internal Training Package Update Review',
          type: 'Internal',
          status: 'In Progress',
          priority: 'Medium',
          scheduledDate: '2024-02-20',
          auditor: 'Sarah Johnson',
          department: 'Curriculum Development',
          scope: ['CHC Community Services', 'HLT Health Training Package'],
          description: 'Review implementation of updated training packages and assessment tools',
          remindersSent: 2,
          checklist: [
            { id: '5', item: 'Review new units of competency', completed: true },
            { id: '6', item: 'Update assessment tools', completed: true },
            { id: '7', item: 'Trainer briefing sessions', completed: false },
            { id: '8', item: 'Student transition planning', completed: false }
          ],
          riskLevel: 'Medium'
        },
        {
          id: '3',
          title: 'Student Management System Audit',
          type: 'System Audit',
          status: 'Overdue',
          priority: 'High',
          scheduledDate: '2024-01-30',
          auditor: 'IT Security Team',
          department: 'Information Technology',
          scope: ['Data Security', 'Access Controls', 'Backup Procedures', 'AVETMISS Compliance'],
          description: 'Security and compliance audit of student management systems',
          remindersSent: 3,
          checklist: [
            { id: '9', item: 'Review user access permissions', completed: false },
            { id: '10', item: 'Test backup and recovery procedures', completed: false },
            { id: '11', item: 'Validate AVETMISS data exports', completed: false }
          ],
          riskLevel: 'Critical'
        },
        {
          id: '4',
          title: 'Quarterly Compliance Check',
          type: 'Compliance Review',
          status: 'Completed',
          priority: 'Medium',
          scheduledDate: '2024-01-15',
          completionDate: '2024-01-18',
          auditor: 'Michael Chen',
          department: 'Quality Assurance',
          scope: ['Student Compliance', 'Trainer Currency', 'Marketing Materials'],
          description: 'Regular quarterly review of key compliance indicators',
          remindersSent: 1,
          checklist: [
            { id: '12', item: 'Review student compliance rates', completed: true },
            { id: '13', item: 'Check trainer professional development', completed: true },
            { id: '14', item: 'Audit marketing compliance', completed: true }
          ],
          findings: [
            {
              id: '1',
              finding: 'Minor non-compliance in marketing materials - outdated course information',
              riskLevel: 'Low',
              recommendation: 'Update course brochures with current package information',
              responsiblePerson: 'Marketing Team',
              dueDate: '2024-02-28',
              status: 'In Progress'
            }
          ],
          riskLevel: 'Low'
        }
      ];

      const mockAlerts: AuditAlert[] = [
        {
          id: '1',
          title: 'Student Management System Audit Overdue',
          type: 'Overdue',
          priority: 'High',
          message: 'The student management system audit scheduled for January 30th is now overdue. Immediate action required.',
          relatedAuditId: '3',
          createdAt: '2024-02-01T09:00:00Z',
          acknowledged: false
        },
        {
          id: '2',
          title: 'Upcoming ASQA Audit Reminder',
          type: 'Reminder',
          priority: 'High',
          message: 'Annual RTO Compliance Review is scheduled for March 15th. Preparation checklist is 50% complete.',
          relatedAuditId: '1',
          createdAt: '2024-02-10T14:30:00Z',
          acknowledged: true
        },
        {
          id: '3',
          title: 'Critical Risk Level Detected',
          type: 'Risk Alert',
          priority: 'High',
          message: 'Student Management System Audit has been flagged as critical risk due to overdue status.',
          relatedAuditId: '3',
          createdAt: '2024-02-05T11:20:00Z',
          acknowledged: false
        }
      ];

      setAudits(mockAudits);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAudits = () => {
    let filtered = audits;

    if (searchTerm) {
      filtered = filtered.filter(audit =>
        audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.auditor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(audit => audit.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(audit => audit.type === typeFilter);
    }

    setFilteredAudits(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'Overdue':
        return 'bg-red-100 text-red-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateAudit = async () => {
    try {
      const audit: AuditSchedule = {
        id: Date.now().toString(),
        ...newAudit,
        status: 'Scheduled',
        remindersSent: 0,
        checklist: [],
        riskLevel: 'Low'
      };

      setAudits([audit, ...audits]);
      setIsNewAuditModalOpen(false);
      setNewAudit({
        title: '',
        type: 'Internal',
        scheduledDate: '',
        auditor: '',
        department: '',
        description: '',
        scope: [],
        priority: 'Medium'
      });

      toast({
        title: 'Audit Scheduled',
        description: 'New audit has been scheduled successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule audit. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendReminder = (auditId: string) => {
    const updatedAudits = audits.map(audit =>
      audit.id === auditId
        ? { ...audit, remindersSent: audit.remindersSent + 1 }
        : audit
    );
    setAudits(updatedAudits);

    toast({
      title: 'Reminder Sent',
      description: 'Audit reminder has been sent to the auditor.',
    });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    const updatedAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    );
    setAlerts(updatedAlerts);

    toast({
      title: 'Alert Acknowledged',
      description: 'Alert has been acknowledged.',
    });
  };

  const handleViewAuditDetails = (audit: AuditSchedule) => {
    setSelectedAudit(audit);
    setIsDetailModalOpen(true);
  };

  const handleExportSchedule = () => {
    toast({
      title: 'Export Schedule',
      description: 'Audit schedule export functionality would be implemented here.',
    });
  };

  const handleRefreshData = () => {
    fetchAuditData();
    toast({
      title: 'Data Refreshed',
      description: 'Audit data has been updated.',
    });
  };

  const getAuditsByTab = () => {
    switch (activeTab) {
      case 'scheduled':
        return filteredAudits.filter(audit => audit.status === 'Scheduled');
      case 'in-progress':
        return filteredAudits.filter(audit => audit.status === 'In Progress');
      case 'completed':
        return filteredAudits.filter(audit => audit.status === 'Completed');
      case 'overdue':
        return filteredAudits.filter(audit => audit.status === 'Overdue');
      default:
        return filteredAudits;
    }
  };

  const stats = {
    totalAudits: audits.length,
    scheduledAudits: audits.filter(a => a.status === 'Scheduled').length,
    overdueAudits: audits.filter(a => a.status === 'Overdue').length,
    criticalRisk: audits.filter(a => a.riskLevel === 'Critical').length,
    unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Scheduler & Alerts</h1>
          <p className="text-gray-600">Manage audit schedules, track progress, and monitor compliance alerts</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportSchedule}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isNewAuditModalOpen} onOpenChange={setIsNewAuditModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Audit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Schedule New Audit</DialogTitle>
                <DialogDescription>
                  Create a new audit schedule with details and reminders
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Audit Title</Label>
                  <Input
                    id="title"
                    value={newAudit.title}
                    onChange={(e) => setNewAudit({ ...newAudit, title: e.target.value })}
                    placeholder="Enter audit title"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Audit Type</Label>
                  <Select value={newAudit.type} onValueChange={(value: any) => setNewAudit({ ...newAudit, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Internal">Internal</SelectItem>
                      <SelectItem value="External">External</SelectItem>
                      <SelectItem value="Compliance Review">Compliance Review</SelectItem>
                      <SelectItem value="Training Package Update">Training Package Update</SelectItem>
                      <SelectItem value="System Audit">System Audit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newAudit.priority} onValueChange={(value: any) => setNewAudit({ ...newAudit, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={newAudit.scheduledDate}
                    onChange={(e) => setNewAudit({ ...newAudit, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="auditor">Auditor</Label>
                  <Input
                    id="auditor"
                    value={newAudit.auditor}
                    onChange={(e) => setNewAudit({ ...newAudit, auditor: e.target.value })}
                    placeholder="Enter auditor name"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newAudit.department}
                    onChange={(e) => setNewAudit({ ...newAudit, department: e.target.value })}
                    placeholder="Enter department"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAudit.description}
                    onChange={(e) => setNewAudit({ ...newAudit, description: e.target.value })}
                    placeholder="Enter audit description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewAuditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAudit}>
                  Schedule Audit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Audits</p>
                <p className="text-2xl font-bold">{stats.totalAudits}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-purple-600">{stats.scheduledAudits}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdueAudits}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.criticalRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Alerts</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.unacknowledgedAlerts}</p>
              </div>
              <Bell className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.filter(a => !a.acknowledged).length > 0 && (
        <Card className="mb-6 border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <Bell className="h-5 w-5 mr-2" />
              Active Alerts ({alerts.filter(a => !a.acknowledged).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.filter(alert => !alert.acknowledged).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-red-50 rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-red-800">{alert.title}</span>
                      <Badge className={getPriorityColor(alert.priority)}>
                        {alert.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-red-700">{alert.message}</p>
                    <p className="text-xs text-red-600 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAcknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search audits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Internal">Internal</SelectItem>
                <SelectItem value="External">External</SelectItem>
                <SelectItem value="Compliance Review">Compliance Review</SelectItem>
                <SelectItem value="Training Package Update">Training Package Update</SelectItem>
                <SelectItem value="System Audit">System Audit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="scheduled">
            Scheduled ({audits.filter(a => a.status === 'Scheduled').length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({audits.filter(a => a.status === 'In Progress').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({audits.filter(a => a.status === 'Overdue').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({audits.filter(a => a.status === 'Completed').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {getAuditsByTab().length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No audits found</h3>
                  <p className="text-gray-600">No audits match the current filter criteria.</p>
                </CardContent>
              </Card>
            ) : (
              getAuditsByTab().map((audit) => (
                <Card key={audit.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{audit.title}</h3>
                          <Badge className={getStatusColor(audit.status)}>
                            {audit.status}
                          </Badge>
                          <Badge className={getRiskColor(audit.riskLevel)}>
                            {audit.riskLevel} Risk
                          </Badge>
                          <Badge className={getPriorityColor(audit.priority)}>
                            {audit.priority} Priority
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <strong>Type:</strong> {audit.type}
                          </div>
                          <div>
                            <strong>Auditor:</strong> {audit.auditor}
                          </div>
                          <div>
                            <strong>Department:</strong> {audit.department}
                          </div>
                          <div>
                            <strong>Scheduled:</strong> {new Date(audit.scheduledDate).toLocaleDateString()}
                          </div>
                          <div>
                            <strong>Reminders Sent:</strong> {audit.remindersSent}
                          </div>
                          {audit.completionDate && (
                            <div>
                              <strong>Completed:</strong> {new Date(audit.completionDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4">{audit.description}</p>

                        {/* Scope */}
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Audit Scope:</h4>
                          <div className="flex flex-wrap gap-2">
                            {audit.scope.map((item, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Progress */}
                        {audit.checklist.length > 0 && (
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">
                                {Math.round((audit.checklist.filter(item => item.completed).length / audit.checklist.length) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(audit.checklist.filter(item => item.completed).length / audit.checklist.length) * 100} 
                              className="h-2" 
                            />
                          </div>
                        )}

                        {/* Findings */}
                        {audit.findings && audit.findings.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Recent Findings ({audit.findings.length}):
                            </h4>
                            <div className="space-y-2">
                              {audit.findings.slice(0, 2).map((finding) => (
                                <div key={finding.id} className="p-2 bg-yellow-50 rounded">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">{finding.finding}</span>
                                    <Badge className={getRiskColor(finding.riskLevel)} variant="secondary">
                                      {finding.riskLevel}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        size="sm"
                        onClick={() => handleViewAuditDetails(audit)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      {audit.status !== 'Completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendReminder(audit.id)}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Reminder
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

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl">
          {selectedAudit && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedAudit.title}</DialogTitle>
                <DialogDescription>{selectedAudit.description}</DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="checklist" className="mt-4">
                <TabsList>
                  <TabsTrigger value="checklist">Checklist</TabsTrigger>
                  <TabsTrigger value="findings">Findings</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>

                <TabsContent value="checklist" className="space-y-4">
                  {selectedAudit.checklist.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border rounded">
                      <Checkbox checked={item.completed} />
                      <span className={item.completed ? 'line-through text-gray-500' : ''}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="findings" className="space-y-4">
                  {selectedAudit.findings?.map((finding) => (
                    <Card key={finding.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{finding.finding}</h4>
                          <Badge className={getRiskColor(finding.riskLevel)}>
                            {finding.riskLevel}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{finding.recommendation}</p>
                        <div className="text-sm text-gray-500">
                          <p>Responsible: {finding.responsiblePerson}</p>
                          <p>Due: {new Date(finding.dueDate).toLocaleDateString()}</p>
                          <p>Status: {finding.status}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )) || <p className="text-gray-500">No findings recorded yet.</p>}
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Audit Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>Type: {selectedAudit.type}</div>
                        <div>Status: {selectedAudit.status}</div>
                        <div>Priority: {selectedAudit.priority}</div>
                        <div>Risk Level: {selectedAudit.riskLevel}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Schedule Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>Scheduled: {new Date(selectedAudit.scheduledDate).toLocaleDateString()}</div>
                        <div>Auditor: {selectedAudit.auditor}</div>
                        <div>Department: {selectedAudit.department}</div>
                        <div>Reminders Sent: {selectedAudit.remindersSent}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Audit
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}