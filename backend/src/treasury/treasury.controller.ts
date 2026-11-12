import { Body, Controller, Get, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { TreasuryService } from "./treasury.service";

const evaluateSchema = z.object({
  amountUSD: z.coerce.number().nonnegative(),
  category: z.string().default("Operations & Freelance"),
  reputationScore: z.coerce.number().min(0).max(100).default(50),
  verificationStatus: z
    .enum(["VERIFIED", "WARNING", "UNVERIFIED", "MISMATCH"])
    .default("UNVERIFIED"),
  recipientAddress: z.string().default("recipient.testnet"),
  senderAddress: z.string().default("user.testnet"),
  spentInLast24hUSD: z.coerce.number().nonnegative().default(340),
});

@Controller("treasury")
export class TreasuryController {
  constructor(private readonly treasury: TreasuryService) {}

  @Get("policy")
  getPolicy() {
    return { success: true, policy: this.treasury.defaultPolicy };
  }

  @Post("evaluate")
  evaluate(@Body(new ZodValidationPipe(evaluateSchema)) body: z.infer<typeof evaluateSchema>) {
    const evaluation = this.treasury.evaluatePayment(
      body.amountUSD,
      body.category,
      body.reputationScore,
      body.verificationStatus,
      this.treasury.defaultPolicy,
      body.spentInLast24hUSD,
      body.recipientAddress,
      body.senderAddress
    );
    return { success: true, evaluation };
  }
}
