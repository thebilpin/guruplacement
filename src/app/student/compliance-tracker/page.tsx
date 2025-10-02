'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Target,
  TrendingUp,
  BookOpen,
  Award
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  title: string;
  description: string;
  category: 'Documentation' | 'Training' | 'Assessment' | 'Health & Safety' | 'Legal';
  status: 'Completed' | 'In Progress' | 'Overdue' | 'Not Started';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  completedDate?: string;
  documents: string[];
  progress: number;
  requirements: string[];
  notes?: string;
}

interface ComplianceStats {
  totalItems: number;
  completed: number;
  inProgress: number;
  overdue: number;
  overallProgress: number;
}

export default function ComplianceTrackerPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    totalItems: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    overallProgress: 0
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchComplianceData();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [complianceItems]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockData: ComplianceItem[] = [
        {
          id: '1',
          title: 'Working with Children Check',
          description: 'Valid WWCC required for all placement activities involving minors',
          category: 'Legal',
          status: 'Completed',
          priority: 'High',
          dueDate: '2024-01-15',
          completedDate: '2024-01-10',
          documents: ['wwcc-certificate.pdf'],
          progress: 100,
          requirements: ['Submit valid WWCC certificate', 'Verify expiry date', 'Upload to system'],
          notes: 'Certificate valid until 2026'
        },
        {
          id: '2',
          title: 'First Aid Training',
          description: 'Complete certified first aid training course',
          category: 'Training',
          status: 'In Progress',
          priority: 'High',
          dueDate: '2024-02-20',
          documents: ['enrollment-confirmation.pdf'],
          progress: 60,
          requirements: ['Complete online modules', 'Attend practical session', 'Pass final assessment'],
          notes: 'Practical session scheduled for Feb 18'
        },
        {
          id: '3',
          title: 'Workplace Health & Safety Induction',
          description: 'Complete mandatory WHS induction for placement site',
          category: 'Health & Safety',
          status: 'Not Started',
          priority: 'Medium',
          dueDate: '2024-02-25',
          documents: [],
          progress: 0,
          requirements: ['Watch safety videos', 'Complete quiz', 'Sign acknowledgment form']
        },
        {
          id: '4',
          title: 'Skills Assessment Portfolio',
          description: 'Submit comprehensive skills assessment portfolio',
          category: 'Assessment',
          status: 'In Progress',
          priority: 'High',
          dueDate: '2024-03-01',
          documents: ['draft-portfolio.docx'],
          progress: 75,
          requirements: ['Complete all skill demonstrations', 'Gather supervisor feedback', 'Final review'],
          notes: '3 out of 4 demonstrations completed'
        },
        {
          id: '5',
          title: 'Privacy & Confidentiality Agreement',
          description: 'Sign and submit privacy agreement for client information handling',
          category: 'Documentation',
          status: 'Overdue',
          priority: 'High',
          dueDate: '2024-01-30',
          documents: [],
          progress: 0,
          requirements: ['Read privacy policy', 'Complete online training', 'Sign agreement form']
        }
      ];

      setComplianceItems(mockData);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load compliance data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalItems = complianceItems.length;
    const completed = complianceItems.filter(item => item.status === 'Completed').length;
    const inProgress = complianceItems.filter(item => item.status === 'In Progress').length;
    const overdue = complianceItems.filter(item => item.status === 'Overdue').length;
    const overallProgress = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;

    setStats({
      totalItems,
      completed,
      inProgress,
      overdue,
      overallProgress
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'Overdue':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Overdue':
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
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const handleUploadDocument = async (itemId: string) => {
    try {
      // Mock file upload
      toast({
        title: 'Document Upload',
        description: 'Document upload functionality would be implemented here.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewDocument = (document: string) => {
    // Mock document viewing
    toast({
      title: 'Document Viewer',
      description: `Opening ${document}...`,
    });
  };

  const handleMarkComplete = async (itemId: string) => {
    try {
      const updatedItems = complianceItems.map(item =>
        item.id === itemId 
          ? { ...item, status: 'Completed' as const, progress: 100, completedDate: new Date().toISOString().split('T')[0] }
          : item
      );
      setComplianceItems(updatedItems);

      toast({
        title: 'Success',
        description: 'Compliance item marked as complete.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update compliance status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleExportReport = () => {
    toast({
      title: 'Export Report',
      description: 'Compliance report export functionality would be implemented here.',
    });
  };

  const handleRefreshData = () => {
    fetchComplianceData();
    toast({
      title: 'Data Refreshed',
      description: 'Compliance data has been updated.',
    });
  };

  const filteredItems = selectedCategory === 'all' 
    ? complianceItems 
    : complianceItems.filter(item => item.category === selectedCategory);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Tracker</h1>
          <p className="text-gray-600">Monitor your placement compliance requirements and progress</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{stats.totalItems}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Compliance Progress</span>
              <span className="text-sm font-medium">{stats.overallProgress}%</span>
            </div>
            <Progress value={stats.overallProgress} className="h-2" />
            <p className="text-sm text-gray-600">
              {stats.completed} of {stats.totalItems} compliance requirements completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Items */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">All Items</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.inProgress + complianceItems.filter(i => i.status === 'Not Started').length})</TabsTrigger>
          <TabsTrigger value="overdue">Overdue ({stats.overdue})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="space-y-4">
            {filteredItems
              .filter(item => {
                if (activeTab === 'pending') return item.status === 'In Progress' || item.status === 'Not Started';
                if (activeTab === 'overdue') return item.status === 'Overdue';
                if (activeTab === 'completed') return item.status === 'Completed';
                return true;
              })
              .map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(item.status)}
                          <h3 className="text-lg font-semibold">{item.title}</h3>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority} Priority
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{item.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            {item.category}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </div>
                          {item.completedDate && (
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              Completed: {new Date(item.completedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {item.status !== 'Completed' && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Progress</span>
                          <span className="text-sm font-medium">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-2" />
                      </div>
                    )}

                    {/* Requirements */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                      <ul className="space-y-1">
                        {item.requirements.map((req, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Documents */}
                    {item.documents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Documents:</h4>
                        <div className="flex flex-wrap gap-2">
                          {item.documents.map((doc, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDocument(doc)}
                              className="text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {doc}
                              <Eye className="h-3 w-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {item.notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Notes:</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{item.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUploadDocument(item.id)}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                      {item.status !== 'Completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkComplete(item.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}