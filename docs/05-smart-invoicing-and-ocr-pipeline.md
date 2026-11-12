# 05 — Smart Invoicing & Multimodal OCR Pipeline

## Overview

Traditional enterprise billing involves manual data entry from PDF invoices into banking portals—a process fraught with typos, invoice manipulation, and lack of real-time auditability.

**PaySure AI Smart Invoicing** pairs multimodal artificial intelligence with cryptographic Web3 settlement:
1. **Multimodal OCR Extraction**: Ingests PDF, PNG, or JPEG vendor invoices and deterministically extracts structured invoice data.
2. **Multi-Chain Attestation**: Validates the vendor across 8 major blockchains (NEAR, Base, Stacks, Bitcoin, Solana, etc.).
3. **Cryptographic Auto-Reconciliation**: Binds on-chain payment hashes directly to invoice records, updating status to `PAID` with zero human reconciliation.

---

## 1. Invoice Creation (`/invoices/new`)

Finance teams can issue invoices denominated in NEAR or stable assets (USDC) destined for any counterparty wallet:

```
[Form Input Parameters]
  • Invoice Identifier (e.g. INV-2026-9042)
  • Vendor / Business Name (e.g. LeProf Consulting)
  • Settlement Blockchain (NEAR, Base, Stacks, Bitcoin, Solana, XRP, Cosmos, Stellar)
  • Beneficiary Address / Account
  • Amount Due & Denomination Asset (NEAR / USDC)
  • Due Date & Service Scope Description
         │
         ▼
[Real-Time Address & Payee Check]
  • detectChainFromAddress identifies address format
  • Queries /api/recipients/verify for corporate attestation
         │
         ▼
[Real-Time Wallet Balance Evaluation]
  • If Amount > Connected Balance:
    - Input displays red border & deficit notice
    - "Save & Proceed to Pay" button is disabled and greyed out
         │
         ▼
[Submission Options]
  • "Save as Draft": Persists record in PostgreSQL
  • "Save & Proceed to Pay": Saves invoice and redirects to /pay?invoiceId=...
```

---

## 2. Multimodal OCR Document Extraction (`/invoices/upload`)

Vendors frequently submit invoices as PDF documents or scanned images. PaySure AI extracts payment parameters using NEAR.AI Cloud multimodal vision inference.

### Extraction Pipeline:
1. **Document Upload**: User uploads an invoice (PDF, PNG, JPG) or selects an institutional sample.
2. **API Dispatch (`/api/ai/extract-invoice`)**: The file payload is converted into base64 or raw text and submitted to NEAR.AI Cloud / DeepSeek:
   ```json
   {
     "invoiceNumber": "INV-2026-9042",
     "recipientName": "Acme Web3 Design Studio",
     "recipientAddress": "acme-design.testnet",
     "amount": 75.00,
     "dueDate": "2026-11-20",
     "description": "UI/UX Brand Design & Frontend Systems"
   }
   ```
3. **Automated Payee Screening**: As soon as extraction succeeds, the system runs pre-flight Confirmation of Payee verification. If the address on the invoice does not match the registered entity's attested wallet, a **`MISMATCH` fraud warning** is displayed immediately.
4. **Action Hand-off**:
   - **"Save as Draft"**: Archives the invoice.
   - **"Proceed to Payment"**: Redirects to `/pay?invoiceId=...`.
   - **"Pay with AI Copilot"**: Dispatches `paysure:open-copilot` to open the assistant dock, resolve the invoice, and display the one-click settlement card.

---

## 3. Cryptographic Auto-Reconciliation

Traditional ERP systems require bookkeepers to match bank statement line items with invoices manually. In PaySure AI, reconciliation happens automatically on-chain:

```
[Payer Signs On-Chain]
         │
         ▼
[POST /api/payments]
  • Payload: { invoiceId, transactionHash, senderAddress, recipientAddress, amount }
         │
         ▼
[Database Transaction (Prisma)]
  • Creates Payment record with transactionHash (e.g. 8JbYAEA...)
  • Updates Invoice status: "PENDING" ──► "PAID"
  • Generates immutable Audit Receipt record
         │
         ▼
[Real-Time Telemetry Update]
  • Invoices table reflects "PAID" badge with green highlight
  • Treasury dashboard decrements outstanding receivables
  • Sender can download verifiable PDF receipt with block explorer links
```
