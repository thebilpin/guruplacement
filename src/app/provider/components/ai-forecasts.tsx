
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getFillRatePrediction, type FillRatePredictionOutput } from '@/ai/ai-fill-rate-predictions';
import { Bot, Loader, Sparkles } from 'lucide-react';

type AiState = {
  data: FillRatePredictionOutput | null;
  error: string | null;
};

async function getPredictionAction(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const input = {
    jobTitle: 'Assistant Nurse',
    requiredSkills: ['First Aid', 'Patient Care', 'Communication'],
    location: 'Melbourne, VIC',
    companySize: 'Large',
    industry: 'Healthcare',
    averageTimeToFillSimilarRoles: 30,
  };
  
  try {
    const result = await getFillRatePrediction(input);
    return { data: result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to get prediction: ${errorMessage}` };
  }
}


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Get Fill Rate Prediction
        </>
      )}
    </Button>
  );
}

export function AiForecasts() {
    const [state, formAction] = useActionState(getPredictionAction, { data: null, error: null });

    return (
        <Card className="card-hover">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Bot className="h-6 w-6 text-primary" />
                    <CardTitle>AI Placement Forecast</CardTitle>
                </div>
                <CardDescription>Predict placement fill rates for new roles.</CardDescription>
            </CardHeader>
            <CardContent>
                 {state.error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{state.error}</AlertDescription>
                    </Alert>
                )}
                {state.data ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold">Predicted Fill Rate</h4>
                            <p className="text-primary font-bold text-lg">{state.data.predictedFillRate}%</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Predicted Time to Fill</h4>
                            <p className="text-muted-foreground">{state.data.predictedTimeToFill} days</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Key Factors</h4>
                            <ul className="list-disc pl-5 text-muted-foreground">
                                {state.data.factorsInfluencingFillRate.slice(0, 2).map(factor => <li key={factor}>{factor}</li>)}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <form action={formAction}>
                        <SubmitButton />
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
