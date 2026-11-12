/**
 * PaySure AI Treasury & Security Guardrails Policy Engine
 * 
 * Enforces human-defined constraints on autonomous AI spending:
 * - Single transaction limits ($500.00 USD)
 * - 24-hour spending velocity caps ($2,500.00 USD)
 * - Department budget allocations
 * - Autonomous auto-approval thresholds for verified counterparties (<= $100.00 USD)
 * - Counterparty trust & reputation scoring (0-100)
 * - SputnikDAO / Trezu Multi-Sig Escalation for high-value transfers
 * - OutLayer Agent Security attestation
 */

import { evaluateOutlayerPolicy, OutlayerAttestation } from "@/lib/security/outlayer";
import { buildSputnikTransferProposal, DEFAULT_SPUTNIK_DAO } from "./sputnikDao";

export interface TreasuryPolicy {
  maxSingleTxAmountUSD: number; // e.g. $500.00
  dailyVelocityCapUSD: number; // e.g. $2,500.00
  autoApproveVerifiedUnderUSD: number; // e.g. $100.00
  emergencyKillswitchActive: boolean;
  sputnikDaoContract: string;
  departmentBudgets: {
    category: string;
    monthlyBudgetUSD: number;
    spentThisMonthUSD: number;
  }[];
}

export interface PolicyEvaluationResult {
  isAllowed: boolean;
  requiresHumanSignoff: boolean;
  requiresSputnikDaoEscalation: boolean;
  autoExecutable: boolean;
  violations: string[];
  warnings: string[];
  reputationScore: number;
  riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  outlayerAttestation?: OutlayerAttestation;
  sputnikDaoProposal?: ReturnType<typeof buildSputnikTransferProposal>;
}

// Default human-defined business constraints
export const DEFAULT_TREASURY_POLICY: TreasuryPolicy = {
  maxSingleTxAmountUSD: 500,
  dailyVelocityCapUSD: 2500,
  autoApproveVerifiedUnderUSD: 100,
  emergencyKillswitchActive: false,
  sputnikDaoContract: DEFAULT_SPUTNIK_DAO,
  departmentBudgets: [
    { category: "Engineering & Audits", monthlyBudgetUSD: 5000, spentThisMonthUSD: 1450 },
    { category: "Design & UX", monthlyBudgetUSD: 2500, spentThisMonthUSD: 850 },
    { category: "Operations & Freelance", monthlyBudgetUSD: 2000, spentThisMonthUSD: 420 },
    { category: "Marketing & Growth", monthlyBudgetUSD: 1500, spentThisMonthUSD: 300 },
  ],
};

/**
 * Calculates counterparty reputation score (0 to 100)
 */
export function calculateReputationScore(recipient: {
  verificationStatus: string;
  transactionCount?: number;
  isOfficialPartner?: boolean;
}): number {
  let score = 50;

  if (recipient.verificationStatus === "VERIFIED") score += 35;
  if (recipient.verificationStatus === "WARNING") score -= 25;
  if (recipient.verificationStatus === "MISMATCH") score -= 50;
  if (recipient.verificationStatus === "UNVERIFIED") score -= 15;

  if (recipient.isOfficialPartner) score += 15;
  if ((recipient.transactionCount || 0) > 3) score += 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluates an intended payment against the business owner's policy constraints
 */
export function evaluatePaymentAgainstPolicy(
  amountUSD: number,
  category: string,
  reputationScore: number,
  verificationStatus: string,
  policy: TreasuryPolicy = DEFAULT_TREASURY_POLICY,
  spentInLast24hUSD: number = 340,
  recipientAddress: string = "recipient.testnet",
  senderAddress: string = "user.testnet"
): PolicyEvaluationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // 1. Emergency Killswitch
  if (policy.emergencyKillswitchActive) {
    violations.push("Treasury emergency killswitch is ACTIVE. All autonomous spending is frozen.");
  }

  // 2. Single Transaction Limit
  const exceedsSingleTx = amountUSD > policy.maxSingleTxAmountUSD;
  if (exceedsSingleTx) {
    violations.push(
      `Amount ($${amountUSD.toFixed(2)}) exceeds maximum single transaction limit of $${policy.maxSingleTxAmountUSD.toFixed(2)}. Escalating to SputnikDAO council multi-sig.`
    );
  }

  // 3. Daily Velocity Cap
  if (spentInLast24hUSD + amountUSD > policy.dailyVelocityCapUSD) {
    violations.push(
      `Payment would exceed 24-hour velocity cap of $${policy.dailyVelocityCapUSD.toFixed(2)} (Spent: $${spentInLast24hUSD.toFixed(2)}).`
    );
  }

  // 4. Department Budget Limit
  const dept = policy.departmentBudgets.find((d) => d.category.toLowerCase() === category.toLowerCase());
  if (dept && dept.spentThisMonthUSD + amountUSD > dept.monthlyBudgetUSD) {
    warnings.push(
      `Payment exceeds monthly budget allocation for '${dept.category}' ($${dept.monthlyBudgetUSD.toFixed(2)}).`
    );
  }

  // 5. Verification & Reputation Check
  if (verificationStatus === "MISMATCH") {
    violations.push("CRITICAL FRAUD ALERT: Recipient identity does not match invoice profile!");
  } else if (verificationStatus === "UNVERIFIED" || reputationScore < 60) {
    warnings.push("Unregistered or low-reputation counterparty. Extra verification required.");
  }

  // OutLayer Agent Security evaluation
  const outlayerAttestation = evaluateOutlayerPolicy({
    senderAddress,
    recipientAddress,
    amountUSD,
    token: "NEAR",
    intent: `Transfer ${amountUSD} USD to ${recipientAddress} for ${category}`,
  });

  const requiresSputnikDaoEscalation = exceedsSingleTx || outlayerAttestation.recommendation === "REQUIRE_MULTISIG";

  // Build SputnikDAO proposal payload if escalated
  let sputnikDaoProposal: ReturnType<typeof buildSputnikTransferProposal> | undefined;
  if (requiresSputnikDaoEscalation) {
    sputnikDaoProposal = buildSputnikTransferProposal({
      daoContract: policy.sputnikDaoContract,
      description: `Payment of $${amountUSD.toFixed(2)} to ${recipientAddress} for ${category}`,
      receiverId: recipientAddress,
      amountNear: (amountUSD / 5).toFixed(2), // Approximate NEAR value based on ~$5/NEAR
    });
  }

  const isAllowed = violations.length === 0;

  // Auto-Executable criteria:
  // Must be verified, score >= 80, amount <= autoApproveVerifiedUnderUSD, zero violations, and OutLayer approved
  const autoExecutable =
    isAllowed &&
    verificationStatus === "VERIFIED" &&
    reputationScore >= 80 &&
    amountUSD <= policy.autoApproveVerifiedUnderUSD &&
    warnings.length === 0 &&
    outlayerAttestation.compliant;

  const requiresHumanSignoff = !autoExecutable;

  const riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
    verificationStatus === "MISMATCH" || violations.length > 0 ? "CRITICAL" :
    reputationScore < 65 || warnings.length > 0 ? "HIGH" :
    amountUSD > policy.autoApproveVerifiedUnderUSD ? "MEDIUM" : "LOW";

  return {
    isAllowed,
    requiresHumanSignoff,
    requiresSputnikDaoEscalation,
    autoExecutable,
    violations,
    warnings,
    reputationScore,
    riskTier,
    outlayerAttestation,
    sputnikDaoProposal,
  };
}
