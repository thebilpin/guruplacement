'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Users,
  FileText,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

interface RiskArea {
  id: string;
  name: string;
  category: 'Student Management' | 'Training Delivery' | 'Assessment' | 'Compliance' | 'Finance' | 'Quality';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  score: number;
  trend: 'Improving' | 'Stable' | 'Declining';
  issues: number;
  lastAssessment: string;
  nextReview: string;
  responsible: string;
}

interface ComplianceMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

export default function ComplianceHeatmapPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [riskAreas, setRiskAreas] = useState<RiskArea[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('monthly');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchComplianceData();
  }, [selectedTimeframe]);

  const fetchComplianceData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API call
      const mockRiskAreas: RiskArea[] = [
        {
          id: '1',
          name: 'Student Enrollment Compliance',
          category: 'Student Management',
          riskLevel: 'Low',
          score: 85,
          trend: 'Stable',
          issues: 2,
          lastAssessment: '2024-01-20',
          nextReview: '2024-04-20',
          responsible: 'Student Services Team'
        },
        {
          id: '2',
          name: 'Training Package Currency',
          category: 'Training Delivery',
          riskLevel: 'Medium',
          score: 72,
          trend: 'Improving',
          issues: 5,
          lastAssessment: '2024-01-18',
          nextReview: '2024-03-18',
          responsible: 'Curriculum Team'
        },
        {
          id: '3',
          name: 'Assessment Validation',
          category: 'Assessment',
          riskLevel: 'High',
          score: 58,
          trend: 'Declining',
          issues: 8,
          lastAssessment: '2024-01-15',
          nextReview: '2024-02-15',
          responsible: 'Quality Assurance'
        },
        {
          id: '4',
          name: 'Trainer Qualifications',
          category: 'Compliance',
          riskLevel: 'Medium',
          score: 68,
          trend: 'Stable',
          issues: 4,
          lastAssessment: '2024-01-22',
          nextReview: '2024-04-22',
          responsible: 'HR Department'
        },
        {
          id: '5',
          name: 'Financial Reporting',
          category: 'Finance',
          riskLevel: 'Low',
          score: 92,
          trend: 'Improving',
          issues: 1,
          lastAssessment: '2024-01-25',
          nextReview: '2024-04-25',
          responsible: 'Finance Team'
        },
        {
          id: '6',
          name: 'Quality Management System',
          category: 'Quality',
          riskLevel: 'Critical',
          score: 45,
          trend: 'Declining',
          issues: 12,
          lastAssessment: '2024-01-10',
          nextReview: '2024-02-10',
          responsible: 'Quality Manager'
        }
      ];

      const mockMetrics: ComplianceMetric[] = [
        {
          id: '1',
          name: 'Student Completion Rate',
          value: 78,
          target: 85,
          unit: '%',
          trend: 'up',
          riskLevel: 'Medium'
        },
        {
          id: '2',
          name: 'Trainer Compliance Rate',
          value: 92,
          target: 95,
          unit: '%',
          trend: 'stable',
          riskLevel: 'Low'
        },
        {
          id: '3',
          name: 'Assessment Turnaround',
          value: 12,
          target: 10,
          unit: 'days',
          trend: 'down',
          riskLevel: 'Medium'
        },
        {
          id: '4',
          name: 'Student Satisfaction',
          value: 4.2,
          target: 4.5,
          unit: '/5',
          trend: 'up',
          riskLevel: 'Low'
        }
      ];

      setRiskAreas(mockRiskAreas);
      setMetrics(mockMetrics);
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

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'Declining':
        return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const filteredRiskAreas = selectedCategory === 'all' 
    ? riskAreas 
    : riskAreas.filter(area => area.category === selectedCategory);

  const handleExportReport = () => {
    toast({
      title: 'Export Report',
      description: 'Compliance heatmap report export functionality would be implemented here.',
    });
  };

  const handleRefreshData = () => {
    fetchComplianceData();
    toast({
      title: 'Data Refreshed',
      description: 'Compliance data has been updated.',
    });
  };

  const stats = {
    totalAreas: riskAreas.length,
    criticalRisk: riskAreas.filter(a => a.riskLevel === 'Critical').length,
    highRisk: riskAreas.filter(a => a.riskLevel === 'High').length,
    averageScore: Math.round(riskAreas.reduce((sum, area) => sum + area.score, 0) / riskAreas.length),
    totalIssues: riskAreas.reduce((sum, area) => sum + area.issues, 0)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Risk Dashboard</h1>
          <p className="text-gray-600">Monitor compliance risk levels across all RTO operations</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Risk Areas</p>
                <p className="text-2xl font-bold">{stats.totalAreas}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Risk</p>
                <p className="text-2xl font-bold text-red-600">{stats.criticalRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-orange-600">{stats.highRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold text-blue-600">{stats.averageScore}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.totalIssues}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Key Compliance Metrics</CardTitle>
          <CardDescription>Critical performance indicators for RTO compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric) => (
              <div key={metric.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">{metric.name}</h4>
                  {metric.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                  {metric.trend === 'down' && <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />}
                  {metric.trend === 'stable' && <Activity className="h-4 w-4 text-blue-500" />}
                </div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className="text-sm text-gray-600">{metric.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Target: {metric.target}{metric.unit}
                </div>
                <Badge className={getRiskColor(metric.riskLevel)} variant="outline">
                  {metric.riskLevel}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Filter by Category:</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Student Management">Student Management</SelectItem>
                <SelectItem value="Training Delivery">Training Delivery</SelectItem>
                <SelectItem value="Assessment">Assessment</SelectItem>
                <SelectItem value="Compliance">Compliance</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Quality">Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Heatmap</CardTitle>
          <CardDescription>Comprehensive view of compliance risk across all operational areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRiskAreas.map((area) => (
              <Card key={area.id} className={`border-l-4 ${getRiskColor(area.riskLevel)}`}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{area.name}</h3>
                      <Badge variant="outline">{area.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={getRiskColor(area.riskLevel)}>
                          {area.riskLevel}
                        </Badge>
                        {getTrendIcon(area.trend)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Score Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Compliance Score</span>
                      <span className="text-sm font-medium">{area.score}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getScoreColor(area.score)}`}
                        style={{ width: `${area.score}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Active Issues:</span>
                      <span className="font-medium">{area.issues}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trend:</span>
                      <span className="font-medium">{area.trend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Assessment:</span>
                      <span className="font-medium">{new Date(area.lastAssessment).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Review:</span>
                      <span className="font-medium">{new Date(area.nextReview).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Responsible:</span>
                      <span className="font-medium">{area.responsible}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}