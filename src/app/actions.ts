"use server";

import { parseTransaction, ParsedTransactionOutput } from "@/ai/flows/smart-input-transaction-parsing";

interface ActionResult {
    success: boolean;
    data?: ParsedTransactionOutput;
    error?: string;
}

// Custom error types for better error handling
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class AIResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIResponseError';
  }
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
    
    // Provide more helpful error messages based on error type
    let errorMessage = "Failed to parse transaction with AI.";
    
    if (error instanceof Error) {
      // Check for specific error patterns from our validation
      if (error.message.includes('Invalid AI response')) {
        // Schema validation errors
        if (error.message.includes('amount')) {
          errorMessage = "Could not determine transaction amount. Please specify a valid amount.";
        } else if (error.message.includes('positive')) {
          errorMessage = "Transaction amount must be a positive number.";
        } else if (error.message.includes('category')) {
          errorMessage = "Could not determine transaction category. Please specify the category.";
        } else if (error.message.includes('merchant')) {
          errorMessage = "Could not determine merchant. Please specify where the transaction occurred.";
        } else {
          errorMessage = "Could not extract all required transaction details. Please provide amount, category, and merchant.";
        }
      } else if (error.message.includes('rephrasing')) {
        // Custom error from our flow
        errorMessage = error.message;
      } else {
        // Generic fallback with error details
        errorMessage = `Failed to parse: ${error.message}`;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}
