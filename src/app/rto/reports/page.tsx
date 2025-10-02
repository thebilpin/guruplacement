
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Bot,
  FileDown,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Pie, PieChart, Cell, Tooltip } from 'recharts';
import { DateRangePicker } from '../components/date-range-picker';


const studentProgressData = [
    { name: 'On Track', value: 180, fill: '#22c55e' },
    { name: 'Needs Attention', value: 45, fill: '#f59e0b' },
    { name: 'At Risk', value: 20, fill: '#ef4444' },
];

const providerPerformanceData = [
  { name: 'HealthBridge', rating: 4.8 },
  { name: 'Innovate Inc.', rating: 4.5 },
  { name: 'CareWell', rating: 4.2 },
  { name: 'EduFuture', rating: 3.9 },
  { name: 'TechStart', rating: 3.5 },
];


export default function RTOReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
            <div>
                <h1 className="text-3xl font-bold font-headline text-slate-800">Reports</h1>
                <p className="text-muted-foreground mt-1">
                    Generate custom reports and analyze placement data.
                </p>
            </div>
            <div className="flex items-center space-x-2">
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export Current View
                </Button>
            </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Report Filters</CardTitle>
                <CardDescription>Customize the data included in your report.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <DateRangePicker />
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Cohort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="2024-s1">2024 Semester 1</SelectItem>
                        <SelectItem value="2023-s2">2023 Semester 2</SelectItem>
                    </SelectContent>
                </Select>
                 <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Provider" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="healthbridge">HealthBridge</SelectItem>
                        <SelectItem value="innovate">Innovate Inc.</SelectItem>
                    </SelectContent>
                </Select>
                <Button>Generate Report</Button>
            </CardContent>
        </Card>

        <Tabs defaultValue="student-progress">
            <TabsList>
            <TabsTrigger value="student-progress">Student Progress</TabsTrigger>
            <TabsTrigger value="provider-performance">Provider Performance</TabsTrigger>
            <TabsTrigger value="compliance-audits">Compliance Audits</TabsTrigger>
            </TabsList>
            <TabsContent value="student-progress">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4 card-hover">
                        <CardHeader>
                            <CardTitle>Student Status Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2 h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={studentProgressData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} label>
                                        {studentProgressData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))'}}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3 card-hover">
                       <CardHeader>
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                <CardTitle>AI Summary</CardTitle>
                            </div>
                            <CardDescription>
                                Key insights from the student progress data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <p>The majority of students (73%) are 'On Track'. However, a notable 18% require attention, and 8% are 'At Risk'. The 'At Risk' group warrants immediate intervention to ensure successful placement outcomes.</p>
                             <Button>Generate Detailed Insights</Button>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="provider-performance">
                <Card className="card-hover">
                    <CardHeader>
                        <CardTitle>Provider Ratings</CardTitle>
                        <CardDescription>Average student satisfaction ratings for top providers.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={providerPerformanceData}>
                                <defs>
                                    <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                                <YAxis domain={[3, 5]} stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{borderRadius: 'var(--radius)', border: '1px solid hsl(var(--border))'}}/>
                                <Bar dataKey="rating" fill="url(#ratingGradient)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

    </div>
  );
}
