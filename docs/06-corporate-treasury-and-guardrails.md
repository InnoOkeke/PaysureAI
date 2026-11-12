# 06 — Corporate Treasury Governance & Guardrails

## Overview

Corporate Web3 treasuries cannot rely on single-operator discretion or unconstrained autonomous agents. High-velocity disbursements must be constrained by rigorous, deterministic spending policies, velocity ceilings, and governance escalation protocols.

PaySure AI embeds an **Autonomous Treasury Policy Engine** and **Multi-Sig Governance Layer** directly into every payment flow.

---

## Policy Engine Architecture

```
[Payment Proposal] (Amount, Beneficiary, Category)
         │
         ▼
┌────────────────────────────────────────────────────────┐
│                 TREASURY POLICY ENGINE                 │
│                                                        │
│  1. Single-Transaction Ceiling Check                   │
│     Is Amount <= $250.00 USD?                          │
│                                                        │
│  2. Daily Velocity Accumulator Check                   │
│     Does Current Day Spend + Amount <= Ceiling?        │
│                                                        │
│  3. Counterparty Risk & Reputation Scoring             │
│     Is Reputation Score >= 60 / 100?                   │
│                                                        │
│  4. Confirmation of Payee Attestation Tier             │
│     Is Status == VERIFIED?                             │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
    [ALL CHECKS PASS]               [POLICY BREACH]
   ✓ Autonomous Execution          ⚠ Escalation Protocol
   Single signature releases       Mandatory SputnikDAO / Trezu
   capital immediately             multi-signature sign-off
```

---

## Policy Parameters & Limits

| Guardrail Rule | Threshold Limit | Action on Breach |
| :--- | :--- | :--- |
| **Autonomous Single-Tx Ceiling** | $250.00 USD (or ~100 NEAR) | Mandates executive secondary approval. |
| **Dual-Approval Ceiling** | > $500.00 USD | Blocks autonomous execution; escalates to SputnikDAO multi-sig council. |
| **Daily Velocity Ceiling** | $1,000.00 USD / 24h rolling | Halts all disbursements until the next rolling epoch. |
| **Minimum Counterparty Trust Score** | 60 / 100 | Flags transaction with elevated risk advisory. |
| **Emergency Circuit Breaker** | OutLayer Agent Flag | Freezes automated settlement rails globally in the event of upstream anomaly. |

---

## Counterparty Reputation Scoring Formula

PaySure AI deterministically evaluates the risk tier of every counterparty using a weighted reputation formula:

$$\text{Reputation Score} = \text{Base} + \text{AttestationWeight} + \text{TxVolumeWeight} + \text{PartnerBonus} - \text{Penalty}$$

### Scoring Components:
- **Base Score**: 35 points (unverified baseline).
- **KYC Verification Attestation**:
  - `VERIFIED`: $+40$ points
  - `WARNING`: $-20$ points
  - `UNVERIFIED`: $+0$ points
  - `MISMATCH`: $-50$ points (Critical Red Flag)
- **Historical Transaction Frequency**:
  - $> 10$ prior settlements: $+15$ points
  - $5 - 10$ prior settlements: $+10$ points
  - $1 - 4$ prior settlements: $+5$ points
  - Novel Counterparty ($0$ prior settlements): $+0$ points
- **Official Ecosystem Partner Status**: $+10$ points

A score of **$\ge 80$** is classified as **Tier-1 Prime**, $\mathbf{60 - 79}$ as **Standard Commercial**, and $\mathbf{< 60}$ as **Elevated Risk**.

---

## Multi-Sig Governance Escalation (SputnikDAO & Trezu)

When a proposed payment exceeds the autonomous ceiling (e.g. an institutional transfer of $5,000 USD):
1. **Automated Hold**: The transaction is intercepted before on-chain dispatch.
2. **Proposal Submission**: An on-chain proposal is published to the organization's **SputnikDAO contract** (`paysure-council.sputnik-dao.testnet`).
3. **Multi-Stakeholder Sign-Off**: Treasury officers must log into their respective DAO voting interfaces (or Trezu multi-sig dashboard) to review the CoP attestation and cast their approval votes.
4. **Execution Release**: Once the threshold voting quorum ($M$-of-$N$) is satisfied on NEAR, the smart contract releases the funds to the beneficiary or cross-chain solver rail.
