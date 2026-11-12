import { Injectable } from "@nestjs/common";
import { Prisma, TreasuryPolicy as TreasuryPolicyRow } from "@prisma/client";
import { NearService } from "../near/near.service";
import { PrismaService } from "../prisma/prisma.service";
import { OutlayerAttestation, OutlayerService } from "./outlayer.service";
import { SputnikDaoService } from "./sputnik-dao.service";

export interface DepartmentBudget {
  category: string;
  monthlyBudgetUSD: number;
  spentThisMonthUSD: number;
}

export interface TreasuryPolicy {
  maxSingleTxAmountUSD: number;
  dailyVelocityCapUSD: number;
  autoApproveVerifiedUnderUSD: number;
  emergencyKillswitchActive: boolean;
  sputnikDaoContract: string;
  departmentBudgets: DepartmentBudget[];
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
  sputnikDaoProposal?: ReturnType<SputnikDaoService["buildTransferProposal"]>;
}

export interface VelocitySnapshot {
  spentUSD: number;
  paymentCount: number;
  windowHours: number;
}

export interface PolicyUpdate {
  maxSingleTxAmountUSD?: number;
  dailyVelocityCapUSD?: number;
  autoApproveVerifiedUnderUSD?: number;
  emergencyKillswitchActive?: boolean;
  sputnikDaoContract?: string;
  departmentBudgets?: DepartmentBudget[];
}

export const DEFAULT_TREASURY_POLICY: TreasuryPolicy = {
  maxSingleTxAmountUSD: 500,
  dailyVelocityCapUSD: 2500,
  autoApproveVerifiedUnderUSD: 100,
  emergencyKillswitchActive: false,
  sputnikDaoContract: "paysure-council.sputnik-dao.testnet",
  departmentBudgets: [
    { category: "Engineering & Audits", monthlyBudgetUSD: 5000, spentThisMonthUSD: 1450 },
    { category: "Design & UX", monthlyBudgetUSD: 2500, spentThisMonthUSD: 850 },
    { category: "Operations & Freelance", monthlyBudgetUSD: 2000, spentThisMonthUSD: 420 },
    { category: "Marketing & Growth", monthlyBudgetUSD: 1500, spentThisMonthUSD: 300 },
  ],
};

@Injectable()
export class TreasuryService {
  constructor(
    private readonly outlayer: OutlayerService,
    private readonly sputnikDao: SputnikDaoService,
    private readonly prisma: PrismaService,
    private readonly near: NearService
  ) {}

  get defaultPolicy(): TreasuryPolicy {
    return {
      ...DEFAULT_TREASURY_POLICY,
      sputnikDaoContract: this.sputnikDao.defaultDaoContract,
      departmentBudgets: DEFAULT_TREASURY_POLICY.departmentBudgets.map((budget) => ({ ...budget })),
    };
  }

  async getPolicyForAccount(accountId?: string): Promise<TreasuryPolicy> {
    if (!accountId) return this.defaultPolicy;

    const row = await this.prisma.treasuryPolicy.findUnique({
      where: { accountId: accountId.toLowerCase() },
    });

    return row ? this.mapPolicy(row) : this.defaultPolicy;
  }

  async upsertPolicy(accountId: string, update: PolicyUpdate): Promise<TreasuryPolicy> {
    const cleanAccountId = accountId.toLowerCase();
    const existing = await this.prisma.treasuryPolicy.findUnique({
      where: { accountId: cleanAccountId },
    });
    const base = existing ? this.mapPolicy(existing) : this.defaultPolicy;
    const merged: TreasuryPolicy = {
      ...base,
      ...update,
      departmentBudgets: update.departmentBudgets ?? base.departmentBudgets,
      sputnikDaoContract: update.sputnikDaoContract ?? base.sputnikDaoContract,
    };

    const data = {
      maxSingleTxAmountUSD: merged.maxSingleTxAmountUSD,
      dailyVelocityCapUSD: merged.dailyVelocityCapUSD,
      autoApproveVerifiedUnderUSD: merged.autoApproveVerifiedUnderUSD,
      emergencyKillswitchActive: merged.emergencyKillswitchActive,
      sputnikDaoContract: merged.sputnikDaoContract,
      departmentBudgets: merged.departmentBudgets as unknown as Prisma.InputJsonValue,
    };

    const saved = await this.prisma.treasuryPolicy.upsert({
      where: { accountId: cleanAccountId },
      create: { accountId: cleanAccountId, ...data },
      update: data,
    });

    return this.mapPolicy(saved);
  }

  async setKillswitch(accountId: string, active: boolean): Promise<TreasuryPolicy> {
    return this.upsertPolicy(accountId, { emergencyKillswitchActive: active });
  }

  async getVelocity(accountId: string, windowHours = 24): Promise<VelocitySnapshot> {
    const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
    const payments = await this.prisma.payment.findMany({
      where: {
        senderAddress: accountId.toLowerCase(),
        status: "SUCCESS",
        createdAt: { gte: since },
      },
    });

    const spentUSD = payments.reduce((total, payment) => {
      const isStable = /usd/i.test(payment.tokenAddress);
      return total + (isStable ? payment.amount : payment.amount * this.near.nearUsdRate);
    }, 0);

    return {
      spentUSD: Number(spentUSD.toFixed(2)),
      paymentCount: payments.length,
      windowHours,
    };
  }

