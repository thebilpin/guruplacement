// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI career advisor for students.
 *
 * - getCareerAdvice - A function that provides personalized career guidance, suggests relevant skills, and offers advice.
 * - CareerAdviceInput - The input type for the getCareerAdvice function.
 * - CareerAdviceOutput - The return type for the getCareerAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CareerAdviceInputSchema = z.object({
  studentProfile: z
    .string()
    .describe('A detailed profile of the student, including their skills, interests, and experience.'),
  careerGoals: z.string().describe('The student’s career goals and aspirations.'),
});
export type CareerAdviceInput = z.infer<typeof CareerAdviceInputSchema>;

const CareerAdviceOutputSchema = z.object({
  personalizedGuidance: z
    .string()
    .describe('Personalized guidance and advice tailored to the student’s profile and goals.'),
  skillSuggestions: z
    .string()
    .describe('A list of relevant skills the student should acquire to succeed in their chosen career path.'),
  successAdvice: z
    .string()
    .describe('Actionable advice on how the student can succeed in their career, including networking, mentorship, and continued learning.'),
});
export type CareerAdviceOutput = z.infer<typeof CareerAdviceOutputSchema>;

export async function getCareerAdvice(input: CareerAdviceInput): Promise<CareerAdviceOutput> {
  return careerAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'careerAdvicePrompt',
  input: {schema: CareerAdviceInputSchema},
  output: {schema: CareerAdviceOutputSchema},
  prompt: `You are an AI career advisor, providing personalized guidance to students.

  Based on the student's profile and career goals, provide personalized guidance, suggest relevant skills to acquire, and offer actionable advice on how to succeed.

  Student Profile: {{{studentProfile}}}
  Career Goals: {{{careerGoals}}}
  \n  Format your output in a structured way.
  `, // Changed from description to profile
});

const careerAdviceFlow = ai.defineFlow(
  {
    name: 'careerAdviceFlow',
    inputSchema: CareerAdviceInputSchema,
    outputSchema: CareerAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
