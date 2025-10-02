
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const activities = [
  {
    actor: 'Admin',
    action: 'approved a new provider, "HealthBridge".',
    time: '2m ago',
    avatar: 'https://picsum.photos/seed/admin/100/100',
  },
  {
    actor: 'Sarah Johnson',
    action: 'submitted her final evaluation.',
    time: '1h ago',
    avatar: 'https://picsum.photos/seed/student1/100/100',
  },
    {
    actor: 'John Smith',
    action: 'left feedback for a student.',
    time: '3h ago',
    avatar: 'https://picsum.photos/seed/supervisor/100/100',
  },
];

export function RecentActivity() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-primary" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity, index) => (
            <li key={index} className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.avatar} />
                <AvatarFallback>{activity.actor.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm">
                  <span className="font-semibold">{activity.actor}</span>{' '}
                  {activity.action}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
