# PaySure AI — Autonomous Invoicing & Confirmation of Payee on NEAR Protocol

> **"Never send funds to a spoofed account again."**

PaySure AI is an autonomous, AI-powered invoice management and payment verification platform built natively on **NEAR Protocol**. It eliminates invoice fraud, account typosquatting, and transfer anxiety by combining **Confirmation of Payee (named-account verification registry)**, **Multimodal AI OCR invoice ingestion**, and **Native NEAR Intent Settlement rails**.

Built for the **NEAR Hackathon: Build Beyond Boundaries** across the **AI Agents** and **NEAR Intents** tracks.

---

## 🚀 Key Features

1. **NEAR Confirmation of Payee (Anti-Spoofing & Typo Defense)**:
   - Evaluates recipient NEAR accounts (`*.near`, `*.testnet`) against an on-chain identity directory before funds move.
   - Evaluates counterparties across a 4-tier safety matrix:
     - `VERIFIED`: Target NEAR account exactly matches the registered legal entity.
     - `WARNING`: Payee exists but has recent key rotations or updates.
     - `UNVERIFIED`: Account has no registered record in PaySure; caution advised.
     - `MISMATCH`: The account extracted from the invoice contradicts the payee's registered account (High-risk fraud alert).
2. **Multimodal AI Invoice Ingestion**:
   - Upload invoices in **PDF, PNG, JPG, JPEG**.
   - The AI agent parses invoice numbers, line items, amounts, due dates, and recipient NEAR Account IDs into an editable confirmation draft.
   - **Zero-Trust Security**: Documents are treated as untrusted input with adversarial prompt-injection defense. AI never signs transactions or accesses private keys.
3. **NEAR Intent Settlement Rails**:
   - Settles transactions natively in **NEAR** or **NEP-141 USDC** with sub-second finality.
   - Converts invoice parameters into a self-validating payment intent (`/api/near/intents`).
4. **Verifiable Digital Receipts**:
   - Generates audit-ready, downloadable PDF payment receipts containing transaction hashes, block timestamps, sender/payee NEAR accounts, and direct links to **NEARBlocks**.
5. **Floating Autonomous AI Copilot**:
   - Global floating agent dock with proactive, route-aware popup prompts grounded in live database context (pending invoices, settled volume, and counterparty verification statuses).

---

## 🌐 NEAR Protocol Configuration

| Parameter | Value |
| :--- | :--- |
| **Blockchain Network** | `NEAR Protocol (Testnet & Mainnet)` |
| **Network ID** | `testnet` |
| **RPC Endpoint** | `https://rpc.testnet.near.org` |
| **Native Currency** | `NEAR` (24 Decimals) |
| **Settlement Stablecoin** | `USDC` (NEP-141 Standard, 6 Decimals) |
| **Block Explorer** | `https://testnet.nearblocks.io` |
| **Wallet / Faucet** | `https://testnet.mynearwallet.com` |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, canvas-confetti, jsPDF.
- **NEAR & Web3**: NEAR Protocol, NEAR Wallet Context, NEP-141 Token Standard, Viem (cryptographic utilities).
- **AI Engine**: Multimodal AI Agent with structured JSON parsing and prompt-injection defense.
- **Backend & Database**: Next.js API Route Handlers, Prisma ORM, PostgreSQL (Prisma Postgres on Vercel).

---

## 📂 Project Architecture

```
PaysureAI/
├── src/
│   ├── app/
│   │   ├── page.tsx            # Fintech Landing Page
│   │   ├── dashboard/          # Financial Dashboard & Statistics
│   │   ├── invoices/           # Invoice management & AI upload
│   │   │   └── upload/         # Multimodal AI invoice OCR & verification
│   │   ├── recipients/         # NEAR Confirmation of Payee directory
│   │   ├── pay/                # Guided verified NEAR payment flow
│   │   ├── history/            # Transaction history & PDF receipts
│   │   └── api/                # API route handlers (AI, Invoices, Payments, Intents)
│   ├── components/
│   │   ├── assistant/          # Global Floating Copilot & Proactive Teaser
│   │   ├── navigation/         # Navbar (NEAR Account balance, switcher) & Footer
│   │   ├── landing/            # Hero, Features, HowItWorks, Security
│   │   └── dashboard/          # OverviewCards, RecentTx, OutstandingInvoices
│   ├── context/
│   │   └── NearWalletContext.tsx # Native NEAR wallet state & session
│   └── lib/
│       ├── near/               # NEAR config & Intent orchestration
│       ├── prisma.ts           # Prisma client singleton
│       └── utils.ts            # Formatting & currency helpers
├── prisma/
│   └── schema.prisma           # Users, Recipients, Invoices, Payments, Receipts
└── NEAR_HACKATHON_SPEC.md      # Detailed NEAR Hackathon submission spec
```

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- Node.js v18+ or v20+
- pnpm or npm
- NEAR Testnet account (create one free at [testnet.mynearwallet.com](https://testnet.mynearwallet.com))

### 2. Installation
```bash
git clone https://github.com/InnoOkeke/PaysureAI.git
cd PaysureAI
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your database and AI API keys:
```env
DATABASE_URL="postgres://..."
DEEPSEEK_API_KEY="your-api-key"
```

### 4. Database Setup
```bash
pnpm db:push
```

### 5. Start the Application
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Demonstration Workflow

1. **Connect NEAR Wallet**: Click "Connect NEAR Wallet" in the navbar. The app automatically connects to your NEAR testnet account (or `paysure-treasury.testnet`).
2. **AI Invoice Ingestion**: Navigate to `/invoices/upload`. Upload an invoice or click one of the live sample buttons (e.g. Acme Design Studio). The AI agent extracts payee details, token amount, and invoice number.
3. **Confirmation of Payee**: The system verifies the NEAR Account ID against the on-chain directory. If the account matches, a green `VERIFIED` badge appears. If a typo or lookalike account is detected, an alert blocks blind transfers.
4. **Approve & Pay**: Click "Confirm & Proceed to Payment". The app navigates to `/pay`, presents the verified payment review, and dispatches the settlement on NEAR Testnet.
5. **Verifiable Receipt**: Consensus confirmation triggers confetti, logs the immutable transaction hash on NEARBlocks, and enables downloading a compliance-grade **PDF Receipt**.
6. **Floating AI Copilot**: Click the floating agent dock in the bottom-right corner to ask questions about invoice statuses, NEAR token procedures, or vendor histories.

---

## 🛡 Security & Audit Notes

- **Non-Custodial**: User private keys never touch the server or client javascript state; transactions are signed via user authorization.
- **Untrusted Document Defense**: Invoice inputs are sanitized and passed through strict Zod schemas to block prompt-injection attacks.
- **Anti-Spoofing Heuristics**: Dedicated validation preventing homoglyph and lookalike named account confusion on NEAR Protocol.

---

## 📄 License
MIT License. Built for the NEAR Hackathon: Build Beyond Boundaries.
