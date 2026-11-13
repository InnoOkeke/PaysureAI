# 02 — Multi-Chain Settlement & Cross-Chain Bridging

## Overview

Enterprises and contractors work across heterogeneous blockchain environments. An agency may demand payment in **STX on Stacks**, a smart contract auditor may invoice in **ETH on Base**, and a marketing vendor may request **SOL on Solana**.

PaySure AI implements a unified **Dual-Model Cross-Chain Settlement Architecture** powered by **NEAR Protocol’s Chain Abstraction stack**:
- **Model A**: Intent-Driven Cross-Chain Settlement & Solver Rail (Zero friction for external vendors).
- **Model B**: Decentralized Threshold Multi-Party Computation (MPC) Chain Signatures (`v1.signer-prod.testnet`).

---

## Model A vs. Model B Comparison

| Feature | Model A: Intent Solver Rail | Model B: Threshold MPC Signatures |
| :--- | :--- | :--- |
| **Primary Use Case** | Paying vendors who already have existing wallets on external chains. | Direct, non-custodial multi-chain control from a NEAR account. |
| **Vendor Requirement**| **Zero NEAR setup**: Vendor receives native assets in their existing wallet. | Requires payer to manage derived multi-chain signer accounts. |
| **Supported Chains** | Stacks (L2), Solana, Ripple (XRP), Cosmos, Stellar, Base, Arbitrum. | Ethereum, Base, Arbitrum, Bitcoin (Native). |
| **Execution Mechanism** | Payer locks NEAR in settlement contract; solvers fulfill on destination chain. | NEAR validator nodes collectively sign external raw transactions via ECDSA/Ed25519. |
| **Gas Responsibility** | Payer settles all cross-chain fees in NEAR; vendor pays 0 gas. | Gas is relayed or derived through NEAR MPC network. |

---

## Supported Blockchain Matrix

PaySure AI provides native destination routing across 8 major blockchain ecosystems:

| Ecosystem | Address Pattern | Supported Rail | Settlement Asset | Testnet Format |
| :--- | :--- | :--- | :--- | :--- |
| **NEAR Protocol** | `*.near`, `*.testnet` | Native Nightshade 2.0 | NEAR / USDC | `*.testnet` |
| **Base / Ethereum / Arbitrum** | `0x[a-fA-F0-9]{40}` | Model A Solver / Model B MPC | ETH / USDC | `0x...` |
| **Bitcoin** | `bc1...`, `1...`, `3...` | Model B MPC / Intent Rail | BTC Native | `tb1...`, `m...`, `n...` |
| **Stacks (Bitcoin L2)** | `SP...` (Mainnet), `ST...` (Testnet) | Model A Solver Rail | STX Native | `ST[a-zA-Z0-9]{28,42}` |
| **Solana** | Base58 (32–44 characters) | Model A Solver Rail | SOL / USDC | Devnet Base58 |
| **Ripple (XRP)** | `r[1-9A-HJ-NP-Za-km-z]{24,34}` | Model A Solver Rail | XRP Native | Testnet `r...` |
| **Cosmos Hub** | `cosmos1[a-z0-9]{38,45}` | Model A Solver Rail | ATOM Native | `cosmos1...` |
| **Stellar** | `G[A-Z2-7]{55}` | Model A Solver Rail | XLM Native | Testnet `G...` |

---

## The Step-by-Step Model A Settlement Flow

When an organization authorizes a cross-chain transfer (e.g., *"Send 50 NEAR to LeProf on Stacks"*):

```
[1. Sender Initiates Transfer] 
  • Payer selects "Stacks (L2)" or types intent in /pay
  • PaySure resolves LeProf's Stacks testnet address (ST1P72Z...)
  • Confirmation of Payee verifies identity
         │
         ▼
[2. Wallet Authorization on NEAR]
  • Payer clicks "Sign & Transfer"
  • MyNearWallet / Meteor popup requests cryptographic approval
  • Attached deposit = exact sum (e.g. 50 NEAR converted to yoctoNEAR)
         │
         ▼
[3. Contract Escrow & Intent Publication]
  • Funds are locked on NEAR in v1.signer-prod.testnet
  • Transaction receipt generates an immutable on-chain event log
         │
         ▼
[4. Decentralized Solver Execution]
  • Cross-chain solvers detect the on-chain lock proof on NEAR
  • Solver executes a transfer on Stacks L2 releasing 50 STX to ST1P72Z...
         │
         ▼
[5. Settlement Finalization & Audit Hash]
  • Destination block hash is bound to the NEAR transaction hash
  • PaySure reconciles invoice status to PAID and issues PDF receipt
```

---

## Attached Deposit Mechanics (The yoctoNEAR Fix)

In NEAR smart contracts, calls that transfer value must attach a non-zero deposit in **yoctoNEAR** ($1\text{ NEAR} = 10^{24}\text{ yoctoNEAR}$).

### The Bug in Standard Implementations:
If a frontend hardcodes `BigInt("1")` (1 yoctoNEAR) as the attached deposit, the blockchain explorer (NearBlocks) formats the transaction as `0 NEAR Deposit`, even if parameters specify 50 NEAR.

### PaySure AI's Deterministic Conversion:
```typescript
import { parseNearAmount } from "near-api-js/lib/utils/format";

// Convert user amount (e.g. "50.0") to exact 24-decimal yoctoNEAR string
const depositYocto = parseNearAmount(amount) || "0";

// Attach the full parsed value to the function call
await wallet.signAndSendTransaction({
  receiverId: "v1.signer-prod.testnet",
  actions: [
    actionCreators.functionCall(
      "sign_cross_chain_intent",
      {
        target_chain: "Stacks",
        target_address: recipient,
        memo: invoiceReference
      },
      BigInt("300000000000000"), // 300 TGas
      BigInt(depositYocto || "1")  // Exact attached deposit
    )
  ]
});
```

This guarantees that explorers display the genuine transferred volume while maintaining non-custodial integrity.

