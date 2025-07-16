'use server';
/**
 * @fileOverview An AI flow for suggesting menu items.
 *
 * - suggestMenuItems - A function that suggests menu items based on a partial query.
 * - SuggestMenuItemsInput - The input type for the suggestMenuItems function.
 * - SuggestMenuItemsOutput - The return type for the suggestMenuItems function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestMenuItemsInputSchema = z.string();
export type SuggestMenuItemsInput = z.infer<typeof SuggestMenuItemsInputSchema>;

const SuggestMenuItemsOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of 5-7 suggested menu item names.'),
});
export type SuggestMenuItemsOutput = z.infer<typeof SuggestMenuItemsOutputSchema>;


export async function suggestMenuItems(input: SuggestMenuItemsInput): Promise<SuggestMenuItemsOutput> {
  return suggestMenuItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMenuItemsPrompt',
  input: { schema: SuggestMenuItemsInputSchema },
  output: { schema: SuggestMenuItemsOutputSchema },
  prompt: `You are an expert chef and restaurant menu designer. A user is typing a menu item into a bill-splitting app.
  
  Based on their partial input of "{{{prompt}}}", suggest a short list (5-7 items) of common and relevant full menu item names they might be trying to type.
  
  For example, if the input is "chick", you might suggest "Chicken Sandwich", "Chicken Wings", "Chicken Caesar Salad", etc.
  If the input is "beer", suggest specific types like "IPA", "Lager", "Stout", "Pilsner".
  If the input is empty, suggest common appetizers like "French Fries", "Onion Rings", "Nachos", "Mozzarella Sticks".
  
  Return only the list of suggestions.`,
});

const suggestMenuItemsFlow = ai.defineFlow(
  {
    name: 'suggestMenuItemsFlow',
    inputSchema: SuggestMenuItemsInputSchema,
    outputSchema: SuggestMenuItemsOutputSchema,
  },
  async (promptQuery) => {
    const { output } = await prompt(promptQuery);
    return output!;
  }
);
