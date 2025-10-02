
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const initialNotifications = [
  {
    id: 1,
    actor: 'System',
    avatar: null,
    message: 'New company "Tech Solutions" has been added.',
    time: '5m ago',
    type: 'System',
    read: false,
  },
  {
    id: 2,
    actor: 'John Smith',
    avatar: 'https://picsum.photos/seed/supervisor/100/100',
    message: 'approved your timesheet for Week 11.',
    time: '1h ago',
    type: 'Supervisor',
    read: false,
  },
  {
    id: 3,
    actor: 'System',
    avatar: null,
    message: 'Your profile is 80% complete. Update it now!',
    time: '3h ago',
    type: 'System',
    read: true,
  },
    {
    id: 4,
    actor: 'Jane Doe',
    avatar: 'https://picsum.photos/seed/mentor/100/100',
    message: 'You have a new message from your mentor.',
    time: '1 day ago',
    type: 'Mentor',
    read: false,
  },
  {
    id: 5,
    actor: 'System',
    avatar: null,
    message: 'New learning module "Workplace Safety" is available.',
    time: '2 days ago',
    type: 'System',
    read: true,
  },
];

export function NotificationsFeed() {
    const [notifications, setNotifications] = useState(initialNotifications);

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle className="text-xl font-bold font-headline">Notifications</CardTitle>
            <CardDescription>Your recent activity and updates.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead}>Mark all as read</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-4">
            {notifications.map((notification, i) => (
              <li key={notification.id} className={cn("flex items-start gap-3 transition-opacity", notification.read && 'opacity-60')}>
                <Avatar className="h-8 w-8">
                  {notification.avatar && <AvatarImage src={notification.avatar} />}
                  <AvatarFallback>{notification.actor ? notification.actor.charAt(0) : 'S'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm">
                    <span className="font-semibold">{notification.actor}</span> {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
