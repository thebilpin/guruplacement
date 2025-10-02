
'use client';
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
import {
    Activity,
    Bot,
    FileCheck,
    FileClock,
    FileX,
    MoreHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

const complianceItems = [
  { student: 'Sarah Johnson', document: 'Police Check', status: 'Verified', dueDate: 'N/A' },
  { student: 'Ben Carter', document: 'First Aid Certificate', status: 'Pending', dueDate: '2024-07-30' },
  { student: 'Li Wei', document: 'Police Check', status: 'Missing', dueDate: '2024-07-25' },
  { student: 'Aisha Khan', document: 'Working with Children Check', status: 'Verified', dueDate: 'N/A' },
  { student: 'Tom Wilson', document: 'COVID-19 Vaccination', status: 'Expired', dueDate: '2024-06-01' },
];

const auditTrail = [
  { user: 'Admin', action: 'Verified Police Check for Sarah Johnson.', timestamp: '2h ago' },
  { user: 'System', action: 'Flagged expired vaccination for Tom Wilson.', timestamp: '1 day ago' },
  { user: 'Admin', action: 'Sent reminder to Ben Carter for First Aid Cert.', timestamp: '2 days ago' },
];

export default function RTOCompliancePage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage compliance for all students and placements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Checklist</CardTitle>
                    <CardDescription>Overview of student document statuses.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Document</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {complianceItems.map((item) => (
                            <TableRow key={item.student + item.document}>
                            <TableCell className="font-medium">{item.student}</TableCell>
                            <TableCell>{item.document}</TableCell>
                            <TableCell>
                                <Badge
                                variant={
                                    item.status === 'Verified' ? 'default' :
                                    item.status === 'Pending' ? 'secondary' : 'destructive'
                                }
                                className={item.status === 'Verified' ? 'bg-green-100 text-green-800' : item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                >
                                {item.status}
                                </Badge>
                            </TableCell>
                            <TableCell>{item.dueDate}</TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem>Verify Document</DropdownMenuItem>
                                    <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">
                                    Flag Issue
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
        </div>

        <div className="space-y-8">
            <Card className="card-hover">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Compliance Advisor</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Li Wei's missing Police Check poses a high risk for their upcoming placement start date. Recommend immediate follow-up.</p>
                    <Button className="w-full">Get AI Recommendations</Button>
                </CardContent>
            </Card>

            <Card className="card-hover">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <CardTitle>Audit Trail</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {auditTrail.map((item, index) => (
                            <li key={index} className="flex items-start text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 mt-1">
                                    <Activity className="h-4 w-4 text-slate-500"/>
                                </div>
                                <div>
                                    <p><span className="font-semibold">{item.user}</span> {item.action}</p>
                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
