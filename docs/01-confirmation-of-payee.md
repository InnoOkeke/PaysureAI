# 01 — Confirmation of Payee (CoP) Engine

## Overview

In traditional UK and European banking, **Confirmation of Payee (CoP)** validates that the legal recipient's name matches their account number before an electronic funds transfer is finalized. 

In Web3, blockchain transactions are irreversible: sending capital to an impostor address or mistyping a single character in an account identifier (such as `leprof.tesnet` instead of `leprof.testnet`) causes permanent, unrecoverable capital loss. **PaySure AI’s Confirmation of Payee Engine** replicates institutional banking-grade attestation for Web3 corporate treasuries.

---

## The 4-Step Verification Lifecycle

Every time a user inputs a beneficiary account or cross-chain address (in `/pay`, `/invoices/new`, `/invoices/upload`, or via the AI Copilot), the engine automatically executes the following pipeline:

```
[User Input] 
      │
      ▼
[1. Format & Chain Detection] ──► Detects NEAR (.testnet), EVM (0x), Bitcoin (tb1/bc1), Stacks (ST/SP), etc.
      │
      ▼
[2. On-Chain RPC Query]      ──► Queries NEAR RPC (https://rpc.testnet.near.org) with view_account
      │
      ▼
[3. Corporate Directory Match] ──► Checks verified KYC legal entities and Payment IDs in PaySure Registry
      │
      ▼
[4. Typosquatting Defense]   ──► Computes Levenshtein edit distance against attested corporate handles
      │
      ▼
[Status Result & UI Attestation] ──► VERIFIED | WARNING | UNVERIFIED | MISMATCH
```

---

### Step 1: Input Normalization & Multi-Chain Schema Detection
The input string is cleaned of leading/trailing whitespace and run through schema detection via `detectChainFromAddress`:
- **NEAR Account**: Matches `[a-z0-9_-]+\.(testnet|near)`
- **EVM (Base / Ethereum / Arbitrum)**: Matches `^0x[a-fA-F0-9]{40}$`
- **Bitcoin (Native / SegWit / Taproot)**: Matches `/^(bc1|[13]|tb1)[a-zA-HJ-NP-Z0-9]{25,62}$/`
- **Stacks (Bitcoin L2)**: Matches `/^S[PT][a-zA-Z0-9]{28,42}$/` (Mainnet `SP...`, Testnet `ST...`)
- **Solana**: Matches Base58 32–44 characters
- **Ripple (XRP)**: Matches `/^r[1-9A-HJ-NP-Za-km-z]{24,34}$/`
- **Cosmos Hub**: Matches `/^cosmos1[a-z0-9]{38,45}$/`
- **Stellar**: Matches `/^G[A-Z2-7]{55}$/`

---

### Step 2: Live On-Chain NEAR RPC Interrogation
For all NEAR-native accounts, the engine initiates a real-time JSON-RPC request to the NEAR network (`https://rpc.testnet.near.org`):

```json
{
  "jsonrpc": "2.0",
  "id": "paysure-cop-check",
  "method": "query",
  "params": {
    "request_type": "view_account",
    "finality": "final",
    "account_id": "leprof.testnet"
  }
}
```

- **Account Exists**: The RPC returns state including `amount` (yoctoNEAR balance), `storage_usage`, and `code_hash`.
- **Account Does Not Exist**: The RPC returns `UnknownAccount`. The engine marks the account as unregistered or potentially typosquatted.

---

### Step 3: Corporate Identity Registry Attestation
The engine cross-references the verified address against attested corporate vendor records stored in PostgreSQL via Prisma:
- **Legal Business Name**: e.g., `LeProf Consulting`, `Acme Web3 Design Studio`.
- **Registered Payment ID**: e.g., `leprof`, `acme-design`.
- **Multi-Chain Portfolio**: Associated EVM, Bitcoin, Stacks, Solana, and Cosmos addresses.
- **Verification Tier**: KYC verified partner status and historical transaction frequency.

---

### Step 4: Typosquatting & Levenshtein Edit Distance Defense
Attackers routinely deploy lookalike accounts (e.g. `satoshl-dev.testnet` using an `l` instead of an `i`, or `acme-des1gn.testnet`).

The engine calculates the **Levenshtein distance** between the input handle and all registered corporate handles:
$$\text{Distance}(s_1, s_2) = \text{minimum number of single-character edits required to transform } s_1 \text{ into } s_2$$

- If an input is **within an edit distance of 1 or 2** from an official verified partner but is *not* that partner, the engine flags a **CRITICAL TYPOSQUATTING WARNING**:
  > *"CRITICAL WARNING: Lookalike Account Detected. Did you mean 'satoshi-dev.testnet'?"*

---

## Attestation Status Outcomes

| Status | Color | Risk Level | Description |
| :--- | :--- | :--- | :--- |
| **`VERIFIED`** | Emerald Green | Minimal (0%) | Account exists on-chain and exactly matches an attested legal business record in the corporate directory. |
| **`WARNING`** | Amber Yellow | Elevated (35%) | Account exists on-chain, but displays recent key rotations, lack of KYC attestation, or minor name mismatches. |
| **`UNVERIFIED`**| Slate / Red | Moderate (60%) | Account exists on-chain with balance, but has not filed corporate KYC documentation in the PaySure directory. |
| **`MISMATCH`** | Crimson Rose | Critical (100%) | Account on the invoice or input directly contradicts the known registered account for that vendor (potential invoice hijack). |

---

## API Specification: `/api/recipients/verify`

### Request Payload:
```json
POST /api/recipients/verify
Content-Type: application/json

{
  "address": "leprof.testnet",
  "name": "LeProf Consulting"
}
```

### Response Payload:
```json
{
  "status": "VERIFIED",
  "reason": "Matched attested partner LeProf Consulting across NEAR, Base, and Stacks.",
  "recipient": {
    "displayName": "LeProf Consulting",
    "paymentId": "leprof",
    "walletAddress": "leprof.testnet",
    "evmAddress": "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    "stacksAddress": "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    "verificationStatus": "VERIFIED"
  },
  "detectedChain": "NEAR Protocol",
  "rail": "NEAR Native Consensus"
}
```
