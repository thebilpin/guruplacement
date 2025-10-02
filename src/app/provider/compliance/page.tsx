
'use client';
import * as React from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { FileCheck, Upload, Activity, AlertTriangle } from 'lucide-react';

const complianceDocs = [
    { name: 'Public Liability Insurance', status: 'Verified', expiry: '2025-06-30' },
    { name: 'WorkCover Insurance', status: 'Verified', expiry: '2025-07-15' },
    { name: 'COVID-19 Safety Plan', status: 'Expiring Soon', expiry: '2024-08-01' },
    { name: 'Affiliation Agreement', status: 'Missing', expiry: 'N/A' },
];

const auditLog = [
    { user: 'RTO Admin', action: 'Verified Public Liability Insurance', timestamp: '2d ago' },
    { user: 'You', action: 'Uploaded new COVID-19 Safety Plan', timestamp: '1w ago' },
];

export default function ProviderCompliancePage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Compliance</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's compliance documents and audit trail.
          </p>
        </div>
        <Button>
            <Upload className="mr-2 h-4 w-4"/>
            Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Documents</CardTitle>
                    <CardDescription>Overview of your organization's key documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Document Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Expiry Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {complianceDocs.map(doc => (
                                <TableRow key={doc.name}>
                                    <TableCell className="font-semibold">{doc.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                doc.status === 'Verified' ? 'default' :
                                                doc.status === 'Missing' ? 'destructive' : 'secondary'
                                            }
                                            className={
                                                doc.status === 'Verified' ? 'bg-green-100 text-green-800' :
                                                doc.status === 'Expiring Soon' ? 'bg-yellow-100 text-yellow-800' : ''
                                            }
                                        >{doc.status}</Badge>
                                    </TableCell>
                                    <TableCell>{doc.expiry}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                    <CardDescription>Recent activity related to compliance documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4">
                        {auditLog.map((log, index) => (
                             <li key={index} className="flex items-start text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 mt-1">
                                    <Activity className="h-4 w-4 text-slate-500"/>
                                </div>
                                <div>
                                    <p><span className="font-semibold">{log.user}</span> {log.action}</p>
                                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Compliance Calendar</CardTitle>
                    <CardDescription>Key expiry dates at a glance.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                     <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
