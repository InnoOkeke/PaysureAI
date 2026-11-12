import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { PendingActionService } from "./pending-action.service";

const prepareSchema = z.object({
  accountId: z.string().min(1),
  payload: z.record(z.unknown()),
  quoteSnapshot: z.record(z.unknown()).optional(),
  source: z.string().optional(),
  ttlSeconds: z.coerce.number().int().positive().max(3600).optional(),
});

const accountSchema = z.object({
  accountId: z.string().min(1),
});

const executeSchema = z.object({
  accountId: z.string().min(1),
  txHash: z.string().min(1),
});

@Controller("intents")
export class PendingActionController {
  constructor(private readonly pending: PendingActionService) {}

  @Post("prepare")
  prepare(@Body(new ZodValidationPipe(prepareSchema)) body: z.infer<typeof prepareSchema>) {
    return this.pending.prepare(body);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.pending.get(id);
  }

  @Post(":id/confirm")
  confirm(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(accountSchema)) body: z.infer<typeof accountSchema>
  ) {
    return this.pending.confirm(id, body.accountId);
  }

  @Post(":id/cancel")
  cancel(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(accountSchema)) body: z.infer<typeof accountSchema>
  ) {
    return this.pending.cancel(id, body.accountId);
  }

  @Post(":id/execute")
  execute(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(executeSchema)) body: z.infer<typeof executeSchema>
  ) {
    return this.pending.markExecuted(id, body.accountId, body.txHash);
  }
}
