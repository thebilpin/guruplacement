'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  User, 
  FileText, 
  Database, 
  Settings, 
  Lock, 
  Unlock, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  MoreVertical,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  Target,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Archive,
  Flag,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  ExternalLink,
  Server,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action: string;
  actionType: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'APPROVE' | 'REJECT';
  category: 'AUTHENTICATION' | 'DATA_CHANGE' | 'SYSTEM' | 'COMPLIANCE' | 'SECURITY' | 'USER_MANAGEMENT' | 'DOCUMENT' | 'PLACEMENT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  target: {
    type: string;
    id: string;
    name: string;
  };
  details: {
    description: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
  };
  source: {
    ip: string;
    userAgent: string;
    location?: string;
    device: 'DESKTOP' | 'MOBILE' | 'TABLET';
  };
  result: 'SUCCESS' | 'FAILURE' | 'PARTIAL';
  dashboardType: string;
  tags: string[];
}

interface AuditStats {
  total: number;
  today: number;
  thisWeek: number;
  failures: number;
  criticalEvents: number;
  byCategory: {
    authentication: number;
    dataChange: number;
    system: number;
    compliance: number;
    security: number;
    userManagement: number;
    document: number;
    placement: number;
  };
  byAction: {
    create: number;
    read: number;
    update: number;
    delete: number;
    login: number;
    logout: number;
    export: number;
    import: number;
  };
  trends: {
    daily: number[];
    weekly: number;
    monthly: number;
  };
}

