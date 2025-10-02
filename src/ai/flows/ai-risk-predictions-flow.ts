'use server';
/**
 * @fileOverview This file defines a Genkit flow for AI risk predictions, enabling providers to identify potentially problematic placements and proactively manage them.
 *
 * - aiRiskPredictions - A function that initiates the AI risk prediction flow.
 * - AIRiskPredictionsInput - The input type for the aiRiskPredictions function.
 * - AIRiskPredictionsOutput - The output type for the aiRiskPredictions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIRiskPredictionsInputSchema = z.object({
  studentProfile: z.string().describe('Comprehensive profile of the student, including skills, experience, and academic record.'),
  placementDetails: z.string().describe('Detailed information about the placement, including job description, company profile, and supervisor details.'),
  historicalData: z.string().describe('Historical placement data, including success rates, challenges, and feedback from previous students.'),
});
export type AIRiskPredictionsInput = z.infer<typeof AIRiskPredictionsInputSchema>;

const AIRiskPredictionsOutputSchema = z.object({
  riskScore: z.number().describe('A numerical score indicating the overall risk level of the placement (0-100, higher is riskier).'),
  riskFactors: z.array(z.string()).describe('A list of factors contributing to the risk, such as skill mismatch, lack of support, or company instability.'),
  recommendations: z.array(z.string()).describe('Specific recommendations for mitigating the identified risks, such as additional training, mentorship, or closer supervision.'),
  confidenceLevel: z.string().describe('The confidence level of the risk prediction (High, Medium, Low).'),
});
export type AIRiskPredictionsOutput = z.infer<typeof AIRiskPredictionsOutputSchema>;

export async function aiRiskPredictions(input: AIRiskPredictionsInput): Promise<AIRiskPredictionsOutput> {
  return aiRiskPredictionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiRiskPredictionsPrompt',
  input: {schema: AIRiskPredictionsInputSchema},
  output: {schema: AIRiskPredictionsOutputSchema},
  prompt: `You are an AI assistant designed to predict the risk of student placements based on student profiles, placement details, and historical data.

Analyze the following information to determine the risk score, identify risk factors, and provide recommendations to mitigate these risks.

Student Profile: {{{studentProfile}}}
Placement Details: {{{placementDetails}}}
Historical Data: {{{historicalData}}}

Respond with a JSON object containing the riskScore, riskFactors, recommendations, and confidenceLevel.
`,
});

const aiRiskPredictionsFlow = ai.defineFlow(
  {
    name: 'aiRiskPredictionsFlow',
    inputSchema: AIRiskPredictionsInputSchema,
    outputSchema: AIRiskPredictionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
