
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, FileWarning, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const alerts = [
  {
    id: 1,
    title: 'Timesheet for Week 12 is overdue',
    type: 'Overdue',
    icon: <FileWarning className="h-5 w-5 text-red-500" />,
    action: 'Submit Timesheet',
    href: '#',
  },
  {
    id: 2,
    title: 'Mid-placement review due in 3 days',
    type: 'Upcoming',
    icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
    action: 'View Details',
    href: '#',
  },
  {
    id: 3,
    title: 'Supervisor left a new note on your evaluation',
    type: 'Note',
    icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
    action: 'Read Note',
    href: '#',
  },
];

export function AlertsPanel() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">Alerts & Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {alerts.map((alert, index) => (
            <li key={alert.id} className="flex items-center gap-4 animate-in fade-in-50" style={{animationDelay: `${index * 100}ms`}}>
              {alert.icon}
              <div className="flex-1">
                <p className="font-medium">{alert.title}</p>
                 <Badge variant={alert.type === 'Overdue' ? 'destructive' : alert.type === 'Upcoming' ? 'secondary' : 'default'} className={cn({'bg-yellow-100 text-yellow-800': alert.type === 'Upcoming', 'bg-blue-100 text-blue-800 border-transparent': alert.type === 'Note'}, 'border-transparent')}>
                  {alert.type}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={alert.href}>{alert.action}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
