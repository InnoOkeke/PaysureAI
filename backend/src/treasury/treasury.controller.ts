import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { TreasuryService } from "./treasury.service";

const budgetSchema = z.object({
  category: z.string().min(1),
  monthlyBudgetUSD: z.coerce.number().nonnegative(),
  spentThisMonthUSD: z.coerce.number().nonnegative().default(0),
});

const evaluateSchema = z.object({
  accountId: z.string().optional(),
  amountUSD: z.coerce.number().nonnegative(),
  category: z.string().default("Operations & Freelance"),
  reputationScore: z.coerce.number().min(0).max(100).default(50),
  verificationStatus: z
    .enum(["VERIFIED", "WARNING", "UNVERIFIED", "MISMATCH"])
    .default("UNVERIFIED"),
  recipientAddress: z.string().default("recipient.testnet"),
  senderAddress: z.string().default("user.testnet"),
  spentInLast24hUSD: z.coerce.number().nonnegative().optional(),
});

const policyUpdateSchema = z.object({
  accountId: z.string().min(1),
  maxSingleTxAmountUSD: z.coerce.number().positive().optional(),
  dailyVelocityCapUSD: z.coerce.number().positive().optional(),
  autoApproveVerifiedUnderUSD: z.coerce.number().nonnegative().optional(),
  emergencyKillswitchActive: z.boolean().optional(),
  sputnikDaoContract: z.string().min(1).optional(),
  departmentBudgets: z.array(budgetSchema).optional(),
});

const killswitchSchema = z.object({
  accountId: z.string().min(1),
  active: z.boolean(),
});

@Controller("treasury")
export class TreasuryController {
  constructor(private readonly treasury: TreasuryService) {}

  @Get("policy")
  async getPolicy(@Query("accountId") accountId?: string) {
    const policy = await this.treasury.getPolicyForAccount(accountId);
    const velocity = accountId ? await this.treasury.getVelocity(accountId) : null;
    return { success: true, policy, velocity };
  }

  @Post("policy")
  async savePolicy(
    @Body(new ZodValidationPipe(policyUpdateSchema)) body: z.infer<typeof policyUpdateSchema>
  ) {
    const { accountId, ...update } = body;
    const policy = await this.treasury.upsertPolicy(accountId, update);
    return { success: true, policy };
  }

  @Post("killswitch")
  async killswitch(
    @Body(new ZodValidationPipe(killswitchSchema)) body: z.infer<typeof killswitchSchema>
  ) {
    const policy = await this.treasury.setKillswitch(body.accountId, body.active);
    return { success: true, policy };
  }

  @Get("velocity")
  async velocity(@Query("accountId") accountId: string) {
    const velocity = await this.treasury.getVelocity(accountId);
    return { success: true, velocity };
  }

  @Post("evaluate")
  async evaluate(
    @Body(new ZodValidationPipe(evaluateSchema)) body: z.infer<typeof evaluateSchema>
  ) {
    if (body.accountId) {
      const result = await this.treasury.evaluateForAccount(
        body.accountId,
        body.amountUSD,
        body.category,
        body.reputationScore,
        body.verificationStatus,
        body.recipientAddress
      );
      return { success: true, ...result };
    }

    const evaluation = this.treasury.evaluatePayment(
      body.amountUSD,
      body.category,
      body.reputationScore,
      body.verificationStatus,
      this.treasury.defaultPolicy,
      body.spentInLast24hUSD ?? 0,
      body.recipientAddress,
      body.senderAddress
    );
    return { success: true, evaluation };
  }
}
