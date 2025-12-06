'use server';

/**
 * @fileOverview Parses natural language transaction input using Vertex AI (Gemini) to extract transaction details.
 *
 * - parseTransaction - A function that takes natural language input and returns a structured JSON object representing the parsed transaction details.
 * - ParsedTransactionInput - The input type for the parseTransaction function.
 * - ParsedTransactionOutput - The return type for the parseTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParsedTransactionInputSchema = z.object({
  input: z.string().describe('The natural language transaction input from the user.'),
});
export type ParsedTransactionInput = z.infer<typeof ParsedTransactionInputSchema>;

const ParsedTransactionOutputSchema = z.object({
  amount: z.number().describe('The total amount of the transaction in Indian Rupees.'),
  category: z.string().describe('The category of the transaction (e.g., Food, Travel, Bills).'),
  merchant: z.string().describe('The merchant associated with the transaction (e.g., Zomato, McDonalds).'),
  people: z.array(z.string()).describe('An array of people involved in the transaction.'),
  splitDetails: z
    .record(z.string(), z.number())
    .optional()
    .describe('Optional: Details of how the transaction was split among people, if applicable.'),
});
export type ParsedTransactionOutput = z.infer<typeof ParsedTransactionOutputSchema>;

export async function parseTransaction(input: string): Promise<ParsedTransactionOutput> {
  return parseTransactionFlow({input});
}

const prompt = ai.definePrompt({
  name: 'parseTransactionPrompt',
  input: {schema: ParsedTransactionInputSchema},
  output: {schema: ParsedTransactionOutputSchema},
  prompt: `You are a financial parser. Extract: Amount, Category, Merchant, and People involved. If multiple people are mentioned, calculate the split. Return JSON only.

Transaction: {{input}}`,
});

const parseTransactionFlow = ai.defineFlow(
  {
    name: 'parseTransactionFlow',
    inputSchema: ParsedTransactionInputSchema,
    outputSchema: ParsedTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
