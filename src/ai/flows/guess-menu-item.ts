'use server';
/**
 * @fileOverview An AI flow for guessing a single menu item.
 *
 * - guessMenuItem - A function that guesses a menu item based on a partial query.
 * - GuessMenuItemInput - The input type for the guessMenuItem function.
 * - GuessMenuItemOutput - The return type for the guessMenuItem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GuessMenuItemInputSchema = z.string();
export type GuessMenuItemInput = z.infer<typeof GuessMenuItemInputSchema>;

const GuessMenuItemOutputSchema = z.object({
  guess: z.string().describe('A single most likely full menu item name.'),
});
export type GuessMenuItemOutput = z.infer<typeof GuessMenuItemOutputSchema>;


export async function guessMenuItem(input: GuessMenuItemInput): Promise<GuessMenuItemOutput> {
  return guessMenuItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'guessMenuItemPrompt',
  input: { schema: GuessMenuItemInputSchema },
  output: { schema: GuessMenuItemOutputSchema },
  prompt: `You are an expert chef and restaurant menu designer. A user is typing a menu item into a bill-splitting app.
  
  Based on their partial input of "{{{prompt}}}", guess the single most likely full menu item name they are trying to type.
  
  For example, if the input is "chick", you should guess "Chicken Sandwich".
  If the input is "beer", guess "IPA".
  If the input is empty, guess "French Fries".
  
  Return only the single best guess.`,
});

const guessMenuItemFlow = ai.defineFlow(
  {
    name: 'guessMenuItemFlow',
    inputSchema: GuessMenuItemInputSchema,
    outputSchema: GuessMenuItemOutputSchema,
  },
  async (promptQuery) => {
    const { output } = await prompt(promptQuery);
    return output!;
  }
);
