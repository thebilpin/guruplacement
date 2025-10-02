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
  FolderOpen, 
  Download,
  RefreshCw,
  User,
  FileText,
  Calendar,
  Award,
  BookOpen,
  Search,
  Filter,
  Eye,
  Share2,
  Printer,
  Mail,
  Star,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Portfolio {
  id: string;
  studentId: string;
  studentName: string;
  course: string;
  completionStatus: 'In Progress' | 'Completed' | 'Verified';
  completionPercentage: number;
  totalUnits: number;
  completedUnits: number;
  evidence: {
    documents: number;
    assessments: number;
    logbook: number;
    certificates: number;
  };
  lastUpdated: string;
  createdAt: string;
  supervisor: string;
  graduationDate?: string;
  portfolioScore?: number;
  qualityRating: 1 | 2 | 3 | 4 | 5;
}

export default function PortfolioExportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [filteredPortfolios, setFilteredPortfolios] = useState<Portfolio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [selectedPortfolios, setSelectedPortfolios] = useState<string[]>([]);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [portfolios, searchTerm, statusFilter, courseFilter]);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockPortfolios: Portfolio[] = [
        {
          id: '1',
          studentId: 'S001',
          studentName: 'Sarah Wilson',
          course: 'Certificate III in Business',
          completionStatus: 'Completed',
          completionPercentage: 100,
          totalUnits: 12,
          completedUnits: 12,
          evidence: {
            documents: 45,
            assessments: 24,
            logbook: 15,
            certificates: 3
          },
          lastUpdated: '2024-01-25T16:30:00Z',
          createdAt: '2024-09-01T08:00:00Z',
          supervisor: 'John Smith',
          graduationDate: '2024-02-15T00:00:00Z',
          portfolioScore: 89,
          qualityRating: 5
        },
        {
          id: '2',
          studentId: 'S002',
          studentName: 'Michael Chen',
          course: 'Certificate IV in Leadership and Management',
          completionStatus: 'In Progress',
          completionPercentage: 75,
          totalUnits: 16,
          completedUnits: 12,
          evidence: {
            documents: 38,
            assessments: 18,
            logbook: 12,
            certificates: 2
          },
          lastUpdated: '2024-01-24T14:20:00Z',
          createdAt: '2024-08-15T09:30:00Z',
          supervisor: 'Emma Davis',
          qualityRating: 4
        },
        {
          id: '3',
          studentId: 'S003',
          studentName: 'Lisa Rodriguez',
          course: 'Diploma in Business Administration',
          completionStatus: 'Verified',
          completionPercentage: 100,
          totalUnits: 20,
          completedUnits: 20,
          evidence: {
            documents: 62,
            assessments: 32,
            logbook: 20,
            certificates: 4
          },
          lastUpdated: '2024-01-20T11:45:00Z',
          createdAt: '2024-07-01T10:00:00Z',
          supervisor: 'David Thompson',
          graduationDate: '2024-01-30T00:00:00Z',
          portfolioScore: 95,
          qualityRating: 5
        },
        {
          id: '4',
          studentId: 'S004',
          studentName: 'James Brown',
          course: 'Certificate III in Business',
          completionStatus: 'In Progress',
          completionPercentage: 45,
          totalUnits: 12,
          completedUnits: 5,
          evidence: {
            documents: 18,
            assessments: 8,
            logbook: 5,
            certificates: 1
          },
          lastUpdated: '2024-01-22T09:15:00Z',
          createdAt: '2024-10-01T14:30:00Z',
          supervisor: 'Alice Johnson',
          qualityRating: 3
        },
        {
          id: '5',
          studentId: 'S005',
          studentName: 'Emma Watson',
          course: 'Diploma in Leadership and Management',
          completionStatus: 'Completed',
          completionPercentage: 100,
          totalUnits: 18,
          completedUnits: 18,
          evidence: {
            documents: 55,
            assessments: 28,
            logbook: 18,
            certificates: 3
          },
          lastUpdated: '2024-01-18T16:00:00Z',
          createdAt: '2024-06-15T11:20:00Z',
          supervisor: 'Rachel Green',
          graduationDate: '2024-02-01T00:00:00Z',
          portfolioScore: 92,
          qualityRating: 5
        }
      ];

      setPortfolios(mockPortfolios);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: 'Error',
        description: 'Failed to load portfolios. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = portfolios;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(portfolio =>
        portfolio.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        portfolio.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(portfolio => portfolio.completionStatus === statusFilter);
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(portfolio => portfolio.course === courseFilter);
    }

    // Sort by completion percentage and last updated
    filtered.sort((a, b) => {
      if (a.completionPercentage !== b.completionPercentage) {
        return b.completionPercentage - a.completionPercentage;
      }
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    setFilteredPortfolios(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Verified':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'In Progress':
        return <Clock className="h-4 w-4" />;
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Verified':
        return <Award className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRatingStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
          />
        ))}
      </div>
    );
  };

  const handleExportPortfolio = (portfolioId: string, format: 'pdf' | 'zip' | 'print') => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;

    toast({
      title: 'Export Started',
      description: `Exporting ${portfolio.studentName}'s portfolio as ${format.toUpperCase()}...`,
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: 'Export Complete',
        description: `Portfolio exported successfully.`,
      });
    }, 2000);
  };

  const handleBulkExport = (format: 'pdf' | 'zip') => {
    if (selectedPortfolios.length === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select portfolios to export.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Bulk Export Started',
      description: `Exporting ${selectedPortfolios.length} portfolio(s) as ${format.toUpperCase()}...`,
    });

    // Simulate bulk export process
    setTimeout(() => {
      toast({
        title: 'Bulk Export Complete',
        description: `${selectedPortfolios.length} portfolio(s) exported successfully.`,
      });
      setSelectedPortfolios([]);
    }, 3000);
  };

  const handleEmailPortfolio = (portfolioId: string) => {
    const portfolio = portfolios.find(p => p.id === portfolioId);
    if (!portfolio) return;

    toast({
      title: 'Email Sent',
      description: `Portfolio sent to ${portfolio.studentName}'s email address.`,
    });
  };

  const toggleSelectPortfolio = (portfolioId: string) => {
    setSelectedPortfolios(prev => 
      prev.includes(portfolioId) 
        ? prev.filter(id => id !== portfolioId)
        : [...prev, portfolioId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedPortfolios.length === filteredPortfolios.length) {
      setSelectedPortfolios([]);
    } else {
      setSelectedPortfolios(filteredPortfolios.map(p => p.id));
    }
  };

  const uniqueCourses = [...new Set(portfolios.map(p => p.course))];

  const stats = {
    total: portfolios.length,
    completed: portfolios.filter(p => p.completionStatus === 'Completed').length,
    verified: portfolios.filter(p => p.completionStatus === 'Verified').length,
    inProgress: portfolios.filter(p => p.completionStatus === 'In Progress').length
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Management</h1>
          <p className="text-gray-600">Export and manage student portfolios</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchPortfolios}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedPortfolios.length > 0 && (
            <>
              <Button variant="outline" onClick={() => handleBulkExport('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Bulk PDF
              </Button>
              <Button variant="outline" onClick={() => handleBulkExport('zip')}>
                <Download className="h-4 w-4 mr-2" />
                Bulk ZIP
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Portfolios</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verified}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search portfolios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Course</label>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map(course => (
                    <SelectItem key={course} value={course}>{course}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCourseFilter('all');
              }}>
                <Filter className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedPortfolios.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={selectedPortfolios.length === filteredPortfolios.length}
                  onChange={toggleSelectAll}
                />
                <span className="text-sm">{selectedPortfolios.length} selected</span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkExport('pdf')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkExport('zip')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export ZIP
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Portfolios List */}
      <div className="space-y-4">
        {filteredPortfolios.map((portfolio) => (
          <Card key={portfolio.id}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <input
                  type="checkbox"
                  className="mt-2 rounded"
                  checked={selectedPortfolios.includes(portfolio.id)}
                  onChange={() => toggleSelectPortfolio(portfolio.id)}
                />
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{portfolio.studentName}</h3>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getStatusColor(portfolio.completionStatus)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(portfolio.completionStatus)}
                            <span>{portfolio.completionStatus}</span>
                          </div>
                        </Badge>
                        {getRatingStars(portfolio.qualityRating)}
                        {portfolio.portfolioScore && (
                          <Badge variant="outline">Score: {portfolio.portfolioScore}%</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><BookOpen className="inline h-4 w-4 mr-1" />{portfolio.course}</div>
                        <div><User className="inline h-4 w-4 mr-1" />Supervisor: {portfolio.supervisor}</div>
                        {portfolio.graduationDate && (
                          <div><Award className="inline h-4 w-4 mr-1" />Graduated: {new Date(portfolio.graduationDate).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {portfolio.completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {portfolio.completedUnits}/{portfolio.totalUnits} units
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${portfolio.completionPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Evidence Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-blue-600">{portfolio.evidence.documents}</div>
                      <div className="text-xs text-gray-600">Documents</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-green-600">{portfolio.evidence.assessments}</div>
                      <div className="text-xs text-gray-600">Assessments</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-purple-600">{portfolio.evidence.logbook}</div>
                      <div className="text-xs text-gray-600">Logbook</div>
                    </div>
                    <div className="text-center bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold text-orange-600">{portfolio.evidence.certificates}</div>
                      <div className="text-xs text-gray-600">Certificates</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      Last updated: {new Date(portfolio.lastUpdated).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportPortfolio(portfolio.id, 'pdf')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportPortfolio(portfolio.id, 'zip')}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        ZIP
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEmailPortfolio(portfolio.id)}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleExportPortfolio(portfolio.id, 'print')}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPortfolios.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Portfolios Found</h3>
            <p className="text-gray-600">
              {portfolios.length === 0 
                ? "No student portfolios are available yet."
                : "No portfolios match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}