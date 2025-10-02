
'use client'

import {
  MoreHorizontal,
  PlusCircle,
  Search,
  ListFilter,
  FileDown,
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

const tasks = [
    { student: 'Sarah Johnson', task: 'Observation 1: Patient Communication', due: '2024-07-25', status: 'Pending' },
    { student: 'Ben Carter', task: 'Knowledge Test: IT Security Basics', due: '2024-07-22', status: 'Overdue' },
    { student: 'Li Wei', task: 'Portfolio Submission: Aged Care', due: '2024-07-30', status: 'Pending' },
    { student: 'Sarah Johnson', task: 'Logbook Review: Week 12', due: '2024-07-20', status: 'Completed' },
    { student: 'Ben Carter', task: 'Project Submission: Network Setup', due: '2024-07-18', status: 'Completed' },
];


export default function AssessmentTasksPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Assessment Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all pending and completed assessment tasks.
          </p>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center">
            <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <Button size="sm" variant="outline" className="h-8 gap-1">
                <FileDown className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                </span>
                </Button>
            </div>
        </div>
        <TabsContent value="all">
            <Card>
                <CardHeader>
                     <div className="relative flex-1 w-full md:grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search tasks or students..." className="pl-9 w-full md:w-80" />
                    </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.map((task, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold">{task.student}</TableCell>
                          <TableCell>{task.task}</TableCell>
                          <TableCell>{task.due}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                task.status === 'Completed' ? 'default' :
                                task.status === 'Overdue' ? 'destructive' : 'secondary'
                              }
                               className={
                                task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''
                              }
                            >
                              {task.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">Assess</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
