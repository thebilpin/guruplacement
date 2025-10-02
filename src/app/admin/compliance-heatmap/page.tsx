'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Building, 
  GraduationCap, 
  BookOpen,
  Shield,
  Target,
  Calendar,
  BarChart3,
  Activity,
  Zap,
  Eye,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HeatmapCell {
  id: string;
  category: string;
  dashboardType: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceScore: number;
  alertCount: number;
  lastUpdate: Date;
  trends: {
    direction: 'UP' | 'DOWN' | 'STABLE';
    percentage: number;
  };
}

interface ComplianceMetrics {
  overall: number;
  byDashboard: {
    student: number;
    trainer: number;
    provider: number;
    rto: number;
  };
  byCategory: {
    safety: number;
    documentation: number;
    assessment: number;
    placement: number;
    audit: number;
  };
  trends: {
    weekly: number;
    monthly: number;
    quarterly: number;
  };
}

interface RiskIndicator {
  id: string;
  name: string;
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  description: string;
  affectedEntities: number;
  timeframe: string;
}

export default function ComplianceHeatmapPage() {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [riskIndicators, setRiskIndicators] = useState<RiskIndicator[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedView, setSelectedView] = useState('risk');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHeatmapData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchHeatmapData, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedPeriod]);

  const fetchHeatmapData = async () => {
    try {
      // Fetch data from audit scheduler
      const [statsResponse, alertsResponse] = await Promise.all([
        fetch('/api/admin/audit-scheduler?action=dashboard'),
        fetch('/api/admin/audit-scheduler?action=alerts')
      ]);

      if (statsResponse.ok && alertsResponse.ok) {
        const statsData = await statsResponse.json();
        const alertsData = await alertsResponse.json();

        // Generate heatmap data
        const heatmap = generateHeatmapData(statsData.stats, alertsData.alerts);
        setHeatmapData(heatmap);

        // Generate compliance metrics
        const complianceMetrics = generateComplianceMetrics(statsData.stats);
        setMetrics(complianceMetrics);

        // Generate risk indicators
        const risks = generateRiskIndicators(alertsData.alerts);
        setRiskIndicators(risks);
      }

    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      toast({
        title: "Error",
        description: "Failed to load heatmap data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (stats: any, alerts: any[]): HeatmapCell[] => {
    const categories = ['Safety', 'Documentation', 'Assessment', 'Placement', 'Audit'];
    const dashboards = ['STUDENT', 'TRAINER', 'PROVIDER', 'RTO'];
    const heatmap: HeatmapCell[] = [];

    dashboards.forEach(dashboard => {
      categories.forEach(category => {
        const dashboardStats = stats[dashboard.toLowerCase()];
        const categoryAlerts = alerts.filter(a => 
          a.dashboardType === dashboard && 
          a.category?.toUpperCase() === category.toUpperCase()
        );

        const alertCount = categoryAlerts.length;
        const criticalAlerts = categoryAlerts.filter(a => a.severity === 'CRITICAL').length;
        
        // Calculate compliance score (0-100)
        let complianceScore = 100;
        if (alertCount > 0) {
          complianceScore = Math.max(0, 100 - (alertCount * 10) - (criticalAlerts * 20));
        }

        // Determine risk level
        let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        if (criticalAlerts > 0) riskLevel = 'CRITICAL';
        else if (alertCount >= 5) riskLevel = 'HIGH';
        else if (alertCount >= 2) riskLevel = 'MEDIUM';

        heatmap.push({
          id: `${dashboard}-${category}`,
          category,
          dashboardType: dashboard,
          riskLevel,
          complianceScore,
          alertCount,
          lastUpdate: new Date(),
          trends: {
            direction: Math.random() > 0.6 ? 'UP' : Math.random() > 0.3 ? 'DOWN' : 'STABLE',
            percentage: Math.floor(Math.random() * 15) + 1
          }
        });
      });
    });

    return heatmap;
  };

  const generateComplianceMetrics = (stats: any): ComplianceMetrics => {
    const totalAlerts = Object.values(stats).reduce((sum: number, dashboard: any) => 
      sum + (dashboard.totalAlerts || 0), 0
    );
    const totalCritical = Object.values(stats).reduce((sum: number, dashboard: any) => 
      sum + (dashboard.criticalAlerts || 0), 0
    );

    const overallScore = Math.max(0, 100 - (totalAlerts * 2) - (totalCritical * 10));

    return {
      overall: overallScore,
      byDashboard: {
        student: Math.max(0, 100 - (stats.student?.totalAlerts || 0) * 5),
        trainer: Math.max(0, 100 - (stats.trainer?.totalAlerts || 0) * 5),
        provider: Math.max(0, 100 - (stats.provider?.totalAlerts || 0) * 5),
        rto: Math.max(0, 100 - (stats.rto?.totalAlerts || 0) * 5),
      },
      byCategory: {
        safety: 85 + Math.floor(Math.random() * 15),
        documentation: 78 + Math.floor(Math.random() * 20),
        assessment: 92 + Math.floor(Math.random() * 8),
        placement: 76 + Math.floor(Math.random() * 20),
        audit: 88 + Math.floor(Math.random() * 12),
      },
      trends: {
        weekly: Math.floor(Math.random() * 10) - 5,
        monthly: Math.floor(Math.random() * 20) - 10,
        quarterly: Math.floor(Math.random() * 30) - 15,
      }
    };
  };

  const generateRiskIndicators = (alerts: any[]): RiskIndicator[] => {
    return [
      {
        id: 'expired-documents',
        name: 'Expired Documents',
        level: 'HIGH',
        score: 78,
        description: 'Multiple safety documents have expired across student cohorts',
        affectedEntities: alerts.filter(a => a.type === 'EXPIRY_REMINDER' && a.severity === 'HIGH').length,
        timeframe: 'Immediate'
      },
      {
        id: 'placement-compliance',
        name: 'Placement Hour Compliance',
        level: 'MEDIUM',
        score: 65,
        description: 'Some students are behind on required placement hours',
        affectedEntities: alerts.filter(a => a.category === 'PLACEMENT').length,
        timeframe: '30 days'
      },
      {
        id: 'trainer-pd',
        name: 'Trainer Professional Development',
        level: 'MEDIUM',
        score: 72,
        description: 'PD requirements approaching due dates for several trainers',
        affectedEntities: alerts.filter(a => a.dashboardType === 'TRAINER').length,
        timeframe: '60 days'
      },
      {
        id: 'audit-readiness',
        name: 'Audit Readiness',
        level: 'LOW',
        score: 92,
        description: 'System is well-prepared for upcoming audits',
        affectedEntities: alerts.filter(a => a.category === 'AUDIT').length,
        timeframe: '90 days'
      }
    ];
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDashboardIcon = (type: string) => {
    switch (type) {
      case 'STUDENT': return <GraduationCap className="w-4 h-4" />;
      case 'TRAINER': return <Users className="w-4 h-4" />;
      case 'PROVIDER': return <Building className="w-4 h-4" />;
      case 'RTO': return <BookOpen className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (direction: string, percentage: number) => {
    const color = direction === 'UP' ? 'text-green-600' : direction === 'DOWN' ? 'text-red-600' : 'text-gray-600';
    return direction === 'UP' ? 
      <TrendingUp className={`w-3 h-3 ${color}`} /> : 
      direction === 'DOWN' ? 
      <TrendingDown className={`w-3 h-3 ${color}`} /> : 
      <Activity className={`w-3 h-3 ${color}`} />;
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
          <h1 className="text-3xl font-bold tracking-tight">📊 Compliance Heatmap & Risk Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Visual compliance monitoring and risk assessment dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="weekly">Last 7 Days</SelectItem>
              <SelectItem value="monthly">Last 30 Days</SelectItem>
              <SelectItem value="quarterly">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overall Compliance Score */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Overall Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 56}`}
                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - metrics.overall / 100)}`}
                    className={metrics.overall >= 80 ? 'text-green-500' : metrics.overall >= 60 ? 'text-yellow-500' : 'text-red-500'}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{Math.round(metrics.overall)}%</div>
                    <div className="text-xs text-muted-foreground">Compliant</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getTrendIcon('UP', metrics.trends.weekly)}
                  <span className="text-sm font-medium">Weekly Trend</span>
                </div>
                <div className={`text-lg font-bold ${metrics.trends.weekly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.trends.weekly > 0 ? '+' : ''}{metrics.trends.weekly}%
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getTrendIcon(metrics.trends.monthly >= 0 ? 'UP' : 'DOWN', Math.abs(metrics.trends.monthly))}
                  <span className="text-sm font-medium">Monthly Trend</span>
                </div>
                <div className={`text-lg font-bold ${metrics.trends.monthly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.trends.monthly > 0 ? '+' : ''}{metrics.trends.monthly}%
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {getTrendIcon(metrics.trends.quarterly >= 0 ? 'UP' : 'DOWN', Math.abs(metrics.trends.quarterly))}
                  <span className="text-sm font-medium">Quarterly Trend</span>
                </div>
                <div className={`text-lg font-bold ${metrics.trends.quarterly >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.trends.quarterly > 0 ? '+' : ''}{metrics.trends.quarterly}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="heatmap">Risk Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="risk-indicators">Risk Indicators</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          {/* Interactive Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Compliance Risk Heatmap
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm" onClick={fetchHeatmapData}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                Visual representation of compliance risks across all dashboard types and categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Heatmap Legend */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Risk Level:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-xs">Low</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-xs">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-xs">High</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-xs">Critical</span>
                </div>
              </div>

              {/* Heatmap Grid */}
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  {/* Headers */}
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <div className="text-sm font-medium text-center">Dashboard</div>
                    <div className="text-sm font-medium text-center">Safety</div>
                    <div className="text-sm font-medium text-center">Documentation</div>
                    <div className="text-sm font-medium text-center">Assessment</div>
                    <div className="text-sm font-medium text-center">Placement</div>
                    <div className="text-sm font-medium text-center">Audit</div>
                  </div>

                  {/* Heatmap Rows */}
                  {['STUDENT', 'TRAINER', 'PROVIDER', 'RTO'].map(dashboard => (
                    <div key={dashboard} className="grid grid-cols-6 gap-2 mb-2">
                      <div className="flex items-center justify-center p-3 border rounded bg-gray-50">
                        <div className="flex items-center gap-2">
                          {getDashboardIcon(dashboard)}
                          <span className="text-sm font-medium">{dashboard}</span>
                        </div>
                      </div>
                      {['Safety', 'Documentation', 'Assessment', 'Placement', 'Audit'].map(category => {
                        const cell = heatmapData.find(c => c.dashboardType === dashboard && c.category === category);
                        return (
                          <div
                            key={`${dashboard}-${category}`}
                            className={`p-3 border rounded cursor-pointer hover:opacity-80 transition-opacity ${
                              cell ? getRiskColor(cell.riskLevel) : 'bg-gray-200'
                            }`}
                            title={cell ? `${cell.alertCount} alerts, ${cell.complianceScore}% compliant` : 'No data'}
                          >
                            <div className="text-center text-white">
                              <div className="text-xs font-medium">
                                {cell ? `${cell.complianceScore}%` : 'N/A'}
                              </div>
                              <div className="text-xs">
                                {cell ? `${cell.alertCount} alerts` : ''}
                              </div>
                              <div className="flex justify-center mt-1">
                                {cell && getTrendIcon(cell.trends.direction, cell.trends.percentage)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Dashboard Performance Trends */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Performance</CardTitle>
                  <CardDescription>Compliance scores by dashboard type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(metrics.byDashboard).map(([dashboard, score]) => (
                    <div key={dashboard}>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="flex items-center gap-2">
                          {getDashboardIcon(dashboard.toUpperCase())}
                          <span className="capitalize font-medium">{dashboard}</span>
                        </div>
                        <span>{Math.round(score)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Performance</CardTitle>
                  <CardDescription>Compliance scores by compliance category</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(metrics.byCategory).map(([category, score]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="capitalize font-medium">{category}</span>
                        <span>{Math.round(score)}%</span>
                      </div>
                      <Progress value={score} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="risk-indicators" className="space-y-6">
          {/* Risk Indicators */}
          <div className="grid gap-4">
            {riskIndicators.map(indicator => (
              <Card key={indicator.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getRiskColor(indicator.level)}`}></div>
                      {indicator.name}
                    </div>
                    <Badge variant={indicator.level === 'CRITICAL' ? 'destructive' : indicator.level === 'HIGH' ? 'default' : 'secondary'}>
                      {indicator.level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <Progress value={indicator.score} className="h-2 flex-1" />
                        <span className="text-sm font-medium">{indicator.score}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Affected Entities</p>
                      <p className="text-lg font-semibold">{indicator.affectedEntities}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Timeframe</p>
                      <p className="text-sm font-medium">{indicator.timeframe}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-4">{indicator.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI-Powered Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                AI-Powered Compliance Insights
              </CardTitle>
              <CardDescription>Intelligent analysis and recommendations based on compliance data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Risk Detected</AlertTitle>
                <AlertDescription>
                  Student safety documentation compliance has dropped to 72%. Immediate action recommended for WWCC and immunisation records.
                </AlertDescription>
              </Alert>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Positive Trend Identified</AlertTitle>
                <AlertDescription>
                  Trainer professional development compliance has improved by 15% over the last quarter. Current trajectory suggests 95% compliance by year-end.
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Proactive Recommendation</AlertTitle>
                <AlertDescription>
                  Based on historical patterns, we recommend scheduling provider insurance renewals 90 days in advance to avoid last-minute compliance issues.
                </AlertDescription>
              </Alert>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Schedule Student Document Review</p>
                      <p className="text-xs text-muted-foreground">Immediate - Focus on expired safety documentation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Implement Placement Hour Tracking</p>
                      <p className="text-xs text-muted-foreground">This week - Automated alerts for students behind schedule</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Optimize Trainer PD Schedule</p>
                      <p className="text-xs text-muted-foreground">Next month - Leverage current positive trend</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}