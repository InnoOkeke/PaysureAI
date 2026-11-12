import { Body, Controller, Get, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { PrismaService } from "../prisma/prisma.service";
import { NearService } from "../near/near.service";
import { IntentService } from "./intent.service";

const resolveSchema = z.object({
  prompt: z.string().min(1),
  senderAccount: z.string().default("company.near"),
});

const createIntentSchema = z.object({
  senderNearAccount: z.string().default("alice.testnet"),
  recipientAddress: z.string().min(1),
  paymentId: z.string().optional(),
  amount: z.coerce.number().positive(),
  tokenSymbol: z.string().default("NEAR"),
  invoiceReference: z.string().default("INTENT-REF"),
});

@Controller("near/intents")
export class IntentController {
  constructor(
    private readonly intents: IntentService,
    private readonly near: NearService,
    private readonly prisma: PrismaService
  ) {}

  @Post("resolve")
  async resolve(@Body(new ZodValidationPipe(resolveSchema)) body: z.infer<typeof resolveSchema>) {
    const result = await this.intents.resolve(body.prompt, body.senderAccount);

    if (result.resolved) {
      return {
        success: true,
        resolved: result.resolved,
        action: "pay",
      };
    }

    return {
      success: true,
      resolved: null,
      action: result.command?.action ?? "unknown",
      command: result.command ?? {
        action: "unknown",
        reason: "The backend could not parse this request.",
      },
    };
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createIntentSchema)) body: z.infer<typeof createIntentSchema>) {
    let verificationTier: "VERIFIED" | "WARNING" | "UNVERIFIED" | "MISMATCH" = "UNVERIFIED";

    const foundRecipient = await this.prisma.recipient.findFirst({
      where: {
        OR: [
          { walletAddress: body.recipientAddress.toLowerCase() },
          ...(body.paymentId ? [{ paymentId: body.paymentId.toLowerCase() }] : []),
        ],
      },
    });

    if (foundRecipient) {
      verificationTier =
        foundRecipient.walletAddress.toLowerCase() === body.recipientAddress.toLowerCase()
          ? (foundRecipient.verificationStatus as typeof verificationTier)
          : "MISMATCH";
    }

    const intent = this.near.createPaymentIntent({
      senderNearAccount: body.senderNearAccount,
      recipientNearAccount: body.recipientAddress,
      paymentIdAlias: body.paymentId ?? foundRecipient?.paymentId,
      amount: String(body.amount),
      tokenSymbol: body.tokenSymbol,
      invoiceReference: body.invoiceReference,
      verificationTier,
    });

    return {
      success: true,
      message: "Verifiable NEAR Payment Intent formulated successfully",
      intent,
      network: "NEAR Protocol",
      consensus: "Nightshade Sub-Second Finality",
    };
  }

  @Get()
  getConfig() {
    return {
      protocol: "PaySure AI Verifiable NEAR Payment Intent Protocol",
      version: "1.1.0",
      engine: "NEAR Protocol Native Intent Settlement",
      config: this.near.intentsConfig(),
      agentSwarm: {
        guard: "PaySure AI Risk Sentinel (Prompt Injection & Payee Verification)",
        dispatcher: "PaySure AI Autonomous Intent Dispatcher",
      },
    };
  }
}
