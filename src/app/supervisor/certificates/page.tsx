
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Clock, FileCheck, Send, X, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const certificateSubmissions = [
  { student: 'Ben Carter', document: 'First Aid Certificate', submitted: '2d ago', status: 'Pending Approval', expiry: '2026-07-15' },
  { student: 'Aisha Khan', document: 'National Police Check', submitted: '1w ago', status: 'Approved', expiry: '2025-07-01' },
  { student: 'Sarah Johnson', document: 'Influenza Vaccination Record', submitted: '2w ago', status: 'Approved', expiry: '2025-05-01' },
  { student: 'Li Wei', document: 'Manual Handling Certificate', submitted: '3w ago', status: 'Rejected', expiry: 'N/A' },
];

export default function SupervisorCertificatesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            Approve student-submitted certificates and track expiry dates.
          </p>
        </div>
      </div>

        <Card className="card-hover">
            <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
                <CardDescription>Review and action new documents from your students.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {certificateSubmissions.map((cert) => (
                    <TableRow key={cert.student + cert.document}>
                        <TableCell className="font-medium">{cert.student}</TableCell>
                        <TableCell>{cert.document}</TableCell>
                        <TableCell>
                        <Badge
                            variant={
                                cert.status === 'Approved' ? 'default' :
                                cert.status === 'Rejected' ? 'destructive' : 'secondary'
                            }
                            className={
                                cert.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                cert.status === 'Pending Approval' ? 'bg-yellow-100 text-yellow-800' : ''
                            }
                        >
                            {cert.status}
                        </Badge>
                        </TableCell>
                        <TableCell>{cert.expiry}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <FileCheck className="mr-2 h-4 w-4" /> Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <X className="mr-2 h-4 w-4 text-red-500" /> Reject
                                </DropdownMenuItem>
                                 <DropdownMenuItem>
                                    <Send className="mr-2 h-4 w-4" /> Notify Student
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
  );
}
