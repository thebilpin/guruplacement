'use server';

/**
 * @fileOverview Provides personalized placement recommendations for students based on their profile and skills.
 *
 * - getPlacementRecommendations - A function that returns placement recommendations.
 * - PlacementRecommendationInput - The input type for the getPlacementRecommendations function.
 * - PlacementRecommendationOutput - The return type for the getPlacementRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlacementRecommendationInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('A detailed description of the student profile, including skills, experience, and interests.'),
  placementRequirements: z
    .string()
    .optional()
    .describe('Optional details about specific placement requirements or preferences.'),
});
export type PlacementRecommendationInput = z.infer<typeof PlacementRecommendationInputSchema>;

const PlacementRecommendationOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      title: z.string().describe('The title of the placement opportunity.'),
      matchPercentage: z.number().describe('The percentage match of the placement to the student.'),
      requirements: z.string().describe('The key requirements for the placement.'),
      benefits: z.string().describe('The benefits offered by the placement.'),
      deadline: z.string().describe('The application deadline for the placement.'),
      whyThisMatch: z.string().describe('Explanation of why the placement is a good match for student.'),
    })
  ).describe('A list of placement recommendations.'),
});
export type PlacementRecommendationOutput = z.infer<typeof PlacementRecommendationOutputSchema>;

export async function getPlacementRecommendations(input: PlacementRecommendationInput): Promise<PlacementRecommendationOutput> {
  return placementRecommendationFlow(input);
}

const placementRecommendationPrompt = ai.definePrompt({
  name: 'placementRecommendationPrompt',
  input: {schema: PlacementRecommendationInputSchema},
  output: {schema: PlacementRecommendationOutputSchema},
  prompt: `You are an AI placement assistant. Your job is to provide personalized placement recommendations to students, so that they can easily find opportunities that match their interests and increase their chances of a successful placement.

  Analyze the student's profile and skills to provide the best placement recommendations.

  Student Profile: {{{studentProfile}}}
  Placement Requirements: {{{placementRequirements}}}

  Provide a list of placement opportunities, each with:
  - title
  - matchPercentage (0-100)
  - requirements
  - benefits
  - deadline
  - whyThisMatch: Explanation of why the placement is a good match for student
  `,
});

const placementRecommendationFlow = ai.defineFlow(
  {
    name: 'placementRecommendationFlow',
    inputSchema: PlacementRecommendationInputSchema,
    outputSchema: PlacementRecommendationOutputSchema,
  },
  async input => {
    const {output} = await placementRecommendationPrompt(input);
    return output!;
  }
);
