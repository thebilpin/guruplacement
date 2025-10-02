

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
import { collections } from '@/lib/db';

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
  avatar?: string;
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
        // Fetch students and related data
        const [studentsSnapshot, coursesSnapshot] = await Promise.all([
          collections.students().limit(10).get(),
          collections.courses().get(),
        ]);

        // Get student data with user information
        const studentsData = await Promise.all(
          studentsSnapshot.docs.map(async (doc) => {
            const studentData = doc.data();
            const userDoc = await collections.users().doc(studentData.userId).get();
            const userData = userDoc.data();
            
            return {
              id: doc.id,
              firstName: userData?.firstName || 'Unknown',
              lastName: userData?.lastName || 'User',
              email: userData?.email || '',
              avatarUrl: userData?.avatarUrl,
              status: studentData.status || 'enrolled',
              studentId: studentData.studentId || '',
              userId: studentData.userId || '',
              name: `${userData?.firstName || 'Unknown'} ${userData?.lastName || 'User'}`,
              placement: 'Not assigned', // This would come from placement data
              progress: Math.floor(Math.random() * 100), // Mock data for progress
              risk: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)], // Mock risk assessment
            };
          })
        );

        setStudents(studentsData as any[]);

        // Calculate stats
        const activeCount = studentsData.filter(s => s.status === 'enrolled' || s.status === 'in_placement').length;
        const completedCount = studentsData.filter(s => s.status === 'completed').length;

        setRtoStats({
          totalStudents: studentsData.length,
          activeStudents: activeCount,
          completedStudents: completedCount,
          totalCourses: coursesSnapshot.size,
        });

      } catch (error) {
        console.error('Error fetching RTO data:', error);
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
          <Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Student Placements */}
        <Card className="lg:col-span-2 card-hover">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Student Placements Overview</CardTitle>
              <CardDescription>
                Tracking all active student placements.
              </CardDescription>
            </div>
             <Button asChild variant="outline">
              <Link href="/rto/placements">View All Placements</Link>
             </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Placement</TableHead>
                  <TableHead className="text-center">Risk Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => (
                  <TableRow key={student.name} className="animate-in fade-in-50" style={{animationDelay: `${index * 100}ms`}}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={student.avatar} />
                          <AvatarFallback>
                            {student.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2">
                              <p className={`text-sm ${student.status === 'At Risk' ? 'text-red-500' : student.status === 'Needs Attention' ? 'text-yellow-600' : 'text-muted-foreground'}`}>{student.status}</p>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.placement}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          student.risk === 'High'
                            ? 'destructive'
                            : student.risk === 'Medium'
                            ? 'secondary'
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
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">
                            Flag for Review
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <AiRiskAlerts />
          <RecentActivity />
          <PlacementsByStatusChart />
        </div>
      </div>
    </div>
  );
}
