
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building, Calendar, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';

export function CurrentPlacement() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">Current Placement</CardTitle>
        <CardDescription>Frontend Developer Intern</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="https://picsum.photos/seed/supervisor/100/100" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">John Smith</p>
            <p className="text-sm text-muted-foreground">Supervisor</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 mt-0.5 text-muted-foreground" />
          <div>
            <Link href="#" className="font-semibold hover:underline">
              Innovate Inc.
            </Link>
            <p className="text-sm text-muted-foreground">Provider</p>
          </div>
        </div>
         <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground"/>
                <span>Sydney, NSW (Remote)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground"/>
                <span>Mon, Wed, Fri</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground"/>
                <span>9:00 AM - 5:00 PM</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
