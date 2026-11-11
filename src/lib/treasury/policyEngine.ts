/**
 * PaySure AI Treasury & Security Guardrails Policy Engine
 * 
 * Enforces human-defined constraints on autonomous AI spending:
 * - Single transaction limits
 * - 24-hour spending velocity caps
 * - Department budget allocations
 * - Autonomous auto-approval thresholds for verified counterparties
 * - Counterparty trust & reputation scoring (0-100)
 */

export interface TreasuryPolicy {
  maxSingleTxAmountUSD: number; // e.g. $250.00
  dailyVelocityCapUSD: number; // e.g. $1,000.00
  autoApproveVerifiedUnderUSD: number; // e.g. $50.00
  emergencyKillswitchActive: boolean;
  departmentBudgets: {
    category: string;
    monthlyBudgetUSD: number;
    spentThisMonthUSD: number;
  }[];
}

export interface PolicyEvaluationResult {
  isAllowed: boolean;
  requiresHumanSignoff: boolean;
  autoExecutable: boolean;
  violations: string[];
  warnings: string[];
  reputationScore: number;
  riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

// Default human-defined business constraints
export const DEFAULT_TREASURY_POLICY: TreasuryPolicy = {
  maxSingleTxAmountUSD: 250,
  dailyVelocityCapUSD: 1000,
  autoApproveVerifiedUnderUSD: 50,
  emergencyKillswitchActive: false,
  departmentBudgets: [
    { category: "Engineering & Audits", monthlyBudgetUSD: 3000, spentThisMonthUSD: 1250 },
    { category: "Design & UX", monthlyBudgetUSD: 1500, spentThisMonthUSD: 750 },
    { category: "Operations & Freelance", monthlyBudgetUSD: 1000, spentThisMonthUSD: 320 },
    { category: "Marketing & Growth", monthlyBudgetUSD: 800, spentThisMonthUSD: 200 },
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
  spentInLast24hUSD: number = 180
): PolicyEvaluationResult {
  const violations: string[] = [];
  const warnings: string[] = [];

  // 1. Emergency Killswitch
  if (policy.emergencyKillswitchActive) {
    violations.push("Treasury emergency killswitch is ACTIVE. All autonomous spending is frozen.");
  }

  // 2. Single Transaction Limit
  if (amountUSD > policy.maxSingleTxAmountUSD) {
    violations.push(
      `Amount ($${amountUSD.toFixed(2)}) exceeds maximum single transaction limit of $${policy.maxSingleTxAmountUSD.toFixed(2)}.`
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

  const isAllowed = violations.length === 0;

  // Auto-Executable criteria:
  // Must be verified, score >= 80, amount <= autoApproveVerifiedUnderUSD, and zero violations
  const autoExecutable =
    isAllowed &&
    verificationStatus === "VERIFIED" &&
    reputationScore >= 80 &&
    amountUSD <= policy.autoApproveVerifiedUnderUSD &&
    warnings.length === 0;

  const requiresHumanSignoff = !autoExecutable;

  const riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
    verificationStatus === "MISMATCH" || violations.length > 0 ? "CRITICAL" :
    reputationScore < 65 || warnings.length > 0 ? "HIGH" :
    amountUSD > policy.autoApproveVerifiedUnderUSD ? "MEDIUM" : "LOW";

  return {
    isAllowed,
    requiresHumanSignoff,
    autoExecutable,
    violations,
    warnings,
    reputationScore,
    riskTier,
  };
}

