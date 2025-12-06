"use server";

import { parseTransaction, ParsedTransactionOutput } from "@/ai/flows/smart-input-transaction-parsing";

interface ActionResult {
    success: boolean;
    data?: ParsedTransactionOutput;
    error?: string;
}

export async function handleTransactionInput(input: string): Promise<ActionResult> {
  if (!input || !input.trim()) {
    return { success: false, error: "Input cannot be empty." };
  }

  try {
    const parsedData = await parseTransaction(input.trim());
    return { success: true, data: parsedData };
  } catch (error) {
    console.error("AI parsing failed:", error);
    
    // Provide more helpful error messages
    let errorMessage = "Failed to parse transaction with AI.";
    
    if (error instanceof Error) {
      // If it's a validation error, provide more specific feedback
      if (error.message.includes('Expected')) {
        errorMessage = "Could not extract all required transaction details. Please provide amount, category, and merchant.";
      } else if (error.message.includes('positive')) {
        errorMessage = "Transaction amount must be a positive number.";
      } else if (error.message.includes('rephrasing')) {
        errorMessage = error.message;
      } else {
        errorMessage = `Failed to parse: ${error.message}`;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}
