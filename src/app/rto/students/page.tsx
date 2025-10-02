
'use client'

import { useEffect, useState } from 'react';
import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ListFilter,
  FileDown,
  RefreshCw,
  Loader2,
} from 'lucide-react';
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
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';


interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  status: string;
  course: string;
  courseId: string;
  cohort: string;
  enrollmentDate: string;
  completionDate?: string;
  progress: number;
  activePlacement?: {
    id: string;
    providerName: string;
    position: string;
    startDate: string;
    status: string;
  };
  compliance: {
    documentsComplete: boolean;
    backgroundCheck: boolean;
    medicalClearance: boolean;
  };
  rtoId: string;
}

interface StudentsStats {
  total: number;
  enrolled: number;
  active: number;
  completed: number;
  at_risk: number;
  placement_ready: number;
  in_placement: number;
}

export default function RTOStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<StudentsStats>({
    total: 0,
    enrolled: 0,
    active: 0,
    completed: 0,
    at_risk: 0,
    placement_ready: 0,
    in_placement: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cohortFilter, setCohortFilter] = useState('');
  const { toast } = useToast();

  // Fetch students data
  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('🎓 Fetching RTO students...');
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('rtoId', 'current-rto'); // In real app, get from auth context
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);
      if (cohortFilter) params.append('cohort', cohortFilter);

      const response = await fetch(`/api/rto/students?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudents(data.students || []);
          setStats(data.stats || {
            total: 0,
            enrolled: 0,
            active: 0,
            completed: 0,
            at_risk: 0,
            placement_ready: 0,
            in_placement: 0,
          });
        } else {
          throw new Error(data.error || 'Failed to fetch students');
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error Loading Students",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  // Handle filter changes
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const handleCohortFilterChange = (value: string) => {
    setCohortFilter(value);
  };

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchStudents();
  }, [statusFilter, cohortFilter]);

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_placement':
        return <Badge className="bg-blue-100 text-blue-800">In Placement</Badge>;
      case 'active':
        return <Badge className="bg-yellow-100 text-yellow-800">Active</Badge>;
      case 'at_risk':
        return <Badge className="bg-red-100 text-red-800">At Risk</Badge>;
      case 'placement_ready':
        return <Badge className="bg-purple-100 text-purple-800">Placement Ready</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Students</h1>
          <p className="text-muted-foreground mt-1">
            Manage student records, track progress, and view details.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button onClick={() => fetchStudents()} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh
            </Button>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Student
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Placement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.in_placement}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.at_risk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Placement Ready</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.placement_ready}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolled}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search students by name or ID..." 
                      className="pl-9 w-full md:w-80" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="enrolled">Enrolled</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="in_placement">In Placement</SelectItem>
                            <SelectItem value="placement_ready">Placement Ready</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="at_risk">At Risk</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={cohortFilter} onValueChange={handleCohortFilterChange}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by Cohort" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Cohorts</SelectItem>
                            <SelectItem value="2024 Semester 1">2024 Semester 1</SelectItem>
                            <SelectItem value="2024 Semester 2">2024 Semester 2</SelectItem>
                            <SelectItem value="2023 Semester 2">2023 Semester 2</SelectItem>
                            <SelectItem value="Default">Default</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-10 gap-1">
                        <FileDown className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                            Export
                        </span>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p>Loading students...</p>
                    </TableCell>
                  </TableRow>
                ) : students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No students found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((s) => (
                    <TableRow key={s.id}>
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            <AvatarImage src={s.avatarUrl} />
                            <AvatarFallback>{`${s.firstName.charAt(0)}${s.lastName.charAt(0)}`}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-medium">{`${s.firstName} ${s.lastName}`}</span>
                                <p className="text-xs text-muted-foreground">{s.studentId}</p>
                                <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                        </div>
                        </TableCell>
                        <TableCell>{s.course}</TableCell>
                        <TableCell>{s.cohort}</TableCell>
                        <TableCell>
                          {getStatusBadge(s.status)}
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
                        <DropdownMenuItem>Manage Documents</DropdownMenuItem>
                        <DropdownMenuItem>View Placements</DropdownMenuItem>
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
    </div>
  );
}
