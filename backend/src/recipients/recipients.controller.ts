import { Body, Controller, Get, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { RecipientsService } from "./recipients.service";

const verifySchema = z.object({
  address: z.string().min(1),
  name: z.string().optional(),
  paymentId: z.string().optional(),
});

const addRecipientSchema = z.object({
  displayName: z.string().min(1),
  walletAddress: z.string().min(1),
  paymentId: z.string().optional(),
  evmAddress: z.string().optional(),
  bitcoinAddress: z.string().optional(),
  solanaAddress: z.string().optional(),
  xrpAddress: z.string().optional(),
  cosmosAddress: z.string().optional(),
  stacksAddress: z.string().optional(),
  stellarAddress: z.string().optional(),
  notes: z.string().optional(),
  verificationStatus: z
    .enum(["VERIFIED", "WARNING", "UNVERIFIED", "MISMATCH"])
    .default("VERIFIED"),
});

@Controller("recipients")
export class RecipientsController {
  constructor(private readonly recipients: RecipientsService) {}

  @Get()
  async list() {
    const recipients = await this.recipients.list();
    return { recipients };
  }

  @Post()
  async add(
    @Body(new ZodValidationPipe(addRecipientSchema)) body: z.infer<typeof addRecipientSchema>
  ) {
    const recipient = await this.recipients.add(body);
    return { recipient, success: true };
  }

  @Post("verify")
  async verify(@Body(new ZodValidationPipe(verifySchema)) body: z.infer<typeof verifySchema>) {
    return this.recipients.verify(body.address, body.name, body.paymentId);
  }
}
