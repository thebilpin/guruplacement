'use client';

import { useEffect, useState } from 'react';
import {
  Download,
  Search,
  Users,
  BookUser,
  CheckCircle,
  FileWarning,
  MoreHorizontal,
  UserPlus,
  GraduationCap,
  ClipboardCheck,
  Clock,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KpiCard } from '@/app/rto/dashboard/components/kpi-card';
import { PlacementsByStatusChart } from './components/placements-by-status-chart';
import { RecentActivity } from './components/recent-activity';
import { AiRiskAlerts } from './components/ai-risk-alerts';
import Link from 'next/link';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  status: string;
  studentId: string;
  userId: string;
  name: string;
  placement: string;
  progress: number;
  risk: string;
}

interface RTOStats {
  totalStudents: number;
  activeStudents: number;
  completedStudents: number;
  totalCourses: number;
}

export default function RtoDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [rtoStats, setRtoStats] = useState<RTOStats>({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    totalCourses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRTOData = async () => {
      try {
        // Get RTO ID from user context or auth (for now using query param)
        const rtoId = 'current-rto'; // In real app, get from auth context
        const response = await fetch(`/api/rto/dashboard?rtoId=${rtoId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStudents(data.students || []);
            setRtoStats(data.stats || {
              totalStudents: 0,
              activeStudents: 0,
              completedStudents: 0,
              totalCourses: 0
            });
          } else {
            console.error('API returned error:', data.error);
          }
        } else {
          console.error('Failed to fetch RTO data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching RTO data:', error);
        // Set fallback data on error
        setStudents([]);
        setRtoStats({
          totalStudents: 0,
          activeStudents: 0,
          completedStudents: 0,
          totalCourses: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRTOData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enrolled': return { variant: 'default' as const, text: 'Enrolled', color: 'bg-blue-100 text-blue-800' };
      case 'in_placement': return { variant: 'default' as const, text: 'In Placement', color: 'bg-green-100 text-green-800' };
      case 'completed': return { variant: 'default' as const, text: 'Completed', color: 'bg-purple-100 text-purple-800' };
      case 'withdrawn': return { variant: 'destructive' as const, text: 'Withdrawn', color: 'bg-red-100 text-red-800' };
      default: return { variant: 'secondary' as const, text: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const handleExportReport = () => {
    console.log('📊 Exporting RTO report...');
    // In production, would generate and download report
    alert('RTO performance report would be downloaded as PDF/Excel');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
           <h1 className="text-3xl font-bold font-headline text-slate-800">
            RTO Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, Admin! Here's your overview.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Students"
          value={loading ? "..." : rtoStats.totalStudents.toString()}
          change="+5.2% from last month"
          icon={<Users className="text-blue-500" />}
        />
        <KpiCard
          title="Active Students"
          value={loading ? "..." : rtoStats.activeStudents.toString()}
          change="+2 since last week"
          icon={<BookUser className="text-green-500" />}
        />
        <KpiCard
          title="Total Courses"
          value={loading ? "..." : rtoStats.totalCourses.toString()}
          change="Active courses"
          icon={<CheckCircle className="text-teal-500" />}
        />
        <KpiCard
          title="Completed Students"
          value={loading ? "..." : rtoStats.completedStudents.toString()}
          change="This semester"
          icon={<CheckCircle className="text-purple-500" />}
        />
      </div>

      {/* Invitation Management & Contract Functions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-blue-600" />
                <CardTitle>Student & Assessor Management</CardTitle>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/rto/invite-users">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription>Invite students and assessors to your RTO</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                    <GraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Active Students</p>
                    <p className="text-sm text-gray-600">Enrolled and active</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{loading ? "..." : rtoStats.activeStudents}</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                    <ClipboardCheck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Active Assessors</p>
                    <p className="text-sm text-gray-600">Verified assessors</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-purple-600">{loading ? "..." : "12"}</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Invitations</p>
                    <p className="text-sm text-gray-600">Awaiting acceptance</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{loading ? "..." : "3"}</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/rto/invite-users">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                <CardTitle>Partnership Contracts</CardTitle>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/rto/contracts">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            <CardDescription>Manage contracts with workplace providers</CardDescription>
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
                    <p className="text-sm text-gray-600">With providers</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{loading ? "..." : "7"}</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pending Signatures</p>
                    <p className="text-sm text-gray-600">Awaiting provider signature</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-yellow-600">{loading ? "..." : "2"}</span>
              </div>
              <Button asChild className="w-full">
                <Link href="/rto/contracts">
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Contracts
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Students</CardTitle>
                <CardDescription>
                  Tracking all active student placements.
                </CardDescription>
              </div>
               <Button asChild variant="outline">
                <Link href="/rto/placements">View All Students</Link>
               </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Risk Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student, index) => (
                    <TableRow key={student.id} className="animate-in fade-in-50" style={{animationDelay: `${index * 100}ms`}}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={student.avatarUrl || `https://picsum.photos/seed/${student.email}/100/100`} />
                            <AvatarFallback>
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {student.studentId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge {...getStatusBadge(student.status)} className={getStatusBadge(student.status).color}>
                          {getStatusBadge(student.status).text}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            student.risk === 'High'
                              ? 'destructive'
                              : student.risk === 'Medium'
                              ? 'outline'
                              : 'default'
                          }
                          className={
                            student.risk === 'Low' ? 'bg-green-100 text-green-800' :
                            student.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {student.risk}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2 lg:col-span-3">
          <PlacementsByStatusChart />
          <RecentActivity />
          <AiRiskAlerts />
        </div>
      </div>
    </div>
  );
}