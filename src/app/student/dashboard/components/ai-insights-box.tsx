
'use client';

import { useActionState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCareerAdvice, type CareerAdviceOutput } from '@/ai/flows/ai-career-advisor';
import { Bot, Loader, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type AiState = {
  data: CareerAdviceOutput | null;
  error: string | null;
};

async function getAdviceAction(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const studentProfile = 'A 3rd-year computer science student specializing in web development, with projects in React and Node.js. Interested in full-stack roles and AI applications.';
  const careerGoals = 'To secure a full-stack developer role at a fast-growing tech startup and eventually specialize in machine learning engineering.';
  
  try {
    const result = await getCareerAdvice({ studentProfile, careerGoals });
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to get advice: ${errorMessage}` };
  }
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full animate-pulse-slow">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Career Advice
        </>
      )}
    </Button>
  );
}

export function AiInsightsBox() {
  const [state, formAction] = useActionState(getAdviceAction, { data: null, error: null });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-bold font-headline">AI Insights</CardTitle>
        </div>
        <CardDescription>Personalized career suggestions from your AI assistant.</CardDescription>
      </CardHeader>
      <CardContent>
        {state.error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
            </Alert>
        )}
        
        {state.data ? (
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-1">Personalized Guidance</h4>
              <p className="text-muted-foreground">{state.data.personalizedGuidance}</p>
            </div>
            <div>
              <h4 className="font-semibold mb-1">Skill Suggestions</h4>
              <p className="text-muted-foreground">{state.data.skillSuggestions}</p>
            </div>
             <div>
              <h4 className="font-semibold mb-1">Success Advice</h4>
              <p className="text-muted-foreground">{state.data.successAdvice}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-100 rounded-lg text-center">
            <h4 className="font-semibold text-slate-800">Suggested next skill: Agile Basics</h4>
            <p className="text-sm text-muted-foreground mt-1">Learn the fundamentals of Agile to stand out in job applications.</p>
            <form action={formAction} className="mt-4">
                <SubmitButton />
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
