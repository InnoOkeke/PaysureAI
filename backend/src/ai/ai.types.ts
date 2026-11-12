import { ZodType } from "zod";

export interface LlmCompletion {
  text: string;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
}

export interface LlmProvider {
  readonly name: string;
  readonly model: string;
  readonly configured: boolean;
  complete(prompt: string): Promise<LlmCompletion>;
}

export interface AiRequest<T> {
  task: string;
  prompt: string;
  schema: ZodType<T, any, any>;
  accountId?: string;
  cacheTTL?: number;
  metadata?: Record<string, unknown>;
}

export interface ChatHistoryEntry {
  role: "user" | "assistant";
  content: string;
}
