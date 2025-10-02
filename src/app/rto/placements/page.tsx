
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';


const placements = [
  {
    student: 'Sarah Johnson',
    avatar: 'https://picsum.photos/seed/student1/100/100',
    provider: 'St. Mary\'s Hospital',
    supervisor: 'John Smith',
    progress: 85,
    status: 'On Track',
  },
  {
    student: 'Ben Carter',
    avatar: 'https://picsum.photos/seed/student2/100/100',
    provider: 'TechStart Solutions',
    supervisor: 'Jane Doe',
    progress: 40,
    status: 'Needs Attention',
  },
  {
    student: 'Maria Garcia',
    avatar: 'https://picsum.photos/seed/student3/100/100',
    provider: 'Sunshine Primary',
    supervisor: 'Emily White',
    progress: 95,
    status: 'Completed',
  },
  {
    student: 'Li Wei',
    avatar: 'https://picsum.photos/seed/student4/100/100',
    provider: 'CareWell Aged Care',
    supervisor: 'David Brown',
    progress: 20,
    status: 'At Risk',
  },
    {
    student: 'Aisha Khan',
    avatar: 'https://picsum.photos/seed/student5/100/100',
    provider: 'Innovate Inc.',
    supervisor: 'Michael Green',
    progress: 70,
    status: 'On Track',
  },
  {
    student: 'Tom Wilson',
    avatar: 'https://picsum.photos/seed/student6/100/100',
    provider: 'HealthBridge',
    supervisor: 'Laura Blue',
    progress: 100,
    status: 'Completed',
  },
];


export default function RTOPlacementsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Placements</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all student placements.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Placement
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center">
            <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <div className="ml-auto flex items-center gap-2">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                    </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuItem>Provider</DropdownMenuItem>
                    <DropdownMenuItem>Status</DropdownMenuItem>
                    <DropdownMenuItem>Risk Level</DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
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
                    <CardTitle>All Placements</CardTitle>
                    <CardDescription>A comprehensive list of all placements.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Provider</TableHead>
                        <TableHead>Supervisor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {placements.map((p) => (
                        <TableRow key={p.student}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={p.avatar} />
                                <AvatarFallback>{p.student.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{p.student}</span>
                            </div>
                          </TableCell>
                          <TableCell>{p.provider}</TableCell>
                          <TableCell>{p.supervisor}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                p.status === 'Completed' ? 'default' :
                                p.status === 'At Risk' ? 'destructive' : 'secondary'
                              }
                               className={
                                p.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                p.status === 'Needs Attention' ? 'bg-yellow-100 text-yellow-800' : ''
                              }
                            >
                              {p.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={p.progress} className="h-2 w-24" />
                                <span className="text-xs text-muted-foreground">{p.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Approve Timesheet</DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
