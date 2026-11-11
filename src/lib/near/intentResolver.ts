/**
 * Conversational Natural Language Intent Resolver
 * 
 * Translates human prompts (e.g. "Send $50 to John Kennedy on Base")
 * into verifiable cross-chain intents with Confirmation of Payee and Treasury Policy evaluation.
 */

import { evaluatePaymentAgainstPolicy, calculateReputationScore, DEFAULT_TREASURY_POLICY } from "@/lib/treasury/policyEngine";
import { deriveEVMAddressFromNear } from "@/lib/near/chainSignatures";

export interface ResolvedIntent {
  rawPrompt: string;
  extractedAmount: number;
  extractedCurrency: string;
  recipientQuery: string;
  targetChain: string;
  memo: string;
  resolvedPayee: {
    displayName: string;
    accountId: string;
    targetChainAddress: string;
    verificationStatus: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH";
    reputationScore: number;
  };
  policyCheck: {
    isAllowed: boolean;
    autoExecutable: boolean;
    requiresHumanSignoff: boolean;
    riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    violations: string[];
    warnings: string[];
  };
  settlementExecution: {
    sourceAccount: string;
    settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver";
    mpcSignerDerivation?: string;
  };
}

// Built-in registry of verified counterparties with multi-chain endpoints
const DIRECTORY_COUNTERPARTIES = [
  {
    displayName: "John Kennedy",
    paymentId: "john-kennedy",
    nearAccountId: "john-kennedy.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: true,
    transactionCount: 8,
  },
  {
    displayName: "Acme Web3 Design Studio",
    paymentId: "acme-design",
    nearAccountId: "acme-design.testnet",
    evmAddress: "0x456569838f1d43009A91ebA4263147Afd7233483",
    solanaAddress: "Acme482kXz9vQ7wPzN9bL1m9k6qR8s2vY5t1u4w3x2z1",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: true,
    transactionCount: 14,
  },
  {
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    nearAccountId: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    solanaAddress: "Satosh19428571829471928471928471928471928471",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: false,
    transactionCount: 5,
  },
];

/**
 * Resolves natural language prompt into a structured, policy-checked intent
 */
export function resolveNaturalLanguageIntent(
  prompt: string,
  senderNearAccount: string = "company.near"
): ResolvedIntent {
  const clean = prompt.trim();

  // 1. Extract Amount & Currency
  let extractedAmount = 50;
  let extractedCurrency = "USD";

  const amountMatch = clean.match(/(?:\$|usd\s*|near\s*)?(\d+(?:\.\d{1,2})?)\s*(usd|near|usdc|\$)?/i);
  if (amountMatch) {
    extractedAmount = parseFloat(amountMatch[1]);
    if (clean.toLowerCase().includes("near")) {
      extractedCurrency = "NEAR";
    } else if (clean.toLowerCase().includes("usdc")) {
      extractedCurrency = "USDC";
    }
  }

  // 2. Extract Destination Chain
  let targetChain = "NEAR Protocol";
  const lower = clean.toLowerCase();
  if (lower.includes("on base") || lower.includes("to base")) {
    targetChain = "Base";
  } else if (lower.includes("on ethereum") || lower.includes("on eth")) {
    targetChain = "Ethereum";
  } else if (lower.includes("on arbitrum")) {
    targetChain = "Arbitrum";
  } else if (lower.includes("on solana")) {
    targetChain = "Solana";
  }

  // 3. Extract Recipient Query
  let recipientQuery = "John Kennedy";
  if (lower.includes("john") || lower.includes("kennedy")) {
    recipientQuery = "John Kennedy";
  } else if (lower.includes("acme")) {
    recipientQuery = "Acme Web3 Design Studio";
  } else if (lower.includes("satoshi")) {
    recipientQuery = "Satoshi Freelance Engineering";
  } else {
    // Try to match "to [Name/Account]"
    const toMatch = clean.match(/to\s+([a-zA-Z0-9-_\.]+)/i);
    if (toMatch) {
      recipientQuery = toMatch[1];
    }
  }

  // 4. Resolve Counterparty from Confirmation of Payee
  const matched = DIRECTORY_COUNTERPARTIES.find(
    (c) =>
      c.displayName.toLowerCase().includes(recipientQuery.toLowerCase()) ||
      c.paymentId.toLowerCase().includes(recipientQuery.toLowerCase()) ||
      c.nearAccountId.toLowerCase().includes(recipientQuery.toLowerCase())
  );

  const verificationStatus = matched ? matched.verificationStatus : "UNVERIFIED";
  const reputationScore = matched ? calculateReputationScore(matched) : 35;

  let targetChainAddress = matched?.nearAccountId || `${recipientQuery.toLowerCase()}.testnet`;
  if (targetChain === "Base" || targetChain === "Ethereum" || targetChain === "Arbitrum") {
    targetChainAddress = matched?.evmAddress || "0x71C8360f3a8b417c805F99D4133A89f07447d251";
  } else if (targetChain === "Solana") {
    targetChainAddress = matched?.solanaAddress || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  }

  // 5. Evaluate against Treasury Policy Engine
  const policyCheck = evaluatePaymentAgainstPolicy(
    extractedAmount,
    "Operations & Freelance",
    reputationScore,
    verificationStatus,
    DEFAULT_TREASURY_POLICY,
    180
  );

  // 6. Determine Settlement Rail
  const settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver" =
    targetChain === "NEAR Protocol"
      ? "NEAR Native"
      : "NEAR Chain Signatures (MPC)";

  return {
    rawPrompt: prompt,
    extractedAmount,
    extractedCurrency,
    recipientQuery,
    targetChain,
    memo: `Conversational Settlement: ${prompt}`,
    resolvedPayee: {
      displayName: matched?.displayName || recipientQuery,
      accountId: matched?.nearAccountId || `${recipientQuery.toLowerCase()}.testnet`,
      targetChainAddress,
      verificationStatus,
      reputationScore,
    },
    policyCheck,
    settlementExecution: {
      sourceAccount: senderNearAccount,
      settlementRail,
      mpcSignerDerivation:
        settlementRail === "NEAR Chain Signatures (MPC)"
          ? deriveEVMAddressFromNear(senderNearAccount)
          : undefined,
    },
  };
}

