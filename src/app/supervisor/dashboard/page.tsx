
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
import { FileWarning, Bell, Users, PlusCircle, Building, CheckCircle, Shield, UserCheck } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from 'recharts';
import Link from 'next/link';
import { KpiCard } from '@/app/rto/dashboard/components/kpi-card';

interface SupervisorStats {
  totalAssignedStudents: number;
  activeSupervisions: number;
  completedEvaluations: number;
  issuesReported: number;
  weeklyHours: number;
}

interface SupervisedStudent {
  id: string;
  name: string;
  course: string;
  progress: number;
  issues: number;
  riskLevel: 'low' | 'medium' | 'high';
  avatar?: string;
  placementSite: string;
}

interface WorkloadData {
  name: string;
  hours: number;
  students: number;
}

export default function SupervisorDashboardPage() {
  const [stats, setStats] = useState<SupervisorStats>({
    totalAssignedStudents: 0,
    activeSupervisions: 0,
    completedEvaluations: 0,
    issuesReported: 0,
    weeklyHours: 0,
  });
  const [supervisedStudents, setSupervisedStudents] = useState<SupervisedStudent[]>([]);
  const [workloadData, setWorkloadData] = useState<WorkloadData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupervisorData = async () => {
      try {
        const supervisorId = 'current-supervisor'; // In real app, get from auth context
        const response = await fetch(`/api/supervisor/dashboard?supervisorId=${supervisorId}&action=dashboard`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats(data.stats);
            setSupervisedStudents(data.supervisedStudents || []);
            setWorkloadData(data.workloadData || []);
          } else {
            console.error('API returned error:', data.error);
          }
        } else {
          console.error('Failed to fetch supervisor data:', response.status);
        }
      } catch (error) {
        console.error('Error fetching supervisor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupervisorData();
  }, []);

  const handleViewStudent = (studentId: string, name: string) => {
    console.log('👀 Viewing student:', studentId, name);
    // In production, would navigate to student detail page
    alert(`Would view details for ${name}`);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">
                    Supervisor Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                    Welcome back, John! Here's your overview.
                </p>
            </div>
            <Button asChild>
                <Link href="/supervisor/logs"><PlusCircle className="mr-2 h-4 w-4" /> Add Daily Log</Link>
            </Button>
        </div>

                <div className="grid gap-4 md:grid-cols-3">
             <KpiCard
                title="Assigned Students"
                value={loading ? "..." : stats.totalAssignedStudents.toString()}
                change="Active supervisions"
                icon={<Users className="text-blue-500" />}
             />
             <KpiCard
                title="Weekly Hours"
                value={loading ? "..." : stats.weeklyHours.toString()}
                change="Supervision time"
                icon={<UserCheck className="text-green-500" />}
             />
             <KpiCard
                title="Issues Reported"
                value={loading ? "..." : stats.issuesReported.toString()}
                change={stats.issuesReported > 0 ? "Needs attention" : "All clear"}
                icon={<Shield className={stats.issuesReported > 0 ? "text-red-500" : "text-green-500"} />}
                changeType={stats.issuesReported > 0 ? 'negative' : undefined}
             />
        </div>

        {/* Provider Assignment & Invitation Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-green-600" />
              <CardTitle>Provider Assignment Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100">
                  <Building className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Assigned Provider</p>
                  <p className="text-sm text-gray-600">HealthBridge Medical</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Invitation Status</p>
                  <p className="text-sm text-blue-600">Accepted & Active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Supervisor Role</p>
                  <p className="text-sm text-purple-600">Senior Nurse Manager</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm font-medium text-green-800">Your supervisor account is fully activated!</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                You have successfully accepted your Provider invitation and can supervise students from partner RTOs.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-3 card-hover">
                <CardHeader>
                    <CardTitle>Assigned Students</CardTitle>
                    <CardDescription>Overview of your students' progress and status.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-center">Pending Issues</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supervisedStudents.map((student: SupervisedStudent) => (
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
                                        <Button onClick={() => handleViewStudent(student.id, student.name)} variant="outline" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 card-hover">
                <CardHeader>
                    <CardTitle>Weekly Workload</CardTitle>
                    <CardDescription>Supervision hours logged this week.</CardDescription>
                </CardHeader>
                <CardContent className="h-80 pl-0">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={workloadData}>
                             <defs>
                                <linearGradient id="workloadGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`}/>
                            <Tooltip formatter={(value) => `${value} hours`} cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))'}}/>
                            <Bar dataKey="hours" fill="url(#workloadGradient)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