interface AuditFilters {
  actionType: string[];
  category: string[];
  severity: string[];
  result: string[];
  dashboardType: string[];
  dateRange: string;
  user: string;
  search: string;
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [filters, setFilters] = useState<AuditFilters>({
    actionType: [],
    category: [],
    severity: [],
    result: [],
    dashboardType: [],
    dateRange: 'all',
    user: '',
    search: ''
  });
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'user'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAuditLogs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAuditLogs, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, filters, sortBy, sortOrder]);

  const fetchAuditLogs = async () => {
    try {
      // Generate sample audit log data
      const sampleLogs = generateAuditLogData();
      setAuditLogs(sampleLogs);
      
      const auditStats = calculateStats(sampleLogs);
      setStats(auditStats);
      
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAuditLogData = (): AuditLogEntry[] => {
    const actionTypes: AuditLogEntry['actionType'][] = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'APPROVE', 'REJECT'];
    const categories: AuditLogEntry['category'][] = ['AUTHENTICATION', 'DATA_CHANGE', 'SYSTEM', 'COMPLIANCE', 'SECURITY', 'USER_MANAGEMENT', 'DOCUMENT', 'PLACEMENT'];
    const severities: AuditLogEntry['severity'][] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const results: AuditLogEntry['result'][] = ['SUCCESS', 'FAILURE', 'PARTIAL'];
    const dashboards = ['STUDENT', 'TRAINER', 'PROVIDER', 'RTO', 'ADMIN', 'SYSTEM'];
    const devices: AuditLogEntry['source']['device'][] = ['DESKTOP', 'MOBILE', 'TABLET'];
    
    const sampleLogs: AuditLogEntry[] = [];
    
    for (let i = 0; i < 100; i++) {
      const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const result = results[Math.floor(Math.random() * results.length)];
      const dashboard = dashboards[Math.floor(Math.random() * dashboards.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      
      sampleLogs.push({
        id: `audit-${i + 1}`,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        action: getActionDescription(actionType, category),
        actionType,
        category,
        severity,
        user: {
          id: `user-${Math.floor(Math.random() * 20) + 1}`,
          name: `User ${Math.floor(Math.random() * 20) + 1}`,
          email: `user${Math.floor(Math.random() * 20) + 1}@example.com`,
          role: getRandomRole(),
          avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=user${i + 1}`
        },
        target: {
          type: getTargetType(category),
          id: `target-${i + 1}`,
          name: getTargetName(category)
        },
        details: {
          description: getDetailedDescription(actionType, category),
          oldValue: actionType === 'UPDATE' ? generateOldValue() : undefined,
          newValue: actionType === 'UPDATE' || actionType === 'CREATE' ? generateNewValue() : undefined,
          metadata: {
            sessionId: `session-${Math.random().toString(36).substr(2, 9)}`,
            requestId: `req-${Math.random().toString(36).substr(2, 12)}`
          }
        },
        source: {
          ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: getUserAgent(device),
          location: getRandomLocation(),
          device
        },
        result,
        dashboardType: dashboard,
        tags: generateTags(actionType, category)
      });
    }
    
    return sampleLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  };

  const getActionDescription = (actionType: string, category: string): string => {
    const descriptions = {
      'CREATE': `Created new ${category.toLowerCase()} record`,
      'READ': `Accessed ${category.toLowerCase()} data`,
      'UPDATE': `Modified ${category.toLowerCase()} information`,
      'DELETE': `Deleted ${category.toLowerCase()} record`,
      'LOGIN': `User logged into ${category.toLowerCase()} system`,
      'LOGOUT': `User logged out of ${category.toLowerCase()} system`,
      'EXPORT': `Exported ${category.toLowerCase()} data`,
      'IMPORT': `Imported ${category.toLowerCase()} data`,
      'APPROVE': `Approved ${category.toLowerCase()} request`,
      'REJECT': `Rejected ${category.toLowerCase()} request`
    };
    return descriptions[actionType] || `${actionType} action on ${category}`;
  };

  const getRandomRole = (): string => {
    const roles = ['Student', 'Trainer', 'Provider Admin', 'RTO Admin', 'System Admin', 'Assessor', 'Supervisor'];
    return roles[Math.floor(Math.random() * roles.length)];
  };

  const getTargetType = (category: string): string => {
    const types = {
      'AUTHENTICATION': 'User Session',
      'DATA_CHANGE': 'Database Record',
      'SYSTEM': 'System Configuration',
      'COMPLIANCE': 'Compliance Document',
      'SECURITY': 'Security Policy',
      'USER_MANAGEMENT': 'User Account',
      'DOCUMENT': 'Document File',
      'PLACEMENT': 'Placement Record'
    };
    return types[category as keyof typeof types] || 'System Entity';
  };

  const getTargetName = (category: string): string => {
    const names = {
      'AUTHENTICATION': `Session-${Math.random().toString(36).substr(2, 6)}`,
      'DATA_CHANGE': `Record-${Math.floor(Math.random() * 1000)}`,
      'SYSTEM': `Config-${Math.random().toString(36).substr(2, 4)}`,
      'COMPLIANCE': `Compliance-Doc-${Math.floor(Math.random() * 100)}`,
      'SECURITY': `Security-Policy-${Math.floor(Math.random() * 50)}`,
      'USER_MANAGEMENT': `User-${Math.floor(Math.random() * 500)}`,
      'DOCUMENT': `Document-${Math.floor(Math.random() * 200)}`,
      'PLACEMENT': `Placement-${Math.floor(Math.random() * 300)}`
    };
    return names[category as keyof typeof names] || `Entity-${Math.floor(Math.random() * 100)}`;
  };

  const getDetailedDescription = (actionType: string, category: string): string => {
    return `User performed ${actionType} operation on ${category} with system validation and security checks completed successfully.`;
  };

  const generateOldValue = () => ({
    status: 'pending',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    value: Math.floor(Math.random() * 100)
  });

  const generateNewValue = () => ({
    status: 'active',
    lastModified: new Date().toISOString(),
    value: Math.floor(Math.random() * 100)
  });

  const getUserAgent = (device: string): string => {
    const userAgents = {
      'DESKTOP': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'MOBILE': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      'TABLET': 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
    };
    return userAgents[device as keyof typeof userAgents];
  };

  const getRandomLocation = (): string => {
    const locations = ['Sydney, Australia', 'Melbourne, Australia', 'Brisbane, Australia', 'Perth, Australia', 'Adelaide, Australia'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const generateTags = (actionType: string, category: string): string[] => {
    const baseTags = [actionType.toLowerCase(), category.toLowerCase()];
    const additionalTags = ['audit', 'logged', 'tracked'];
    return [...baseTags, ...additionalTags.slice(0, Math.floor(Math.random() * 2) + 1)];
  };

  const calculateStats = (logs: AuditLogEntry[]): AuditStats => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: logs.length,
      today: logs.filter(log => log.timestamp >= todayStart).length,
      thisWeek: logs.filter(log => log.timestamp >= weekStart).length,
      failures: logs.filter(log => log.result === 'FAILURE').length,
      criticalEvents: logs.filter(log => log.severity === 'CRITICAL').length,
      byCategory: {
        authentication: logs.filter(log => log.category === 'AUTHENTICATION').length,
        dataChange: logs.filter(log => log.category === 'DATA_CHANGE').length,
        system: logs.filter(log => log.category === 'SYSTEM').length,
        compliance: logs.filter(log => log.category === 'COMPLIANCE').length,
        security: logs.filter(log => log.category === 'SECURITY').length,
        userManagement: logs.filter(log => log.category === 'USER_MANAGEMENT').length,
        document: logs.filter(log => log.category === 'DOCUMENT').length,
        placement: logs.filter(log => log.category === 'PLACEMENT').length,
      },
      byAction: {
        create: logs.filter(log => log.actionType === 'CREATE').length,
        read: logs.filter(log => log.actionType === 'READ').length,
        update: logs.filter(log => log.actionType === 'UPDATE').length,
        delete: logs.filter(log => log.actionType === 'DELETE').length,
        login: logs.filter(log => log.actionType === 'LOGIN').length,
        logout: logs.filter(log => log.actionType === 'LOGOUT').length,
        export: logs.filter(log => log.actionType === 'EXPORT').length,
        import: logs.filter(log => log.actionType === 'IMPORT').length,
      },
      trends: {
        daily: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
          return logs.filter(log => log.timestamp >= dayStart && log.timestamp < dayEnd).length;
        }),
        weekly: Math.floor(Math.random() * 30) - 15,
        monthly: Math.floor(Math.random() * 50) - 25,
      }
    };
  };

  const applyFilters = () => {
    let filtered = [...auditLogs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchLower) ||
        log.user.name.toLowerCase().includes(searchLower) ||
        log.target.name.toLowerCase().includes(searchLower) ||
        log.details.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply other filters
    if (filters.actionType.length > 0) {
      filtered = filtered.filter(log => filters.actionType.includes(log.actionType));
    }

    if (filters.category.length > 0) {
      filtered = filtered.filter(log => filters.category.includes(log.category));
    }

    if (filters.severity.length > 0) {
      filtered = filtered.filter(log => filters.severity.includes(log.severity));
    }

    if (filters.result.length > 0) {
      filtered = filtered.filter(log => filters.result.includes(log.result));
    }

    if (filters.dashboardType.length > 0) {
      filtered = filtered.filter(log => filters.dashboardType.includes(log.dashboardType));
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => log.timestamp >= cutoffDate);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'severity':
          const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          aValue = severityOrder[a.severity];
          bValue = severityOrder[b.severity];
          break;
        case 'user':
          aValue = a.user.name;
          bValue = b.user.name;
          break;
        default:
          aValue = a.timestamp.getTime();
          bValue = b.timestamp.getTime();
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    setFilteredLogs(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'SUCCESS': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILURE': return 'bg-red-100 text-red-800 border-red-200';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'AUTHENTICATION': return 'bg-blue-500 text-white';
      case 'DATA_CHANGE': return 'bg-purple-500 text-white';
      case 'SYSTEM': return 'bg-gray-500 text-white';
      case 'COMPLIANCE': return 'bg-indigo-500 text-white';
      case 'SECURITY': return 'bg-red-500 text-white';
      case 'USER_MANAGEMENT': return 'bg-green-500 text-white';
      case 'DOCUMENT': return 'bg-yellow-500 text-black';
      case 'PLACEMENT': return 'bg-pink-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'CREATE': return <Plus className="w-4 h-4" />;
      case 'READ': return <Eye className="w-4 h-4" />;
      case 'UPDATE': return <Edit className="w-4 h-4" />;
      case 'DELETE': return <Trash2 className="w-4 h-4" />;
      case 'LOGIN': return <Lock className="w-4 h-4" />;
      case 'LOGOUT': return <Unlock className="w-4 h-4" />;
      case 'EXPORT': return <Download className="w-4 h-4" />;
      case 'IMPORT': return <Upload className="w-4 h-4" />;
      case 'APPROVE': return <CheckCircle className="w-4 h-4" />;
      case 'REJECT': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'DESKTOP': return <Monitor className="w-4 h-4" />;
      case 'MOBILE': return <Smartphone className="w-4 h-4" />;
      case 'TABLET': return <Smartphone className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === filteredLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(filteredLogs.map(log => log.id));
    }
  };

  const handleBulkExport = () => {
    if (selectedLogs.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select logs to export",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Exported ${selectedLogs.length} audit logs`,
    });
    
    setSelectedLogs([]);
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
          <h1 className="text-3xl font-bold tracking-tight">🛡️ Audit Logs & System Activity</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive tracking of all system activities and security events
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchAuditLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleBulkExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Audit Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="flex items-center p-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Activity className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.today}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <TrendingUp className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
                <p className="text-xs text-muted-foreground">This Week</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.failures}</p>
                <p className="text-xs text-muted-foreground">Failures</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.criticalEvents}</p>
                <p className="text-xs text-muted-foreground">Critical</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-4">
              <Target className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.total > 0 ? Math.round(((stats.total - stats.failures) / stats.total) * 100) : 100}%
                </p>
                <p className="text-xs text-muted-foreground">Success Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="logs">Audit Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      placeholder="Search audit logs..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Action Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="authentication">Authentication</SelectItem>
                      <SelectItem value="data-change">Data Change</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="All severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severities</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedLogs.length === filteredLogs.length && filteredLogs.length > 0}
                    onCheckedChange={selectAllLogs}
                  />
                  <span className="text-sm">
                    {selectedLogs.length > 0 ? `${selectedLogs.length} selected` : 'Select all'}
                  </span>
                </div>
                {selectedLogs.length > 0 && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleBulkExport}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Selected
                    </Button>
                    <Button size="sm" variant="outline">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Audit Logs List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Audit Log Entries ({filteredLogs.length})
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSortBy('timestamp');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Time {sortBy === 'timestamp' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSortBy('severity');
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    Severity {sortBy === 'severity' && (sortOrder === 'asc' ? <SortAsc className="w-4 h-4 ml-1" /> : <SortDesc className="w-4 h-4 ml-1" />)}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={selectedLogs.includes(log.id)}
                          onCheckedChange={() => toggleLogSelection(log.id)}
                        />
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={log.user.avatar} />
                          <AvatarFallback>
                            {log.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              {getActionIcon(log.actionType)}
                              <Badge className={getCategoryColor(log.category)}>
                                {log.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.severity}
                            </Badge>
                            <Badge variant="outline" className={getResultColor(log.result)}>
                              {log.result}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {getDeviceIcon(log.source.device)}
                              <span>{log.source.device}</span>
                            </div>
                          </div>
                          
                          <h3 className="font-semibold text-lg mb-1">{log.action}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{log.details.description}</p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>User: {log.user.name} ({log.user.role})</span>
                            <span>Target: {log.target.name}</span>
                            <span>Time: {log.timestamp.toLocaleString()}</span>
                            <span>IP: {log.source.ip}</span>
                            <span>Location: {log.source.location}</span>
                          </div>
                          
                          {log.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              {log.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedEntry(log)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Related
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Flag className="w-4 h-4 mr-2" />
                            Flag for Review
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Export Entry
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}

                {filteredLogs.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
                    <p className="text-muted-foreground">
                      {auditLogs.length === 0 ? 'No audit logs have been generated yet.' : 'Try adjusting your filters to see more results.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Analytics Dashboard */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Activity by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category.toUpperCase()).split(' ')[0]}`}></div>
                        <span className="capitalize font-medium">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getCategoryColor(category.toUpperCase()).split(' ')[0]}`}
                            style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Activity by Action Type</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(stats.byAction).map(([action, count]) => (
                    <div key={action} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getActionIcon(action.toUpperCase())}
                        <span className="capitalize font-medium">{action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Security Events & Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Security Monitoring</AlertTitle>
                <AlertDescription>
                  Critical security events and suspicious activities are automatically flagged and monitored for immediate attention.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 space-y-4">
                {filteredLogs.filter(log => log.category === 'SECURITY' || log.severity === 'CRITICAL').slice(0, 5).map((log) => (
                  <div key={log.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <Badge className="bg-red-500 text-white">{log.severity}</Badge>
                      <span className="text-sm font-medium">{log.timestamp.toLocaleString()}</span>
                    </div>
                    <h3 className="font-semibold mb-1">{log.action}</h3>
                    <p className="text-sm text-muted-foreground">{log.details.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>User: {log.user.name}</span>
                      <span>IP: {log.source.ip}</span>
                      <span>Result: {log.result}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          {/* Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Audit Reports & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Audit Reporting</AlertTitle>
                <AlertDescription>
                  Generate comprehensive audit reports for compliance, security reviews, and system analysis.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-20 flex-col">
                  <Download className="w-6 h-6 mb-2" />
                  <span>Security Report</span>
                  <span className="text-xs opacity-75">Last 30 days</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Calendar className="w-6 h-6 mb-2" />
                  <span>Compliance Report</span>
                  <span className="text-xs opacity-75">Quarterly</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Activity className="w-6 h-6 mb-2" />
                  <span>Activity Summary</span>
                  <span className="text-xs opacity-75">Monthly</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Users className="w-6 h-6 mb-2" />
                  <span>User Activity</span>
                  <span className="text-xs opacity-75">Custom range</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Audit Log Details</h2>
              <Button variant="ghost" onClick={() => setSelectedEntry(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Event Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(selectedEntry.category)}>
                        {selectedEntry.category.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(selectedEntry.severity)}>
                        {selectedEntry.severity}
                      </Badge>
                      <Badge variant="outline" className={getResultColor(selectedEntry.result)}>
                        {selectedEntry.result}
                      </Badge>
                    </div>
                    <p><strong>Action:</strong> {selectedEntry.action}</p>
                    <p><strong>Timestamp:</strong> {selectedEntry.timestamp.toLocaleString()}</p>
                    <p><strong>Target:</strong> {selectedEntry.target.name} ({selectedEntry.target.type})</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">User & Source</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedEntry.user.avatar} />
                        <AvatarFallback>
                          {selectedEntry.user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedEntry.user.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedEntry.user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(selectedEntry.source.device)}
                      <span>{selectedEntry.source.device}</span>
                    </div>
                    <p><strong>IP Address:</strong> {selectedEntry.source.ip}</p>
                    <p><strong>Location:</strong> {selectedEntry.source.location}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Event Details</h3>
                <p className="text-sm text-gray-700 mb-4">{selectedEntry.details.description}</p>
                
                {selectedEntry.details.oldValue && selectedEntry.details.newValue && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Previous Value</h4>
                      <pre className="text-xs bg-red-50 p-3 rounded border">
                        {JSON.stringify(selectedEntry.details.oldValue, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">New Value</h4>
                      <pre className="text-xs bg-green-50 p-3 rounded border">
                        {JSON.stringify(selectedEntry.details.newValue, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">Technical Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Session ID:</strong> {selectedEntry.details.metadata?.sessionId}</p>
                    <p><strong>Request ID:</strong> {selectedEntry.details.metadata?.requestId}</p>
                  </div>
                  <div>
                    <p><strong>User Agent:</strong></p>
                    <p className="text-xs text-muted-foreground break-all">{selectedEntry.source.userAgent}</p>
                  </div>
                </div>
              </div>
              
              {selectedEntry.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Tags</h3>
                  <div className="flex items-center gap-1 flex-wrap">
                    {selectedEntry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}