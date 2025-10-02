
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Bot,
  Sparkles,
  Clipboard,
} from 'lucide-react';
import { Label } from '@/components/ui/label';

export default function SupervisorAIHelperPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Bot className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline text-slate-800">
            Supervisor AI Helper
          </h1>
        </div>
        <p className="text-muted-foreground">
          Your assistant for generating feedback, detecting anomalies, and creating improvement plans.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Generator Column */}
        <div className="space-y-8">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>AI Feedback Generator</CardTitle>
              <CardDescription>
                Provide a few keywords or points, and the AI will draft constructive feedback.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback-points">Key Points</Label>
                <Textarea id="feedback-points" placeholder="e.g., 'Good communication, needs to be more proactive, improved technical skills'" />
              </div>
              <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" /> Generate Feedback
              </Button>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>AI Improvement Plan</CardTitle>
              <CardDescription>
                Describe a challenge area, and the AI will suggest an improvement plan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="improvement-area">Area for Improvement</Label>
                <Textarea id="improvement-area" placeholder="e.g., 'Student struggles with time management and prioritizing tasks.'" />
              </div>
              <Button className="w-full">
                <Sparkles className="mr-2 h-4 w-4" /> Create Plan
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Output Column */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
            <CardDescription>
              The AI-generated text will appear here. You can edit it before use.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <Textarea
                readOnly
                className="h-96 bg-slate-50"
                value="Generated content will be displayed here..."
             />
             <Button variant="outline" className="w-full">
                <Clipboard className="mr-2 h-4 w-4"/>
                Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
