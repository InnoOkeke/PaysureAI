import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { RecipientsService } from "./recipients.service";

const verifySchema = z.object({
  address: z.string().min(1),
  name: z.string().optional(),
  paymentId: z.string().optional(),
});

@Controller("recipients")
export class RecipientsController {
  constructor(private readonly recipients: RecipientsService) {}

  @Post("verify")
  async verify(@Body(new ZodValidationPipe(verifySchema)) body: z.infer<typeof verifySchema>) {
    return this.recipients.verify(body.address, body.name, body.paymentId);
  }
}
