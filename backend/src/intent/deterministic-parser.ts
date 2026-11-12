import { ParsedCommand } from "../ai/schemas";

const CHAIN_NAMES: Record<string, string> = {
  near: "NEAR Protocol",
  base: "Base",
  ethereum: "Ethereum",
  eth: "Ethereum",
  arbitrum: "Arbitrum",
  solana: "Solana",
};

function normalizeChain(raw: string | undefined): string {
  if (!raw) return "NEAR Protocol";
  const lower = raw.toLowerCase();
  if (lower.includes("near")) return "NEAR Protocol";
  if (lower.includes("base")) return "Base";
  if (lower.includes("eth")) return "Ethereum";
  if (lower.includes("arb")) return "Arbitrum";
  if (lower.includes("sol")) return "Solana";
  if (lower.includes("bitcoin") || lower.includes("btc")) return "Bitcoin";
  if (lower.includes("xrp") || lower.includes("ripple")) return "Ripple (XRP)";
  if (lower.includes("cosmos") || lower.includes("atom")) return "Cosmos";
  if (lower.includes("stacks") || lower.includes("stx")) return "Stacks (Bitcoin L2)";
  if (lower.includes("stellar") || lower.includes("xlm")) return "Stellar";
  return CHAIN_NAMES[lower] ?? raw;
}

function normalizeCurrency(
  explicit: string | undefined,
  original: string
): "USD" | "NEAR" | "USDC" {
  const value = (explicit ?? "").toLowerCase();
  if (value === "near") return "NEAR";
  if (value === "usdc") return "USDC";
  if (value === "usd" || value === "$") return "USD";
  if (original.includes("$") || /\busd\b/i.test(original)) return "USD";
  if (/\bnear\b/i.test(original)) return "NEAR";
  if (/\busdc\b/i.test(original)) return "USDC";
  return "USD";
}

function cleanRecipient(value: string): string {
  return value
    .replace(/^(?:to|for)\s+/i, "")
    .replace(/[.,!?;:]+$/g, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .trim();
}

function splitTrailingChain(value: string): { recipient: string; chain?: string } {
  const match = value.match(/\s+on\s+(.+?)\s*$/i);
  if (!match) return { recipient: cleanRecipient(value) };
  return {
    recipient: cleanRecipient(value.slice(0, match.index)),
    chain: match[1],
  };
}

export function parseDeterministic(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  const verifyMatch = trimmed.match(
    /^(?:verify|check|confirm)\s+(?:payee\s+)?([a-z0-9._-]+)(?:\s+as\s+(.+))?$/i
  );
  if (verifyMatch) {
    return {
      action: "verify_payee",
      accountId: verifyMatch[1]!.toLowerCase(),
      expectedName: verifyMatch[2]?.trim(),
    };
  }

  const isVerifiedMatch = trimmed.match(
    /^(?:is\s+)?([a-z0-9._-]+\.(?:near|testnet|mainnet))\s+(?:verified|valid|legit|safe)\??$/i
  );
  if (isVerifiedMatch) {
    return {
      action: "verify_payee",
      accountId: isVerifiedMatch[1]!.toLowerCase(),
    };
  }

  const amountFirst = trimmed.match(
    /^(?:pay|send|transfer)\s+(?:\$|usd\s*|near\s*|usdc\s*)?([\d,]+(?:\.\d+)?)\s*(usd|usdc|near|\$)?\s+(?:to\s+)?(.+)$/i
  );
  if (amountFirst) {
    const amount = Number(amountFirst[1]!.replace(/,/g, ""));
    const { recipient, chain } = splitTrailingChain(amountFirst[3]!);
    if (Number.isFinite(amount) && amount > 0 && recipient) {
      return {
        action: "pay",
        amount,
        currency: normalizeCurrency(amountFirst[2], trimmed),
        recipientQuery: recipient,
        targetChain: normalizeChain(chain),
        memo: `Conversational Settlement: ${trimmed}`,
      };
    }
  }

  const payeeFirst = trimmed.match(
    /^(?:pay|send|transfer)\s+(.+?)\s+([\d,]+(?:\.\d+)?)\s*(usd|usdc|near|\$)?(?:\s+on\s+.+)?\s*$/i
  );
  if (payeeFirst) {
    const amount = Number(payeeFirst[2]!.replace(/,/g, ""));
    const recipient = cleanRecipient(payeeFirst[1]!);
    const chainMatch = trimmed.match(/\s+on\s+(.+?)\s*$/i);
    if (Number.isFinite(amount) && amount > 0 && recipient) {
      return {
        action: "pay",
        amount,
        currency: normalizeCurrency(payeeFirst[3], trimmed),
        recipientQuery: recipient,
        targetChain: normalizeChain(chainMatch?.[1]),
        memo: `Conversational Settlement: ${trimmed}`,
      };
    }
  }

  if (/^(?:pay|send|transfer)\b/i.test(lower)) {
    return {
      action: "clarify",
      question:
        "I can prepare that payment, but I need the amount, the payee, and the destination chain. For example: Send $50 to John Kennedy on Base.",
      originalInput: trimmed,
    };
  }

  if (/^(?:open|go to|take me to)\b/i.test(lower)) {
    if (lower.includes("recipient")) return { action: "navigate", page: "recipients" };
    if (lower.includes("invoice")) return { action: "navigate", page: "invoices" };
    if (lower.includes("treasury")) return { action: "navigate", page: "treasury" };
    if (lower.includes("dashboard")) return { action: "navigate", page: "dashboard" };
    if (lower.includes("history")) return { action: "navigate", page: "history" };
    if (lower.includes("pay")) return { action: "navigate", page: "pay" };
  }

  if (lower.includes("invoice")) {
    const statusMatch = lower.match(/\b(pending|paid|draft|cancelled)\b/);
    return {
      action: "invoice_status",
      status: statusMatch ? statusMatch[1]!.toUpperCase() : "ALL",
    };
  }

  if (
    lower.includes("treasury") ||
    lower.includes("spending limit") ||
    lower.includes("policy") ||
    lower.includes("velocity")
  ) {
    const amountMatch = trimmed.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
    return {
      action: "treasury_check",
      amountUSD: amountMatch ? Number(amountMatch[1]!.replace(/,/g, "")) : undefined,
      category: "Operations & Freelance",
    };
  }

  if (/^(?:open|go to|take me to|show)\b/i.test(lower)) {
    if (lower.includes("recipient")) return { action: "navigate", page: "recipients" };
    if (lower.includes("invoice")) return { action: "invoice_status", status: "ALL" };
    if (lower.includes("treasury")) return { action: "navigate", page: "treasury" };
    if (lower.includes("dashboard")) return { action: "navigate", page: "dashboard" };
    if (lower.includes("history")) return { action: "navigate", page: "history" };
    if (lower.includes("pay")) return { action: "navigate", page: "pay" };
  }

  return null;
}
