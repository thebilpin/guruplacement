
'use client'
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ADMIN_CONTENT, getContent } from '@/lib/content';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight,
  BookUser,
  Bot,
  CheckCircle,
  FileWarning,
  Users,
  DollarSign,
  Activity,
  Download,
  ShieldCheck,
  Clock,
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { KpiCard } from '@/app/rto/dashboard/components/kpi-card'

interface DashboardStats {
  totalUsers: number;
  totalRTOs: number;
  totalProviders: number;
  totalStudents: number;
  totalPlacements: number;
  userGrowthPercent: number;
  activeRTOs: number;
  verifiedProviders: number;
}

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalRTOs: 0,
    totalProviders: 0,
    totalStudents: 0,
    totalPlacements: 0,
    userGrowthPercent: 0,
    activeRTOs: 0,
    verifiedProviders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data.stats);
          setRecentActivities(data.activities || []);
          setChartData(data.chartData || []);
          setAlerts(data.alerts || []);
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleExportData = () => {
    console.log('📊 Exporting admin dashboard data...');
    // In production, would generate and download comprehensive system report
    alert('System-wide analytics report would be downloaded as PDF/Excel');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            {ADMIN_CONTENT.dashboard.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ADMIN_CONTENT.dashboard.description}
          </p>
        </div>
         <Button onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            {ADMIN_CONTENT.dashboard.exportButton}
          </Button>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={ADMIN_CONTENT.dashboard.kpis.totalUsers.title}
          value={loading ? "..." : dashboardStats.totalUsers.toLocaleString()}
          change={loading ? "..." : `${dashboardStats.userGrowthPercent > 0 ? '+' : ''}${dashboardStats.userGrowthPercent}% from last month`}
          icon={<Users className="text-blue-500" />}
        />
        <KpiCard
          title={ADMIN_CONTENT.dashboard.kpis.activeRtos.title}
          value={loading ? "..." : dashboardStats.activeRTOs.toString()}
          change={loading ? "..." : getContent.format(ADMIN_CONTENT.dashboard.kpis.activeRtos.description, dashboardStats.totalRTOs)}
          icon={<BookUser className="text-green-500" />}
        />
        <KpiCard
          title={ADMIN_CONTENT.dashboard.kpis.totalProviders.title}
          value={loading ? "..." : dashboardStats.totalProviders.toString()}
          change={loading ? "..." : getContent.format(ADMIN_CONTENT.dashboard.kpis.totalProviders.description, dashboardStats.verifiedProviders)}
          icon={<CheckCircle className="text-teal-500" />}
        />
        <KpiCard
          title={ADMIN_CONTENT.dashboard.kpis.studentsEnrolled.title}
          value={loading ? "..." : dashboardStats.totalStudents.toString()}
          change={loading ? "..." : getContent.format(ADMIN_CONTENT.dashboard.kpis.studentsEnrolled.description, dashboardStats.totalPlacements)}
          icon={<Activity className="text-purple-500" />}
        />
      </div>

      {/* Verification Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <CardTitle>{ADMIN_CONTENT.dashboard.verification.title}</CardTitle>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/verification">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                {ADMIN_CONTENT.dashboard.verification.manageButton}
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">12</p>
                <p className="text-sm text-gray-600">{ADMIN_CONTENT.dashboard.verification.statuses.pending}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <FileWarning className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-sm text-gray-600">{ADMIN_CONTENT.dashboard.verification.statuses.underReview}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">87</p>
                <p className="text-sm text-gray-600">{ADMIN_CONTENT.dashboard.verification.statuses.verified}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">2</p>
                <p className="text-sm text-gray-600">{ADMIN_CONTENT.dashboard.verification.statuses.rejected}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

       <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            <Card className="lg:col-span-5">
                <CardHeader>
                    <CardTitle>{ADMIN_CONTENT.dashboard.charts.userRegistrations}</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => v < 1000 ? v.toString() : `${(v/1000).toFixed(1)}k`}/>
                            <Tooltip formatter={(value) => [`${value} new users`, 'Registrations']} />
                            <Bar dataKey="users" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                     <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Anomaly Alerts</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {alerts.length > 0 ? (
                        <ul className="space-y-4">
                            {alerts.map((alert, index) => (
                                <li key={index} className={`text-sm p-3 rounded-md border ${
                                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                                    alert.type === 'error' ? 'bg-red-50 border-red-200' :
                                    'bg-blue-50 border-blue-200'
                                }`}>
                                    <p className={`font-semibold ${
                                        alert.type === 'warning' ? 'text-yellow-800' :
                                        alert.type === 'error' ? 'text-red-800' :
                                        'text-blue-800'
                                    }`}>{alert.title}</p>
                                    <p className={`${
                                        alert.type === 'warning' ? 'text-yellow-700' :
                                        alert.type === 'error' ? 'text-red-700' :
                                        'text-blue-700'
                                    }`}>{alert.message}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-sm">No alerts at this time.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Platform Activity</CardTitle>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentActivities.map((activity, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            {activity.avatar && <AvatarImage src={activity.avatar} />}
                                            <AvatarFallback>
                                                {activity.user ? activity.user.split(' ').map((name: string) => name.charAt(0)).slice(0, 2).join('') : 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{activity.user}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{activity.action}</TableCell>
                                <TableCell className="text-right">{activity.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </CardContent>
        </Card>

    </div>
  );
}
