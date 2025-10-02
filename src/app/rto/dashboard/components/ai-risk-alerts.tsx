
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertTriangle, Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { aiRiskPredictions, AIRiskPredictionsOutput } from '@/ai/flows/ai-risk-predictions-flow';

const riskFactors = [
    { student: 'Li Wei', risk: 'High', factor: 'Poor initial feedback from supervisor.', placement: 'CareWell Aged Care' },
    { student: 'Ben Carter', risk: 'Medium', factor: 'Mismatched skill set for role requirements.', placement: 'TechStart Solutions' },
];

export function AiRiskAlerts() {
    return (
        <Card className="card-hover">
        <CardHeader>
            <div className="flex items-center gap-3">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle>AI-Powered Risk Alerts</CardTitle>
            </div>
            <CardDescription>
            Proactive warnings for at-risk placements.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
            {riskFactors.map((alert) => (
                <li key={alert.student} className="p-3 bg-slate-100 rounded-lg">
                <div className="flex items-center justify-between">
                    <p className="font-semibold">{alert.student}</p>
                    <Badge
                    variant={alert.risk === 'High' ? 'destructive' : 'secondary'}
                     className={alert.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' : ''}
                    >
                    {alert.risk} Risk
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    {alert.factor} at <span className="font-medium">{alert.placement}</span>
                </p>
                </li>
            ))}
            </ul>
        </CardContent>
        </Card>
    )
}
