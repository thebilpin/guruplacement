
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const data = [
  { rating: '5 Stars', count: 125, fill: '#22c55e' },
  { rating: '4 Stars', count: 42, fill: '#a3e635' },
  { rating: '3 Stars', count: 8, fill: '#facc15' },
  { rating: '2 Stars', count: 2, fill: '#f59e0b' },
  { rating: '1 Star', count: 1, fill: '#ef4444' },
];

export function StudentSatisfactionChart() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Student Satisfaction</CardTitle>
        <CardDescription>Based on post-placement feedback.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="rating"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }}/>
            <Bar dataKey="count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
