'use server';

/**
 * @fileOverview An AI agent for predicting placement fill rates.
 *
 * - getFillRatePrediction - A function that provides fill rate predictions for placements.
 * - FillRatePredictionInput - The input type for the getFillRatePrediction function.
 * - FillRatePredictionOutput - The return type for the getFillRatePrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FillRatePredictionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job for the placement.'),
  requiredSkills: z.array(z.string()).describe('A list of required skills for the placement.'),
  location: z.string().describe('The location of the placement.'),
  companySize: z.string().describe('The size of the company offering the placement (e.g., small, medium, large).'),
  industry: z.string().describe('The industry of the company offering the placement.'),
  averageTimeToFillSimilarRoles: z.number().describe('The average time (in days) it takes to fill similar roles in the current market.'),
});
export type FillRatePredictionInput = z.infer<typeof FillRatePredictionInputSchema>;

const FillRatePredictionOutputSchema = z.object({
  predictedFillRate: z.number().describe('The predicted fill rate (as a percentage) for the placement.'),
  predictedTimeToFill: z.number().describe('The predicted time (in days) it will take to fill the placement.'),
  factorsInfluencingFillRate: z.array(z.string()).describe('A list of factors influencing the fill rate prediction.'),
});
export type FillRatePredictionOutput = z.infer<typeof FillRatePredictionOutputSchema>;

export async function getFillRatePrediction(input: FillRatePredictionInput): Promise<FillRatePredictionOutput> {
  return fillRatePredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fillRatePredictionPrompt',
  input: {schema: FillRatePredictionInputSchema},
  output: {schema: FillRatePredictionOutputSchema},
  prompt: `You are an AI assistant specialized in predicting the fill rate and time to fill for job placements.

  Given the following information about a placement, predict the fill rate (as a percentage) and the time to fill (in days).
  Also, provide a list of factors that influence your prediction.

  Job Title: {{{jobTitle}}}
  Required Skills: {{#each requiredSkills}}{{{this}}}, {{/each}}
  Location: {{{location}}}
  Company Size: {{{companySize}}}
  Industry: {{{industry}}}
  Average Time to Fill Similar Roles: {{{averageTimeToFillSimilarRoles}}} days

  Please provide the prediction in the following JSON format:
  {
    "predictedFillRate": <fill_rate_percentage>,
    "predictedTimeToFill": <time_to_fill_in_days>,
    "factorsInfluencingFillRate": [<factor1>, <factor2>, ...]
  }
  `,
});

const fillRatePredictionFlow = ai.defineFlow(
  {
    name: 'fillRatePredictionFlow',
    inputSchema: FillRatePredictionInputSchema,
    outputSchema: FillRatePredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
