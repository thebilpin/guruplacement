
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
import { FileWarning, Bell, Users, CheckSquare, ListTodo, AlertCircle, Building, CheckCircle, ClipboardCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import { KpiCard } from '@/app/rto/dashboard/components/kpi-card';

interface AssessorStats {
  totalAssignedStudents: number;
  completedAssessments: number;
  pendingEvaluations: number;
  issuesRequiringAttention: number;
}

interface AssignedStudent {
  id: string;
  name: string;
  course: string;
  progress: number;
  issues: number;
  riskLevel: 'low' | 'medium' | 'high';
  avatar?: string;
}

export default function AssessorDashboardPage() {
  const [stats, setStats] = useState<AssessorStats>({
    totalAssignedStudents: 0,
    completedAssessments: 0,
    pendingEvaluations: 0,
    issuesRequiringAttention: 0,
  });
  const [assignedStudents, setAssignedStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessorData = async () => {
      try {
        const assessorId = 'current-assessor'; // In real app, get from auth context
        const response = await fetch(`/api/assessor/dashboard?assessorId=${assessorId}&action=dashboard`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setAssignedStudents(data.assignedStudents || []);
          } else {
            console.error('API returned error:', data.error);
          }
        } else {
          console.error('Failed to fetch assessor data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching assessor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessorData();
  }, []);
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    Assessor Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, Jane! Here's your assessment overview.
                </p>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
             <KpiCard
                title="Assigned Students"
                value={loading ? "..." : stats.totalAssignedStudents.toString()}
                change="This semester"
                icon={<Users className="text-blue-500" />}
             />
             <KpiCard
                title="Pending Assessments"
                value={loading ? "..." : stats.pendingEvaluations.toString()}
                change={stats.pendingEvaluations > 3 ? "High workload" : "On track"}
                icon={<ListTodo className="text-yellow-500" />}
                changeType={stats.pendingEvaluations > 3 ? 'negative' : undefined}
             />
             <KpiCard
                title="Issues Requiring Attention"
                value={loading ? "..." : stats.issuesRequiringAttention.toString()}
                change={stats.issuesRequiringAttention > 0 ? "Needs review" : "All good"}
                icon={<AlertCircle className="text-red-500" />}
                changeType={stats.issuesRequiringAttention > 0 ? 'negative' : undefined}
             />
        </div>

        {/* RTO Assignment & Invitation Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-purple-600" />
              <CardTitle>RTO Assignment Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Assigned RTO</p>
                  <p className="text-sm text-gray-600">Tech Skills Australia</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Invitation Status</p>
                  <p className="text-sm text-green-600">Accepted & Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <ClipboardCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Assessor Role</p>
                  <p className="text-sm text-blue-600">Senior Assessor</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">Your assessor account is fully activated!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You have successfully accepted your RTO invitation and can conduct assessments for assigned students.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='card-hover'>
            <CardHeader>
                <CardTitle>Assessment Workload</CardTitle>
                <CardDescription>Overview of your students' assessment progress and status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Assessment Progress</TableHead>
                            <TableHead className="text-center">Pending Issues</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assignedStudents.map((student) => (
                            <TableRow key={student.name}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={student.avatar} />
                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <span className="font-medium">{student.name}</span>
                                            <p className="text-xs text-muted-foreground">{student.course}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Progress value={student.progress} className="h-2 w-24" />
                                        <span className="text-xs text-muted-foreground">{student.progress}% complete</span>
                                    </div>

                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={student.issues > 0 ? 'destructive' : 'default'} className={`rounded-full h-6 w-6 flex items-center justify-center ${student.issues > 0 ? '' : 'bg-green-100 text-green-800'}`}>{student.issues}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" asChild>
                                      <Link href="/assessor/tasks">View Tasks</Link>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
