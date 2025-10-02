
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const stages = [
  { name: 'Applied', completed: true, date: 'Jan 20, 2024' },
  { name: 'Active', completed: true, date: 'Feb 12, 2024' },
  { name: 'Mid-Review', completed: false, date: 'Apr 1, 2024' },
  { name: 'Completed', completed: false, date: 'May 17, 2024' },
];

export function PlacementJourney() {
  const activeIndex = stages.findIndex((stage) => !stage.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold font-headline">Placement Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative flex items-start justify-between">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          ></div>
          {stages.map((stage, index) => (
            <div key={stage.name} className="relative flex flex-col items-center z-10 w-1/4">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center border-2 bg-background transition-colors',
                  stage.completed ? 'border-primary' : 'border-border'
                )}
              >
                {stage.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-primary animate-in zoom-in" />
                ) : (
                  <div
                    className={cn(
                      'w-3 h-3 rounded-full transition-colors',
                      index === activeIndex ? 'bg-primary animate-pulse' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  'mt-2 text-sm font-medium text-center transition-colors',
                  index === activeIndex
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                {stage.name}
              </p>
               <p className="text-xs text-muted-foreground text-center">{stage.date}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
