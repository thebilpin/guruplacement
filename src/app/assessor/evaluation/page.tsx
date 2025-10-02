
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
import { Bot, ChevronDown, ClipboardCheck, Signature } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const evaluationCriteria = [
    { id: 1, competency: 'UOC-001: Follow safe work practices', score: null },
    { id: 2, competency: 'UOC-002: Communicate effectively with clients', score: 'C' },
    { id: 3, competency: 'UOC-003: Provide personal care', score: 'NYC' },
    { id: 4, competency: 'UOC-004: Support client independence', score: 'C' },
];

export default function CompetencyEvaluationPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Competency Evaluation</h1>
          <p className="text-muted-foreground mt-1">
            Assess student competency using the official rubric.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Evaluation Form: Sarah Johnson</CardTitle>
                    <CardDescription>Assess each unit of competency (UOC) below.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Unit of Competency</TableHead>
                            <TableHead className="text-right w-[200px]">Result</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {evaluationCriteria.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.competency}</TableCell>
                                <TableCell className="text-right">
                                    <Select defaultValue={item.score || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select result..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="C">C (Competent)</SelectItem>
                                            <SelectItem value="NYC">NYC (Not Yet Competent)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Assessment Notes</CardTitle>
                    <CardDescription>Provide detailed justification for your assessment decisions, especially for NYC results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Textarea placeholder="e.g., For UOC-003, student required significant prompting..." rows={6} />
                </CardContent>
            </Card>
            <Card className="bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Feedback Writer</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">The AI can help draft clear, constructive feedback for 'Not Yet Competent' results.</p>
                    <Button className="w-full">Generate NYC Feedback</Button>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Finalization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Your digital signature confirms this assessment was conducted fairly and accurately.</p>
                    <Button variant="outline" className="w-full">
                        <Signature className="mr-2 h-4 w-4"/>
                        Apply Digital Signature
                    </Button>
                     <Button size="lg" className="w-full">Submit Assessment</Button>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
