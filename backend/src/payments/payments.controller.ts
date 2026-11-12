import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { PaymentsService } from "./payments.service";

const recordPaymentSchema = z.object({
  senderAddress: z.string().min(1),
  recipientAddress: z.string().min(1),
  amount: z.coerce.number().positive(),
  tokenAddress: z.string().default("native.near"),
  transactionHash: z.string().min(1),
  invoiceId: z.string().nullable().optional(),
  invoiceReference: z.string().nullable().optional(),
  network: z.string().default("NEAR Testnet"),
  chainId: z.coerce.number().int().default(0),
});

@Controller("payments")
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  async list(
    @Query("txHash") txHash?: string,
    @Query("accountId") accountId?: string,
    @Query("scope") scope?: string
  ) {
    if (txHash) {
      const payment = await this.payments.getByHash(txHash);
      return { payment };
    }

    const payments = await this.payments.list({ accountId, scope });
    return { payments };
  }

  @Post()
  async record(@Body(new ZodValidationPipe(recordPaymentSchema)) body: z.infer<typeof recordPaymentSchema>) {
    const payment = await this.payments.record(body);
    return { success: true, payment };
  }
}
