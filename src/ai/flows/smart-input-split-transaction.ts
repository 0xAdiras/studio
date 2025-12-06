// src/ai/flows/smart-input-split-transaction.ts
'use server';

/**
 * @fileOverview Parses a transaction involving multiple people, splits the transaction amount, and identifies debtors. Used for the Smart Input Bar feature.
 *
 * - parseTransaction - Parses the transaction text and returns a structured JSON object.
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
  amount: z.number().describe('The total amount of the transaction.'),
  category: z.string().describe('The category of the transaction (e.g., Food, Travel).'),
  merchant: z.string().describe('The merchant involved in the transaction.'),
  people: z
    .array(z.object({name: z.string(), amount: z.number()}))
    .describe('An array of people involved in the transaction and their respective amounts.'),
});
export type ParsedTransactionOutput = z.infer<typeof ParsedTransactionOutputSchema>;

export async function parseTransaction(input: ParsedTransactionInput): Promise<ParsedTransactionOutput> {
  return parseTransactionFlow(input);
}

const parseTransactionPrompt = ai.definePrompt({
  name: 'parseTransactionPrompt',
  input: {schema: ParsedTransactionInputSchema},
  output: {schema: ParsedTransactionOutputSchema},
  prompt: `You are a financial parser. Extract: Amount, Category, Merchant, and People involved. If multiple people are mentioned, calculate the split. Return JSON only.

Transaction: {{{input}}}`,
});

const parseTransactionFlow = ai.defineFlow(
  {
    name: 'parseTransactionFlow',
    inputSchema: ParsedTransactionInputSchema,
    outputSchema: ParsedTransactionOutputSchema,
  },
  async input => {
    const {output} = await parseTransactionPrompt(input);
    return output!;
  }
);
