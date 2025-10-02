
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
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Legend, Tooltip } from 'recharts';
import { Calendar } from '@/components/ui/calendar';
import { Bot, PlusCircle } from 'lucide-react';


const fundingPipelineData = [
  { stage: 'Applied', value: 50000 },
  { stage: 'In Review', value: 25000 },
  { stage: 'Approved', value: 75000 },
  { stage: 'Rejected', value: 10000 },
];

const grants = [
    { name: 'Skills for the Future Grant', status: 'Applied', amount: '$20,000', deadline: '2024-08-15' },
    { name: 'Community Care Initiative', status: 'Approved', amount: '$50,000', deadline: 'N/A' },
    { name: 'Tech Upskilling Fund', status: 'In Review', amount: '$25,000', deadline: '2024-08-01' },
    { name: 'Regional Placement Grant', status: 'Draft', amount: '$15,000', deadline: '2024-09-01' },
];

export default function RTOFundingPage() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Funding</h1>
          <p className="text-muted-foreground mt-1">
            Track grants, manage applications, and view your funding pipeline.
          </p>
        </div>
        <div className="flex items-center space-x-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Grant Application
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Funding Pipeline</CardTitle>
                    <CardDescription>Overview of grant application statuses and values.</CardDescription>
                </CardHeader>
                <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={fundingPipelineData} layout="vertical">
                            <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value) / 1000}k`}/>
                            <YAxis type="category" dataKey="stage" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={80}/>
                            <Tooltip formatter={(value) => `$${value}`} />
                            <Bar dataKey="value" fill="#0284c7" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Grant Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Grant Name</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Deadline</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {grants.map(grant => (
                                <TableRow key={grant.name}>
                                    <TableCell className="font-semibold">{grant.name}</TableCell>
                                    <TableCell>
                                        <Badge
                                         variant={
                                            grant.status === 'Approved' ? 'default' :
                                            grant.status === 'Draft' ? 'outline' : 'secondary'
                                        }
                                        className={
                                            grant.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                            grant.status === 'In Review' ? 'bg-yellow-100 text-yellow-800' : ''
                                        }
                                        >{grant.status}</Badge>
                                    </TableCell>
                                    <TableCell>{grant.amount}</TableCell>
                                    <TableCell>{grant.deadline}</TableCell>
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
                    <CardTitle>Deadlines Calendar</CardTitle>
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
            <Card className="card-hover bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <CardTitle>AI Grant Matching</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Based on your recent placements in aged care, you may be eligible for the "Senior Care Workforce Grant".</p>
                    <Button className="w-full">Find Matching Grants</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
