
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { FileDown, Mic, PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const logHistory = [
    { date: '2024-07-18', student: 'Sarah Johnson', entry: 'Observed Sarah assisting a patient with mobility exercises. Showed great empathy and clear communication. No issues to report.' },
    { date: '2024-07-17', student: 'Ben Carter', entry: 'Ben was late by 15 minutes. Addressed the issue with him and reminded him of the importance of punctuality. Otherwise, he completed his IT support tickets effectively.' },
    { date: '2024-07-17', student: 'Li Wei', entry: 'Li demonstrated excellent patience and understanding while working with a resident who was feeling distressed. All tasks completed successfully.' },
];

export default function SupervisorLogsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold font-headline text-slate-800">Daily Logs</h1>
          <p className="text-muted-foreground mt-1">
            Record student observations, progress, and any incidents.
          </p>
        </div>
        <Button>
            <FileDown className="mr-2 h-4 w-4" />
            Export Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
             <Card className="card-hover">
                <CardHeader>
                    <CardTitle>Log History</CardTitle>
                    <CardDescription>Your previous log entries.</CardDescription>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-6">
                    {logHistory.map((log, index) => (
                        <li key={index} className="animate-in fade-in-50" style={{animationDelay: `${index * 100}ms`}}>
                           <div className="flex items-center justify-between mb-2">
                             <p className="font-semibold">{log.student}</p>
                             <p className="text-sm text-muted-foreground">{log.date}</p>
                           </div>
                           <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-md border">{log.entry}</p>
                           {index < logHistory.length - 1 && <Separator className="mt-6"/>}
                        </li>
                    ))}
                   </ul>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8">
            <Card className="card-hover sticky top-24">
                <CardHeader>
                    <CardTitle>New Log Entry</CardTitle>
                    <CardDescription>Select a student and write your notes for today.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Student" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="sarah">Sarah Johnson</SelectItem>
                            <SelectItem value="ben">Ben Carter</SelectItem>
                            <SelectItem value="li">Li Wei</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea placeholder="Enter your observations here..." rows={10} />
                     <div className="flex items-center gap-2">
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4"/>
                            Submit Log
                        </Button>
                        <Button variant="outline" size="icon">
                            <Mic className="h-4 w-4"/>
                        </Button>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
