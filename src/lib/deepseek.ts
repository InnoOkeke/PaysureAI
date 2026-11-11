import OpenAI from "openai";

export const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "dummy_key",
  baseURL: process.env.DEEPSEEK_API_BASE_URL || "https://api.deepseek.com",
});

export const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

export interface InvoiceExtractedData {
  invoiceNumber: string;
  recipientName: string;
  recipientAddress: string;
  amount: number;
  currency: string;
  dueDate?: string;
  description?: string;
  lineItems?: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  confidenceScore: number;
  suspiciousFlags: string[];
}

