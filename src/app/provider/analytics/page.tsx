
'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, Star, Users, Briefcase, TrendingUp, Loader2 } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Pie, PieChart, Cell } from 'recharts';
import { KpiCard } from '../components/kpi-card';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  kpis: {
    overallSuccessRate: number;
    totalPlacements: number;
    studentsHosted: number;
    averageSatisfaction: number;
    applicationSuccessRate: number;
    averageDuration: number;
  };
  charts: {
    successRateData: Array<{name: string; 'Success Rate': number}>;
    studentSourceData: Array<{name: string; value: number}>;
    applicationTrends: Array<{month: string; applications: number}>;
    placementStatusData: Array<{name: string; value: number; fill: string}>;
  };
}

export default function ProviderAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('12months');
  const { toast } = useToast();

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const providerId = 'current-provider'; // In real app, get from auth context
      const response = await fetch(`/api/provider/analytics?providerId=${providerId}&timeRange=${timeRange}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnalyticsData(data);
        } else {
          console.error('API returned error:', data.error);
          toast({
            title: "Error",
            description: "Failed to load analytics data",
            variant: "destructive"
          });
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">Analytics</h1>
                <p className="text-muted-foreground mt-1">
                    Analyze your placement performance and impact.
                </p>
            </div>
            <Button>
                <FileDown className="mr-2 h-4 w-4" />
                Export Full Report
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             <KpiCard
                title="Overall Success Rate"
                value={loading ? "..." : `${analyticsData?.kpis.overallSuccessRate || 0}%`}
                change="+3% vs last year"
                icon={<TrendingUp className="text-green-500" />}
            />
            <KpiCard
                title="Total Placements"
                value={loading ? "..." : (analyticsData?.kpis.totalPlacements || 0).toString()}
                change="+20 this year"
                icon={<Briefcase className="text-blue-500" />}
            />
            <KpiCard
                title="Avg. Student Rating"
                value={loading ? "..." : `${analyticsData?.kpis.averageSatisfaction || 0} / 5`}
                change="Stable"
                icon={<Star className="text-yellow-500" />}
            />
            <KpiCard
                title="Students Hosted"
                value={loading ? "..." : (analyticsData?.kpis.studentsHosted || 0).toString()}
                change="+15% vs last year"
                icon={<Users className="text-fuchsia-500" />}
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 card-hover">
                <CardHeader>
                    <CardTitle>Placement Success Rate (YOY)</CardTitle>
                    <CardDescription>Percentage of students successfully completing placements.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        {loading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        ) : (
                          <BarChart data={analyticsData?.charts.successRateData || []}>
                            <defs>
                                <linearGradient id="successRateGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis domain={[0, 100]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`}/>
                            <Tooltip formatter={(value) => `${value}%`} cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))'}}/>
                            <Bar dataKey="Success Rate" fill="url(#successRateGradient)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 card-hover">
                <CardHeader>
                    <CardTitle>Student Source</CardTitle>
                    <CardDescription>Breakdown of students by RTO.</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        {loading ? (
                          <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin" />
                          </div>
                        ) : (
                          <PieChart>
                            <Pie 
                              data={analyticsData?.charts.studentSourceData || []} 
                              dataKey="value" 
                              nameKey="name" 
                              cx="50%" 
                              cy="50%" 
                              outerRadius={100} 
                              labelLine={false} 
                              label={({name, percent}: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {(analyticsData?.charts.studentSourceData || []).map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${200 + index * 30}, 70%, 50%)`} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))'}}/>
                          </PieChart>
                        )}
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
