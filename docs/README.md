# PaySure AI — Technical Documentation Suite

Welcome to the official technical and architectural documentation for **PaySure AI**, an institutional-grade, non-custodial Web3 corporate payment, invoice settlement, and fraud prevention terminal built on **NEAR Protocol**, **NEAR.AI Cloud**, and **Chain Abstraction**.

---

## Documentation Index

This repository contains in-depth documentation detailing every process, every step, and every technical action performed by PaySure AI:

| Document | Topic | Description |
| :--- | :--- | :--- |
| **[01. Confirmation of Payee (CoP)](./01-confirmation-of-payee.md)** | Fraud Prevention | Real-time on-chain RPC checks, homoglyph typosquatting defense, and corporate entity KYC attestation. |
| **[02. Multi-Chain Settlement & Bridging](./02-multi-chain-settlement-and-bridging.md)** | Chain Abstraction | Model A (Intent Solver Rail) & Model B (Threshold MPC Chain Signatures) across 8 supported blockchains. |
| **[03. Natural Language Payment Compiler](./03-natural-language-payment-compiler.md)** | Intent Intelligence | Deterministic natural language extraction, intent compilation, schema normalization, and hand-off. |
| **[04. Autonomous AI Copilot & NEAR.AI](./04-ai-copilot-and-near-ai.md)** | Agent Infrastructure | Route-aware floating copilot dock, NEAR.AI Cloud LLM inference, database grounding, and invoice payments. |
| **[05. Smart Invoicing & Multimodal OCR](./05-smart-invoicing-and-ocr-pipeline.md)** | Billing Infrastructure | Digital invoice issuance, multimodal PDF/image OCR extraction, and tamper-proof on-chain auto-reconciliation. |
| **[06. Corporate Treasury & Guardrails](./06-corporate-treasury-and-guardrails.md)** | Treasury Governance | Velocity limits, single-tx spending ceilings, counterparty risk scoring, and SputnikDAO multi-sig escalation. |
| **[07. Balance Validation & Security Model](./07-wallet-balance-validation-and-safety.md)** | Safety & Custody | Real-time wallet balance checks, deficit detection, disabled button states, and zero-custody guarantees. |
| **[08. API & Route Reference](./08-api-reference.md)** | Developer Reference | Comprehensive technical specification of all Next.js API endpoints, request/response payloads, and status codes. |

---

## Architectural Overview

PaySure AI operates as a non-custodial financial layer that connects corporate finance teams to the decentralized NEAR economy and external blockchains without requiring multi-wallet fragmentation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PAYSURE AI FRONTEND                             │
│  Payment Terminal (/pay)  ·  Invoices (/invoices)  ·  Copilot (Dock)        │
└──────────────────────┬───────────────────────────────┬──────────────────────┘
                       │                               │
                       ▼                               ▼
       ┌───────────────────────────────┐   ┌───────────────────────────────┐
       │     CONFIRMATION OF PAYEE     │   │      TREASURY GUARDRAILS      │
       │  • NEAR RPC view_account      │   │  • Single-tx limit ($250 USD) │
       │  • Multi-chain address audit  │   │  • Daily velocity ceiling     │
       │  • Levenshtein typosquatting  │   │  • Counterparty risk scoring  │
       └───────────────┬───────────────┘   └───────────────┬───────────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                 CROSS-CHAIN SETTLEMENT ROUTER                 │
       │                                                               │
       │   [Native NEAR]          [Model A Bridge]    [Model B MPC]    │
       │   NEAR Nightshade 2.0    Intent Solver Rail  Chain Signatures │
       │   ~1.1s finality         (Stacks, Solana,    v1.signer-prod   │
       │   < 0.0005 NEAR fee      XRP, Cosmos, XLM)   (EVM, Bitcoin)   │
       └───────────────┬───────────────────────┬───────────────┬───────┘
                       │                       │               │
                       ▼                       ▼               ▼
                 NEAR Protocol          External Chains  External Chains
                 (*.testnet)            (STX, SOL, XRP)  (Base, ETH, BTC)
```

---

## Core System Principles

1. **Strict Non-Custodial Design**: PaySure never stores, handles, or transmits private keys or seed phrases. Every transaction payload is built in-browser and handed off to user-controlled wallets (such as MyNearWallet or Meteor) for cryptographic approval.
2. **Pre-Flight Attestation**: No capital is released until Confirmation of Payee verifies the beneficiary identity and the Treasury Policy Engine approves the spending velocity.
3. **Chain Abstraction First**: Counterparties receive funds in their native token on their preferred blockchain (e.g. STX on Stacks, SOL on Solana, BTC on Bitcoin, or ETH on Base) while the sender maintains a single treasury on NEAR Protocol.