  async evaluateForAccount(
    accountId: string,
    amountUSD: number,
    category: string,
    reputationScore: number,
    verificationStatus: string,
    recipientAddress = "recipient.testnet"
  ) {
    const [policy, velocity] = await Promise.all([
      this.getPolicyForAccount(accountId),
      this.getVelocity(accountId),
    ]);

    const evaluation = this.evaluatePayment(
      amountUSD,
      category,
      reputationScore,
      verificationStatus,
      policy,
      velocity.spentUSD,
      recipientAddress,
      accountId
    );

    return { evaluation, policy, velocity };
  }

  calculateReputationScore(recipient: {
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

  evaluatePayment(
    amountUSD: number,
    category: string,
    reputationScore: number,
    verificationStatus: string,
    policy: TreasuryPolicy = this.defaultPolicy,
    spentInLast24hUSD = 0,
    recipientAddress = "recipient.testnet",
    senderAddress = "user.testnet"
  ): PolicyEvaluationResult {
    const violations: string[] = [];
    const warnings: string[] = [];

    if (policy.emergencyKillswitchActive) {
      violations.push("Treasury emergency killswitch is ACTIVE. All autonomous spending is frozen.");
    }

    const exceedsSingleTx = amountUSD > policy.maxSingleTxAmountUSD;
    if (exceedsSingleTx) {
      violations.push(
        `Amount ($${amountUSD.toFixed(2)}) exceeds maximum single transaction limit of $${policy.maxSingleTxAmountUSD.toFixed(2)}. Escalating to SputnikDAO council multi-sig.`
      );
    }

    if (spentInLast24hUSD + amountUSD > policy.dailyVelocityCapUSD) {
      violations.push(
        `Payment would exceed 24-hour velocity cap of $${policy.dailyVelocityCapUSD.toFixed(2)} (Spent: $${spentInLast24hUSD.toFixed(2)}).`
      );
    }

    const dept = policy.departmentBudgets.find(
      (entry) => entry.category.toLowerCase() === category.toLowerCase()
    );
    if (dept && dept.spentThisMonthUSD + amountUSD > dept.monthlyBudgetUSD) {
      warnings.push(
        `Payment exceeds monthly budget allocation for '${dept.category}' ($${dept.monthlyBudgetUSD.toFixed(2)}).`
      );
    }

    if (verificationStatus === "MISMATCH") {
      violations.push("CRITICAL FRAUD ALERT: Recipient identity does not match invoice profile!");
    } else if (verificationStatus === "UNVERIFIED" || reputationScore < 60) {
      warnings.push("Unregistered or low-reputation counterparty. Extra verification required.");
    }

    const outlayerAttestation = this.outlayer.evaluate({
      senderAddress,
      recipientAddress,
      amountUSD,
      token: "NEAR",
      intent: `Transfer ${amountUSD} USD to ${recipientAddress} for ${category}`,
    });

    const requiresSputnikDaoEscalation =
      exceedsSingleTx || outlayerAttestation.recommendation === "REQUIRE_MULTISIG";

    const sputnikDaoProposal = requiresSputnikDaoEscalation
      ? this.sputnikDao.buildTransferProposal({
          daoContract: policy.sputnikDaoContract,
          description: `Payment of $${amountUSD.toFixed(2)} to ${recipientAddress} for ${category}`,
          receiverId: recipientAddress,
          amountNear: (amountUSD / 5).toFixed(2),
        })
      : undefined;

    const isAllowed = violations.length === 0;

    const autoExecutable =
      isAllowed &&
      verificationStatus === "VERIFIED" &&
      reputationScore >= 80 &&
      amountUSD <= policy.autoApproveVerifiedUnderUSD &&
      warnings.length === 0 &&
      outlayerAttestation.compliant;

    const requiresHumanSignoff = !autoExecutable;

    const riskTier: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" =
      verificationStatus === "MISMATCH" || violations.length > 0
        ? "CRITICAL"
        : reputationScore < 65 || warnings.length > 0
          ? "HIGH"
          : amountUSD > policy.autoApproveVerifiedUnderUSD
            ? "MEDIUM"
            : "LOW";

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

  private mapPolicy(row: TreasuryPolicyRow): TreasuryPolicy {
    const budgets = Array.isArray(row.departmentBudgets)
      ? (row.departmentBudgets as unknown as DepartmentBudget[])
      : this.defaultPolicy.departmentBudgets;

    return {
      maxSingleTxAmountUSD: row.maxSingleTxAmountUSD,
      dailyVelocityCapUSD: row.dailyVelocityCapUSD,
      autoApproveVerifiedUnderUSD: row.autoApproveVerifiedUnderUSD,
      emergencyKillswitchActive: row.emergencyKillswitchActive,
      sputnikDaoContract: row.sputnikDaoContract,
      departmentBudgets: budgets,
    };
  }
}
