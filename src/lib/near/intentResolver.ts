/**
 * Conversational Natural Language Intent Resolver
 * 
 * Translates human prompts (e.g. "Send $50 to LeProf on Base" or "Pay Satoshi 20 NEAR on Solana")
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
    settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver (Model A)";
    mpcSignerDerivation?: string;
  };
}

// Built-in multi-chain directory of verified counterparties
const DIRECTORY_COUNTERPARTIES = [
  {
    displayName: "LeProf Consulting",
    paymentId: "leprof",
    nearAccountId: "leprof.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    xrpAddress: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    cosmosAddress: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54",
    stacksAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    stellarAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: true,
    transactionCount: 19,
  },
  {
    displayName: "Acme Web3 Design Studio",
    paymentId: "acme-design",
    nearAccountId: "acme-design.testnet",
    evmAddress: "0x456569838f1d43009A91ebA4263147Afd7233483",
    bitcoinAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    solanaAddress: "Acme482kXz9vQ7wPzN9bL1m9k6qR8s2vY5t1u4w3x2z1",
    xrpAddress: "rEb8TK3gBgk5auZyyb6BiZN2rk3bU26GLq",
    cosmosAddress: "cosmos1depduwvh4572h7w54cv92z567l523mvhz738q9",
    stacksAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    stellarAddress: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: true,
    transactionCount: 14,
  },
  {
    displayName: "Satoshi Freelance Engineering",
    paymentId: "satoshi-dev",
    nearAccountId: "satoshi-dev.testnet",
    evmAddress: "0x1234567890123456789012345678901234567890",
    bitcoinAddress: "bc1q9d784a0c849e89d6e872c3d5236894c2518e91",
    solanaAddress: "Satosh19428571829471928471928471928471928471",
    xrpAddress: "rLNaPoKeeBjZe2qs6x52yVPZpZ8td4dc6w",
    cosmosAddress: "cosmos1vl9e25dkls8923mxc78dfhk235689123456789",
    stacksAddress: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    stellarAddress: "GCKFBEIYV2U22IO2GUOWGOQUM76ACQOMZBPZFDB2O7AFB9M72G8K7KNA",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: false,
    transactionCount: 8,
  },
  {
    displayName: "John Kennedy",
    paymentId: "john-kennedy",
    nearAccountId: "john-kennedy.testnet",
    evmAddress: "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    bitcoinAddress: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    solanaAddress: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    xrpAddress: "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59",
    cosmosAddress: "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54",
    stacksAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    stellarAddress: "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
    verificationStatus: "VERIFIED" as const,
    isOfficialPartner: true,
    transactionCount: 8,
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
  const lower = clean.toLowerCase();

  // 1. Extract Amount & Currency
  let extractedAmount = 50;
  let extractedCurrency = "USD";

  const amountMatch = clean.match(/(?:\$|usd\s*|near\s*)?(\d+(?:\.\d{1,2})?)\s*(usd|near|usdc|\$)?/i);
  if (amountMatch) {
    extractedAmount = parseFloat(amountMatch[1]);
    if (lower.includes("near")) {
      extractedCurrency = "NEAR";
    } else if (lower.includes("usdc")) {
      extractedCurrency = "USDC";
    }
  }

  // 2. Extract Destination Chain
  let targetChain = "NEAR Protocol";
  let settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver (Model A)" = "NEAR Native";

  if (lower.includes("on base") || lower.includes("to base")) {
    targetChain = "Base";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on ethereum") || lower.includes("on eth")) {
    targetChain = "Ethereum";
    settlementRail = "NEAR Chain Signatures (MPC)";
  } else if (lower.includes("on arbitrum")) {
    targetChain = "Arbitrum";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on solana") || lower.includes("to solana")) {
    targetChain = "Solana";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on bitcoin") || lower.includes("to bitcoin") || lower.includes("on btc")) {
    targetChain = "Bitcoin";
    settlementRail = "NEAR Chain Signatures (MPC)";
  } else if (lower.includes("on xrp") || lower.includes("on ripple") || lower.includes("to ripple")) {
    targetChain = "Ripple (XRP)";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on cosmos") || lower.includes("to cosmos")) {
    targetChain = "Cosmos";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on stacks") || lower.includes("to stacks")) {
    targetChain = "Stacks (Bitcoin L2)";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on stellar") || lower.includes("to stellar")) {
    targetChain = "Stellar";
    settlementRail = "NEAR Intent Solver (Model A)";
  }

  // 3. Extract Recipient Query
  let recipientQuery = "LeProf Consulting";
  if (lower.includes("leprof")) {
    recipientQuery = "LeProf Consulting";
  } else if (lower.includes("acme")) {
    recipientQuery = "Acme Web3 Design Studio";
  } else if (lower.includes("satoshi")) {
    recipientQuery = "Satoshi Freelance Engineering";
  } else if (lower.includes("john") || lower.includes("kennedy")) {
    recipientQuery = "John Kennedy";
  } else {
    // Try to match "to [Name/Account]" or "pay [Name/Account]"
    const toMatch = clean.match(/(?:to|pay)\s+([a-zA-Z0-9-_\.]+)/i);
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

  // Resolve target address according to the selected destination chain
  let targetChainAddress = matched?.nearAccountId || `${recipientQuery.toLowerCase()}.testnet`;
  if (targetChain === "Base" || targetChain === "Ethereum" || targetChain === "Arbitrum") {
    targetChainAddress = matched?.evmAddress || "0x71C8360f3a8b417c805F99D4133A89f07447d251";
  } else if (targetChain === "Bitcoin") {
    targetChainAddress = matched?.bitcoinAddress || "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
  } else if (targetChain === "Solana") {
    targetChainAddress = matched?.solanaAddress || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  } else if (targetChain === "Ripple (XRP)") {
    targetChainAddress = matched?.xrpAddress || "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59";
  } else if (targetChain === "Cosmos") {
    targetChainAddress = matched?.cosmosAddress || "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54";
  } else if (targetChain === "Stacks (Bitcoin L2)") {
    targetChainAddress = matched?.stacksAddress || "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS";
  } else if (targetChain === "Stellar") {
    targetChainAddress = matched?.stellarAddress || "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37";
  }

  // 5. Evaluate against Treasury Policy Engine
  const policyCheck = evaluatePaymentAgainstPolicy(
    extractedAmount,
    "Cross-Chain Operations",
    reputationScore,
    verificationStatus,
    DEFAULT_TREASURY_POLICY,
    180
  );

  return {
    rawPrompt: prompt,
    extractedAmount,
    extractedCurrency,
    recipientQuery,
    targetChain,
    memo: `Cross-Chain Settlement: ${prompt}`,
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
