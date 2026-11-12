import { Body, Controller, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AssistantService } from "./assistant.service";

const historyEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const chatSchema = z.object({
  message: z.string().min(1),
  accountId: z.string().optional(),
  history: z.array(historyEntrySchema).max(20).default([]),
});

@Controller("ai")
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post("assistant")
  chat(@Body(new ZodValidationPipe(chatSchema)) body: z.infer<typeof chatSchema>) {
    return this.assistant.chat(body.message, body.accountId, body.history);
  }
}
