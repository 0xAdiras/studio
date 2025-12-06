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
  amount: z.number().positive().describe('The total amount of the transaction in Indian Rupees. Must be a positive number.'),
  category: z.string().min(1).describe('The category of the transaction (e.g., Food, Travel, Bills, Entertainment, Shopping, Other).'),
  merchant: z.string().min(1).describe('The merchant associated with the transaction (e.g., Zomato, McDonalds, Uber). Use "Unknown" if not specified.'),
  people: z.array(z.string()).default([]).describe('An array of people involved in the transaction. Include "me" if the user is involved. Use empty array if no people are mentioned.'),
  splitDetails: z
    .record(z.string(), z.number())
    .optional()
    .describe('Optional: Details of how the transaction was split among people, if applicable. Keys are person names, values are amounts owed.'),
});
export type ParsedTransactionOutput = z.infer<typeof ParsedTransactionOutputSchema>;

export async function parseTransaction(input: string): Promise<ParsedTransactionOutput> {
  return parseTransactionFlow({input});
}

const prompt = ai.definePrompt({
  name: 'parseTransactionPrompt',
  input: {schema: ParsedTransactionInputSchema},
  output: {schema: ParsedTransactionOutputSchema},
  prompt: `You are a financial transaction parser. Parse the transaction and extract the following details:

1. **amount**: The total transaction amount in Indian Rupees (positive number only)
2. **category**: The transaction category (Food, Travel, Bills, Entertainment, Shopping, or Other)
3. **merchant**: The merchant name (use "Unknown" if not specified)
4. **people**: Array of people involved (include "me" for the user, use empty array if none mentioned)
5. **splitDetails**: If the transaction is split among multiple people, provide an object mapping person names to their amounts. Otherwise, omit this field.

Important:
- Always provide all required fields (amount, category, merchant, people)
- Amount must be a positive number
- Category and merchant must be non-empty strings
- If you cannot determine a value, use sensible defaults (e.g., category: "Other", merchant: "Unknown")

Transaction input: {{input}}`,
});

const parseTransactionFlow = ai.defineFlow(
  {
    name: 'parseTransactionFlow',
    inputSchema: ParsedTransactionInputSchema,
    outputSchema: ParsedTransactionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      throw new Error('AI did not return a valid response. Please try rephrasing your input.');
    }
    
    // Validate the output matches our schema
    const validated = ParsedTransactionOutputSchema.parse(output);
    return validated;
  }
);
