import { describe, expect, it } from "vitest";
import { OutlayerService } from "../src/treasury/outlayer.service";
import { SputnikDaoService } from "../src/treasury/sputnik-dao.service";
import { TreasuryService } from "../src/treasury/treasury.service";
import { loadConfig } from "../src/config/env";

const config = loadConfig({
  DATABASE_URL: "postgres://localhost:5432/paysure_test",
  SPUTNIK_DAO_CONTRACT: "paysure-council.sputnik-dao.testnet",
} as NodeJS.ProcessEnv);

const near = { nearUsdRate: 5 } as never;

function buildTreasury(prisma: unknown = {}) {
  return new TreasuryService(
    new OutlayerService(),
    new SputnikDaoService(config),
    prisma as never,
    near
  );
}

const treasury = buildTreasury();

describe("TreasuryService", () => {
  it("auto-approves a verified low-value payment", () => {
    const result = treasury.evaluatePayment(75, "Operations & Freelance", 100, "VERIFIED");

    expect(result.isAllowed).toBe(true);
    expect(result.autoExecutable).toBe(true);
    expect(result.requiresHumanSignoff).toBe(false);
  });

  it("escalates a payment above the single-transaction limit", () => {
    const result = treasury.evaluatePayment(600, "Operations & Freelance", 100, "VERIFIED");

    expect(result.isAllowed).toBe(false);
    expect(result.requiresSputnikDaoEscalation).toBe(true);
    expect(result.violations.join(" ")).toContain("maximum single transaction");
    expect(result.sputnikDaoProposal).toBeDefined();
  });

  it("blocks a payee mismatch", () => {
    const result = treasury.evaluatePayment(50, "Operations & Freelance", 20, "MISMATCH");

    expect(result.isAllowed).toBe(false);
    expect(result.riskTier).toBe("CRITICAL");
    expect(result.violations.join(" ")).toContain("FRAUD");
  });

  it("computes rolling 24h velocity in USD", async () => {
    const prisma = {
      payment: {
        findMany: async () => [
          { amount: 10, tokenAddress: "native.near" },
          { amount: 25, tokenAddress: "usdc.fakes.testnet" },
        ],
      },
    };
    const service = buildTreasury(prisma);

    const velocity = await service.getVelocity("realdezzy.testnet");

    expect(velocity.spentUSD).toBe(75);
    expect(velocity.paymentCount).toBe(2);
    expect(velocity.windowHours).toBe(24);
  });

  it("uses a persisted killswitch when evaluating an account policy", async () => {
    const prisma = {
      treasuryPolicy: {
        findUnique: async () => ({
          maxSingleTxAmountUSD: 500,
          dailyVelocityCapUSD: 2500,
          autoApproveVerifiedUnderUSD: 100,
          emergencyKillswitchActive: true,
          sputnikDaoContract: "paysure-council.sputnik-dao.testnet",
          departmentBudgets: [],
        }),
      },
      payment: { findMany: async () => [] },
    };
    const service = buildTreasury(prisma);

    const { evaluation } = await service.evaluateForAccount(
      "realdezzy.testnet",
      50,
      "Operations & Freelance",
      100,
      "VERIFIED"
    );

    expect(evaluation.isAllowed).toBe(false);
    expect(evaluation.violations.join(" ")).toContain("killswitch");
  });
});
