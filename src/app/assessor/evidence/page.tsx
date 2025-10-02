
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
import {
  Bot,
  Check,
  Download,
  FileVideo,
  FileText,
  ImageIcon,
  X,
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const evidenceItems = [
  {
    id: 'EV-001',
    name: 'Patient Interaction Video',
    type: 'Video',
    icon: <FileVideo />,
    submittedBy: 'Sarah Johnson',
    status: 'Pending Review',
  },
  {
    id: 'EV-002',
    name: 'Signed Timesheet - Week 12',
    type: 'Document',
    icon: <FileText />,
    submittedBy: 'Sarah Johnson',
    status: 'Approved',
  },
  {
    id: 'EV-003',
    name: 'Workstation Setup Photo',
    type: 'Image',
    icon: <ImageIcon />,
    submittedBy: 'Ben Carter',
    status: 'Requires Resubmission',
  },
];

const checklistItems = [
    { id: 'check-1', label: 'Student name and date are clearly visible.' },
    { id: 'check-2', label: 'Evidence relates to the correct unit of competency.' },
    { id: 'check-3', label: 'Third-party (supervisor) signature is present and valid.' },
    { id: 'check-4', label: 'Meets requirements for authenticity and sufficiency.' },
]

export default function EvidenceReviewPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Evidence Review
          </h1>
          <p className="text-muted-foreground mt-1">
            View, validate, and approve student-submitted evidence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Evidence List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Submitted Evidence Queue</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidenceItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-primary">{item.icon}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.submittedBy}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === 'Approved'
                              ? 'default'
                              : item.status === 'Requires Resubmission'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className={
                            item.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : item.status === 'Pending Review'
                              ? 'bg-yellow-100 text-yellow-800'
                              : ''
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        {/* Review Panel */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Review & Validate</CardTitle>
                    <CardDescription>Patient Interaction Video - Sarah Johnson</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="aspect-video bg-slate-200 rounded-lg flex items-center justify-center">
                        <FileVideo className="h-12 w-12 text-slate-400"/>
                    </div>
                     <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" /> Download Evidence
                     </Button>
                    <div className="space-y-4 pt-4 border-t">
                        <h4 className="font-semibold">Validation Checklist</h4>
                        {checklistItems.map(item => (
                            <div key={item.id} className="flex items-center space-x-2">
                                <Checkbox id={item.id} />
                                <Label htmlFor={item.id} className="text-sm">{item.label}</Label>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 pt-4 border-t">
                        <Button className="w-full">
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button variant="destructive" className="w-full">
                            <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                    </div>
                </CardContent>
            </Card>
             <Card className="bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Validation</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                   <p className="text-sm text-muted-foreground">AI has detected that the video is 5 minutes long and the audio is clear. No visual anomalies found.</p>
                   <Button className="w-full">Run Full AI Analysis</Button>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
