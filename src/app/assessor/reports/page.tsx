
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  FileDown,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, Legend, PolarRadiusAxis } from 'recharts';
import { DateRangePicker } from '@/app/rto/components/date-range-picker';


const competencyData = [
  { name: 'UOC-001', C: 25, NYC: 2 },
  { name: 'UOC-002', C: 27, NYC: 0 },
  { name: 'UOC-003', C: 22, NYC: 5 },
  { name: 'UOC-004', C: 26, NYC: 1 },
];

const skillData = [
  { subject: 'Technical', A: 90, fullMark: 100 },
  { subject: 'Communication', A: 85, fullMark: 100 },
  { subject: 'Teamwork', A: 95, fullMark: 100 },
  { subject: 'Problem Solving', A: 80, fullMark: 100 },
  { subject: 'Professionalism', A: 98, fullMark: 100 },
];

export default function AssessorReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">Assessment Reports</h1>
                <p className="text-muted-foreground mt-1">
                    Analyze trends and generate reports on student competency.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Full Report
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <DateRangePicker />
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="s-johnson">Sarah Johnson</SelectItem>
                        <SelectItem value="b-carter">Ben Carter</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select UOC" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="uoc-1">UOC-001</SelectItem>
                        <SelectItem value="uoc-2">UOC-002</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Generate Report</Button>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Competency Analysis (C vs NYC)</CardTitle>
                    <CardDescription>Breakdown of assessment outcomes per Unit of Competency.</CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={competencyData}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="C" stackId="a" fill="#22c55e" name="Competent"/>
                            <Bar dataKey="NYC" stackId="a" fill="#ef4444" name="Not Yet Competent" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Summary & Insights</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <p>UOC-003 shows a higher rate of 'Not Yet Competent' results (18.5%). This suggests students may require additional support or resources for providing personal care. A review of the training materials for this unit is recommended.</p>
                     <Button>Generate Deeper Insights</Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
