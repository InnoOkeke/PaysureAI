# 07 — Wallet Balance Validation & Non-Custodial Safety

## Overview

Attempting to broadcast blockchain transactions with amounts exceeding the payer's available balance results in wasted user time, frustrating wallet RPC rejections, and confusing error codes. 

PaySure AI enforces **pre-flight, real-time balance validation across the entire application flow**, ensuring that action buttons are disabled and users are clearly warned before attempting an invalid transfer.

---

## Balance Retrieval & Normalization

PaySure AI retrieves account telemetry in real-time through the connected NEAR wallet context (`NearWalletContext.tsx`):

```typescript
const account = await near.account(accountId);
const balanceObj = await account.getAccountBalance();

// balanceObj.available is denominated in yoctoNEAR (24 decimals)
const formattedBalance = (
  parseFloat(balanceObj.available) / 1e24
).toFixed(2);

setBalance(formattedBalance);
```

The normalized balance is distributed via React Context to all platform interfaces: `/pay`, `/invoices`, `/invoices/new`, `/invoices/upload`, and `FloatingCopilot`.

---

## 4-Tier Balance Validation Enforced Across the Platform

```
┌─────────────────────────────────────────────────────────────┐
│                 PAYMENT INTENT / INVOICE SUM                │
│                           amount                            │
└──────────────────────────────┬──────────────────────────────┘
                               │
                amount > parseFloat(balance) ?
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
        [YES: DEFICIT]                       [NO: VALID]
  1. Highlight input in red           1. Standard styling
  2. Display deficit notice           2. Button active
  3. Grey out & disable button        3. Permitted to review/sign
```

### 1. Payment Terminal Step 1 (`/pay` Details Form)
- **Input State**: If `parseFloat(amount) > parseFloat(balance)`, the input field applies a crimson alert border (`border-rose-500/70 bg-rose-950/20 text-rose-200`).
- **Deficit Notice**: Renders an alert message immediately below the input:
  > *"Insufficient balance: You have X NEAR, but you entered Y NEAR."*
- **Submit Action**: The **"Review & Verify Recipient"** button is **greyed out and disabled** (`disabled:cursor-not-allowed`) with the label **"Insufficient Balance"**.

### 2. Payment Terminal Step 2 (`/pay` Review & Sign)
- **Review Banner**: Renders an *"Insufficient Account Balance"* notice warning the user before attempting to invoke wallet popups.
- **Signing Actions**: Both **"Sign & Transfer"** and **"MyNearWallet Web"** buttons are disabled (`disabled:opacity-40 disabled:cursor-not-allowed`), preventing invalid RPC broadcasts.

### 3. Invoices Management (`/invoices` & `/invoices/new`)
- **New Invoice Form**: Displays the connected wallet balance beside the amount field. If the creator plans to "Save & Proceed to Pay" with an amount exceeding balance, the button is disabled.
- **Invoice Directory**: Pending invoices exceeding wallet balance display an inline tag:
  > `Exceeds Balance (X NEAR available)`

### 4. Floating AI Copilot (`FloatingCopilot.tsx`)
- When the Copilot compiles an intent, it evaluates the connected wallet balance.
- If the required transfer sum exceeds available funds, the interactive card highlights `Wallet Balance: X NEAR (Insufficient)` and greys out the **"Apply & Pay Now"** button.

---

## The Non-Custodial Security Model

PaySure AI operates strictly under a **zero-trust, non-custodial custody model**:

1. **Zero Private Key Exposure**: PaySure servers never store, receive, or process private keys, passphrases, or seed phrases. 
2. **Client-Side Payload Assembly**: All transaction payloads (whether native NEAR or Model A cross-chain intents) are assembled in the browser memory.
3. **Hardware & Wallet Isolation**: Cryptographic signatures are authorized exclusively through external, user-controlled wallets (MyNearWallet, Meteor, Ledger, or Trezor).
4. **Verifiable Auditability**: Every transaction receipt records the NEAR block height, transaction hash, and timestamp, linking directly to public explorers for permanent regulatory verification.
