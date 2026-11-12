import { z } from "zod";

export const PayCommandSchema = z.object({
  action: z.literal("pay"),
  amount: z.coerce.number().positive(),
  currency: z.string().default("USD"),
  recipientQuery: z.string().min(1),
  targetChain: z.string().default("NEAR Protocol"),
  memo: z.string().optional(),
  invoiceId: z.string().optional(),
});

export const VerifyPayeeCommandSchema = z.object({
  action: z.literal("verify_payee"),
  accountId: z.string().min(1),
  expectedName: z.string().optional(),
});

export const InvoiceStatusCommandSchema = z.object({
  action: z.literal("invoice_status"),
  status: z.string().default("ALL"),
});

export const TreasuryCheckCommandSchema = z.object({
  action: z.literal("treasury_check"),
  amountUSD: z.coerce.number().nonnegative().optional(),
  category: z.string().optional(),
});

export const NavigateCommandSchema = z.object({
  action: z.literal("navigate"),
  page: z.string().min(1),
});

export const ClarifyCommandSchema = z.object({
  action: z.literal("clarify"),
  question: z.string().min(1),
  originalInput: z.string().optional(),
});

export const ChatCommandSchema = z.object({
  action: z.literal("chat"),
  reply: z.string().min(1),
  suggestedLink: z.string().optional(),
});

export const UnknownCommandSchema = z.object({
  action: z.literal("unknown"),
  reason: z.string().default("Unrecognized command"),
});

export const ParsedCommandSchema = z.discriminatedUnion("action", [
  PayCommandSchema,
  VerifyPayeeCommandSchema,
  InvoiceStatusCommandSchema,
  TreasuryCheckCommandSchema,
  NavigateCommandSchema,
  ClarifyCommandSchema,
  ChatCommandSchema,
  UnknownCommandSchema,
]);

export type ParsedCommand = z.infer<typeof ParsedCommandSchema>;

export const AssistantReplySchema = z.object({
  reply: z.string().min(1),
});

export type AssistantReply = z.infer<typeof AssistantReplySchema>;
