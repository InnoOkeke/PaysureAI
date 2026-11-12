import OpenAI from "openai";
import { LlmCompletion, LlmProvider } from "../ai.types";

export class OpenAiCompatibleProvider implements LlmProvider {
  private readonly client: OpenAI | null;

  constructor(
    readonly name: string,
    readonly model: string,
    apiKey: string | undefined,
    baseURL: string,
    private readonly systemPrompt: string
  ) {
    this.client = apiKey
      ? new OpenAI({
          apiKey,
          baseURL,
        })
      : null;
  }

  get configured(): boolean {
    return this.client !== null;
  }

  async complete(prompt: string): Promise<LlmCompletion> {
    if (!this.client) {
      throw new Error(`${this.name} is not configured`);
    }

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: this.systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content ?? "";
    if (!text) {
      throw new Error(`${this.name} returned an empty response`);
    }

    return {
      text,
      provider: this.name,
      model: this.model,
      promptTokens: completion.usage?.prompt_tokens ?? 0,
      completionTokens: completion.usage?.completion_tokens ?? 0,
    };
  }
}
