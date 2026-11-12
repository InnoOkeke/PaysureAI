import { describe, expect, it } from "vitest";
import { OutlayerService } from "../src/treasury/outlayer.service";
import { SputnikDaoService } from "../src/treasury/sputnik-dao.service";
import { TreasuryService } from "../src/treasury/treasury.service";
import { loadConfig } from "../src/config/env";

const config = loadConfig({
  DATABASE_URL: "postgres://localhost:5432/paysure_test",
  SPUTNIK_DAO_CONTRACT: "paysure-council.sputnik-dao.testnet",
} as NodeJS.ProcessEnv);

const treasury = new TreasuryService(
  new OutlayerService(),
  new SputnikDaoService(config)
);

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
});
