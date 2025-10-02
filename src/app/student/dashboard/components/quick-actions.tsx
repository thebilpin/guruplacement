
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Upload, User, Calendar } from 'lucide-react';

const actions = [
  {
    icon: <Clock className="w-6 h-6 text-primary-foreground" />,
    label: 'Log Hours',
    variant: 'default' as const
  },
  {
    icon: <Upload className="w-6 h-6 text-primary" />,
    label: 'Upload Docs',
    variant: 'secondary' as const
  },
  {
    icon: <User className="w-6 h-6 text-primary" />,
    label: 'Contact Supervisor',
    variant: 'secondary' as const
  },
  {
    icon: <Calendar className="w-6 h-6 text-primary" />,
    label: 'Book Meeting',
    variant: 'secondary' as const
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Button key={action.label} variant={action.variant} className="h-24 flex-col gap-2 card-hover">
            {action.icon}
            <span className="font-semibold">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
