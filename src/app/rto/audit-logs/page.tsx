'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Eye,
  User,
  Calendar,
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Settings,
  Trash2,
  ExternalLink,
  Activity,
  Lock
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'Success' | 'Failed' | 'Warning';
  category: 'Authentication' | 'Data Access' | 'Data Modification' | 'System' | 'Compliance' | 'Security';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  metadata?: Record<string, any>;
}

interface AuditStats {
  totalLogs: number;
  todayLogs: number;
  successfulActions: number;
  failedActions: number;
  securityEvents: number;
  uniqueUsers: number;
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Modal states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [dateRange]);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, searchTerm, categoryFilter, statusFilter, severityFilter, userFilter]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: '2024-01-28T15:30:45Z',
          userId: 'U001',
          userName: 'John Smith',
          userRole: 'RTO Manager',
          action: 'View Student Records',
          resource: 'Student Database',
          resourceId: 'S001',
          details: 'Accessed student compliance records for Sarah Wilson',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'Success',
          category: 'Data Access',
          severity: 'Low',
          metadata: {
            studentId: 'S001',
            recordType: 'compliance',
            duration: '00:05:23'
          }
        },
        {
          id: '2',
          timestamp: '2024-01-28T14:22:15Z',
          userId: 'U002',
          userName: 'Emma Davis',
          userRole: 'Trainer',
          action: 'Update Assessment Results',
          resource: 'Assessment System',
          resourceId: 'A123',
          details: 'Modified assessment results for BSBCMM311 - Certificate III in Business',
          ipAddress: '192.168.1.105',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'Success',
          category: 'Data Modification',
          severity: 'Medium',
          metadata: {
            assessmentId: 'A123',
            studentCount: 15,
            changesCount: 3
          }
        },
        {
          id: '3',
          timestamp: '2024-01-28T13:45:32Z',
          userId: 'U003',
          userName: 'Michael Chen',
          userRole: 'Admin',
          action: 'Failed Login Attempt',
          resource: 'Authentication System',
          details: 'Multiple failed login attempts detected from unusual location',
          ipAddress: '203.45.67.89',
          userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F)',
          status: 'Failed',
          category: 'Security',
          severity: 'High',
          metadata: {
            attemptCount: 5,
            accountLocked: true,
            location: 'Unknown'
          }
        },
        {
          id: '4',
          timestamp: '2024-01-28T12:15:20Z',
          userId: 'U004',
          userName: 'Lisa Rodriguez',
          userRole: 'Quality Manager',
          action: 'Export NCVER Data',
          resource: 'NCVER Export System',
          resourceId: 'NAT00120',
          details: 'Generated AVETMISS NAT00120 file for Q1 2024 submission',
          ipAddress: '192.168.1.110',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'Success',
          category: 'Compliance',
          severity: 'Medium',
          metadata: {
            submissionType: 'NAT00120',
            recordCount: 245,
            fileSize: '2.8MB'
          }
        },
        {
          id: '5',
          timestamp: '2024-01-28T11:30:10Z',
          userId: 'U005',
          userName: 'David Thompson',
          userRole: 'System Admin',
          action: 'Database Backup',
          resource: 'Database System',
          details: 'Automated daily database backup completed successfully',
          ipAddress: '192.168.1.200',
          userAgent: 'System/Automated',
          status: 'Success',
          category: 'System',
          severity: 'Low',
          metadata: {
            backupSize: '1.2GB',
            duration: '00:15:30',
            compression: true
          }
        },
        {
          id: '6',
          timestamp: '2024-01-28T10:45:55Z',
          userId: 'U006',
          userName: 'Alice Johnson',
          userRole: 'Student Services',
          action: 'Create Student Enrollment',
          resource: 'Student Management System',
          resourceId: 'S025',
          details: 'New student enrollment created for Certificate IV in Leadership',
          ipAddress: '192.168.1.115',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'Success',
          category: 'Data Modification',
          severity: 'Medium',
          metadata: {
            studentId: 'S025',
            course: 'Certificate IV in Leadership and Management',
            startDate: '2024-02-05'
          }
        },
        {
          id: '7',
          timestamp: '2024-01-28T09:20:18Z',
          userId: 'U007',
          userName: 'Rachel Green',
          userRole: 'Trainer',
          action: 'Access Denied',
          resource: 'Admin Panel',
          details: 'Attempted to access admin functions without sufficient privileges',
          ipAddress: '192.168.1.120',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          status: 'Failed',
          category: 'Security',
          severity: 'Medium',
          metadata: {
            attemptedResource: '/admin/users',
            requiredRole: 'Admin',
            currentRole: 'Trainer'
          }
        },
        {
          id: '8',
          timestamp: '2024-01-28T08:15:42Z',
          userId: 'U008',
          userName: 'System',
          userRole: 'System',
          action: 'Compliance Check',
          resource: 'Compliance Monitor',
          details: 'Automated compliance check detected 3 students with overdue assessments',
          ipAddress: '127.0.0.1',
          userAgent: 'System/Automated',
          status: 'Warning',
          category: 'Compliance',
          severity: 'Medium',
          metadata: {
            overdueCount: 3,
            alertsSent: true,
            nextCheck: '2024-01-29T08:15:42Z'
          }
        }
      ];

      setAuditLogs(mockLogs);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load audit logs. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API call
      const mockStats: AuditStats = {
        totalLogs: 1247,
        todayLogs: 45,
        successfulActions: 1156,
        failedActions: 91,
        securityEvents: 23,
        uniqueUsers: 28
      };

      setStats(mockStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const applyFilters = () => {
    let filtered = auditLogs;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(log => log.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(log => log.severity === severityFilter);
    }

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.userId === userFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredLogs(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      case 'Warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Authentication':
        return 'bg-blue-100 text-blue-800';
      case 'Data Access':
        return 'bg-green-100 text-green-800';
      case 'Data Modification':
        return 'bg-orange-100 text-orange-800';
      case 'System':
        return 'bg-purple-100 text-purple-800';
      case 'Compliance':
        return 'bg-indigo-100 text-indigo-800';
      case 'Security':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'Failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'Warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Lock className="h-4 w-4" />;
      case 'Data Access':
        return <Eye className="h-4 w-4" />;
      case 'Data Modification':
        return <FileText className="h-4 w-4" />;
      case 'System':
        return <Settings className="h-4 w-4" />;
      case 'Compliance':
        return <Shield className="h-4 w-4" />;
      case 'Security':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExportLogs = () => {
    toast({
      title: 'Export Started',
      description: 'Audit logs are being exported. You will receive a download link shortly.',
    });
  };

  const uniqueUsers = [...new Set(auditLogs.map(log => log.userId))];

  const currentStats = {
    total: filteredLogs.length,
    success: filteredLogs.filter(log => log.status === 'Success').length,
    failed: filteredLogs.filter(log => log.status === 'Failed').length,
    warning: filteredLogs.filter(log => log.status === 'Warning').length,
    security: filteredLogs.filter(log => log.category === 'Security').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
          <p className="text-gray-600">Monitor and track system activities and user actions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchAuditLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{currentStats.total}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success</p>
                <p className="text-2xl font-bold text-green-600">{currentStats.success}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{currentStats.failed}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{currentStats.warning}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security</p>
                <p className="text-2xl font-bold text-purple-600">{currentStats.security}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Users</p>
                <p className="text-2xl font-bold text-indigo-600">{uniqueUsers.length}</p>
              </div>
              <User className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Authentication">Authentication</SelectItem>
                  <SelectItem value="Data Access">Data Access</SelectItem>
                  <SelectItem value="Data Modification">Data Modification</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
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
                  <SelectItem value="Success">Success</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                </SelectContent>
              </Select>
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
              <label className="text-sm font-medium mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
                setSeverityFilter('all');
                setUserFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <Card key={log.id} className={`${log.severity === 'Critical' ? 'border-red-300 bg-red-50' : log.severity === 'High' ? 'border-orange-300 bg-orange-50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{log.action}</h3>
                    <Badge className={getStatusColor(log.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(log.status)}
                        <span>{log.status}</span>
                      </div>
                    </Badge>
                    <Badge className={getCategoryColor(log.category)}>
                      <div className="flex items-center space-x-1">
                        {getCategoryIcon(log.category)}
                        <span>{log.category}</span>
                      </div>
                    </Badge>
                    <Badge className={getSeverityColor(log.severity)} variant="outline">
                      {log.severity}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-3">{log.details}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{log.userName} ({log.userRole})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Database className="h-4 w-4" />
                      <span>{log.resource}</span>
                      {log.resourceId && <span>#{log.resourceId}</span>}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                    <div>IP Address: {log.ipAddress}</div>
                    <div className="truncate">User Agent: {log.userAgent}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm text-gray-500">
                  Log ID: {log.id}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(log)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  {log.category === 'Security' && log.status === 'Failed' && (
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Investigate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Audit Logs Found</h3>
            <p className="text-gray-600">
              {auditLogs.length === 0 
                ? "No audit logs are available for the selected period."
                : "No logs match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Audit Log Details</h3>
              <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                ×
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Log ID:</strong> {selectedLog.id}</div>
                  <div><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</div>
                  <div><strong>User:</strong> {selectedLog.userName} ({selectedLog.userRole})</div>
                  <div><strong>Action:</strong> {selectedLog.action}</div>
                  <div><strong>Resource:</strong> {selectedLog.resource}</div>
                  {selectedLog.resourceId && (
                    <div><strong>Resource ID:</strong> {selectedLog.resourceId}</div>
                  )}
                  <div><strong>Status:</strong> 
                    <Badge className={`ml-2 ${getStatusColor(selectedLog.status)}`}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                  <div><strong>Category:</strong> 
                    <Badge className={`ml-2 ${getCategoryColor(selectedLog.category)}`}>
                      {selectedLog.category}
                    </Badge>
                  </div>
                  <div><strong>Severity:</strong> 
                    <Badge className={`ml-2 ${getSeverityColor(selectedLog.severity)}`} variant="outline">
                      {selectedLog.severity}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Technical Details</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
                  <div><strong>User Agent:</strong> {selectedLog.userAgent}</div>
                  <div><strong>User ID:</strong> {selectedLog.userId}</div>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="font-medium mb-3">Details</h4>
              <p className="text-sm bg-gray-50 p-3 rounded">{selectedLog.details}</p>
            </div>
            
            {selectedLog.metadata && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Metadata</h4>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}