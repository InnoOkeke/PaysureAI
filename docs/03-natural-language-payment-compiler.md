# 03 — Natural Language Payment Compiler

## Overview

Instead of navigating fragmented, multi-step transaction screens, PaySure AI enables finance operators to dictate cross-chain settlements using natural language (e.g., *"Disburse $50 to LeProf on Stacks for smart contract audit"* or *"Send 20 NEAR to Satoshi on Bitcoin"*).

The **Natural Language Payment Compiler** parses human language deterministically, normalizes amounts and currencies, resolves counterparties via Confirmation of Payee, runs pre-flight treasury policy checks, and compiles an execution payload ready for non-custodial signing.

---

## Intent Compilation Pipeline

```
[Raw Human Prompt] 
  "Pay $50 to LeProf on Stacks L2 for code audit"
         │
         ▼
[1. Amount & Currency Parser]
  • Extracted Amount: 50.00
  • Extracted Currency: USD (or NEAR/USDC)
         │
         ▼
[2. Target Chain Resolver]
  • Keyword "on Stacks" ──► Target Chain: Stacks (Bitcoin L2)
  • Execution Rail: Model A Intent Solver Rail
         │
         ▼
[3. Payee Identity Extractor]
  • Entity Query: "LeProf" ──► LeProf Consulting
  • Target Chain Address: SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS
         │
         ▼
[4. Confirmation of Payee Check]
  • Attestation: VERIFIED (Official Ecosystem Partner)
  • Reputation Score: 98/100
         │
         ▼
[5. Treasury Policy Engine]
  • Policy Rule: $50 <= $250 Single-Tx Threshold
  • Approval: ✓ Auto-Executable (No Multi-Sig Escalation Needed)
         │
         ▼
[Compiled ResolvedIntent Object]
```

---

## Schema Specification: `ResolvedIntent`

```typescript
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
```

---

## Natural Language Extraction Rules

### 1. Amount & Currency Extraction
- Matches numerical values preceded or followed by currency markers: `/\$?(\d+(?:\.\d{1,2})?)\s*(usd|near|usdc|\$)?/i`.
- Defaults to USD denomination if specified with `$`, or NEAR if explicitly stated.

### 2. Destination Chain Keywords
- **"on Base" / "to Base"**: Maps to `Base` (EVM Model A/B).
- **"on Stacks" / "to Stacks"**: Maps to `Stacks (Bitcoin L2)` (Model A Solver).
- **"on Bitcoin" / "on BTC"**: Maps to `Bitcoin` (MPC Native / Intent Rail).
- **"on Solana" / "to Solana"**: Maps to `Solana` (Model A Solver).
- **"on Ripple" / "on XRP"**: Maps to `Ripple (XRP)` (Model A Solver).
- **"on Cosmos" / "to Cosmos"**: Maps to `Cosmos` (Model A Solver).
- **"on Stellar" / "to Stellar"**: Maps to `Stellar` (Model A Solver).
- **Default (no chain mentioned)**: Maps to native `NEAR Protocol`.

### 3. Payee Identity Resolution
- The compiler extracts the subject following verbs like `pay`, `send`, `transfer`, `disburse`, or `to`.
- It matches against corporate directory names, handles, or registered payment IDs.
- Once matched, it retrieves the destination address corresponding to the target chain (e.g. if the user says "on Stacks", it grabs the counterparty's `stacksAddress`).

---

## One-Click Application

Once the compiler produces a `ResolvedIntent`, the UI provides an instant **"Apply to Transfer Form"** action:
1. Automatically switches the destination chain pill to the extracted network.
2. Fills the recipient address with the target chain address.
3. Sets the normalized numerical amount.
4. Populates the memo with the context reference.
5. Displays the live Confirmation of Payee verification badge.
6. Enforces real-time wallet balance validation before the user signs.
