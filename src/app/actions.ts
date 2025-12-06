"use server";

import { parseTransaction, ParsedTransactionOutput } from "@/ai/flows/smart-input-transaction-parsing";

interface ActionResult {
    success: boolean;
    data?: ParsedTransactionOutput;
    error?: string;
}

export async function handleTransactionInput(input: string): Promise<ActionResult> {
  if (!input) {
    return { success: false, error: "Input cannot be empty." };
  }

  try {
    const parsedData = await parseTransaction(input);
    return { success: true, data: parsedData };
  } catch (error) {
    console.error("AI parsing failed:", error);
    return { success: false, error: "Failed to parse transaction with AI." };
  }
}
