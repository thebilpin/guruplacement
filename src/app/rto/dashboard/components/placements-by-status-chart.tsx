
'use client';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const data = [
  { status: 'On Track', count: 150, fill: '#22c55e' },
  { status: 'Needs Attention', count: 25, fill: '#f59e0b' },
  { status: 'At Risk', count: 5, fill: '#ef4444' },
];

export function PlacementsByStatusChart() {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Placements by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="status"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
