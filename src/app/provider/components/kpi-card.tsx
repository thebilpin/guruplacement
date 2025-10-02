
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type KpiCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  changeType?: 'positive' | 'negative';
};

export function KpiCard({
  title,
  value,
  change,
  icon,
  changeType = 'positive',
}: KpiCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{value}</p>
        <div className="flex items-center gap-1 text-sm mt-1">
          {changeType === 'positive' ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span
            className={cn(
              'text-muted-foreground',
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
