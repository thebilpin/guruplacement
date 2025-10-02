
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
import { Bot, ChevronDown, ClipboardCheck } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const evaluationCriteria = [
    { id: 1, skill: 'Professionalism', score: 'Exceeds Expectations' },
    { id: 2, skill: 'Communication', score: 'Meets Expectations' },
    { id: 3, skill: 'Technical Skills', score: 'Meets Expectations' },
    { id: 4, skill: 'Teamwork', score: 'Needs Improvement' },
    { id: 5, skill: 'Problem Solving', score: 'Meets Expectations' },
];

export default function SupervisorEvaluationsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Complete and review student performance evaluations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Mid-Placement Evaluation: Sarah Johnson</CardTitle>
                    <CardDescription>Score the student based on the rubric below.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Skill / Competency</TableHead>
                            <TableHead className="text-right w-[250px]">Rating</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {evaluationCriteria.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.skill}</TableCell>
                                <TableCell className="text-right">
                                    <Select defaultValue={item.score}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Exceeds Expectations">Exceeds Expectations</SelectItem>
                                            <SelectItem value="Meets Expectations">Meets Expectations</SelectItem>
                                            <SelectItem value="Needs Improvement">Needs Improvement</SelectItem>
                                            <SelectItem value="Unsatisfactory">Unsatisfactory</SelectItem>
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
            <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Feedback Notes</CardTitle>
                    <CardDescription>Provide specific comments and examples.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                   <Textarea placeholder="Strengths, areas for improvement, general comments..." rows={8} />
                   <Button className="w-full">
                     <ClipboardCheck className="mr-2 h-4 w-4" />
                     Save Draft
                   </Button>
                </CardContent>
            </Card>
            <Card className="card-hover bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Feedback Suggestions</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Based on the 'Needs Improvement' score for Teamwork, you could suggest: "Consider actively participating in team meetings and offering assistance to colleagues."</p>
                    <Button className="w-full">Generate Suggestions</Button>
                </CardContent>
            </Card>
             <Button size="lg" className="w-full">Submit Final Evaluation</Button>
        </div>
      </div>
    </div>
  );
}
