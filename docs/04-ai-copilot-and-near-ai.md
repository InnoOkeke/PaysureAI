# 04 — Autonomous AI Copilot & NEAR.AI Cloud

## Overview

PaySure AI features a proactive, floating autonomous agent dock (**PaySure AI Copilot**) that acts as a real-time copilot for corporate finance teams. It answers inquiries about compliance, summarizes outstanding receivables, evaluates Confirmation of Payee attestations, and prepares cross-chain settlements directly from conversation.

The assistant is powered by **NEAR.AI Cloud** (`api.near.ai`) with decentralized inference models (e.g. `llama-3.1-70b-instruct`) and intelligent deterministic fallbacks.

---

## Architecture & Integration

```
┌────────────────────────────────────────────────────────┐
│             FLOATING COPILOT DOCK (Client)             │
│  • FloatingCopilot.tsx                                 │
│  • Global route awareness (/pay, /invoices, /treasury) │
│  • Event-driven triggers (paysure:open-copilot)        │
└───────────────────────────┬────────────────────────────┘
                            │
                     POST /api/ai/assistant
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                AGENT BACKEND CONTROLLER                │
│                                                        │
│  1. Intent Detection ──► resolveNaturalLanguageIntent  │
│  2. Invoice Matcher  ──► Query Prisma DB (INV-xxxx)    │
│  3. Live Context DB  ──► Recent Invoices, Payments     │
│  4. Inference Call   ──► NEAR.AI Cloud / DeepSeek      │
└───────────────────────────┬────────────────────────────┘
                            │
       ┌────────────────────┴────────────────────┐
       ▼                                         ▼
NEAR.AI Cloud API                        Intelligent Fallback
Endpoint: https://api.near.ai/v1         (Deterministic rule-based
Model: nearai/llama-3.1-70b-instruct      engine if offline/no key)
```

---

## Live Database Grounding

Unlike generic chatbot wrappers, PaySure AI Copilot is grounded with live, verified institutional data extracted from the PostgreSQL database on every turn:
- **Outstanding Invoices**: Pending invoice counts, amounts due, and vendor identities.
- **Settled Transactions**: Most recent cryptographic transaction hashes and settlement timestamps.
- **Attested Counterparties**: Registered corporate entities, payment handles, and KYC verification statuses.

### System Prompt Ingestion:
```typescript
const systemPrompt = `You are PaySure AI Copilot, a senior Web3 fintech assistant running on NEAR.AI Cloud and NEAR Protocol.
Platform Details:
- Blockchain: NEAR Protocol (NEAR Testnet, RPC: https://rpc.testnet.near.org)
- AI Inference Engine: NEAR.AI Cloud (api.near.ai)
- Settlement Tokens: NEAR (native token, 24 decimals) and USDC (NEP-141 token, 6 decimals)
- Multi-Chain Abstraction: 8 supported chains including NEAR, Base, Ethereum, Bitcoin, Solana, Stacks L2, Ripple XRP, Cosmos Hub, and Stellar.
- Settlement Rails: Model A (Intent Solver rail) and Model B (NEAR MPC Chain Signatures).
- Governance: SputnikDAO & Trezu multi-sig escalation for transactions exceeding limits ($500).

Real Database Context:
- Recent Invoices (${invoices.length}): ${JSON.stringify(invoices)}
- Recent Payments (${payments.length}): ${JSON.stringify(payments)}
- Registered Counterparties (${recipients.length}): ${JSON.stringify(recipients)}`;
```

---

## Paying Invoices via AI Copilot

Users can command the Copilot to settle invoices in plain language:
- *"Pay invoice INV-2026-9042"*
- *"Settle the uploaded invoice from Acme Design"*
- *"Pay my latest pending invoice"*

### Execution Flow:
1. **Invoice Identification**: The backend scans for invoice patterns (`INV-[0-9]+` or `#9042`) or fetches the most recent `PENDING` record.
2. **Attestation & Rail Lookup**: Automatically detects the recipient address schema (NEAR, Stacks, Base, Solana, etc.) and evaluates Confirmation of Payee.
3. **Interactive Intent Card**: Instead of returning plain text, the Copilot renders an interactive settlement card in the chat window:
   - Target Network Badge & Settlement Rail
   - Payee Corporate Name & Target Address
   - Total Sum in Settlement Currency
   - Confirmation of Payee attestation badge
   - Real-time Wallet Balance validation (`{balance} NEAR available`)
4. **"Apply & Pay Now" Button**:
   - If balance is sufficient: A single click navigates to `/pay?invoiceId=...` with all parameters pre-filled.
   - If balance is insufficient: The button is automatically disabled and greyed out with the label *"Insufficient Balance (X NEAR)"*.

---

## Event-Driven Copilot Communication

The Copilot communicates seamlessly across pages using native window events:
- **`paysure:open-copilot`**: Dispatched by the invoice directory or upload screen to pop open the dock and immediately send a prompt (e.g. *"Pay invoice INV-2026-9042"*).
- **`paysure:apply-intent`**: Dispatched by the Copilot to the `/pay` page to immediately populate the transfer parameters without triggering a full page reload.
