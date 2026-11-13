/**
 * Conversational Natural Language Intent Resolver
 * 
 * Translates human prompts (e.g. "Send $50 to LeProf on Base" or "Pay Satoshi 20 NEAR on Solana")
 * into verifiable cross-chain intents with Confirmation of Payee and Treasury Policy evaluation.
 */

import { evaluatePaymentAgainstPolicy, calculateReputationScore, DEFAULT_TREASURY_POLICY } from "@/lib/treasury/policyEngine";
import { deriveEVMAddressFromNear } from "@/lib/near/chainSignatures";
import { detectChainFromAddress } from "@/lib/recipients";

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
  senderNearAccount: string = "company.near",
  customRecipients?: any[]
): ResolvedIntent {
  const clean = prompt.trim();
  const lower = clean.toLowerCase();

  // Combine built-in directory with any database recipients
  const allCounterparties = [
    ...DIRECTORY_COUNTERPARTIES,
    ...(customRecipients || []).map((r) => ({
      displayName: r.displayName || r.name,
      paymentId: r.paymentId || (r.displayName || "").toLowerCase().replace(/\s+/g, "-"),
      nearAccountId: r.walletAddress || r.nearAccountId || `${(r.displayName || "").toLowerCase().replace(/\s+/g, "-")}.testnet`,
      evmAddress: r.evmAddress,
      bitcoinAddress: r.bitcoinAddress,
      solanaAddress: r.solanaAddress,
      xrpAddress: r.xrpAddress,
      cosmosAddress: r.cosmosAddress,
      stacksAddress: r.stacksAddress,
      stellarAddress: r.stellarAddress,
      verificationStatus: (r.verificationStatus || "VERIFIED") as any,
      isOfficialPartner: Boolean(r.isOfficialPartner),
      transactionCount: r.transactionCount || 6,
    })),
  ];

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

  // 2. Check for Literal / Explicit On-Chain Addresses in the Prompt
  // Handles EVM, NEAR (*.testnet, *.near), Bitcoin (bc1/1/3/tb1), Stacks (SP/ST), Solana, Cosmos, Ripple, Stellar
  let explicitAddress: string | null = null;
  const words = clean.split(/[\s,]+/);

  for (const word of words) {
    const w = word.trim().replace(/[(),;:]/g, "");
    if (/^0x[a-fA-F0-9]{40}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^[a-zA-Z0-9_\-\.]+\.(testnet|near)$/i.test(w)) {
      explicitAddress = w.toLowerCase();
      break;
    }
    if (/^(bc1|[13]|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^S[PT][a-zA-Z0-9]{28,42}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^cosmos1[a-z0-9]{38,45}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^G[A-Z2-7]{55}$/.test(w)) {
      explicitAddress = w;
      break;
    }
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(w) && !w.includes(".") && !["bitcoin", "ethereum", "arbitrum", "protocol", "lightning"].includes(w.toLowerCase())) {
      explicitAddress = w;
      break;
    }
  }

  // 3. Extract Destination Chain & Rail
  let targetChain = "NEAR Protocol";
  let settlementRail: "NEAR Native" | "NEAR Chain Signatures (MPC)" | "NEAR Intent Solver (Model A)" = "NEAR Native";

  if (lower.includes("on base") || lower.includes("to base")) {
    targetChain = "Base";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on ethereum") || lower.includes("on eth") || lower.includes("to eth")) {
    targetChain = "Ethereum";
    settlementRail = "NEAR Chain Signatures (MPC)";
  } else if (lower.includes("on arbitrum") || lower.includes("to arbitrum")) {
    targetChain = "Arbitrum";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on solana") || lower.includes("to solana")) {
    targetChain = "Solana";
    settlementRail = "NEAR Intent Solver (Model A)";
  } else if (lower.includes("on bitcoin") || lower.includes("to bitcoin") || lower.includes("on btc") || lower.includes("to btc")) {
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
  } else if (explicitAddress) {
    // If user provided a raw address without mentioning chain, auto-infer chain
    const detected = detectChainFromAddress(explicitAddress);
    targetChain = detected.chain.includes("Base") ? "Base" : detected.chain;
    settlementRail = detected.rail;
  }

  // 4. Resolve Payee & Address
  let recipientQuery = "";
  let targetChainAddress = "";
  let matchedCounterparty: any = null;

  if (explicitAddress) {
    // The user provided the exact address directly
    targetChainAddress = explicitAddress;
    
    // Check if this explicit address belongs to any registered counterparty in directory
    matchedCounterparty = allCounterparties.find((c) =>
      c.nearAccountId?.toLowerCase() === explicitAddress!.toLowerCase() ||
      c.evmAddress?.toLowerCase() === explicitAddress!.toLowerCase() ||
      c.bitcoinAddress === explicitAddress ||
      c.solanaAddress === explicitAddress ||
      c.stacksAddress === explicitAddress ||
      c.xrpAddress === explicitAddress ||
      c.cosmosAddress === explicitAddress ||
      c.stellarAddress === explicitAddress
    );

    if (matchedCounterparty) {
      recipientQuery = matchedCounterparty.displayName;
    } else {
      recipientQuery = explicitAddress.length > 18 
        ? `${explicitAddress.slice(0, 6)}...${explicitAddress.slice(-4)}`
        : explicitAddress;
    }
  } else {
    // Extract recipient name / identifier from query
    if (lower.includes("leprof")) {
      recipientQuery = "LeProf Consulting";
    } else if (lower.includes("acme")) {
      recipientQuery = "Acme Web3 Design Studio";
    } else if (lower.includes("satoshi")) {
      recipientQuery = "Satoshi Freelance Engineering";
    } else if (lower.includes("john") || lower.includes("kennedy")) {
      recipientQuery = "John Kennedy";
    } else {
      // Find matches in registered counterparties
      for (const cp of allCounterparties) {
        if (lower.includes(cp.displayName.toLowerCase()) || lower.includes(cp.paymentId.toLowerCase())) {
          recipientQuery = cp.displayName;
          break;
        }
      }

      if (!recipientQuery) {
        // Match "to <name>" or "for <name>"
        const toMatch = clean.match(/(?:to|for)\s+([a-zA-Z0-9_\-\.]+)/i);
        if (toMatch && !["base", "stacks", "solana", "bitcoin", "ethereum", "eth", "xrp", "cosmos", "stellar", "near"].includes(toMatch[1].toLowerCase())) {
          recipientQuery = toMatch[1];
        } else {
          recipientQuery = "LeProf Consulting"; // safe default
        }
      }
    }

    matchedCounterparty = allCounterparties.find(
      (c) =>
        c.displayName.toLowerCase().includes(recipientQuery.toLowerCase()) ||
        c.paymentId.toLowerCase().includes(recipientQuery.toLowerCase()) ||
        c.nearAccountId.toLowerCase().includes(recipientQuery.toLowerCase())
    );

    // Resolve target address according to the selected destination chain
    if (targetChain === "Base" || targetChain === "Ethereum" || targetChain === "Arbitrum") {
      targetChainAddress = matchedCounterparty?.evmAddress || "0x71C8360f3a8b417c805F99D4133A89f07447d251";
    } else if (targetChain === "Bitcoin") {
      targetChainAddress = matchedCounterparty?.bitcoinAddress || "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4";
    } else if (targetChain === "Solana") {
      targetChainAddress = matchedCounterparty?.solanaAddress || "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
    } else if (targetChain === "Ripple (XRP)") {
      targetChainAddress = matchedCounterparty?.xrpAddress || "r9cZA1mLK5R5Am25ArfXFmqgNwjZgnfk59";
    } else if (targetChain === "Cosmos") {
      targetChainAddress = matchedCounterparty?.cosmosAddress || "cosmos1hsk6jryyqjfhp5dhc55tc9jtckygx0e846pc54";
    } else if (targetChain === "Stacks (Bitcoin L2)") {
      targetChainAddress = matchedCounterparty?.stacksAddress || "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS";
    } else if (targetChain === "Stellar") {
      targetChainAddress = matchedCounterparty?.stellarAddress || "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37";
    } else {
      targetChainAddress = matchedCounterparty?.nearAccountId || (recipientQuery.includes(".") ? recipientQuery : `${recipientQuery.toLowerCase()}.testnet`);
    }
  }

  const verificationStatus: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH" = matchedCounterparty 
    ? matchedCounterparty.verificationStatus 
    : (explicitAddress && (explicitAddress.endsWith(".testnet") || explicitAddress.endsWith(".near")) ? "WARNING" : "UNVERIFIED");

  const reputationScore = matchedCounterparty 
    ? calculateReputationScore(matchedCounterparty) 
    : (verificationStatus === "WARNING" ? 65 : 40);

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
    recipientQuery: recipientQuery || "Recipient",
    targetChain,
    memo: `Cross-Chain Settlement: ${prompt}`,
    resolvedPayee: {
      displayName: matchedCounterparty?.displayName || recipientQuery,
      accountId: matchedCounterparty?.nearAccountId || (targetChainAddress.includes(".") ? targetChainAddress : "leprof.testnet"),
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
