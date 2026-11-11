# PaySure AI — Native NEAR Smart Contract

This contract implements the **Confirmation of Payee (Anti-Spoofing Identity Registry)** and **Autonomous Invoice Settlement Rails** natively on **NEAR Protocol**.

---

## 🌟 Key Smart Contract Functions

### 1. `register_payee`
Registers an authenticated legal entity or contractor identity to a NEAR account.
```bash
near call <CONTRACT_ID> register_payee '{"paymentId": "acme-design", "legalName": "Acme Web3 Design Studio", "notes": "Ecosystem Partner"}' --accountId <YOUR_ACCOUNT>.testnet
```

### 2. `verify_payee` (View Function)
Performs Confirmation of Payee check against an account to prevent lookalike/typosquatting attacks.
```bash
near view <CONTRACT_ID> verify_payee '{"accountId": "acme-design.testnet", "expectedName": "Acme Web3 Design Studio"}'
```
**Returns:**
```json
{
  "status": "VERIFIED",
  "legalName": "Acme Web3 Design Studio",
  "isVerified": true,
  "reason": "Account 'acme-design.testnet' is verified and matches legal entity 'Acme Web3 Design Studio'."
}
```

### 3. `pay_invoice` (Payable)
Executes payment with attached NEAR deposit and binds it to an immutable invoice reference. Automatically protects against double-payment fraud.
```bash
near call <CONTRACT_ID> pay_invoice '{"recipientId": "acme-design.testnet", "invoiceReference": "INV-2026-9042"}' --deposit 50 --accountId <YOUR_ACCOUNT>.testnet
```

### 4. `is_invoice_settled` (View Function)
Checks if an invoice reference has already been settled on-chain.
```bash
near view <CONTRACT_ID> is_invoice_settled '{"invoiceReference": "INV-2026-9042"}'
```

---

## 🚀 How to Deploy to NEAR Testnet

### 1. Prerequisites
Install `near-cli` if not already installed:
```bash
npm install -g near-cli
```

### 2. Login to Your Testnet Account
```bash
near login
```

### 3. Build the Contract (TypeScript to Wasm)
```bash
cd contracts/near
npm install
npm run build
```

### 4. Deploy to Testnet
```bash
near deploy --accountId <YOUR_ACCOUNT>.testnet --wasmFile build/paysure_contract.wasm
```
Once deployed, set `NEXT_PUBLIC_NEAR_CONTRACT_ID="<YOUR_ACCOUNT>.testnet"` in your `.env`.

