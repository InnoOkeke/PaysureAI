import { z } from "zod";

export const InvoiceLineItemSchema = z.object({
  description: z.string().default(""),
  quantity: z.coerce.number().default(1),
  unitPrice: z.coerce.number().default(0),
  total: z.coerce.number().default(0),
});

export const ExtractedInvoiceSchema = z.object({
  invoiceNumber: z.string().default("INV-2026-001"),
  recipientName: z.string().default("Unknown Recipient"),
  recipientAddress: z.string().default(""),
  amount: z.coerce.number().default(0),
  currency: z.string().default("NEAR"),
  dueDate: z.string().optional(),
  description: z.string().optional(),
  lineItems: z.array(InvoiceLineItemSchema).default([]),
  confidenceScore: z.coerce.number().min(0).max(100).default(85),
  suspiciousFlags: z.array(z.string()).default([]),
});

export type ExtractedInvoice = z.infer<typeof ExtractedInvoiceSchema>;
