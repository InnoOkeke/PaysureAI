# 08 — API & Technical Route Reference

## Overview

PaySure AI provides a suite of Next.js API route handlers powering payee verification, multi-chain invoice management, AI document extraction, and autonomous agent conversation.

All endpoints adhere to REST conventions, accept and return `application/json` (except file uploads which use `multipart/form-data`), and return standard HTTP status codes.

---

## 1. Payee Verification: `POST /api/recipients/verify`

Interrogates the NEAR RPC and corporate counterparty directory to confirm the validity and identity of a recipient address across all 8 supported blockchains.

### Request:
```http
POST /api/recipients/verify HTTP/1.1
Content-Type: application/json

{
  "address": "leprof.testnet",
  "name": "LeProf Consulting"
}
```

### Response (`200 OK`):
```json
{
  "status": "VERIFIED",
  "reason": "Matched attested partner LeProf Consulting across NEAR, Base, and Stacks.",
  "recipient": {
    "displayName": "LeProf Consulting",
    "paymentId": "leprof",
    "walletAddress": "leprof.testnet",
    "evmAddress": "0x71C8360f3a8b417c805F99D4133A89f07447d251",
    "bitcoinAddress": "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
    "stacksAddress": "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    "solanaAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "verificationStatus": "VERIFIED"
  },
  "detectedChain": "NEAR Protocol",
  "rail": "NEAR Native Consensus"
}
```

---

## 2. Directory Management: `POST /api/recipients`

Registers a new corporate vendor or payee with multi-chain destination wallet addresses.

### Request:
```http
POST /api/recipients HTTP/1.1
Content-Type: application/json

{
  "displayName": "Apex Media Agency",
  "paymentId": "apex-media",
  "walletAddress": "apex-media.testnet",
  "evmAddress": "0x71C8360f3a8b417c805F99D4133A89f07447d251",
  "stacksAddress": "ST1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
  "bitcoinAddress": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4",
  "notes": "Marketing and public relations agency."
}
```

### Response (`200 OK`):
```json
{
  "success": true,
  "recipient": {
    "id": "rec-apex-media-1731411200",
    "displayName": "Apex Media Agency",
    "paymentId": "apex-media",
    "walletAddress": "apex-media.testnet",
    "verificationStatus": "VERIFIED"
  }
}
```

---

## 3. Invoice Management: `GET /api/invoices` & `POST /api/invoices`

### `GET /api/invoices`
Fetches existing invoices with optional filtering by status (`ALL`, `PENDING`, `PAID`).

#### Query Parameters:
- `status`: Optional filter string (`PENDING` | `PAID`).

#### Response (`200 OK`):
```json
{
  "invoices": [
    {
      "id": "cm3e...",
      "invoiceNumber": "INV-2026-9042",
      "recipientName": "Acme Web3 Design Studio",
      "recipientAddress": "acme-design.testnet",
      "amount": 75.0,
      "token": "NEAR",
      "status": "PENDING",
      "dueDate": "2026-11-20",
      "createdAt": "2026-11-12T10:00:00.000Z"
    }
  ]
}
```

### `POST /api/invoices`
Creates a new invoice record in PostgreSQL.

#### Request:
```json
{
  "invoiceNumber": "INV-2026-9042",
  "recipientName": "Acme Web3 Design Studio",
  "recipientAddress": "acme-design.testnet",
  "amount": 75.0,
  "token": "NEAR",
  "dueDate": "2026-11-20",
  "description": "UI/UX Brand Design & Frontend Systems"
}
```

---

## 4. Multimodal AI Extraction: `POST /api/ai/extract-invoice`

Processes an uploaded PDF, PNG, or JPEG invoice document using NEAR.AI Cloud / DeepSeek vision inference.

### Request (`multipart/form-data`):
- `file`: Binary file upload (PDF/PNG/JPG).
- `rawText`: Optional plain text document string.

### Response (`200 OK`):
```json
{
  "data": {
    "invoiceNumber": "INV-2026-9042",
    "recipientName": "Acme Web3 Design Studio",
    "recipientAddress": "acme-design.testnet",
    "amount": 75.0,
    "dueDate": "2026-11-20",
    "description": "UI/UX Brand Design & Frontend Systems"
  }
}
```

---

## 5. Autonomous AI Copilot: `POST /api/ai/assistant`

Powers the conversational AI agent, compiling payment intents, grounding responses in live database context, and preparing invoice settlements.

### Request:
```http
POST /api/ai/assistant HTTP/1.1
Content-Type: application/json

{
  "message": "Pay invoice INV-2026-9042 for 75 NEAR to Acme Design"
}
```

### Response (`200 OK`):
```json
{
  "reply": "**Invoice Prepared for On-Chain Settlement**:\n\n• **Invoice Identifier**: `INV-2026-9042`\n• **Beneficiary**: Acme Web3 Design Studio (`acme-design.testnet`)\n• **Total Sum**: **75 NEAR**\n• **Settlement Network**: NEAR Protocol (Native)\n• **Confirmation of Payee**: Verified On-Chain\n• **Treasury Guardrail**: ✓ Autonomous Limit Approved (< $250)\n\nClick **Apply & Pay Now** below to sign and complete settlement with your connected NEAR wallet.",
  "intent": {
    "rawPrompt": "Pay invoice INV-2026-9042 for 75 NEAR to Acme Design",
    "extractedAmount": 75.0,
    "extractedCurrency": "NEAR",
    "invoiceId": "cm3e...",
    "resolvedPayee": {
      "displayName": "Acme Web3 Design Studio",
      "accountId": "acme-design.testnet",
      "targetChainAddress": "acme-design.testnet",
      "verificationStatus": "VERIFIED"
    },
    "policyCheck": {
      "isAllowed": true,
      "autoExecutable": true
    }
  },
  "provider": "NEAR.AI Cloud (api.near.ai)"
}
```

---

## 6. Payment Settlement & Reconciliation: `POST /api/payments`

Logs finalized on-chain settlements, reconciles invoice records, and generates verifiable PDF receipts.

### Request:
```http
POST /api/payments HTTP/1.1
Content-Type: application/json

{
  "senderAddress": "treasury.testnet",
  "recipientAddress": "acme-design.testnet",
  "amount": 75.0,
  "tokenAddress": "native.near",
  "transactionHash": "8JbYAEA9oJP9ET3e5FtPzqfC2bPQo6EUnA57VtkJVakA",
  "invoiceId": "cm3e...",
  "invoiceReference": "INV-2026-9042",
  "network": "NEAR Protocol",
  "chainId": 0
}
```

### Response (`200 OK`):
```json
{
  "success": true,
  "payment": {
    "id": "pay-1731411200",
    "transactionHash": "8JbYAEA9oJP9ET3e5FtPzqfC2bPQo6EUnA57VtkJVakA",
    "amount": 75.0,
    "recipientAddress": "acme-design.testnet",
    "createdAt": "2026-11-12T10:15:00.000Z"
  }
}
```
