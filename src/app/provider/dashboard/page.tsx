
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, ArrowUpRight, BarChart, Bot, Check, CheckCircle, FileWarning, LineChart, Star, Users, FileText, UserPlus, Clock, Shield } from 'lucide-react';
import { KpiCard } from '../components/kpi-card';
import { AiForecasts } from '../components/ai-forecasts';
import { RecentActivity } from '../components/recent-activity';
import { StudentSatisfactionChart } from '../components/student-satisfaction';
import Link from 'next/link';

interface ProviderStats {
  activePlacements: number;
  studentsHosted: number;
  pendingApplications: number;
  activeSupervisors: number;
  averageSatisfaction: number;
  activeContracts: number;
  pendingSignatures: number;
  pendingInvitations: number;
}

interface Application {
  id: string;
  name: string;
  course: string;
  applied: string;
  avatar: string;
  status: string;
}

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState<ProviderStats>({
    activePlacements: 0,
    studentsHosted: 0,
    pendingApplications: 0,
    activeSupervisors: 0,
    averageSatisfaction: 0,
    activeContracts: 0,
    pendingSignatures: 0,
    pendingInvitations: 0
  });
  const [recentApplications, setRecentApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        // Get Provider ID from user context or auth (for now using query param)
        const providerId = 'current-provider'; // In real app, get from auth context
        const response = await fetch(`/api/provider/dashboard?providerId=${providerId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats || {
              activePlacements: 18,
              studentsHosted: 42,
              pendingApplications: 5,
              activeSupervisors: 8,
              averageSatisfaction: 4.8,
              activeContracts: 3,
              pendingSignatures: 1,
              pendingInvitations: 2
            });
            setRecentApplications(data.recentApplications || [
              { id: '1', name: 'Sarah Johnson', course: 'Diploma of Nursing', applied: '2h ago', avatar: 'https://picsum.photos/seed/student1/100/100', status: 'submitted' },
              { id: '2', name: 'Ben Carter', course: 'Certificate IV in IT', applied: '1d ago', avatar: 'https://picsum.photos/seed/student2/100/100', status: 'submitted' },
              { id: '3', name: 'Maria Garcia', course: 'Diploma of Early Childhood Education', applied: '3d ago', avatar: 'https://picsum.photos/seed/student3/100/100', status: 'submitted' }
            ]);
          } else {
            console.error('API returned error:', data.error);
          }
        } else {
          console.error('Failed to fetch Provider data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching Provider data:', error);
        // Set fallback data on error
        setStats({
          activePlacements: 18,
          studentsHosted: 42,
          pendingApplications: 5,
          activeSupervisors: 8,
          averageSatisfaction: 4.8,
          activeContracts: 3,
          pendingSignatures: 1,
          pendingInvitations: 2
        });
        setRecentApplications([
          { id: '1', name: 'Sarah Johnson', course: 'Diploma of Nursing', applied: '2h ago', avatar: 'https://picsum.photos/seed/student1/100/100', status: 'submitted' },
          { id: '2', name: 'Ben Carter', course: 'Certificate IV in IT', applied: '1d ago', avatar: 'https://picsum.photos/seed/student2/100/100', status: 'submitted' },
          { id: '3', name: 'Maria Garcia', course: 'Diploma of Early Childhood Education', applied: '3d ago', avatar: 'https://picsum.photos/seed/student3/100/100', status: 'submitted' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, []);

  const handleViewApplication = (applicationId: string, name: string) => {
    console.log('👀 Viewing application:', applicationId, name);
    // In production, would navigate to application detail page
    alert(`Would view application details for ${name}`);
  };
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
            <h1 className="text-3xl font-bold font-headline text-slate-800">
                Provider Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
                Welcome back, HealthBridge! Here's your overview.
            </p>
            </div>
            <div className="flex items-center space-x-2">
            <Button asChild>
                <Link href="/provider/placements/new">Create Placement</Link>
            </Button>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KpiCard
                title="Active Placements"
                value={loading ? "..." : stats.activePlacements.toString()}
                change="+2 since last month"
                icon={<BarChart className="text-blue-500" />}
            />
            <KpiCard
                title="Students Hosted"
                value={loading ? "..." : stats.studentsHosted.toString()}
                change="+15% YOY"
                icon={<Users className="text-green-500" />}
            />
            <KpiCard
                title="Avg. Satisfaction"
                value={loading ? "..." : `${stats.averageSatisfaction}/5`}
                change="+0.1"
                icon={<Star className="text-yellow-500" />}
            />
            <KpiCard
                title="Pending Applications"
                value={loading ? "..." : stats.pendingApplications.toString()}
                change="3 new"
                icon={<FileWarning className="text-red-500" />}
                changeType='negative'
            />
        </div>

        {/* Contract Management & Invitation Functions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <CardTitle>Contract Management</CardTitle>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/provider/contracts">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                View All
                            </Link>
                        </Button>
                    </div>
                    <CardDescription>Manage your MoU contracts with RTOs</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Active Contracts</p>
                                    <p className="text-sm text-gray-600">3 RTOs</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{loading ? "..." : stats.activeContracts}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Pending Signatures</p>
                                    <p className="text-sm text-gray-600">Require your signature</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-yellow-600">{loading ? "..." : stats.pendingSignatures}</span>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/provider/contracts">
                                <FileText className="h-4 w-4 mr-2" />
                                Manage Contracts
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-green-600" />
                            <CardTitle>Supervisor Management</CardTitle>
                        </div>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/provider/invite-supervisors">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                View All
                            </Link>
                        </Button>
                    </div>
                    <CardDescription>Invite and manage workplace supervisors</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                    <Shield className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Active Supervisors</p>
                                    <p className="text-sm text-gray-600">Verified and active</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{loading ? "..." : stats.activeSupervisors}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium">Pending Invitations</p>
                                    <p className="text-sm text-gray-600">Awaiting acceptance</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{loading ? "..." : stats.pendingInvitations}</span>
                        </div>
                        <Button asChild className="w-full">
                            <Link href="/provider/invite-supervisors">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Supervisors
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 card-hover">
                <CardHeader>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>New students interested in your placements.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Applied</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        Loading applications...
                                    </TableCell>
                                </TableRow>
                            ) : recentApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        No recent applications found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentApplications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={app.avatar} />
                                                    <AvatarFallback>{app.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{app.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{app.course}</TableCell>
                                        <TableCell>{app.applied}</TableCell>
                                        <TableCell className="text-right">
                                            <Button onClick={() => handleViewApplication(app.id, app.name)} variant="outline" size="sm">View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <AiForecasts />
                <StudentSatisfactionChart />
            </div>
        </div>

        <RecentActivity />
    </div>
  );
}
